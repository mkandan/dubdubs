import os
import time
import json
import functions_framework
from yt_dlp import YoutubeDL
import openai
from supabase import create_client, Client
from convert_to_iso_639_1 import convert
from postgrest import APIError
import deepl

path_to_tmp_folder = 'tmp'  # local api on personal device


@functions_framework.http
def main(request):
    start_time = time.time()
    request_json = request.get_json()

    if request_json and 'yt_url' in request_json and 'desired_language' in request_json and 'api_key' in request_json and 'captions_id' in request_json:
        # destructure request
        yt_url = request_json['yt_url']
        desired_language = request_json['desired_language']
        api_key = request_json['api_key']
        captions_id = request_json['captions_id']

        if desired_language == 'en':
            return {"message": "error", "response_time": (time.time()-start_time), "error": "this endpoint is only for non-english result operations."}

        # remove any playlist/mix (non single video) parameters from url
        if '&' in yt_url:
            yt_url = yt_url.split('&')[0]
        # prevent shorts from being processed
        if 'shorts' in yt_url:
            return {"message": "shorts are not supported", "response_time": (time.time()-start_time)}

        # download audio from YT
        yt_id = yt_url.split('=')[1]
        URLS = [yt_url]
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': path_to_tmp_folder + '/%(id)s.%(ext)s',
        }
        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(URLS[0], download=False)
            yt_title = info_dict.get('title', None)
            yt_description = info_dict.get('description', None)
            file_path = ydl.prepare_filename(info_dict)
            ydl.download(URLS)

        # run audio through Whisper -- $0.006 / minute (rounded to the nearest second)
        openai.api_key = api_key
        try:
            audio_file = open(file_path, 'rb')
            transcript = openai.Audio.transcribe(
                "whisper-1", audio_file, response_format="verbose_json")
        except openai.error.AuthenticationError as error:
            print("Authentication failed: {}".format(error))
            os.remove(file_path)
            return {"message": "error", "response_time": (time.time()-start_time), "error": "Incorrect API key provided. You can find your API key at https://platform.openai.com/account/api-keys"}
        except openai.error.RateLimitError as error:
            print(
                "You exceeded your current quota, please check your plan and billing details: {}".format(error))
            os.remove(file_path)
            return {"message": "error", "response_time": (time.time()-start_time), "error": "You exceeded your current quota, please check your plan and billing details."}

        # clean up transcript. removed avg_logprob, compression_ratio, no_speech_prob, seek, temperature, tokens, and transient
        for segment in transcript['segments']:
            for key in ['avg_logprob', 'compression_ratio', 'no_speech_prob', 'seek', 'temperature', 'tokens', 'transient']:
                segment.pop(key, None)

        # if transcript['language'] is spelled out, convert to ISO 639-1 by checking if its longer than 2 characters
        if len(transcript['language']) > 2:
            # make sure first letter of each word in lang is capitalized
            capital_lang = transcript['language'].title()
            transcript['language'] = convert("639-1", capital_lang)

        # read test.json file
        # with open('test-shorter.json', 'r') as f:
        #     response = f.read()
        # transcript = json.loads(response)['transcript']

        translator = deepl.Translator(os.environ.get('DEEPL_AUTH_KEY'))
        deepl_usage = str(translator.get_usage()).split(': ')[
            1].split(' of ')
        before_deepl_usage = int(deepl_usage[0])
        deepl_usage_limit = int(deepl_usage[1])

        all_segment_text_ordered = []
        for segment in transcript['segments']:
            text = segment['text']
            # remove leading or trailing whitespace
            if text[0] == ' ':
                text = text[1:]
            if text[-1] == ' ':
                text = text[:-1]
            all_segment_text_ordered.append(text)

        try:
            deepl_result = translator.translate_text(
                all_segment_text_ordered, source_lang=transcript['language'], target_lang=desired_language.upper())
        except deepl.QuotaExceededException as e:
            os.remove(file_path)
            return {"message": "error", "response_time": (time.time()-start_time), "error": e.args[0]}
        except deepl.exceptions.DeepLException as e:
            if (e.should_retry):
                os.remove(file_path)
                return {"message": "retry", "response_time": (time.time()-start_time), "error": e.args[0]}
            else:
                os.remove(file_path)
                return {"message": "error", "response_time": (time.time()-start_time), "error": e.args[0]}

        # replace original transcript text with translated text
        combined_text = ''
        for i in range(len(deepl_result)):
            transcript['segments'][i]['text'] = deepl_result[i].text
            # dont add an extra space at the end
            if i == len(deepl_result)-1:
                combined_text += deepl_result[i].text
            else:
                combined_text += deepl_result[i].text + ' '
        transcript['text'] = combined_text
        transcript['original_language'] = transcript['language']
        transcript['language'] = desired_language
        after_deepl_usage = int(before_deepl_usage)+len(combined_text)

        # return {'transcript': transcript}

        # if transcript is not empty, upload to supabase
        if transcript['text'] != '':
            url: str = os.environ.get('SUPABASE_URL')
            key: str = os.environ.get('SUPABASE_ANON_KEY')
            supabase: Client = create_client(url, key)

            try:
                supabase.table('captions').insert(
                    {'history': [{"event": "created_at", "timestamp": time.time()}],
                     'language': transcript['language'],
                     'timestamped_captions': [json.loads(json.dumps(transcript))],
                     'video_id': yt_id,
                     'status': 'complete'
                     },
                ).eq('id', captions_id).execute()
            except APIError as e:
                os.remove(file_path)
                return {"message": "error while writing captions to DB", "response_time": (time.time()-start_time), "error": e.json()}

            # delete file from local storage
            os.remove(file_path)

            return {"message": "success", "response_time": (time.time()-start_time), "yt_url": yt_url, "desired_language": desired_language, "captions_id": captions_id, "yt_title": yt_title, "yt_description": yt_description, "transcript": transcript, "before_deepl_usage": before_deepl_usage, "after_deepl_usage": after_deepl_usage, "deepl_usage_limit": deepl_usage_limit}

        else:
            os.remove(file_path)
            return {"message": "error", "response_time": (time.time()-start_time), "error": "transcript was empty"}

    # handle missing parameters
    missing_params = []
    required_params = ['yt_url', 'desired_language', 'api_key', 'captions_id']
    if request_json:
        for param in required_params:
            if param not in request_json:
                missing_params.append(param)
        if missing_params:
            return {"message": "missing parameter", "required": missing_params, "response_time": (time.time()-start_time)}
        # if all required parameters are present, but empty
        else:
            return {"message": "missing parameter", "required": required_params, "response_time": (time.time()-start_time)}

    # handle empty request
    else:
        return {"message": "missing parameter", "required": ['yt_url', 'desired_language', 'api_key', 'captions_id'], "response_time": (time.time()-start_time)}
