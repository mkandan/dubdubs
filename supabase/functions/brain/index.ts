/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0'

import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "browser-with-cors" up and running!`)

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method == 'POST') {
    // const body = await req.json()
    // const yt_url = body.yt_url as string
    // const desired_language = body.desired_language as string

    // // get youtube video id from url
    // const yt_id = yt_url.split('v=')[1]

    try {
      const supabase = createClient(
        Deno.env.get('Z_SUPABASE_URL') ?? '',
        Deno.env.get('Z_SUPABASE_ANON_KEY') ?? '',
      )

      const { data: captions_data, error: captions_error } = await supabase
        .from('captions')
        .select('*')
      if (captions_error) {
        return new Response(JSON.stringify({ error: captions_error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      } else {
        const { name } = await req.json()
        const data = {
          message: `Hello ${name}!`,
          captions_data: captions_data,
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  }

  try {
    const { name } = await req.json()
    const data = {
      message: `Hello ${name}!`,
      // SUPABASE_URL: Deno.env.get('SUPABASE_URL') ?? '',
      // SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Z_SUPABASE_URL: Deno.env.get('Z_SUPABASE_URL') ?? '',
      // Z_SUPABASE_ANON_KEY: Deno.env.get('Z_SUPABASE_ANON_KEY') ?? '',
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
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
