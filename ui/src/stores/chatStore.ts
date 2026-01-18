import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, Conversation, Theme } from '@/types'
import { generateId } from '@/utils/helpers'

const STORAGE_KEY = 'bugzero-chat-history'
const THEME_KEY = 'bugzero-theme'

export const useChatStore = defineStore('chat', () => {
  // State
  const conversations = ref<Conversation[]>([])
  const activeConversationId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const theme = ref<Theme>('system')
  const sidebarOpen = ref(true)

  // Getters
  const activeConversation = computed(() => {
    if (!activeConversationId.value) return null
    return conversations.value.find(c => c.id === activeConversationId.value) || null
  })

  const messages = computed(() => {
    return activeConversation.value?.messages || []
  })

  const sortedConversations = computed(() => {
    return [...conversations.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  })

  // Actions
  function createConversation(): Conversation {
    const conversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversations.value.push(conversation)
    activeConversationId.value = conversation.id
    saveToStorage()
    return conversation
  }

  function setActiveConversation(id: string) {
    activeConversationId.value = id
  }

  function addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    if (!activeConversationId.value) {
      createConversation()
    }

    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date()
    }

    const conversation = conversations.value.find(
      c => c.id === activeConversationId.value
    )

    if (conversation) {
      conversation.messages.push(newMessage)
      conversation.updatedAt = new Date()

      // Update conversation title from first user message
      if (conversation.messages.length === 1 && message.role === 'user') {
        conversation.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
      }

      saveToStorage()
    }

    return newMessage
  }

  function updateMessage(messageId: string, updates: Partial<Message>) {
    const conversation = activeConversation.value
    if (!conversation) return

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      conversation.messages[messageIndex] = {
        ...conversation.messages[messageIndex],
        ...updates
      }
      saveToStorage()
    }
  }

  function removeMessage(messageId: string) {
    const conversation = activeConversation.value
    if (!conversation) return

    const index = conversation.messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      conversation.messages.splice(index, 1)
      saveToStorage()
    }
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations.value.splice(index, 1)
      if (activeConversationId.value === id) {
        activeConversationId.value = conversations.value[0]?.id || null
      }
      saveToStorage()
    }
  }

  function clearConversation() {
    if (activeConversation.value) {
      activeConversation.value.messages = []
      activeConversation.value.updatedAt = new Date()
      saveToStorage()
    }
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem(THEME_KEY, newTheme)
    applyTheme(newTheme)
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(open: boolean) {
    sidebarOpen.value = open
  }

  // Persistence
  function saveToStorage() {
    try {
      const data = JSON.stringify(conversations.value)
      localStorage.setItem(STORAGE_KEY, data)
    } catch (e) {
      console.error('Failed to save chat history:', e)
    }
  }

  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data) as Conversation[]
        conversations.value = parsed.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }))
        if (conversations.value.length > 0 && !activeConversationId.value) {
          activeConversationId.value = conversations.value[0].id
        }
      }

      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
      if (savedTheme) {
        theme.value = savedTheme
        applyTheme(savedTheme)
      }
    } catch (e) {
      console.error('Failed to load chat history:', e)
    }
  }

  function applyTheme(newTheme: Theme) {
    const root = document.documentElement
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Initialize
  loadFromStorage()

  return {
    // State
    conversations,
    activeConversationId,
    isLoading,
    error,
    theme,
    sidebarOpen,
    // Getters
    activeConversation,
    messages,
    sortedConversations,
    // Actions
    createConversation,
    setActiveConversation,
    addMessage,
    updateMessage,
    removeMessage,
    deleteConversation,
    clearConversation,
    setLoading,
    setError,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    loadFromStorage
  }
})
