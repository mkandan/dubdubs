import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0'

let supabase_url = Deno.env.get('Z_SUPABASE_URL') ?? ''
let supabase_anon_key = Deno.env.get('Z_SUPABASE_ANON_KEY') ?? ''

const checkDeployed = Deno.env.get('DENO_DEPLOYMENT_ID') ?? ''
if (checkDeployed.startsWith('tpqbderafyftvmrhrdht')) {
  supabase_url = Deno.env.get('SUPABASE_URL') ?? supabase_url
  supabase_anon_key = Deno.env.get('SUPABASE_ANON_KEY') ?? supabase_anon_key
}

export const supabase = createClient(supabase_url, supabase_anon_key)
