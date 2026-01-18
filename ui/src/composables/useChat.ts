import { computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { sendChatMessage } from '@/services/api'
import type { Message } from '@/types'
import { generateId } from '@/utils/helpers'

export function useChat() {
  const store = useChatStore()

  const messages = computed(() => store.messages)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const activeConversation = computed(() => store.activeConversation)

  async function sendMessage(content: string, webpageUrl?: string) {
    if (!content.trim() && !webpageUrl) return

    store.setError(null)

    // Ensure we have an active conversation
    if (!store.activeConversationId) {
      store.createConversation()
    }

    // Add user message
    const userMessage = store.addMessage({
      role: 'user',
      content: content.trim(),
      webpageUrl
    })

    // Add loading placeholder for assistant
    const loadingMessage = store.addMessage({
      role: 'assistant',
      content: '',
      isLoading: true
    })

    store.setLoading(true)

    try {
      const response = await sendChatMessage({
        message: content.trim(),
        webpageUrl,
        conversationId: store.activeConversationId!
      })

      // Update the loading message with the actual response
      store.updateMessage(loadingMessage.id, {
        content: response.reply,
        isLoading: false
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      store.setError(errorMessage)

      // Update loading message to show error
      store.updateMessage(loadingMessage.id, {
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        isLoading: false
      })
    } finally {
      store.setLoading(false)
    }
  }

  function regenerateResponse(messageId: string) {
    const messageIndex = messages.value.findIndex(m => m.id === messageId)
    if (messageIndex === -1 || messages.value[messageIndex].role !== 'assistant') return

    // Find the previous user message
    const previousMessages = messages.value.slice(0, messageIndex)
    const lastUserMessage = [...previousMessages].reverse().find(m => m.role === 'user')

    if (lastUserMessage) {
      // Remove the current assistant message
      store.removeMessage(messageId)

      // Resend the user message
      sendMessage(lastUserMessage.content, lastUserMessage.webpageUrl)
    }
  }

  function editMessage(messageId: string, newContent: string) {
    const message = messages.value.find(m => m.id === messageId)
    if (!message || message.role !== 'user') return

    // Find and remove all messages after this one
    const messageIndex = messages.value.findIndex(m => m.id === messageId)
    const messagesToRemove = messages.value.slice(messageIndex + 1)

    messagesToRemove.forEach(m => store.removeMessage(m.id))

    // Update the message
    store.updateMessage(messageId, { content: newContent })

    // Resend
    sendMessage(newContent, message.webpageUrl)
  }

  function clearChat() {
    store.clearConversation()
  }

  function newChat() {
    store.createConversation()
  }

  function deleteChat(id: string) {
    store.deleteConversation(id)
  }

  function selectChat(id: string) {
    store.setActiveConversation(id)
  }

  return {
    messages,
    isLoading,
    error,
    activeConversation,
    conversations: computed(() => store.sortedConversations),
    sendMessage,
    regenerateResponse,
    editMessage,
    clearChat,
    newChat,
    deleteChat,
    selectChat
  }
}
