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

    // on FE: realtime checking for updates for captions with status 'complete'. but if status is 'requested' show a loading symbol. should NOT fire edge function as it's already been requested.
    // insert captions with status to request
    const { data: captions_request_data, error: captions_request_error } = await supabase
      .from('captions')
      .insert({
        history: [{ event: 'requested_at', timestamp: new Date().toISOString() }],
        language: desired_language,
        video_id: yt_id,
        status: 'requested'
      })
      .select('*')

    if (captions_request_error) {
      return new Response(
        JSON.stringify({
          message: 'captions_request_error',
          error: captions_request_error.message,
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
        captions_id: captions_request_data[0].id,
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
