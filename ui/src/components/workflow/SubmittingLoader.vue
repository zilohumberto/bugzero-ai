<script setup lang="ts">
</script>

<template>
  <div class="w-full max-w-md mx-auto text-center">
    <!-- Loading animation -->
    <div class="mb-8">
      <div class="relative w-24 h-24 mx-auto">
        <!-- Outer ring -->
        <div class="absolute inset-0 rounded-full border-4 border-amber-100 dark:border-amber-900/30"></div>
        <!-- Spinning ring -->
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>

        <!-- Center star -->
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-10 h-10 text-amber-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
      Adding to Wishlist
    </h2>

    <p class="text-gray-600 dark:text-gray-400 mb-6">
      Please wait while we save your request...
    </p>

    <!-- Progress indicator -->
    <div class="flex justify-center gap-2">
      <span class="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
      <span class="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
      <span class="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
    </div>
  </div>
</template>
