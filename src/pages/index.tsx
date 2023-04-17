import { type NextPage } from 'next'
import Head from 'next/head'
import { env } from '~/env.mjs'
import axios, { AxiosResponse } from 'axios'
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg'
import { Readable, Writable } from 'stream'
import fs from 'fs'

const Home: NextPage = () => {
  async function callWhisper(url: string, languageCode: string) {
    try {
      const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
        responseType: 'arraybuffer',
      })
      // Making a stream out of the buffer
      const inputStream = arrayBufferToStream(response.data)
      // We want to avoid the 25 MB limitation and ensure that the audio file is within the acceptable size range for the API.
      const resizedBuffer = await reduceBitrate(inputStream)
      //  This step is necessary because the OpenAI API expects a stream as input for the audio file.
      const resizedStream = bufferToReadableStream(resizedBuffer, 'audio.mp3')
      console.log('resizedStream: ', resizedStream)
      // const configuration = new Configuration({
      //   apiKey: process.env.OPEN_API_KEY,
      // })

      // const openai = new OpenAIApi(configuration)
      // let prompt = 'YOUR PROMPT'

      // const resp = await openai.createTranscription(
      //   resizedStream,
      //   'whisper-1',
      //   prompt,
      //   'verbose_json',
      //   0.8,
      //   language_code,
      //   { maxContentLength: Infinity, maxBodyLength: Infinity },
      // )
      // return resp.data
    } catch (error) {
      console.error(error)
    }
  }

  function arrayBufferToStream(buffer: ArrayBuffer) {
    const readable = new Readable({
      read() {
        this.push(Buffer.from(buffer))
        this.push(null)
      },
    })
    return readable
  }

  function reduceBitrate(inputStream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const outputChunks: Buffer[] = []
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      ffmpeg(inputStream as any)
        .audioBitrate(64) // low quality. You can update that
        .on('error', reject)
        .on('end', () => resolve(Buffer.concat(outputChunks)))
        .format('mp3')
        .pipe(
          new Writable({
            write(chunk: Buffer, encoding: string, callback: () => void) {
              outputChunks.push(chunk)
              callback()
            },
          }),
        )
    })
  }

  function bufferToReadableStream(buffer: Buffer, filename: string): Readable {
    const readable: Readable = new Readable({
      read() {
        this.push(buffer)
        this.push(null)
      },
    }) as never
    readable.path = filename
    readable._readableState.objectMode = false
    return readable
  }

  const handleEdgeFunction = () => {
    console.log('clicked brain at: ', new Date().toLocaleString())
    axios
      .post(
        'http://localhost:54321/functions/v1/brain', // local
        // 'https://tpqbderafyftvmrhrdht.functions.supabase.co/brain', // prod
        {
          // yt_url: 'https://www.youtube.com/watch?v=gGZmi3UVSOI',
          yt_url: 'https://www.youtube.com/watch?v=u7j--YMXZtA', // french mbappe song
          // yt_url:
          //   'https://www.youtube.com/watch?v=u7j--YMXZtA&list=RDu7j--YMXZtA', // youtube mix
          desired_language: 'en',
        },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`, // local
            // Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, // prod
            'Content-Type': 'application/json',
          },
        },
      )
      .then((response) => {
        console.log(response.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <button
          className="rounded-lg bg-white p-6"
          // onClick={() => handleEdgeFunction()}
          onClick={() =>
            void callWhisper(
              'https://www.youtube.com/watch?v=u7j--YMXZtA',
              'en',
            )
          }
        >
          🧠 on {process.env.NODE_ENV}
        </button>
      </main>
    </>
  )
}

export default Home
