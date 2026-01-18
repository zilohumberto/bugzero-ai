<script setup lang="ts">
import { computed } from 'vue'
import type { WebsiteAction } from '@/types'
import Icon from '@/components/common/Icon.vue'

const props = defineProps<{
  action: WebsiteAction
  url: string
}>()

const actionLabels: Record<WebsiteAction, { title: string; description: string }> = {
  'analyze-performance': {
    title: 'Analyzing Performance',
    description: 'Running performance tests and gathering metrics...'
  },
  'generate-test-cases': {
    title: 'Generating Test Cases',
    description: 'Analyzing website structure and creating test scenarios...'
  },
  'write-playwright-tests': {
    title: 'Writing Playwright Tests',
    description: 'Generating automated test scripts...'
  }
}

const currentAction = computed(() => actionLabels[props.action])

const domain = computed(() => {
  try {
    return new URL(props.url).hostname.replace('www.', '')
  } catch {
    return props.url
  }
})
</script>

<template>
  <div class="w-full max-w-xl mx-auto text-center">
    <!-- Loading animation -->
    <div class="mb-8">
      <div class="relative w-28 h-28 mx-auto">
        <!-- Animated rings -->
        <div class="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-900"></div>
        <div class="absolute inset-2 rounded-full border-4 border-primary-200 dark:border-primary-800 animate-pulse"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>

        <!-- Center icon -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-14 h-14 rounded-xl bg-primary-500 flex items-center justify-center">
            <svg class="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
      {{ currentAction.title }}
    </h2>

    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {{ currentAction.description }}
    </p>

    <!-- Website badge -->
    <div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 mb-8">
      <Icon name="link" size="sm" class="text-primary-500" />
      <span class="truncate max-w-[250px]">{{ domain }}</span>
    </div>

    <!-- Progress bar -->
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div class="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full animate-progress"></div>
    </div>

    <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
      This may take a few moments...
    </p>
  </div>
</template>

<style scoped>
@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 95%;
  }
}

.animate-progress {
  animation: progress 3s ease-out forwards;
}
</style>
