export type FaviconProvider = 'google'

export type FaviconResult = {
  provider: FaviconProvider
  url: string
}

export function getFavicon(domain: string, size = 64): FaviconResult {
  const normalizedDomain = domain.trim().toLowerCase()
  return {
    provider: 'google',
    url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(normalizedDomain)}&sz=${size}`
  }
}
