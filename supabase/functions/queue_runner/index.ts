// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_shared/supabaseClient.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from Functions!')

serve(async (req) => {
  // const { name } = await req.json()
  // make sure there are none still generating
  const {
    data: check_queue_for_generating_data,
    error: check_queue_for_generating_error,
  } = await supabase.from('queue').select('*').eq('status', 'generating')

  if (check_queue_for_generating_error) {
    return new Response(
      JSON.stringify({
        message: 'check_queue_for_generating_error',
        error: check_queue_for_generating_error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  } else {
    // // if there are any still generating, return
    if (check_queue_for_generating_data.length > 0) {
      return new Response(
        JSON.stringify({
          message: 'there are jobs still generating',
          data: check_queue_for_generating_data,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 204,
        },
      )
    }
    // // if there are none still generating, continue with queued jobs. havent dealt with failed jobs yet :(
    else {
      const { data: check_queue_for_5_data, error: check_queue_for_5_error } =
        await supabase
          .from('queue')
          .select('*')
          .eq('status', 'queued')
          .order('id', { ascending: true })
          .limit(5)

      if (check_queue_for_5_error) {
        return new Response(
          JSON.stringify({
            message: 'check_queue_for_5_error',
            error: check_queue_for_5_error.message,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          },
        )
      } else {
        //  update status and history for each
        for (const queue_item of check_queue_for_5_data) {
          try {
            const {
              data: pre_update_job_status_history_data,
              error: pre_update_job_status_history_error,
            } = await supabase
              .from('queue')
              .update({
                status: 'generating',
                history: queue_item.history.concat({
                  event: 'started_generating',
                  timestamp: new Date().toISOString(),
                }),
              })
              .eq('id', queue_item.id)

            // if pre_update_job_status_history_error, dont do anything.
            if (pre_update_job_status_history_error) {
              continue
            }
            // otherwise make a fetch get keepalive request to https://dubdubs.wl.r.appspot.com/download-from-YT-and-upload-and-generate-caption
            else {
              const yt_url = queue_item.video_id
              const desired_language = queue_item.job_details.desired_language
              const fetchUrl = `https://dubdubs.wl.r.appspot.com/download-from-YT-and-upload-and-generate-caption?yt_url=https://www.youtube.com/watch?v=${yt_url}&desired_language=${desired_language}`
              try {
                const response = await fetch(fetchUrl, { keepalive: true })
                const data = await response.json()

                console.log('data: ', data)
              } catch (error) {
                // Handle any errors that occurred during the fetch request
                console.error('Error fetching data:', error)
              }
            }
          } catch (error) {
            console.log('error: ', error)
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ message: 'end' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

/* To invoke:
curl -i --location --request GET 'http://localhost:54321/functions/v1/queue_runner' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
curl -i --location --request GET 'https://tpqbderafyftvmrhrdht.functions.supabase.co/queue_runner' \
  --header 'Authorization: Bearer process.env.SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
   */
