<script setup lang="ts">
import { computed } from 'vue'
import type { WebsiteValidation, WebsiteAction, ActionOption } from '@/types'
import Icon from '@/components/common/Icon.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps<{
  validation: WebsiteValidation
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', action: WebsiteAction): void
  (e: 'back'): void
}>()

const actions: ActionOption[] = [
  {
    id: 'analyze-performance',
    title: 'Analyze Performance',
    description: 'Get detailed performance metrics, load times, and optimization suggestions',
    icon: 'chart'
  },
  {
    id: 'generate-test-cases',
    title: 'Generate Test Cases',
    description: 'Create comprehensive test cases based on the website structure and functionality',
    icon: 'list'
  },
  {
    id: 'write-playwright-tests',
    title: 'Write Playwright Tests',
    description: 'Generate ready-to-run Playwright test scripts for automated testing',
    icon: 'code'
  }
]

const domain = computed(() => {
  try {
    return new URL(props.validation.url).hostname.replace('www.', '')
  } catch {
    return props.validation.url
  }
})
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <!-- Back button -->
    <button
      @click="emit('back')"
      class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back</span>
    </button>

    <!-- Website info card -->
    <div class="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
          <img
            v-if="validation.favicon"
            :src="validation.favicon"
            :alt="validation.title"
            class="w-8 h-8"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <Icon v-else name="link" class="text-gray-400" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <Icon name="check" size="sm" class="text-green-500" />
            <span class="text-sm font-medium text-green-700 dark:text-green-300">Website Validated</span>
          </div>
          <p class="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {{ validation.title || domain }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
            {{ validation.url }}
          </p>
        </div>
      </div>
    </div>

    <!-- Action selection header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        What would you like to do?
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Select an action to perform on this website
      </p>
    </div>

    <!-- Action cards -->
    <div class="space-y-4">
      <button
        v-for="action in actions"
        :key="action.id"
        @click="emit('select', action.id)"
        :disabled="isLoading"
        class="w-full p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div class="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
            <!-- Performance icon -->
            <svg v-if="action.icon === 'chart'" class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <!-- Test cases icon -->
            <svg v-else-if="action.icon === 'list'" class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <!-- Code icon -->
            <svg v-else-if="action.icon === 'code'" class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ action.title }}
            </h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">
              {{ action.description }}
            </p>
          </div>

          <!-- Arrow -->
          <div class="flex-shrink-0 mt-1">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
