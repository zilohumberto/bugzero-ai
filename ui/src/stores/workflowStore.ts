import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  WorkflowStep,
  WebsiteAction,
  WebsiteValidation,
  WorkflowResult,
  BuildEntry,
  UserInfo,
  Theme
} from '@/types'
import { validateWebsite, processWebsiteAction, submitToWishlist } from '@/services/api'
import { normalizeUrl } from '@/utils/validators'
import { generateId } from '@/utils/helpers'

const BUILDS_KEY = 'bugzero-builds'
const THEME_KEY = 'bugzero-theme'

export const useWorkflowStore = defineStore('workflow', () => {
  // Workflow state
  const step = ref<WorkflowStep>('input')
  const websiteUrl = ref<string | null>(null)
  const validation = ref<WebsiteValidation | null>(null)
  const selectedAction = ref<WebsiteAction | null>(null)
  const userInfo = ref<UserInfo | null>(null)
  const result = ref<WorkflowResult | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  // Builds history
  const builds = ref<BuildEntry[]>([])

  // UI state
  const sidebarOpen = ref(false)

  // Theme
  const theme = ref<Theme>('system')

  // Getters
  const canProceed = computed(() => {
    switch (step.value) {
      case 'input':
        return websiteUrl.value !== null
      case 'select-action':
        return selectedAction.value !== null
      case 'collect-info':
        return userInfo.value !== null && userInfo.value.acceptedPolicy
      default:
        return false
    }
  })

  const currentStepIndex = computed(() => {
    const steps: WorkflowStep[] = ['input', 'validating', 'select-action', 'processing', 'collect-info', 'submitting', 'result']
    return steps.indexOf(step.value)
  })

  // Get a specific build by ID
  function getBuildById(id: string): BuildEntry | undefined {
    return builds.value.find(b => b.id === id)
  }

  // Actions
  async function submitWebsite(url: string) {
    const normalizedUrl = normalizeUrl(url)
    websiteUrl.value = normalizedUrl
    error.value = null
    step.value = 'validating'
    isLoading.value = true

    try {
      const response = await validateWebsite(normalizedUrl)

      validation.value = {
        url: normalizedUrl,
        isValid: response.isValid,
        title: response.title,
        description: response.description,
        favicon: response.favicon,
        error: response.error
      }

      if (response.isValid) {
        step.value = 'select-action'
      } else {
        error.value = response.error || 'Website validation failed'
        step.value = 'input'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to validate website'
      step.value = 'input'
    } finally {
      isLoading.value = false
    }
  }

  async function selectAndProcessAction(action: WebsiteAction) {
    if (!websiteUrl.value) return

    selectedAction.value = action
    step.value = 'processing'
    isLoading.value = true
    error.value = null

    try {
      await processWebsiteAction(websiteUrl.value, action)
      step.value = 'collect-info'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to process action'
      step.value = 'select-action'
    } finally {
      isLoading.value = false
    }
  }

  async function submitWishlistWithUserInfo(name: string, email: string) {
    if (!websiteUrl.value || !selectedAction.value) return

    userInfo.value = {
      name,
      email,
      acceptedPolicy: true
    }

    step.value = 'submitting'
    isLoading.value = true
    error.value = null

    try {
      const response = await submitToWishlist(
        websiteUrl.value,
        selectedAction.value,
        name,
        email
      )

      result.value = {
        action: selectedAction.value,
        websiteUrl: websiteUrl.value,
        message: response.message,
        addedToWishlist: true,
        timestamp: new Date()
      }

      // Add to builds history
      addBuild(websiteUrl.value, selectedAction.value, name, email)

      step.value = 'result'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit'
      step.value = 'collect-info'
    } finally {
      isLoading.value = false
    }
  }

  function addBuild(url: string, action: WebsiteAction, userName: string, userEmail: string) {
    const entry: BuildEntry = {
      id: generateId(),
      websiteUrl: url,
      websiteTitle: validation.value?.title,
      action,
      userName,
      userEmail,
      status: 'pending',
      createdAt: new Date()
    }
    builds.value.unshift(entry)
    saveBuilds()
  }

  function reset() {
    step.value = 'input'
    websiteUrl.value = null
    validation.value = null
    selectedAction.value = null
    userInfo.value = null
    result.value = null
    error.value = null
    isLoading.value = false
  }

  function goBack() {
    switch (step.value) {
      case 'select-action':
        step.value = 'input'
        validation.value = null
        break
      case 'collect-info':
        step.value = 'select-action'
        selectedAction.value = null
        userInfo.value = null
        break
      case 'result':
        step.value = 'select-action'
        result.value = null
        selectedAction.value = null
        userInfo.value = null
        break
    }
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function removeBuild(id: string) {
    const index = builds.value.findIndex(b => b.id === id)
    if (index !== -1) {
      builds.value.splice(index, 1)
      saveBuilds()
    }
  }

  function clearBuilds() {
    builds.value = []
    saveBuilds()
  }

  // Theme
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem(THEME_KEY, newTheme)
    applyTheme(newTheme)
  }

  function applyTheme(newTheme: Theme) {
    const root = document.documentElement
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Persistence
  function saveBuilds() {
    try {
      localStorage.setItem(BUILDS_KEY, JSON.stringify(builds.value))
    } catch (e) {
      console.error('Failed to save builds:', e)
    }
  }

  function loadFromStorage() {
    try {
      const savedBuilds = localStorage.getItem(BUILDS_KEY)
      if (savedBuilds) {
        const parsed = JSON.parse(savedBuilds) as BuildEntry[]
        builds.value = parsed.map(b => ({
          ...b,
          createdAt: new Date(b.createdAt),
          completedAt: b.completedAt ? new Date(b.completedAt) : undefined
        }))
      }

      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
      if (savedTheme) {
        theme.value = savedTheme
        applyTheme(savedTheme)
      }
    } catch (e) {
      console.error('Failed to load from storage:', e)
    }
  }

  // Initialize
  loadFromStorage()

  return {
    // State
    step,
    websiteUrl,
    validation,
    selectedAction,
    userInfo,
    result,
    error,
    isLoading,
    builds,
    theme,
    sidebarOpen,
    // Getters
    canProceed,
    currentStepIndex,
    // Actions
    getBuildById,
    submitWebsite,
    selectAndProcessAction,
    submitWishlistWithUserInfo,
    reset,
    goBack,
    clearError,
    toggleSidebar,
    closeSidebar,
    removeBuild,
    clearBuilds,
    setTheme,
    loadFromStorage
  }
})
