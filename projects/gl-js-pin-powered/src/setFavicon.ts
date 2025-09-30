export function setFavicon(url: string) {
  let link = document.querySelector(
    "link[rel*='icon']"
  ) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}
