import type { APIGatewayEvent, Context } from 'aws-lambda'
import { google } from 'googleapis'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

console.log('process.env.YOUTUBE_API_KEY: ', process.env.YOUTUBE_API_KEY)
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

  if (event.httpMethod == 'POST') {
    const body = JSON.parse(event.body)
    const yt_url = body.yt_url as string
    const isValid = isValidYoutubeUrl(yt_url)

    // return {
    //   statusCode: 200,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     data: 'testServerless function',
    //   }),
    // }

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
      const yt_video_id = yt_url.split('v=')[1]
      const defaultLanguage = getDefaultLanguage(yt_video_id)

      // write to db
      return db
        .$connect()
        .then(() => {
          console.log('connected')

          return db.captions.create({
            data: {
              yt_video_id: yt_video_id,
              history: [
                {
                  created_at: new Date().toUTCString(),
                },
              ],
              original_language: defaultLanguage,
            },
          })
        })
        .then(() => {
          db.$disconnect()

          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: 'testServerless function',
            }),
          }
        })
        .catch((e) => {
          console.log('error: ', e)
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              error: 'error',
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
