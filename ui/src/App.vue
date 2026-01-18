<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useAuthStore } from '@/stores/authStore'
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import AuthModal from '@/components/auth/AuthModal.vue'

const route = useRoute()
const store = useWorkflowStore()
const authStore = useAuthStore()

onMounted(() => {
  store.loadFromStorage()
  authStore.loadFromStorage()
})
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <Header />

    <div class="flex-1 flex overflow-hidden">
      <Sidebar />

      <main class="flex-1 overflow-auto bg-white dark:bg-gray-900">
        <RouterView />
      </main>
    </div>

    <!-- Auth Modal -->
    <AuthModal />
  </div>
</template>
