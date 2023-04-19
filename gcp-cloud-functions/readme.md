### local

1. install requirements `pip install -r requirements.txt` (preferably in a virtualenv like .venv)

2. serve GCP CF locally `functions-framework --target whisper_cap --debug`

3. send request via curl (but i prefer [hopscotch](https://hoppscotch.io/))

`curl http://127.0.0.1:8080` for a basic test

`curl --request POST \
  --url http://localhost:8080/ \
  --header 'content-type: application/json' \
  --data '{
  "yt_url": "https://www.youtube.com/watch?v=xBz8cYO3UjE",
  "desired_language": "asdf",
  "api_key": "my_fake_api_key",
  "queue_id":39
}'`

### deployed CF

if translating to english, curl to https://translate-en-ttgy4skmjq-wl.a.run.app
if translating to not-english, curl to https://translate-not-en-ttgy4skmjq-wl.a.run.app

`curl -m 70 -X POST [see above] \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
--data '{
  "yt_url": "https://www.youtube.com/watch?v=xBz8cYO3UjE",
  "desired_language": "asdf",
  "api_key": "my_fake_api_key",
  "queue_id":39
}'`

### test links

https://www.youtube.com/watch?v=qCsS-6W4rOA
https://www.youtube.com/watch?v=hBgEx4m-ejo (1ish min)
https://www.youtube.com/watch?v=xBz8cYO3UjE (1min)
