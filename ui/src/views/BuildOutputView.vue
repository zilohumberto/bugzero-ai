<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkflowStore } from '@/stores/workflowStore'
import type { WebsiteAction } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useWorkflowStore()

const buildId = computed(() => route.params.id as string)
const build = computed(() => store.getBuildById(buildId.value))

const actionLabels: Record<WebsiteAction, string> = {
  'analyze-performance': 'Performance Analysis',
  'generate-test-cases': 'Test Case Generation',
  'write-playwright-tests': 'Playwright Tests'
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function handleBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <button
          @click="handleBack"
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Home</span>
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-4xl mx-auto px-4 py-8">
      <!-- Build not found -->
      <div v-if="!build" class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Build Not Found
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          The build you're looking for doesn't exist or has been removed.
        </p>
        <button
          @click="handleBack"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Go Back Home
        </button>
      </div>

      <!-- Build details -->
      <div v-else>
        <!-- Build info card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {{ getDomain(build.websiteUrl) }}
              </h1>
              <p class="text-gray-500 dark:text-gray-400">
                {{ actionLabels[build.action] }}
              </p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                build.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300' :
                build.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' :
                build.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300' :
                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              ]"
            >
              {{ build.status.charAt(0).toUpperCase() + build.status.slice(1) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Requested by</span>
              <p class="text-gray-900 dark:text-gray-100 font-medium">{{ build.userName }}</p>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Email</span>
              <p class="text-gray-900 dark:text-gray-100 font-medium">{{ build.userEmail }}</p>
            </div>
          </div>
        </div>

        <!-- Output section (placeholder) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Output
          </h2>

          <!-- Placeholder for output -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400">
              Output will be displayed here once processing is complete.
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
              This feature is coming soon.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
