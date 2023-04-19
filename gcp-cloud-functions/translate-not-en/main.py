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
import re

path_to_tmp_folder = 'tmp'  # local api on personal device


@functions_framework.http
def main(request):
    start_time = time.time()
    request_json = request.get_json()

    if request_json and 'yt_url' in request_json and 'desired_language' in request_json and 'api_key' in request_json and 'queue_id' in request_json:
        #     # destructure request
        #     yt_url = request_json['yt_url']
        desired_language = request_json['desired_language']
    #     api_key = request_json['api_key']
    #     queue_id = request_json['queue_id']

    #     # remove any playlist/mix (non single video) parameters from url
    #     if '&' in yt_url:
    #         yt_url = yt_url.split('&')[0]
    #     # prevent shorts from being processed
    #     if 'shorts' in yt_url:
    #         return {"message": "shorts are not supported", "response_time": (time.time()-start_time)}

    #     # download audio from YT
    #     yt_id = yt_url.split('=')[1]
    #     URLS = [yt_url]
    #     ydl_opts = {
    #         'format': 'bestaudio/best',
    #         'outtmpl': path_to_tmp_folder + '/%(id)s.%(ext)s',
    #     }
    #     with YoutubeDL(ydl_opts) as ydl:
    #         info_dict = ydl.extract_info(URLS[0], download=False)
    #         yt_title = info_dict.get('title', None)
    #         yt_description = info_dict.get('description', None)
    #         file_path = ydl.prepare_filename(info_dict)
    #         ydl.download(URLS)

    #     # run audio through Whisper -- $0.006 / minute (rounded to the nearest second)
    #     openai.api_key = api_key
    #     try:
    #         audio_file = open(file_path, 'rb')
    #         if desired_language == 'en':
    #             transcript = openai.Audio.transcribe(
    #                 "whisper-1", audio_file, response_format="verbose_json")
    #         else:
    #             return {"message": "error", "response_time": (time.time()-start_time), "error": "this endpoint is only for english result operations."}
    #     except openai.error.AuthenticationError as error:
    #         print("Authentication failed: {}".format(error))
    #         return {"message": "error", "response_time": (time.time()-start_time), "error": "Incorrect API key provided. You can find your API key at https://platform.openai.com/account/api-keys"}
    #     except openai.error.RateLimitError as error:
    #         print(
    #             "You exceeded your current quota, please check your plan and billing details: {}".format(error))
    #         return {"message": "error", "response_time": (time.time()-start_time), "error": "You exceeded your current quota, please check your plan and billing details."}

    #     # clean up transcript. removed avg_logprob, compression_ratio, no_speech_prob, seek, temperature, tokens, and transient
    #     for segment in transcript['segments']:
    #         for key in ['avg_logprob', 'compression_ratio', 'no_speech_prob', 'seek', 'temperature', 'tokens', 'transient']:
    #             segment.pop(key, None)

        # read test.json file
        with open('test-shorter.json', 'r') as f:
            response = f.read()
        transcript = json.loads(response)['transcript']

        whole_text: str = transcript['text']
        translator = deepl.Translator(os.environ.get('DEEPL_AUTH_KEY'))
        deepl_usage = str(translator.get_usage()).split(': ')[
            1].split(' of ')
        before_deepl_usage = deepl_usage[0]
        deepl_usage_limit = deepl_usage[1]

        try:
            deepl_result = translator.translate_text(
                whole_text, source_lang=transcript['language'], target_lang=desired_language.upper())
            deepl_result_dict = {
                'text': deepl_result.text,
                'detected_source_lang': deepl_result.detected_source_lang
            }
            deepl_result_json = json.loads(json.dumps(deepl_result_dict))
            after_deepl_usage = int(before_deepl_usage)+len(whole_text)

            # update transcript with translated text from DeepL
            transcript['text'] = deepl_result_json['text']
            transcript['language'] = desired_language
            transcript['original_language'] = deepl_result_json['detected_source_lang'].lower()
            re_segment_as_sentence = re.split(
                r'[.!?]\s', deepl_result_json['text'])
            # collate segments (sentences) between original and translated text
            for i, segment in enumerate(transcript['segments']):
                if i < len(re_segment_as_sentence):
                    segment['text'] = re_segment_as_sentence[i] + \
                        re.search(r'[.?!]', segment['text']).group(0)

            return {"message": "success", "response_time": (time.time()-start_time), 'transcript': transcript, "before_deepl_usage": before_deepl_usage, "after_deepl_usage": after_deepl_usage, "deepl_usage_limit": deepl_usage_limit}

        except deepl.QuotaExceededException as e:
            return {"message": "error", "response_time": (time.time()-start_time), "error": e.args[0]}
        except deepl.exceptions.DeepLException as e:
            if (e.should_retry):
                return {"message": "retry", "response_time": (time.time()-start_time), "error": e.args[0]}
            else:
                return {"message": "error", "response_time": (time.time()-start_time), "error": e.args[0]}

    #     # if transcript['language'] is spelled out, convert to ISO 639-1 by checking if its longer than 2 characters
    #     if len(transcript['language']) > 2:
    #         # make sure first letter of each word in lang is capitalized
    #         capital_lang = transcript['language'].title()
    #         transcript['language'] = convert("639-1", capital_lang)

    #     # if transcript is not empty, upload to supabase
    #     if transcript['text'] != '':
    #         url: str = os.environ.get('SUPABASE_URL')
    #         key: str = os.environ.get('SUPABASE_ANON_KEY')
    #         supabase: Client = create_client(url, key)

    #         try:
    #             supabase.table('captions').insert(
    #                 {'history': [{"event": "created_at", "timestamp": time.time()}],
    #                  'language': transcript['language'],
    #                  'timestamped_captions': transcript['segments'],
    #                  'video_id': yt_id,
    #                  },
    #             ).execute()
    #         except APIError as e:
    #             return {"message": "error while writing captions to DB", "response_time": (time.time()-start_time), "error": e}

    #         # get queue data, mainly for history updates
    #         try:
    #             queue_data = supabase.table('queue').select(
    #                 '*').eq('id', queue_id).execute().data
    #         except APIError as e:
    #             return {"message": "error while fetching queue data from DB", "response_time": (time.time()-start_time), "error": e}

    #         # update queue history and status
    #         updated_history = queue_data[0]['history']
    #         updated_history.append({"event": "captions_generated", "timestamp": time.strftime(
    #             '%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())})
    #         try:
    #             supabase.table('queue').update(
    #                 {'status': 'complete', 'history': updated_history}
    #             ).eq('id', queue_id).execute()
    #         except APIError as e:
    #             return {"message": "error while writing updated queue to DB", "response_time": (time.time()-start_time), "error": e}

    #         # delete file from local storage
    #         os.remove(file_path)

    #         return {"message": "success", "response_time": (time.time()-start_time), "yt_url": yt_url, "desired_language": desired_language, "queue_id": queue_id, "yt_title": yt_title, "yt_description": yt_description, "transcript": transcript}

    #     else:
    #         return {"message": "error", "response_time": (time.time()-start_time), "error": "transcript was empty"}

    # # handle missing parameters
    # missing_params = []
    # required_params = ['yt_url', 'desired_language', 'api_key', 'queue_id']
    # if request_json:
    #     for param in required_params:
    #         if param not in request_json:
    #             missing_params.append(param)
    #     if missing_params:
    #         return {"message": "missing parameter", "required": missing_params, "response_time": (time.time()-start_time)}
    #     # if all required parameters are present, but empty
    #     else:
    #         return {"message": "missing parameter", "required": required_params, "response_time": (time.time()-start_time)}

    # # handle empty request
    # else:
    #     return {"message": "missing parameter", "required": ['yt_url', 'desired_language', 'api_key', 'queue_id'], "response_time": (time.time()-start_time)}
