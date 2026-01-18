<script setup lang="ts">
import Icon from '@/components/common/Icon.vue'

defineProps<{
  url: string
}>()
</script>

<template>
  <div class="w-full max-w-xl mx-auto text-center">
    <!-- Loading animation -->
    <div class="mb-8">
      <div class="relative w-24 h-24 mx-auto">
        <!-- Outer spinning ring -->
        <div class="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-800"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>

        <!-- Inner icon -->
        <div class="absolute inset-0 flex items-center justify-center">
          <Icon name="link" size="lg" class="text-primary-500" />
        </div>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
      Validating Website
    </h2>

    <p class="text-gray-600 dark:text-gray-400 mb-4">
      Checking if the website is accessible...
    </p>

    <div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300">
      <Icon name="link" size="sm" class="text-primary-500" />
      <span class="truncate max-w-[300px]">{{ url }}</span>
    </div>

    <!-- Progress steps -->
    <div class="mt-8 space-y-3">
      <div class="flex items-center justify-center gap-3 text-sm">
        <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Icon name="check" size="sm" class="text-white" />
        </div>
        <span class="text-gray-600 dark:text-gray-400">URL format validated</span>
      </div>
      <div class="flex items-center justify-center gap-3 text-sm">
        <div class="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center animate-pulse">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <span class="text-gray-900 dark:text-gray-100 font-medium">Checking website accessibility</span>
      </div>
      <div class="flex items-center justify-center gap-3 text-sm">
        <div class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <span class="text-gray-400 dark:text-gray-500">Fetching website metadata</span>
      </div>
    </div>
  </div>
</template>
