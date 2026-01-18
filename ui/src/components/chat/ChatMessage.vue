<script setup lang="ts">
import { computed, ref } from 'vue'
import { marked } from 'marked'
import type { Message } from '@/types'
import Icon from '@/components/common/Icon.vue'
import Button from '@/components/common/Button.vue'
import WebpagePreview from './WebpagePreview.vue'
import TypingIndicator from './TypingIndicator.vue'
import { formatTime } from '@/utils/helpers'
import { copyToClipboard } from '@/utils/helpers'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  (e: 'regenerate'): void
  (e: 'edit', content: string): void
}>()

const copied = ref(false)
const isEditing = ref(false)
const editContent = ref('')

const isUser = computed(() => props.message.role === 'user')
const isAssistant = computed(() => props.message.role === 'assistant')

const renderedContent = computed(() => {
  if (props.message.isLoading) return ''
  return marked.parse(props.message.content, { async: false }) as string
})

const timestamp = computed(() => formatTime(props.message.timestamp))

async function handleCopy() {
  await copyToClipboard(props.message.content)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function startEdit() {
  editContent.value = props.message.content
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  editContent.value = ''
}

function saveEdit() {
  if (editContent.value.trim()) {
    emit('edit', editContent.value.trim())
  }
  isEditing.value = false
}
</script>

<template>
  <div
    :class="[
      'group flex gap-4 px-4 py-6',
      isUser ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-800/50'
    ]"
  >
    <!-- Avatar -->
    <div
      :class="[
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser
          ? 'bg-primary-500 text-white'
          : 'bg-emerald-500 text-white'
      ]"
    >
      <Icon :name="isUser ? 'user' : 'bot'" size="sm" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Role label -->
      <div class="flex items-center gap-2 mb-1">
        <span class="font-semibold text-gray-900 dark:text-gray-100">
          {{ isUser ? 'You' : 'Assistant' }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ timestamp }}
        </span>
      </div>

      <!-- Webpage URL badge -->
      <div v-if="message.webpageUrl && isUser" class="mb-2">
        <WebpagePreview :url="message.webpageUrl" />
      </div>

      <!-- Loading indicator -->
      <div v-if="message.isLoading">
        <TypingIndicator />
      </div>

      <!-- Edit mode -->
      <div v-else-if="isEditing && isUser" class="space-y-2">
        <textarea
          v-model="editContent"
          class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows="4"
        />
        <div class="flex gap-2">
          <Button size="sm" @click="saveEdit">Save & Submit</Button>
          <Button size="sm" variant="ghost" @click="cancelEdit">Cancel</Button>
        </div>
      </div>

      <!-- Message content -->
      <div
        v-else
        class="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:text-primary-600 dark:prose-code:text-primary-400"
        v-html="renderedContent"
      />

      <!-- Actions -->
      <div
        v-if="!message.isLoading && !isEditing"
        class="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          @click="handleCopy"
          class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Copy"
        >
          <Icon :name="copied ? 'check' : 'copy'" size="sm" />
        </button>

        <button
          v-if="isUser"
          @click="startEdit"
          class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Edit"
        >
          <Icon name="edit" size="sm" />
        </button>

        <button
          v-if="isAssistant"
          @click="emit('regenerate')"
          class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Regenerate"
        >
          <Icon name="refresh" size="sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.prose pre {
  position: relative;
}

.prose code {
  font-size: 0.875em;
}

.prose pre code {
  font-size: 0.8em;
}
</style>
