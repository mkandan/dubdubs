// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from './_shared/supabaseClient.ts'
import { corsHeaders } from './_shared/cors.ts'

serve(async req => {
  if (req.method === 'POST') {
    const body = await req.json()
    const yt_url = body.yt_url as string
    const desired_language = body.desired_language as string
    const api_key = body.api_key as string
    const yt_id = yt_url.split('v=')[1]

    // make queue
    const { data: queue_data, error: queue_error } = await supabase
      .from('queue')
      .insert({
        history: [{ event: 'created_at', timestamp: new Date().toISOString() }],
        video_id: yt_id,
        job_details: {
          type: 'get_captions',
          desired_language: desired_language,
        },
      })
      .select('*')

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
      const request_body = {
        yt_id,
        yt_url,
        desired_language,
        api_key,
        queue_id: queue_data[0].id,
      }

      if (desired_language == 'en') {
        fetch(Deno.env.get('GOOGLE_CLOUD_FUNCTION_TRANSLATE_EN_URL'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request_body),
        })
        return new Response(
          JSON.stringify({
            message: 'sent',
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
            status: 200,
          },
        )
      } else if (desired_language != 'en') {
        fetch(Deno.env.get('GOOGLE_CLOUD_FUNCTION_TRANSLATE_NOT_EN_URL'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request_body),
        })
        return new Response(
          JSON.stringify({
            message: 'sent',
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
            status: 200,
          },
        )
      }
    }
  }
  return new Response(
    JSON.stringify({
      message: 'method not allowed',
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 405,
    },
  )
})
