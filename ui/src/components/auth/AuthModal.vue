<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { validatePassword, isValidEmail } from '@/utils/validators'
import Button from '@/components/common/Button.vue'

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const touched = ref({
  name: false,
  email: false,
  password: false,
  confirmPassword: false,
})

const isLogin = computed(() => authStore.authMode === 'login')

const passwordValidation = computed(() => validatePassword(password.value))

const errors = computed(() => ({
  name: touched.value.name && !name.value.trim(),
  email: touched.value.email && (!email.value.trim() || !isValidEmail(email.value)),
  password: touched.value.password && !passwordValidation.value.isValid,
  confirmPassword: touched.value.confirmPassword && password.value !== confirmPassword.value,
}))

const canSubmit = computed(() => {
  if (isLogin.value) {
    return email.value.trim() && password.value.trim() && !authStore.isLoading
  }
  return (
    name.value.trim() &&
    email.value.trim() &&
    isValidEmail(email.value) &&
    passwordValidation.value.isValid &&
    password.value === confirmPassword.value &&
    !authStore.isLoading
  )
})

// Reset form when switching modes
watch(() => authStore.authMode, () => {
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  touched.value = { name: false, email: false, password: false, confirmPassword: false }
})

function handleBlur(field: keyof typeof touched.value) {
  touched.value[field] = true
}

async function handleSubmit() {
  if (!canSubmit.value) {
    touched.value = { name: true, email: true, password: true, confirmPassword: true }
    return
  }

  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(name.value, email.value, password.value)
    }
  } catch (err) {
    // Error is handled in store
  }
}

function handleClose() {
  authStore.closeAuthModal()
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="authStore.showAuthModal"
        @click="handleBackdropClick"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      >
        <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <!-- Header -->
          <div class="px-6 pt-6 pb-4">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ isLogin ? 'Welcome Back' : 'Create Account' }}
              </h2>
              <button
                @click="handleClose"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-gray-600 dark:text-gray-400">
              {{ isLogin ? 'Sign in to save your build history' : 'Sign up to track your builds and usage' }}
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="px-6 pb-6 space-y-4">
            <!-- Name field (register only) -->
            <div v-if="!isLogin">
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="Your name"
                :disabled="authStore.isLoading"
                @blur="handleBlur('name')"
                :class="[
                  'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
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
                :disabled="authStore.isLoading"
                @blur="handleBlur('email')"
                :class="[
                  'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                ]"
              />
              <p v-if="errors.email" class="mt-1.5 text-sm text-red-500">
                Please enter a valid email address
              </p>
            </div>

            <!-- Password field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter password"
                  :disabled="authStore.isLoading"
                  @blur="handleBlur('password')"
                  :class="[
                    'w-full px-4 py-3 pr-12 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  ]"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <!-- Password requirements (register only) -->
              <div v-if="!isLogin && touched.password" class="mt-2 space-y-1">
                <p
                  v-for="error in passwordValidation.errors"
                  :key="error"
                  class="text-sm text-red-500 flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  {{ error }}
                </p>
                <p v-if="passwordValidation.isValid" class="text-sm text-green-500 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Password meets all requirements
                </p>
              </div>
            </div>

            <!-- Confirm Password (register only) -->
            <div v-if="!isLogin">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password <span class="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Confirm password"
                :disabled="authStore.isLoading"
                @blur="handleBlur('confirmPassword')"
                :class="[
                  'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                ]"
              />
              <p v-if="errors.confirmPassword" class="mt-1.5 text-sm text-red-500">
                Passwords do not match
              </p>
            </div>

            <!-- API error -->
            <div
              v-if="authStore.error"
              class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p class="text-sm text-red-600 dark:text-red-300">
                {{ authStore.error }}
              </p>
            </div>

            <!-- Submit button -->
            <Button
              type="submit"
              :disabled="!canSubmit"
              :loading="authStore.isLoading"
              class="w-full py-3 text-base"
            >
              {{ isLogin ? 'Sign In' : 'Create Account' }}
            </Button>

            <!-- Switch mode -->
            <p class="text-center text-sm text-gray-600 dark:text-gray-400">
              {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
              <button
                type="button"
                @click="authStore.switchAuthMode"
                class="ml-1 text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                {{ isLogin ? 'Sign up' : 'Sign in' }}
              </button>
            </p>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white,
.modal-enter-active .dark\:bg-gray-800,
.modal-leave-active .dark\:bg-gray-800 {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white,
.modal-enter-from .dark\:bg-gray-800,
.modal-leave-to .dark\:bg-gray-800 {
  transform: scale(0.95);
}
</style>
