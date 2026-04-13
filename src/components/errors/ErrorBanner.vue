<script setup lang="ts">
import CrossButton from '../buttons/CrossButton.vue'

const props = defineProps<{
  message: string
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="error-banner">
    <div class="error-banner__inner">
      <header class="error-banner__header">
        <h3 class="error-banner__title h3" v-if="title">{{ title }}</h3>
        <div v-else></div>
        <CrossButton
          class="error-banner__close-button"
          :color="'light'"
          :onClose="handleClose"
        />
      </header>
      <p class="error-banner__message">{{ message }}</p>
    </div>
    <div class="error-banner__progress"></div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.error-banner {
  position: fixed;
  right: rem(20);
  left: rem(20);
  margin-inline: auto;
  width: auto;
  max-width: rem(400);
  color: var(--color-light);
  background-color: var(--color-error);
  border: rem(1) solid var(--color-error);
  border-radius: rem(12);
  overflow: hidden;
  z-index: 10000;
  animation: slideIn 0.3s forwards;

  &__inner {
    padding: rem(20);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &__close-button {
    @include square(32);

    left: auto;
  }

  &__message {
    @include fluid-text(16, 14);
  }

  &__progress {
    width: 100%;
    height: rem(5);
    background-color: var(--color-light);
    border-radius: rem(5) rem(5) 0 0;
    animation: progress 10s linear;
  }
}

@keyframes slideIn {
  from { transform: translateY(-100%); }
  to { transform: translateY(rem(20)); }
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0; }
}
</style>