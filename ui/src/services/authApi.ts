import type { AuthResponse, User, UsageInfo } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/v0/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }))
    throw new Error(error.detail || 'Invalid email or password')
  }

  const data = await response.json()

  return {
    access_token: data.access_token,
    token_type: data.token_type,
    user: transformUser(data.user),
  }
}

/**
 * Register a new user
 */
export async function register(name: string, email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/v0/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name,
      password,
      auth_provider: 'local',
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }))
    throw new Error(error.detail || 'Registration failed')
  }

  const data = await response.json()
  return transformUser(data)
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/v0/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get current user')
  }

  const data = await response.json()
  return transformUser(data)
}

/**
 * Get user usage statistics
 */
export async function getUserUsage(token: string): Promise<UsageInfo> {
  const response = await fetch(`${API_BASE_URL}/v0/users/me/usage`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get usage info')
  }

  const data = await response.json()
  return {
    userId: data.user_id,
    plan: data.plan,
    limit: data.limit,
    used: data.used,
    remaining: data.remaining,
  }
}

/**
 * Transform API user response to User type
 */
function transformUser(data: any): User {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    plan: data.plan,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}
