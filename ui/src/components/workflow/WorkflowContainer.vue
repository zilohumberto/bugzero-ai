<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflowStore'
import WebsiteInput from './WebsiteInput.vue'
import ValidationLoader from './ValidationLoader.vue'
import ActionSelector from './ActionSelector.vue'
import ProcessingLoader from './ProcessingLoader.vue'
import WishlistForm from './WishlistForm.vue'
import SubmittingLoader from './SubmittingLoader.vue'
import WishlistResult from './WishlistResult.vue'

const store = useWorkflowStore()

const step = computed(() => store.step)
const isLoading = computed(() => store.isLoading)
const error = computed(() => store.error)
const websiteUrl = computed(() => store.websiteUrl)
const validation = computed(() => store.validation)
const selectedAction = computed(() => store.selectedAction)
const result = computed(() => store.result)

function handleSubmitWebsite(url: string) {
  store.submitWebsite(url)
}

function handleSelectAction(action: Parameters<typeof store.selectAndProcessAction>[0]) {
  store.selectAndProcessAction(action)
}

function handleSubmitWishlist(data: { name: string; email: string }) {
  store.submitWishlistWithUserInfo(data.name, data.email)
}

function handleBack() {
  store.goBack()
}

function handleStartOver() {
  store.reset()
}

function handleTryAnother() {
  store.goBack()
}
</script>

<template>
  <div class="min-h-full flex items-center justify-center p-4 sm:p-8">
    <!-- Step: Input -->
    <WebsiteInput
      v-if="step === 'input'"
      :is-loading="isLoading"
      :error="error"
      @submit="handleSubmitWebsite"
    />

    <!-- Step: Validating -->
    <ValidationLoader
      v-else-if="step === 'validating'"
      :url="websiteUrl!"
    />

    <!-- Step: Select Action -->
    <ActionSelector
      v-else-if="step === 'select-action' && validation"
      :validation="validation"
      :is-loading="isLoading"
      @select="handleSelectAction"
      @back="handleBack"
    />

    <!-- Step: Processing -->
    <ProcessingLoader
      v-else-if="step === 'processing' && selectedAction && websiteUrl"
      :action="selectedAction"
      :url="websiteUrl"
    />

    <!-- Step: Collect Info -->
    <WishlistForm
      v-else-if="step === 'collect-info' && validation && selectedAction"
      :validation="validation"
      :action="selectedAction"
      :is-loading="isLoading"
      :error="error"
      @submit="handleSubmitWishlist"
      @back="handleBack"
    />

    <!-- Step: Submitting -->
    <SubmittingLoader
      v-else-if="step === 'submitting'"
    />

    <!-- Step: Result -->
    <WishlistResult
      v-else-if="step === 'result' && result"
      :result="result"
      @start-over="handleStartOver"
      @try-another="handleTryAnother"
    />
  </div>
</template>
