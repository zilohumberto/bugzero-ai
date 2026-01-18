const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i

const FULL_URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return URL_REGEX.test(url)
  }
}

export function extractUrls(text: string): string[] {
  const matches = text.match(FULL_URL_REGEX)
  return matches || []
}

export function normalizeUrl(url: string): string {
  if (!url) return ''
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

export function getDomainFromUrl(url: string): string {
  try {
    const normalizedUrl = normalizeUrl(url)
    const urlObj = new URL(normalizedUrl)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength - 3) + '...'
}

// Password validation
const SPECIAL_CHARS = '.,-><+!:;?|'
const SPECIAL_CHARS_REGEX = /[.,\-><+!:;?|]/

export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []

  if (!password) {
    errors.push('Password is required')
    return { isValid: false, errors }
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least 1 number')
  }

  if (!SPECIAL_CHARS_REGEX.test(password)) {
    errors.push(`Password must contain a special character (${SPECIAL_CHARS})`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
