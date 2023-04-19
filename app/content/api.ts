import { createClient } from '@supabase/supabase-js'
import ISO6391 from 'iso-639-1'
import { getVideoId } from '../content/utils'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_KEY as string

const supabase = createClient(supabaseUrl, supabaseKey)

const state = {
  fetched_captions: false,
  fetched_processing_captions: false,
}

export const { getCode, getName } = ISO6391

export const captions: any[] = []
export const processing_captions: any[] = []

export async function loadSubtitles(language: string) {
  const { data, error } = await supabase.functions.invoke('brain', {
    body: {
      yt_url: window.location.href,
      desired_language: getCode(language).toLowerCase(),
    },
  })

  if (error) {
    console.error('Error fetching captions:', error)
    return
  }
  return data
}

export async function hasCaptionsLanguage(language: string) {
  if (!captions?.length && !state.fetched_captions) {
    const { data, error } = await supabase
      .from('captions')
      .select('*')
      .eq('video_id', getVideoId())
    if (error) {
      console.error('Error fetching captions:', error)
      return false
    }
    state.fetched_captions = true
    captions.push(...data)
  }

  return captions.some(caption => {
    return getName(caption.language).toUpperCase() === language.toUpperCase()
  })
}

export async function isProcessingCaption(language: string) {
  if (!processing_captions?.length && !state.fetched_processing_captions) {
    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .eq('video_id', getVideoId())
      .eq('status', 'queued')
      .eq('job_details->>desired_language', getCode(language).toLowerCase())
    if (error) {
      console.error('Error fetching captions:', error)
      return false
    }
    state.fetched_processing_captions = true
    processing_captions.push(...data)
  }

  return processing_captions.some(caption => {
    return (
      getName(caption.job_details.desired_language).toUpperCase() ===
      language.toUpperCase()
    )
  })
}
