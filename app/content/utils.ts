export const waitForElement = async (selector: string) => {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector))
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

export const getVideoId = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('v')
}
