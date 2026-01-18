<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useAuthStore } from '@/stores/authStore'
import type { WebsiteAction, BuildStatus } from '@/types'
import Icon from '@/components/common/Icon.vue'
import { formatTimestamp } from '@/utils/helpers'

const router = useRouter()
const store = useWorkflowStore()
const authStore = useAuthStore()

const builds = computed(() => store.builds)
const isOpen = computed(() => store.sidebarOpen)

const actionLabels: Record<WebsiteAction, string> = {
  'analyze-performance': 'Performance',
  'generate-test-cases': 'Test Cases',
  'write-playwright-tests': 'Playwright'
}

const statusConfig: Record<BuildStatus, { label: string; class: string }> = {
  pending: {
    label: 'Pending',
    class: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  },
  processing: {
    label: 'Processing',
    class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
  },
  completed: {
    label: 'Completed',
    class: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300'
  },
  failed: {
    label: 'Failed',
    class: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'
  }
}

const planLabels: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise'
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function handleBuildClick(id: string) {
  router.push(`/build/${id}`)
  store.closeSidebar()
}

function handleRemove(id: string, event: Event) {
  event.stopPropagation()
  store.removeBuild(id)
}

function handleClearAll() {
  if (confirm('Are you sure you want to clear all builds history?')) {
    store.clearBuilds()
  }
}

function handleOverlayClick() {
  store.closeSidebar()
}

function handleLogin() {
  authStore.openLoginModal()
  store.closeSidebar()
}

function handleSignUp() {
  authStore.openRegisterModal()
  store.closeSidebar()
}

function handleLogout() {
  if (confirm('Are you sure you want to sign out?')) {
    authStore.logout()
  }
}

// Close sidebar on route change
watch(() => router.currentRoute.value, () => {
  store.closeSidebar()
})
</script>

<template>
  <!-- Mobile overlay -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      @click="handleOverlayClick"
      class="lg:hidden fixed inset-0 bg-black/50 z-40"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-col',
      // Desktop: always visible, Mobile: hidden unless open
      isOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden lg:flex'
    ]"
  >
    <!-- Mobile close button -->
    <div class="lg:hidden absolute top-4 right-4">
      <button
        @click="store.closeSidebar()"
        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-gray-900 dark:text-gray-100">
          Builds History
        </h2>
        <button
          v-if="builds.length > 0"
          @click="handleClearAll"
          class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hidden lg:block"
        >
          Clear all
        </button>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Previous analysis requests
      </p>
    </div>

    <!-- Builds list -->
    <div class="flex-1 overflow-y-auto p-3">
      <div v-if="builds.length === 0" class="text-center py-8">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          No builds yet
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Add a website to get started
        </p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="entry in builds"
          :key="entry.id"
          @click="handleBuildClick(entry.id)"
          class="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 group cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <!-- Status badge -->
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    statusConfig[entry.status].class
                  ]"
                >
                  {{ statusConfig[entry.status].label }}
                </span>
                <!-- Action badge -->
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ actionLabels[entry.action] }}
                </span>
              </div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {{ getDomain(entry.websiteUrl) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ formatTimestamp(entry.createdAt) }}
              </p>
            </div>
            <button
              @click="handleRemove(entry.id, $event)"
              class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              title="Remove from history"
            >
              <Icon name="close" size="sm" class="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Auth Section -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <!-- Logged in state -->
      <div v-if="authStore.isAuthenticated" class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span class="text-primary-600 dark:text-primary-400 font-semibold text-sm">
              {{ authStore.user?.name?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>

        <!-- Plan & Usage -->
        <div class="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Plan</span>
            <span class="text-xs font-semibold text-primary-600 dark:text-primary-400">
              {{ planLabels[authStore.user?.plan || 'free'] }}
            </span>
          </div>
          <div v-if="authStore.usage" class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500 dark:text-gray-400">Usage</span>
              <span class="text-gray-900 dark:text-gray-100">
                {{ authStore.usage.used }} / {{ authStore.usage.limit === -1 ? 'Unlimited' : authStore.usage.limit }}
              </span>
            </div>
            <div v-if="authStore.usage.limit !== -1" class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-500 rounded-full transition-all"
                :style="{ width: `${Math.min((authStore.usage.used / authStore.usage.limit) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <button
          @click="handleLogout"
          class="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      <!-- Logged out state -->
      <div v-else class="space-y-3">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Save your history
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sign in to keep your builds synced
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="handleLogin"
            class="flex-1 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 transition-colors"
          >
            Sign In
          </button>
          <button
            @click="handleSignUp"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{{ builds.length }} build{{ builds.length !== 1 ? 's' : '' }}</span>
        <span>BugZero v0.1.0</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
