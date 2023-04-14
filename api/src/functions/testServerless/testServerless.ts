import { PrismaClient, type audio } from '.prisma/client'
import type { APIGatewayEvent, Context } from 'aws-lambda'
import { google } from 'googleapis'

import { LogLevel } from '@redwoodjs/api/dist/logger'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

const yt = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})
/**
 * The handler function is your code that processes http request events.
 * You can use return and throw to send a response or error, respectively.
 *
 * Important: When deployed, a custom serverless function is an open API endpoint and
 * is your responsibility to secure appropriately.
 *
 * @see {@link https://redwoodjs.com/docs/serverless-functions#security-considerations|Serverless Function Considerations}
 * in the RedwoodJS documentation for more information.
 *
 * @typedef { import('aws-lambda').APIGatewayEvent } APIGatewayEvent
 * @typedef { import('aws-lambda').Context } Context
 * @param { APIGatewayEvent } event - an object which contains information from the invoker.
 * @param { Context } context - contains information about the invocation,
 * function, and execution environment.
 */
export const handler = async (event: APIGatewayEvent, _context: Context) => {
  logger.info(`${event.httpMethod} ${event.path}: testServerless function`)

  /**
   * validates youtube url against regex
   * @param url includes https
   * @returns boolean
   */
  function isValidYoutubeUrl(url: string): boolean {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/
    return youtubeRegex.test(url)
  }

  /**
   * gets default language of youtube video
   * NOTE! if no language is provided by uploader, it will return 'undefined'
   * @param video_id
   * @returns string
   * @see https://developers.google.com/youtube/v3/docs/videos/list
   * @see https://developers.google.com/youtube/v3/docs/videos#snippet.defaultLanguage
   */
  function getDefaultLanguage(video_id: string): string {
    yt.videos.list(
      {
        part: ['snippet'],
        id: [video_id],
        prettyPrint: true,
      },
      (err, res) => {
        if (err) {
          console.log('error: ', err)
          return
        } else {
          const videoSnippet = res.data.items[0].snippet
          return videoSnippet.defaultLanguage
        }
      }
    )
    return
  }

  /**
   * either fetches caption's content or queues jobs to generate caption.
   * FYI: if caption exists, then video exists. if video exists, audio exists. if caption DNE, video exists/DNE. if video exists/DNE, audio exists/DNE.
   * @param db prisma client
   * @param yt_id unique youtube video id
   * @param defaultLanguage result from YouTube API call on video id
   * @returns caption's content or { status: 'queued' }
   */
  async function fetchCaptionsOrQueueJobs(
    db: PrismaClient<
      { log: { level: LogLevel; emit: 'stdout' | 'event' }[] },
      never,
      false
    >,
    yt_id: string,
    defaultLanguage: string,
    desiredLanguage: string
  ) {
    const captionExists = await db.captions.findFirst({
      where: {
        language: desiredLanguage,
        audio: {
          video_id: yt_id,
        },
      },
    })
    console.log('captionExists: ', captionExists)

    if (captionExists) {
      return captionExists.timestamped_captions
    } else {
      // since caption DNE, first check if audio exists for video_id/yt_id
      const audioExists = await db.audio.findFirst({
        where: {
          video_id: yt_id,
        },
      })

      let audio: audio
      if (!audioExists) {
        // since audio DNE, need to 1. init audio row, 2. (serverless) download audio
        // 1. init audio row
        audio = await db.audio.create({
          data: {
            video_id: yt_id,
            history: [{ created_at: new Date().toUTCString() }],
          },
        })
        // 2. queue download_audio job
        const downloadAudioJob = await db.queue.create({
          data: {
            video_id: yt_id,
            status: 'queued',
            history: [
              { created_at: new Date().toUTCString() },
              { queued_at: new Date().toUTCString() },
            ],
            job_details: {
              type: 'download_audio',
              audio_id: `${audioExists ? `${audioExists.id}` : `${audio.id}`}`,
              language: defaultLanguage,
            },
          },
        })
      }
      // since audio row (now) exists, need to 3. (serverless) generate captions
      // 3. queue generate_captions job
      const generateCaptionsJob = await db.queue.create({
        data: {
          video_id: yt_id,
          status: 'queued',
          history: [
            { created_at: new Date().toUTCString() },
            { queued_at: new Date().toUTCString() },
          ],
          job_details: {
            type: 'generate_captions',
            audio_id: audio.id,
            desired_language: desiredLanguage,
          },
        },
      })
      // finally, return a json object with status: 'queued'
      return {
        status: 'queued',
      }
    }
  }

  if (event.httpMethod == 'POST') {
    const body = JSON.parse(event.body)
    const yt_url = body.yt_url as string
    const desired_language = body.desired_language as string
    const isValid = isValidYoutubeUrl(yt_url)

    if (!isValid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'invalid youtube link',
        }),
      }
    } else {
      // get youtube video id from url
      const yt_id = yt_url.split('v=')[1]
      const yt_default_language = getDefaultLanguage(yt_id)

      let captions: Prisma.JsonValue[] | { status: string }
      return db
        .$connect()
        .then(async () => {
          captions = await fetchCaptionsOrQueueJobs(
            db,
            yt_id,
            yt_default_language,
            desired_language
          )
        })
        .then(() => {
          db.$disconnect()
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'success!',
              captions: captions,
            }),
          }
        })
    }
  } else {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'error',
      }),
    }
  }
}
