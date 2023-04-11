import type { APIGatewayEvent, Context } from 'aws-lambda'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

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

  if (event.httpMethod == 'POST') {
    if (event.httpMethod == 'POST') {
      return db
        .$connect()
        .then(() => {
          console.log('connected')

          return db.captions.create({
            data: {
              youtube_id: 'test',
              history: [
                {
                  start: 0,
                  end: 1,
                  text: 'test',
                },
              ],
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
          }
        })
    } else {
      return {
        statusCode: 400,
      }
    }
  }
}
