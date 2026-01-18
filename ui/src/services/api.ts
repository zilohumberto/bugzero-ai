import type { WebsiteAction } from '@/types'
import {
  validateWebsite as mockValidateWebsite,
  processWebsiteAction as mockProcessWebsiteAction
} from './mockApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

/**
 * Collect browser metadata that's legally and easily accessible
 * Note: IP address must be collected server-side from the request headers
 */
function collectBrowserMetadata(): Record<string, unknown> {
  const nav = navigator
  const screen = window.screen

  return {
    // Browser & OS
    userAgent: nav.userAgent,
    platform: nav.platform,
    vendor: nav.vendor,

    // Language preferences
    language: nav.language,
    languages: nav.languages ? [...nav.languages] : [nav.language],

    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    // Screen & viewport
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenColorDepth: screen.colorDepth,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,

    // Browser capabilities
    cookiesEnabled: nav.cookieEnabled,
    onLine: nav.onLine,
    doNotTrack: nav.doNotTrack,

    // Page context
    referrer: document.referrer || null,
    currentUrl: window.location.href,

    // Timestamp
    submittedAt: new Date().toISOString(),
  }
}

/**
 * Validate if a website is accessible and get its metadata
 * Note: This still uses mock until the backend endpoint is implemented
 */
export async function validateWebsite(url: string) {
  // TODO: Connect to real API when endpoint is available
  return mockValidateWebsite(url)
}

/**
 * Process an action on a validated website
 * Note: This still uses mock until the backend endpoint is implemented
 */
export async function processWebsiteAction(url: string, action: WebsiteAction) {
  // TODO: Connect to real API when endpoint is available
  return mockProcessWebsiteAction(url, action)
}

/**
 * Submit wishlist entry with user information
 * Connects to the real backend API
 */
export async function submitToWishlist(
  url: string,
  action: WebsiteAction,
  name: string,
  email: string
) {
  const metadata = collectBrowserMetadata()

  const response = await fetch(`${API_BASE_URL}/v0/wishlist/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      website: url,
      action,
      name,
      email,
      metadata
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || error.message || `HTTP error ${response.status}`)
  }

  const data = await response.json()

  // Transform API response to match expected format
  return {
    success: true,
    message: 'Successfully added to wishlist!',
    wishlistId: data.id
  }
}
