import { computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import type { Theme } from '@/types'

export function useTheme() {
  const store = useChatStore()

  const theme = computed(() => store.theme)

  const isDark = computed(() => {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  function setTheme(newTheme: Theme) {
    store.setTheme(newTheme)
  }

  function toggleTheme() {
    if (isDark.value) {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  function handleSystemThemeChange(e: MediaQueryListEvent) {
    if (theme.value === 'system') {
      const root = document.documentElement
      if (e.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  })

  onUnmounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  }
}
