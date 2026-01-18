import type {
  ValidateWebsiteResponse,
  ProcessActionResponse,
  WishlistSubmissionResponse,
  WebsiteAction
} from '@/types'
import { delay, generateId } from '@/utils/helpers'
import { getDomainFromUrl } from '@/utils/validators'
import { getFavicon } from '@/services/favicon'

// Mock website data for validation
const MOCK_WEBSITES: Record<string, { title: string; description: string }> = {
  'google.com': {
    title: 'Google',
    description: 'Search the world\'s information'
  },
  'github.com': {
    title: 'GitHub',
    description: 'Where the world builds software'
  },
  'amazon.com': {
    title: 'Amazon',
    description: 'Online shopping from the earth\'s biggest selection'
  },
  'netflix.com': {
    title: 'Netflix',
    description: 'Watch TV shows and movies online'
  },
  'twitter.com': {
    title: 'X (Twitter)',
    description: 'What\'s happening in the world'
  },
  'linkedin.com': {
    title: 'LinkedIn',
    description: 'Professional networking platform'
  },
  'example.com': {
    title: 'Example Domain',
    description: 'This domain is for use in illustrative examples'
  }
}

// Invalid domains for testing
const INVALID_DOMAINS = ['invalid.xyz', 'notareal.site', 'fake123.test']

/**
 * Mock API to validate if a website is valid/accessible
 */
export async function validateWebsite(url: string): Promise<ValidateWebsiteResponse> {
  // Simulate network delay (1-2 seconds)
  await delay(1000 + Math.random() * 1000)

  const domain = getDomainFromUrl(url).toLowerCase()

  // Check for invalid domains
  if (INVALID_DOMAINS.some(d => domain.includes(d))) {
    return {
      isValid: false,
      error: 'Website could not be reached. Please check the URL and try again.'
    }
  }

  // Simulate random validation failure (5% chance)
  if (Math.random() < 0.05) {
    return {
      isValid: false,
      error: 'Connection timeout. The website took too long to respond.'
    }
  }

  // Check for known websites
  const knownSite = Object.entries(MOCK_WEBSITES).find(([key]) => domain.includes(key))

  if (knownSite) {
    const { url: faviconUrl } = getFavicon(domain)
    return {
      isValid: true,
      title: knownSite[1].title,
      description: knownSite[1].description,
      favicon: faviconUrl
    }
  }

  // For unknown but valid-looking URLs
  const { url: fallbackFaviconUrl } = getFavicon(domain)
  return {
    isValid: true,
    title: `Website - ${domain}`,
    description: `Content from ${domain}`,
    favicon: fallbackFaviconUrl
  }
}

/**
 * Mock API to process an action on a website
 */
export async function processWebsiteAction(
  url: string,
  action: WebsiteAction
): Promise<ProcessActionResponse> {
  // Simulate longer processing time (2-4 seconds)
  await delay(2000 + Math.random() * 2000)

  const domain = getDomainFromUrl(url)

  // Simulate random processing failure (3% chance)
  if (Math.random() < 0.03) {
    return {
      success: false,
      message: 'An error occurred while processing your request. Please try again.',
      addedToWishlist: false
    }
  }

  const actionMessages: Record<WebsiteAction, string> = {
    'analyze-performance': `Performance analysis for ${domain} has been added to your wishlist. We'll notify you when this feature is ready!`,
    'generate-test-cases': `Test case generation for ${domain} has been added to your wishlist. We're working hard to bring this feature to you soon!`,
    'write-playwright-tests': `Playwright test generation for ${domain} has been added to your wishlist. This feature is coming soon!`
  }

  return {
    success: true,
    message: actionMessages[action],
    addedToWishlist: true
  }
}

/**
 * Mock API to submit wishlist entry with user info
 */
export async function submitToWishlist(
  url: string,
  action: WebsiteAction,
  name: string,
  email: string
): Promise<WishlistSubmissionResponse> {
  // Simulate network delay (1-2 seconds)
  await delay(1000 + Math.random() * 1000)

  const domain = getDomainFromUrl(url)

  // Simulate random failure (2% chance)
  if (Math.random() < 0.02) {
    throw new Error('Failed to submit to wishlist. Please try again.')
  }

  // Simulate email validation failure
  if (!email.includes('@')) {
    throw new Error('Invalid email address.')
  }

  const actionLabels: Record<WebsiteAction, string> = {
    'analyze-performance': 'Performance Analysis',
    'generate-test-cases': 'Test Case Generation',
    'write-playwright-tests': 'Playwright Test Generation'
  }

  return {
    success: true,
    message: `Thank you, ${name}! Your request for "${actionLabels[action]}" on ${domain} has been added to our wishlist. We'll notify you at ${email} when this feature is ready.`,
    wishlistId: generateId()
  }
}
