<script setup lang="ts">
</script>

<template>
  <div class="flex items-center gap-1 p-2">
    <div class="flex gap-1">
      <span
        class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
        style="animation-delay: 0ms"
      />
      <span
        class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
        style="animation-delay: 150ms"
      />
      <span
        class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
        style="animation-delay: 300ms"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}

span {
  animation: bounce 1.4s infinite ease-in-out;
}
</style>
