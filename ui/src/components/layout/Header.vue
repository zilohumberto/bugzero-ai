<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflowStore'
import Icon from '@/components/common/Icon.vue'

const store = useWorkflowStore()

const isDark = computed(() => {
  if (store.theme === 'dark') return true
  if (store.theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})

function toggleTheme() {
  if (isDark.value) {
    store.setTheme('light')
  } else {
    store.setTheme('dark')
  }
}

function handleNewWebsite() {
  store.reset()
}

function handleMenuClick() {
  store.toggleSidebar()
}
</script>

<template>
  <header class="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sm:px-6">
    <!-- Left side - Menu button + Logo -->
    <div class="flex items-center gap-3">
      <!-- Mobile menu button -->
      <button
        @click="handleMenuClick"
        class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
        title="Toggle menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      </div>
      <div class="hidden sm:block">
        <h1 class="font-bold text-gray-900 dark:text-gray-100 text-lg">
          BugZero
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          AI Testing Platform
        </p>
      </div>
    </div>

    <!-- Center - Breadcrumb/Status (optional) -->
    <div class="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span class="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
        Beta
      </span>
    </div>

    <!-- Right side - Actions -->
    <div class="flex items-center gap-2">
      <!-- New Website button -->
      <button
        @click="handleNewWebsite"
        class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Icon name="plus" size="sm" />
        <span class="hidden sm:inline">New Website</span>
      </button>

      <!-- Theme toggle -->
      <button
        @click="toggleTheme"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <Icon :name="isDark ? 'sun' : 'moon'" />
      </button>
    </div>
  </header>
</template>
