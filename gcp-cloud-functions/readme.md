### local

1. serve GCP CF locally `functions-framework --target whisper_cap --debug` via CLI

2. send request via curl (but i prefer [hopscotch](https://hoppscotch.io/))

`curl http://127.0.0.1:8080`

`curl --request POST \
  --url http://localhost:8080/ \
  --header 'content-type: application/json' \
  --data '{
  "yt_url": "https://www.youtube.com/watch?v=qCsS-6W4rOA",
  "desired_language": "asdf",
  "api_key": "my_fake_api_key",
  "queue_id":39
}'`

### deployed CF

`curl -m 70 -X POST https://youcap-whisper-ttgy4skmjq-wl.a.run.app \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
--data '{
  "yt_url": "https://www.youtube.com/watch?v=qCsS-6W4rOA",
  "desired_language": "asdf",
  "api_key": "my_fake_api_key",
  "queue_id":39
}'`

### test links

https://www.youtube.com/watch?v=qCsS-6W4rOA
https://www.youtube.com/watch?v=hBgEx4m-ejo
