import {
  captions,
  getName,
  hasCaptionsLanguage,
  isProcessingCaption,
  loadSubtitles,
} from '../content/api'
import { createCaptionElement } from './caption'

interface ComponentOptions {
  values: string[]
}

let subtitlesInterval: any // Interval to sync subtitles (setInterval)
let captionItems: any[] // Each caption with timespan and text (timestamped_captions column value)

// Returns timespan in milliseconds
function timeToMs(time: string) {
  const [h, m, s] = time.split(':')
  const [seconds, ms] = s.split('.')
  return (+h * 60 * 60 + +m * 60 + +seconds) * 1000 + +ms
}

// Manage subtitles
function updateSubtitles(videoTimeMs: number) {
  const captionContainer = document.querySelector(
    '.caption-window.ytp-caption-window-bottom',
  )

  if (captionContainer) {
    const currentSubtitle = captionItems.find(item => {
      const startMs = timeToMs(item.start)
      const endMs = timeToMs(item.end)
      return videoTimeMs >= startMs && videoTimeMs < endMs
    })

    captionContainer.innerHTML = ''

    if (currentSubtitle) {
      const captionElement = createCaptionElement(currentSubtitle.caption)
      captionContainer.appendChild(captionElement)
    }
  }
}

// I don't remember
function syncSubtitles(ytPlayer: HTMLVideoElement) {
  const currentTimeMs = ytPlayer.currentTime * 1000
  updateSubtitles(currentTimeMs)
}

export async function createComponent(options: ComponentOptions) {
  const modal = document.createElement('div')
  const searchInput = document.createElement('input')
  const modalContent = document.createElement('div')

  searchInput.addEventListener('input', (event: any) => {
    const value = event.target.value
    const modalItems = document.querySelectorAll<HTMLDivElement>(
      '.modal-item-dubsdubs',
    )

    modalItems.forEach((item: any) => {
      if (item.innerHTML.toLowerCase().includes(value.toLowerCase())) {
        item.style.display = 'flex'
      } else {
        item.style.display = 'none'
      }
    })
  })

  modal.addEventListener('click', (event: any) => {
    if (event.target.className === 'modal-dubsdubs') {
      modal.style.display = 'none'
    }
  })

  modalContent.appendChild(searchInput)

  const modalItems = await Promise.all(
    options.values.map(async value => {
      // value = language name (e.g. English, Spanish, etc.)
      const p = document.createElement('p')
      const availabilityIndicator = document.createElement('span')
      const hasCaptions = await hasCaptionsLanguage(value)
      const isProcessing = await isProcessingCaption(value)

      p.innerHTML = value
      p.className = 'modal-item-dubsdubs'
      p.setAttribute('data-available', hasCaptions.toString())
      p.setAttribute('data-processing', isProcessing.toString())
      p.appendChild(availabilityIndicator)

      p.addEventListener('click', async () => {
        // Calling it again because it might have changed
        const isAlreadyProcessing = await isProcessingCaption(value)
        if (isAlreadyProcessing) {
          p.setAttribute('data-processing', 'true')
          return
        }

        const hasAlreadyCaptions = await hasCaptionsLanguage(value)

        if (!hasAlreadyCaptions) {
          await loadSubtitles(value)

          p.setAttribute('data-processing', 'true')
          return
        }

        const video = document.querySelector('video')

        if (!video) return

        // Old (tested) code commented, if something broke after my edit.
        // Add "https://gist.githubusercontent.com/*" to the "permissions" array in "manifests files,
        // Otherwise, NetworkError, ykyk

        // const data = await fetch(
        //   'https://gist.githubusercontent.com/vrishty/7e147634e6a82df175b30619ccfae6d2/raw/8aac5cb63f247ef53ad35940ca6bcd67862cd904/a2e81258-9d72-4f66-9940-2760de821fbe.vtt',
        // ).then(res => res.text())

        // const items = data.split('\n')
        // const filteredItems = items.filter(Boolean)
        // filteredItems.shift()

        // captionItems = filteredItems
        //   .map((item, i) => {
        //     if (!item.includes('-->')) return null
        //     const [start, end] = item.split(' --> ')
        //     return {
        //       order: i + 1,
        //       start: start,
        //       end: end,
        //       caption: filteredItems[i + 1],
        //     }
        //   })
        //   .filter(Boolean)

        captionItems = captions.find(
          caption =>
            getName(caption.language).toLowerCase() === value.toLowerCase(),
        ).timestamped_captions

        subtitlesInterval && clearInterval(subtitlesInterval)

        subtitlesInterval = setInterval(() => syncSubtitles(video), 500)
      })

      return p
    }),
  )

  // Sort modal items by availability then alphabetically
  modalItems.sort((a, b) => {
    const aLanguageAvailable = captions.some(
      caption => getName(caption.language) === a.innerHTML,
    )
    const bLanguageAvailable = captions.some(
      caption => getName(caption.language) === b.innerHTML,
    )

    if (aLanguageAvailable && !bLanguageAvailable) {
      return -1
    } else if (!aLanguageAvailable && bLanguageAvailable) {
      return 1
    } else {
      return a.innerHTML.localeCompare(b.innerHTML)
    }
  })

  modalContent.append(...modalItems)

  modal.className = 'modal-dubsdubs'
  modalContent.className = 'modal-content-dubsdubs'
  modal.appendChild(modalContent)
  return modal
}
