import os
import time
import functions_framework
from pytube import YouTube
import openai

path_to_tmp_folder = 'tmp'  # local api on personal device


@functions_framework.http
def whisper_cap(request):
    start_time = time.time()
    # get youtube url and desired_language from request
    request_json = request.get_json()

    if request_json and 'yt_url' in request_json and 'desired_language' and 'api_key' in request_json:
        yt_url = request_json['yt_url']
        desired_language = request_json['desired_language']
        api_key = request_json['api_key']

        # download audio from YT
        try:
            yt = YouTube(yt_url)
            yt_title = yt.title
            yt_description = yt.description
            yt_stream = yt.streams.filter(only_audio=True).first()
            yt_stream.download(output_path=path_to_tmp_folder)
            file_path = os.path.join(
                path_to_tmp_folder, yt_stream.default_filename)

        except Exception as e:
            # handle the exception here
            print(f"Error while working with audio via pytub: {e}")
            return {'error': 'Error while working with audio via pytub', 'message': e}, 500

    # run audio through Whisper
    # openai.api_key = api_key
    # audio_file = open(file_path, 'rb')
    # transcript = openai.Audio.transcribe("whisper-1", audio_file,)

    # delete file from local storage
    os.remove(file_path)

    return {"message": "success", "response_time": (time.time()-start_time), "yt_url": yt_url, "desired_language": desired_language, yt_title: yt_title, "yt_description": yt_description, }

    # handle missing parameters
    missing_params = []
    required_params = ['yt_url', 'desired_language', 'api_key']
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
        return {"message": "missing parameter", "required": ['yt_url', 'desired_language', 'api_key'], "response_time": (time.time()-start_time)}
