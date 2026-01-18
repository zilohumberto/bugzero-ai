// Workflow steps
export type WorkflowStep = 'input' | 'validating' | 'select-action' | 'processing' | 'collect-info' | 'submitting' | 'result'

// Available actions for website analysis
export type WebsiteAction = 'analyze-performance' | 'generate-test-cases' | 'write-playwright-tests'

export interface ActionOption {
  id: WebsiteAction
  title: string
  description: string
  icon: string
}

// Website validation
export interface WebsiteValidation {
  url: string
  isValid: boolean
  title?: string
  description?: string
  favicon?: string
  error?: string
}

// Workflow state
export interface WorkflowState {
  step: WorkflowStep
  websiteUrl: string | null
  validation: WebsiteValidation | null
  selectedAction: WebsiteAction | null
  result: WorkflowResult | null
  error: string | null
}

// Result from action
export interface WorkflowResult {
  action: WebsiteAction
  websiteUrl: string
  message: string
  addedToWishlist: boolean
  timestamp: Date
}

// User info for wishlist
export interface UserInfo {
  name: string
  email: string
  acceptedPolicy: boolean
}

// Build status
export type BuildStatus = 'pending' | 'processing' | 'completed' | 'failed'

// Build entry (history)
export interface BuildEntry {
  id: string
  websiteUrl: string
  websiteTitle?: string
  action: WebsiteAction
  userName: string
  userEmail: string
  status: BuildStatus
  output?: string
  createdAt: Date
  completedAt?: Date
}

// Wishlist submission
export interface WishlistSubmissionRequest {
  url: string
  action: WebsiteAction
  name: string
  email: string
  acceptedPolicy: boolean
}

export interface WishlistSubmissionResponse {
  success: boolean
  message: string
  wishlistId: string
}

// API types
export interface ValidateWebsiteRequest {
  url: string
}

export interface ValidateWebsiteResponse {
  isValid: boolean
  title?: string
  description?: string
  favicon?: string
  error?: string
}

export interface ProcessActionRequest {
  url: string
  action: WebsiteAction
}

export interface ProcessActionResponse {
  success: boolean
  message: string
  addedToWishlist: boolean
}

// Theme
export type Theme = 'light' | 'dark' | 'system'

// Auth types
export type PlanType = 'free' | 'starter' | 'business' | 'enterprise'

export interface User {
  id: string
  email: string
  name: string
  plan: PlanType
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface UsageInfo {
  userId: string
  plan: PlanType
  limit: number
  used: number
  remaining: number
}

// Legacy types (keeping for compatibility)
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  webpageUrl?: string
  isLoading?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
