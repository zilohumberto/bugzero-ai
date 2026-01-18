<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useChat } from '@/composables/useChat'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import Icon from '@/components/common/Icon.vue'

const { messages, isLoading, sendMessage, regenerateResponse, editMessage } = useChat()

const messagesContainer = ref<HTMLDivElement | null>(null)
const chatInput = ref<InstanceType<typeof ChatInput> | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)

watch(
  () => messages.value[messages.value.length - 1]?.content,
  () => {
    scrollToBottom()
  }
)

onMounted(() => {
  scrollToBottom()
  chatInput.value?.focusInput()
})

function handleSend(message: string, url?: string) {
  sendMessage(message, url)
}

function handleRegenerate(messageId: string) {
  regenerateResponse(messageId)
}

function handleEdit(messageId: string, content: string) {
  editMessage(messageId, content)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto"
    >
      <!-- Empty state -->
      <div
        v-if="messages.length === 0"
        class="h-full flex flex-col items-center justify-center p-8 text-center"
      >
        <div class="w-16 h-16 mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Icon name="bot" size="xl" class="text-primary-500" />
        </div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          How can I help you today?
        </h2>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          I can help you analyze webpages, answer questions, and assist with various tasks.
          Paste a URL to get started!
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          <button
            @click="handleSend('What can you help me with?')"
            class="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <p class="font-medium text-gray-900 dark:text-gray-100">Get started</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Learn what I can do</p>
          </button>

          <button
            @click="handleSend('Analyze this webpage', 'https://example.com')"
            class="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <p class="font-medium text-gray-900 dark:text-gray-100">Analyze a webpage</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Try with example.com</p>
          </button>

          <button
            @click="handleSend('Write me a Python function to parse HTML')"
            class="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <p class="font-medium text-gray-900 dark:text-gray-100">Write some code</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Get coding help</p>
          </button>

          <button
            @click="handleSend('Explain how web scraping works')"
            class="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <p class="font-medium text-gray-900 dark:text-gray-100">Learn something</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Ask me anything</p>
          </button>
        </div>
      </div>

      <!-- Messages list -->
      <div v-else class="max-w-3xl mx-auto">
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
          @regenerate="handleRegenerate(message.id)"
          @edit="(content) => handleEdit(message.id, content)"
        />
      </div>
    </div>

    <!-- Input -->
    <ChatInput
      ref="chatInput"
      :disabled="isLoading"
      @send="handleSend"
    />
  </div>
</template>
