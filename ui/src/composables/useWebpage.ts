import { ref, computed } from 'vue'
import type { WebpageInfo } from '@/types'
import { isValidUrl, extractUrls, normalizeUrl, getDomainFromUrl } from '@/utils/validators'
import { fetchWebpageInfo } from '@/services/api'

export function useWebpage() {
  const detectedUrl = ref<string | null>(null)
  const webpageInfo = ref<WebpageInfo | null>(null)
  const isLoadingInfo = ref(false)

  const hasValidUrl = computed(() => {
    return detectedUrl.value !== null && isValidUrl(detectedUrl.value)
  })

  const domain = computed(() => {
    if (!detectedUrl.value) return null
    return getDomainFromUrl(detectedUrl.value)
  })

  function detectUrlInText(text: string): string | null {
    const urls = extractUrls(text)
    if (urls.length > 0) {
      const url = normalizeUrl(urls[0])
      if (isValidUrl(url)) {
        return url
      }
    }
    return null
  }

  function setUrl(url: string | null) {
    if (url && isValidUrl(url)) {
      detectedUrl.value = normalizeUrl(url)
    } else {
      detectedUrl.value = null
    }
    webpageInfo.value = null
  }

  function clearUrl() {
    detectedUrl.value = null
    webpageInfo.value = null
  }

  async function loadWebpageInfo() {
    if (!detectedUrl.value) return

    isLoadingInfo.value = true
    try {
      const info = await fetchWebpageInfo(detectedUrl.value)
      webpageInfo.value = {
        url: detectedUrl.value,
        title: info.title,
        isValid: true,
        isLoading: false
      }
    } catch {
      webpageInfo.value = {
        url: detectedUrl.value,
        isValid: true,
        isLoading: false
      }
    } finally {
      isLoadingInfo.value = false
    }
  }

  function validateUrl(url: string): boolean {
    return isValidUrl(url)
  }

  return {
    detectedUrl,
    webpageInfo,
    isLoadingInfo,
    hasValidUrl,
    domain,
    detectUrlInText,
    setUrl,
    clearUrl,
    loadWebpageInfo,
    validateUrl
  }
}
