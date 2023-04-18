import os
import time
import functions_framework
from pytube import YouTube
import openai
from supabase import create_client, Client

path_to_tmp_folder = 'tmp'  # local api on personal device


@functions_framework.http
def whisper_cap(request):
    start_time = time.time()
    # get youtube url and desired_language from request
    request_json = request.get_json()

    if request_json and 'yt_url' in request_json and 'desired_language' in request_json and 'api_key' in request_json and 'queue_id' in request_json:
        yt_url = request_json['yt_url']
        desired_language = request_json['desired_language']
        api_key = request_json['api_key']
        queue_id = request_json['queue_id']

        # remove any playlist/mix (non single video) parameters from url
        if '&' in yt_url:
            yt_url = yt_url.split('&')[0]
        # prevent shorts from being processed
        if 'shorts' in yt_url:
            return {"message": "shorts are not supported", "response_time": (time.time()-start_time)}

        # download audio from YT
        yt = YouTube(yt_url)
        yt_stream = yt.streams.filter(only_audio=True).first()
        yt_stream.download(output_path=path_to_tmp_folder)
        yt_title = yt.title
        yt_description = yt.description
        yt_id = yt_url.split('=')[1]
        file_path = os.path.join(
            path_to_tmp_folder, yt_stream.default_filename)

        # run audio through Whisper -- $0.006 / minute (rounded to the nearest second)
        # openai.api_key = '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'
        # audio_file = open(file_path, 'rb')
        # transcript = openai.Audio.transcribe(
        #     "whisper-1", audio_file, response_format="verbose_json")

        # # clean up transcript. removed avg_logprob, compression_ratio, no_speech_prob, seek, temperature, tokens, and transient
        # for segment in transcript['segments']:
        #     for key in ['avg_logprob', 'compression_ratio', 'no_speech_prob', 'seek', 'temperature', 'tokens', 'transient']:
        #         segment.pop(key, None)
        # if transcript['language'] is spelled out, convert to ISO 639-1 by checking if its longer than 2 characters
        # if len(transcript['language']) > 2:
        #     transcript['language'] =

        # if transcript is not empty, upload to supabase
        # if transcript['text'] != '':
        url: str = os.environ.get('SUPABASE_URL')
        key: str = os.environ.get('SUPABASE_ANON_KEY')
        supabase: Client = create_client(url, key)

        # try:
        #     supabase.table('captions').insert(
        #         {'history': [{"event": "created_at", "timestamp": time.time()}],
        #          'language': transcript['language'],
        #          'timestamped_captions': transcript,
        #          'video_id': yt_id,
        #          },
        #     ).execute()
        # except APIError as e:
        #     return {"message": "error", "response_time": (time.time()-start_time), "error": e}

        try:
            queue_data = supabase.table('queue').select(
                '*').eq('id', queue_id).execute().data
        except APIError as e:
            return {"message": "error", "response_time": (time.time()-start_time), "error": e}

        updated_history = queue_data[0]['history']
        updated_history.append({"event": "captions_generated", "timestamp": time.strftime(
            '%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())})

        try:
            supabase.table('queue').update(
                {'status': 'complete', 'history': updated_history}
            ).eq('id', queue_id).execute()
        except APIError as e:
            return {"message": "error", "response_time": (time.time()-start_time), "error": e}

        # delete file from local storage
        os.remove(file_path)

        # return {"message": "success", "response_time": (time.time()-start_time), "yt_url": yt_url, "desired_language": desired_language, "queue_id": queue_id, "yt_title": yt_title, "yt_description": yt_description, "transcript": transcript}

    # handle missing parameters
    missing_params = []
    required_params = ['yt_url', 'desired_language', 'api_key', 'queue_id']
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
        return {"message": "missing parameter", "required": ['yt_url', 'desired_language', 'api_key', 'queue_id'], "response_time": (time.time()-start_time)}
