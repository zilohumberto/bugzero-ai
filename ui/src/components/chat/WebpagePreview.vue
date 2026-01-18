<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { getDomainFromUrl, truncateUrl } from '@/utils/validators'

const props = defineProps<{
  url: string
  removable?: boolean
}>()

const emit = defineEmits<{
  (e: 'remove'): void
}>()

const domain = computed(() => getDomainFromUrl(props.url))
const displayUrl = computed(() => truncateUrl(props.url, 40))
</script>

<template>
  <div
    class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-full text-sm"
  >
    <Icon name="link" size="sm" class="text-primary-500" />
    <a
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
    >
      <span class="font-medium">{{ domain }}</span>
      <Icon name="external-link" size="sm" class="opacity-60" />
    </a>
    <button
      v-if="removable"
      @click="emit('remove')"
      class="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      <Icon name="close" size="sm" />
    </button>
  </div>
</template>
