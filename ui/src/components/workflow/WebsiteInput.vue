<script setup lang="ts">
import { ref, computed } from 'vue'
import Icon from '@/components/common/Icon.vue'
import Button from '@/components/common/Button.vue'
import { isValidUrl } from '@/utils/validators'

const props = defineProps<{
  isLoading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', url: string): void
}>()

const url = ref('')
const touched = ref(false)

const isValid = computed(() => {
  if (!url.value) return false
  return isValidUrl(url.value)
})

const showError = computed(() => {
  return touched.value && url.value && !isValid.value
})

function handleSubmit() {
  touched.value = true
  if (isValid.value && !props.isLoading) {
    emit('submit', url.value)
  }
}

function handleInput() {
  touched.value = true
}
</script>

<template>
  <div class="w-full max-w-xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
        <Icon name="link" size="xl" class="text-white" />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Add a Website
      </h1>
      <p class="text-gray-600 dark:text-gray-400 text-lg">
        Enter a website URL to analyze and generate tests
      </p>
    </div>

    <!-- Input form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="website-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Website URL
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon name="link" size="md" class="text-gray-400" />
          </div>
          <input
            id="website-url"
            v-model="url"
            type="text"
            placeholder="https://example.com"
            :disabled="isLoading"
            @input="handleInput"
            :class="[
              'w-full pl-12 pr-4 py-4 text-lg border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
              showError
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            ]"
          />
        </div>

        <!-- Validation error -->
        <p v-if="showError" class="mt-2 text-sm text-red-500 flex items-center gap-1">
          <Icon name="close" size="sm" />
          Please enter a valid URL (e.g., https://example.com)
        </p>

        <!-- API error -->
        <div
          v-if="error"
          class="mt-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
        >
          <Icon name="close" class="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-red-800 dark:text-red-200">
              Validation Failed
            </p>
            <p class="text-sm text-red-600 dark:text-red-300 mt-1">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        :disabled="!isValid || isLoading"
        :loading="isLoading"
        class="w-full py-4 text-lg"
      >
        <template v-if="!isLoading">
          <span>Validate Website</span>
          <Icon name="send" size="md" />
        </template>
        <template v-else>
          <span>Validating...</span>
        </template>
      </Button>
    </form>

    <!-- Helper text -->
    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      We'll verify the website is accessible before showing available actions
    </p>
  </div>
</template>
