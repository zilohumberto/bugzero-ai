<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WebsiteAction, WebsiteValidation } from '@/types'
import Icon from '@/components/common/Icon.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps<{
  validation: WebsiteValidation
  action: WebsiteAction
  isLoading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: { name: string; email: string }): void
  (e: 'back'): void
}>()

const name = ref('')
const email = ref('')
const acceptedPolicy = ref(false)
const touched = ref({
  name: false,
  email: false,
  policy: false
})

const actionLabels: Record<WebsiteAction, string> = {
  'analyze-performance': 'Performance Analysis',
  'generate-test-cases': 'Test Case Generation',
  'write-playwright-tests': 'Playwright Tests'
}

const domain = computed(() => {
  try {
    return new URL(props.validation.url).hostname.replace('www.', '')
  } catch {
    return props.validation.url
  }
})

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const errors = computed(() => ({
  name: touched.value.name && !name.value.trim(),
  email: touched.value.email && (!email.value.trim() || !isValidEmail.value),
  policy: touched.value.policy && !acceptedPolicy.value
}))

const canSubmit = computed(() => {
  return (
    name.value.trim() &&
    email.value.trim() &&
    isValidEmail.value &&
    acceptedPolicy.value &&
    !props.isLoading
  )
})

function handleSubmit() {
  touched.value = { name: true, email: true, policy: true }

  if (canSubmit.value) {
    emit('submit', {
      name: name.value.trim(),
      email: email.value.trim()
    })
  }
}

function handleBlur(field: 'name' | 'email' | 'policy') {
  touched.value[field] = true
}
</script>

<template>
  <div class="w-full max-w-lg mx-auto">
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

    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Add to Wishlist
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Enter your details to be notified when this feature is ready
      </p>
    </div>

    <!-- Summary card -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden">
          <img
            v-if="validation.favicon"
            :src="validation.favicon"
            :alt="validation.title"
            class="w-6 h-6"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <Icon v-else name="link" size="sm" class="text-gray-400" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
            {{ domain }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ actionLabels[action] }}
          </p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Name field -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="Your name"
          :disabled="isLoading"
          @blur="handleBlur('name')"
          :class="[
            'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          ]"
        />
        <p v-if="errors.name" class="mt-1.5 text-sm text-red-500">
          Please enter your name
        </p>
      </div>

      <!-- Email field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Email <span class="text-red-500">*</span>
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="your@email.com"
          :disabled="isLoading"
          @blur="handleBlur('email')"
          :class="[
            'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
            errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          ]"
        />
        <p v-if="errors.email" class="mt-1.5 text-sm text-red-500">
          Please enter a valid email address
        </p>
      </div>

      <!-- Policy checkbox -->
      <div class="pt-2">
        <label class="flex items-start gap-3 cursor-pointer group">
          <div class="relative flex items-center justify-center mt-0.5">
            <input
              v-model="acceptedPolicy"
              type="checkbox"
              :disabled="isLoading"
              @change="handleBlur('policy')"
              class="sr-only"
            />
            <div
              :class="[
                'w-5 h-5 border-2 rounded transition-all flex items-center justify-center',
                acceptedPolicy
                  ? 'bg-primary-500 border-primary-500'
                  : errors.policy
                    ? 'border-red-500 bg-white dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-primary-400'
              ]"
            >
              <svg
                v-if="acceptedPolicy"
                class="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            I agree to the
            <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
            and
            <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>.
            I consent to receive email notifications about this feature.
            <span class="text-red-500">*</span>
          </span>
        </label>
        <p v-if="errors.policy" class="mt-1.5 text-sm text-red-500 ml-8">
          You must accept the policy to continue
        </p>
      </div>

      <!-- API error -->
      <div
        v-if="error"
        class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
      >
        <Icon name="close" class="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-red-800 dark:text-red-200">
            Submission Failed
          </p>
          <p class="text-sm text-red-600 dark:text-red-300 mt-1">
            {{ error }}
          </p>
        </div>
      </div>

      <!-- Submit button -->
      <Button
        type="submit"
        :disabled="!canSubmit"
        :loading="isLoading"
        class="w-full py-3.5 text-base"
      >
        <template v-if="!isLoading">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>Add to Wishlist</span>
        </template>
        <template v-else>
          <span>Submitting...</span>
        </template>
      </Button>
    </form>
  </div>
</template>
