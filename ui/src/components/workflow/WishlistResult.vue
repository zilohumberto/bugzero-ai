<script setup lang="ts">
import { computed } from 'vue'
import type { WorkflowResult, WebsiteAction } from '@/types'
import Icon from '@/components/common/Icon.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps<{
  result: WorkflowResult
}>()

const emit = defineEmits<{
  (e: 'startOver'): void
  (e: 'tryAnother'): void
}>()

const actionLabels: Record<WebsiteAction, string> = {
  'analyze-performance': 'Performance Analysis',
  'generate-test-cases': 'Test Case Generation',
  'write-playwright-tests': 'Playwright Tests'
}

const domain = computed(() => {
  try {
    return new URL(props.result.websiteUrl).hostname.replace('www.', '')
  } catch {
    return props.result.websiteUrl
  }
})
</script>

<template>
  <div class="w-full max-w-xl mx-auto text-center">
    <!-- Success animation -->
    <div class="mb-8">
      <div class="relative w-24 h-24 mx-auto">
        <!-- Background circle -->
        <div class="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-900/30 animate-pulse"></div>

        <!-- Star icon -->
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-12 h-12 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Title -->
    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
      Added to Wishlist!
    </h2>

    <!-- Subtitle -->
    <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
      This feature is coming soon
    </p>

    <!-- Result card -->
    <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8 text-left">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 dark:text-gray-100">
            {{ actionLabels[result.action] }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
            {{ domain }}
          </p>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-amber-200 dark:border-amber-700">
        <p class="text-sm text-amber-800 dark:text-amber-200">
          {{ result.message }}
        </p>
      </div>
    </div>

    <!-- Info box -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-left">
          <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
            Product in Development
          </p>
          <p class="text-sm text-blue-600 dark:text-blue-300 mt-1">
            We're actively working on this feature. Your request has been saved and you'll be notified when it's ready.
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Button
        variant="secondary"
        class="flex-1 justify-center"
        @click="emit('tryAnother')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Try Another Action</span>
      </Button>

      <Button
        class="flex-1 justify-center"
        @click="emit('startOver')"
      >
        <Icon name="plus" size="sm" />
        <span>Add New Website</span>
      </Button>
    </div>
  </div>
</template>
