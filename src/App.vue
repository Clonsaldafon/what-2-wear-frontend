<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'

import GlobalErrorBanner from './components/errors/GlobalErrorBanner.vue'
import ErrorBanner from './components/errors/ErrorBanner.vue'

import { useErrorStore } from './stores/error'
import { useAuthStore } from './stores/auth.ts'
import { useWardrobeStore } from './stores/wardrobes.ts'

const errorStore = useErrorStore()
const authStore = useAuthStore()
const wardrobeStore = useWardrobeStore()

watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      await wardrobeStore.fetchItems()
    } else {
      wardrobeStore.items = []
    }
  },
  { immediate: true }
)
</script>

<template>
  <GlobalErrorBanner
    v-if="errorStore.hasError && errorStore.fatal"
    :message="errorStore.errorMessage"
    @close="errorStore.clearError"
  />

  <template v-else>
    <RouterView />

    <ErrorBanner
      v-if="errorStore.hasError"
      :title="errorStore.errorTitle"
      :message="errorStore.errorMessage"
      @close="errorStore.clearError"
    />
  </template>
</template>

<style scoped></style>
