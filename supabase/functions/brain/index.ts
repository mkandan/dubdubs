// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { google } from 'googleapis'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "browser-with-cors" up and running!`)
console.log(Deno.env.get('YOUTUBE_API_KEY'))

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name } = await req.json()
    const data = {
      message: `Hello ${name}!`,
      YOUR_API_KEY: Deno.env.get('YOUTUBE_API_KEY'),
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
  --header 'Authorization: Bearer process.env.SUPABASE_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
   */
