<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useErrorStore } from './stores/error';
import GlobalErrorBanner from './components/errors/GlobalErrorBanner.vue';
import ErrorBanner from './components/errors/ErrorBanner.vue';

const errorStore = useErrorStore();
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
