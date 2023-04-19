/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabaseClient.ts'

console.log(`Function "browser-with-cors" up and running!`)

serve(async req => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method == 'POST') {
    // let supabase_url = Deno.env.get('Z_SUPABASE_URL') ?? ''
    // let supabase_anon_key = Deno.env.get('Z_SUPABASE_ANON_KEY') ?? ''
    // const checkDeployed = Deno.env.get('DENO_DEPLOYMENT_ID') ?? ''
    // if (checkDeployed.startsWith('tpqbderafyftvmrhrdht')) {
    //   supabase_url = Deno.env.get('SUPABASE_URL') ?? supabase_url
    //   supabase_anon_key = Deno.env.get('SUPABASE_ANON_KEY') ?? supabase_anon_key
    // }

    const body = await req.json()
    const yt_url = body.yt_url as string
    const desired_language = body.desired_language as string

    {
      // const data = {
      //   yt_url: yt_url,
      //   desired_language: desired_language,
      // }
      // return new Response(JSON.stringify(data), {
      //   headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      //   status: 200,
      // })
    }

    // get youtube video id from url
    const yt_id = yt_url.split('v=')[1]

    try {
      // const supabase = createClient(supabase_url, supabase_anon_key)

      const { data: captions_data, error: captions_error } = await supabase
        .from('captions')
        .select('*')
        .eq('video_id', yt_id)
        .eq('language', desired_language)

      if (captions_error) {
        return new Response(
          JSON.stringify({
            message: 'captions_error',
            error: captions_error.message,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      } else {
        // no matches found so (queue eventually) and run app engine request
        if (captions_data?.length === 0) {
          // check if already in queue by video_id and job_details.type and job_details.desired_language
          const { data: check_queue_data, error: check_queue_error } =
            await supabase
              .from('queue')
              .select('*')
              .eq('video_id', yt_id)
              .eq('job_details->>type', 'get_captions')
              .eq('job_details->>desired_language', desired_language)

          if (check_queue_error) {
            return new Response(
              JSON.stringify({
                message: 'check_queue_error',
                error: check_queue_error,
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              },
            )
          } else if (check_queue_data?.length == 0) {
            // add to queue table
            const { data: queue_data, error: queue_error } = await supabase
              .from('queue')
              .insert({
                history: [
                  { event: 'created_at', timestamp: new Date().toISOString() },
                ],
                video_id: yt_id,
                job_details: {
                  type: 'get_captions',
                  desired_language: desired_language,
                },
              })

            if (queue_error) {
              return new Response(
                JSON.stringify({
                  message: 'queue_error',
                  error: queue_error.message,
                }),
                {
                  headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                  },
                  status: 201,
                },
              )
            } else {
              return new Response(
                JSON.stringify({
                  message: 'added to queue',
                  queue_data: queue_data,
                }),
                {
                  headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                  },
                  status: 200,
                },
              )

              // run app engine request
            }
          } else {
            // already in queue
            return new Response(
              JSON.stringify({
                message: 'already in queue',
                queue_data: check_queue_data,
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              },
            )
          }
        }

        // best case 1 match found
        else if (captions_data?.length === 1) {
          // update analytics.play_counter (FYI analytics is JSONB)

          const { error: queue_error } = await supabase
            .from('captions')
            .update({
              analytics: {
                play_counter: captions_data[0].analytics.play_counter + 1,
              },
            })
            .eq('id', captions_data[0].id)

          if (queue_error) {
            return new Response(
              JSON.stringify({
                message: 'queue_error',
                error: queue_error.message,
              }),
              {
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
                status: 201,
              },
            )
          } else {
            const data = {
              captions_data: captions_data[0],
              yt_url: yt_url,
              desired_language: desired_language,
            }

            return new Response(JSON.stringify(data), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            })
          }
        }

        // (WIP) multiple matches found so return all and let user choose
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ message: 'smth else', error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }
  }

  // otherwise return 204 nothing
  const data = {
    nothing: 'nothing',
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 204,
  })
})
/* To invoke:
curl -i --location --request POST 'http://localhost:54321/functions/v1/brain' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
curl -i --location --request POST 'https://tpqbderafyftvmrhrdht.functions.supabase.co/brain' \
  --header 'Authorization: Bearer process.env.SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
   */
