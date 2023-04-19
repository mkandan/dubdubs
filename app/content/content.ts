// This is good code, i like it, hopefully you will too.

import { createComponent as createModalComponent } from '../components/modal'
import languages from './languages.json'
import { waitForElement } from './utils'

function getSubtitleButtonSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.innerHTML = `
    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17.5 17.0801H15.65" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.97 17.0801H6.5" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17.5 13.3201H11.97" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.27 13.3201H6.5" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  `
  return svg
}

function createSubtitleButton() {
  const subtitleButton = document.createElement('button')
  subtitleButton.className = 'ytp-button subtitles-button'
  subtitleButton.setAttribute('data-title', 'Subtitles')
  subtitleButton.setAttribute('role', 'button')

  const svg = getSubtitleButtonSVG()
  subtitleButton.appendChild(svg)

  createTooltip(subtitleButton)

  subtitleButton.addEventListener('click', () => {
    const modal: any = document.querySelector('.modal-dubsdubs')
    if (!modal) return
    modal.style.display = 'block'
  })
  return subtitleButton
}

function createTooltip(subtitleButton: HTMLElement) {
  const tooltip = document.createElement('div')
  tooltip.setAttribute('id', 'yt-video-loop-tooltip')
  tooltip.className = 'ytp-tooltip  ytp-bottom'
  tooltip.style.display = 'none'

  const wrapper = document.createElement('div')
  wrapper.className = 'ytp-tooltip-text-wrapper'

  const tooltipText = document.createElement('span')
  tooltipText.className = 'ytp-tooltip-text'

  const position = document.getElementsByClassName('ytp-storyboard')[0]
  wrapper.appendChild(tooltipText)
  tooltip.appendChild(wrapper)
  document.getElementById('movie_player')?.insertBefore(tooltip, position)

  subtitleButton.addEventListener('mouseover', showTooltip)
  subtitleButton.addEventListener('mouseleave', hideTooltip)

  function showTooltip() {
    const video = document.getElementsByClassName(
      'video-stream html5-main-video',
    )[0] as HTMLVideoElement
    const videoHeight = parseInt(video.style.height, 10)

    tooltipText.innerHTML = subtitleButton.getAttribute('data-title') || ''
    tooltip.style.left = subtitleButton.offsetLeft + 'px'
    tooltip.style.top = videoHeight - 87.5 + 'px'
    tooltip.style.display = 'inline'
  }

  function hideTooltip() {
    tooltip.style.display = 'none'
  }
}

function insertSubtitleButton(subtitleButton: HTMLButtonElement) {
  const defaultSubtitleButton = document.querySelector(
    'button.ytp-subtitles-button.ytp-button',
  )

  if (!defaultSubtitleButton) {
    throw new Error('[DubsDubs] Default subtitle button not found!')
  }

  defaultSubtitleButton.insertAdjacentElement('beforebegin', subtitleButton)
}

async function addUserInteractions() {
  await waitForElement('video')
  const subtitleButton = createSubtitleButton()
  insertSubtitleButton(subtitleButton)

  const modal = await createModalComponent({
    values: languages,
  })

  if (!modal) return
  document.body.appendChild(modal)
}

addUserInteractions()
