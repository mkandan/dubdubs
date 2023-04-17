export function createCaptionElement(text: string) {
  const spanOuter = document.createElement('span')
  spanOuter.style.display = 'block'
  spanOuter.classList.add('caption-visual-line')

  const spanInner = document.createElement('span')
  spanInner.style.display = 'inline-block'
  spanInner.style.whiteSpace = 'pre-wrap'
  spanInner.style.background = 'rgba(8, 8, 8, 0.75)'
  spanInner.style.fontSize = '16px'
  spanInner.style.color = 'rgb(255, 255, 255)'
  spanInner.style.fontFamily =
    '"YouTube Noto", Roboto, "Arial Unicode Ms", Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif'
  spanInner.classList.add('ytp-caption-segment')
  spanInner.textContent = text

  spanOuter.appendChild(spanInner)
  return spanOuter
}
