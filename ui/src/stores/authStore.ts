import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UsageInfo } from '@/types'
import { login as apiLogin, register as apiRegister, getCurrentUser, getUserUsage } from '@/services/authApi'

const TOKEN_KEY = 'bugzero-token'
const USER_KEY = 'bugzero-user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const usage = ref<UsageInfo | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Auth modal state
  const showAuthModal = ref(false)
  const authMode = ref<'login' | 'register'>('login')

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function openLoginModal() {
    authMode.value = 'login'
    showAuthModal.value = true
    error.value = null
  }

  function openRegisterModal() {
    authMode.value = 'register'
    showAuthModal.value = true
    error.value = null
  }

  function closeAuthModal() {
    showAuthModal.value = false
    error.value = null
  }

  function switchAuthMode() {
    authMode.value = authMode.value === 'login' ? 'register' : 'login'
    error.value = null
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiLogin(email, password)
      token.value = response.access_token
      user.value = response.user
      saveToStorage()
      closeAuthModal()
      await fetchUsage()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(name: string, email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      await apiRegister(name, email, password)
      // After registration, log in automatically
      await login(email, password)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    usage.value = null
    clearStorage()
  }

  async function fetchCurrentUser() {
    if (!token.value) return

    try {
      const userData = await getCurrentUser(token.value)
      user.value = userData
    } catch (err) {
      // Token might be invalid, log out
      logout()
    }
  }

  async function fetchUsage() {
    if (!token.value) return

    try {
      usage.value = await getUserUsage(token.value)
    } catch (err) {
      console.error('Failed to fetch usage:', err)
    }
  }

  function saveToStorage() {
    try {
      if (token.value) {
        localStorage.setItem(TOKEN_KEY, token.value)
      }
      if (user.value) {
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))
      }
    } catch (e) {
      console.error('Failed to save auth to storage:', e)
    }
  }

  function clearStorage() {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch (e) {
      console.error('Failed to clear auth storage:', e)
    }
  }

  function loadFromStorage() {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedUser = localStorage.getItem(USER_KEY)

      if (savedToken) {
        token.value = savedToken
      }

      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        user.value = {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        }
      }

      // Verify token is still valid
      if (token.value) {
        fetchCurrentUser()
        fetchUsage()
      }
    } catch (e) {
      console.error('Failed to load auth from storage:', e)
      clearStorage()
    }
  }

  return {
    // State
    token,
    user,
    usage,
    isLoading,
    error,
    showAuthModal,
    authMode,
    // Getters
    isAuthenticated,
    // Actions
    openLoginModal,
    openRegisterModal,
    closeAuthModal,
    switchAuthMode,
    login,
    register,
    logout,
    fetchCurrentUser,
    fetchUsage,
    loadFromStorage,
  }
})
