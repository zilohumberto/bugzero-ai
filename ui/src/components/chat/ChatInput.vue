<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Icon from '@/components/common/Icon.vue'
import WebpagePreview from './WebpagePreview.vue'
import { useWebpage } from '@/composables/useWebpage'
import { debounce } from '@/utils/helpers'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', message: string, url?: string): void
}>()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const { detectedUrl, hasValidUrl, detectUrlInText, clearUrl } = useWebpage()

const canSend = computed(() => {
  return (inputText.value.trim().length > 0 || hasValidUrl.value) && !props.disabled
})

// Auto-resize textarea
function adjustHeight() {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }
}

// Debounced URL detection
const debouncedDetectUrl = debounce((text: string) => {
  const url = detectUrlInText(text)
  if (url) {
    detectedUrl.value = url
  }
}, 300)

watch(inputText, (newValue) => {
  nextTick(adjustHeight)
  debouncedDetectUrl(newValue)
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSend() {
  if (!canSend.value) return

  const message = inputText.value.trim()
  const url = detectedUrl.value || undefined

  emit('send', message, url)

  inputText.value = ''
  clearUrl()
  nextTick(adjustHeight)
}

function handlePaste(e: ClipboardEvent) {
  const pastedText = e.clipboardData?.getData('text')
  if (pastedText) {
    const url = detectUrlInText(pastedText)
    if (url) {
      detectedUrl.value = url
    }
  }
}

function removeUrl() {
  clearUrl()
  // Remove URL from input text
  if (detectedUrl.value && inputText.value.includes(detectedUrl.value)) {
    inputText.value = inputText.value.replace(detectedUrl.value, '').trim()
  }
}

function focusInput() {
  textareaRef.value?.focus()
}

defineExpose({ focusInput })
</script>

<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
    <div class="max-w-3xl mx-auto">
      <!-- URL Preview -->
      <div v-if="hasValidUrl && detectedUrl" class="mb-3">
        <WebpagePreview :url="detectedUrl" removable @remove="removeUrl" />
      </div>

      <!-- Input area -->
      <div
        class="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all"
      >
        <textarea
          ref="textareaRef"
          v-model="inputText"
          @keydown="handleKeydown"
          @paste="handlePaste"
          :disabled="disabled"
          placeholder="Message BugZero AI... (paste a URL to analyze a webpage)"
          class="flex-1 bg-transparent border-none resize-none py-3 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 min-h-[48px] max-h-[200px]"
          rows="1"
        />

        <button
          @click="handleSend"
          :disabled="!canSend"
          :class="[
            'flex-shrink-0 p-2 m-1.5 rounded-xl transition-colors',
            canSend
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          ]"
        >
          <Icon name="send" size="md" />
        </button>
      </div>

      <!-- Helper text -->
      <p class="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  </div>
</template>
