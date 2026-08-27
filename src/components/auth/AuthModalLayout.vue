<script setup lang="ts">
import CrossButton from '@/components/buttons/CrossButton.vue'

defineProps<{
  title: string
  description: string
  switchLabel: string
  switchText: string
}>()

defineEmits<{
  close: []
  switch: []
}>()
</script>

<template>
  <div class="auth-modal">
    <div class="auth-modal__close">
      <CrossButton @click="$emit('close')" />
    </div>
    <div class="auth-modal__body">
      <div class="auth-modal__content">
        <div class="auth-modal__header">
          <h3 class="auth-modal__title h3">{{ title }}</h3>
          <p class="auth-modal__description">{{ description }}</p>
        </div>
        <slot />
      </div>
      <button
        class="auth-modal__switch"
        type="button"
        @click="$emit('switch')"
      >
        <span>{{ switchText }}</span>
        <span class="auth-modal__switch-label">{{ switchLabel }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.auth-modal {
  width: min(100%, rem(520));
  max-height: min(92vh, rem(720));
  padding: rem(26) rem(24) rem(30);
  background-color: var(--color-light-alt);
  border: rem(1) solid rgba(24, 169, 123, 0.18);
  border-radius: rem(30);
  box-shadow: 0 rem(20) rem(60) rgba(44, 44, 44, 0.16);
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-padding-block: rem(24);
  z-index: 1001;
  animation: modalIn 0.25s forwards;

  &__close {
    display: flex;
    justify-content: end;
  }

  &__body {
    display: flex;
    flex-direction: column;
    row-gap: rem(24);
  }

  &__content {
    display: flex;
    flex-direction: column;
    row-gap: rem(24);
  }

  &__header {
    display: flex;
    flex-direction: column;
    row-gap: rem(10);
    text-align: center;
  }

  &__description {
    color: var(--color-dark-alt);
  }

  &__switch {
    @include flex-center;

    flex-wrap: wrap;
    column-gap: rem(8);
    row-gap: rem(4);
    color: var(--color-dark-alt);

    @include hover {
      color: var(--color-accent);
    }
  }

  &__switch-label {
    font-weight: 700;
    color: var(--color-accent);
  }

  @include mobile {
    padding: rem(20) rem(18) rem(26);
    border-radius: rem(24);
  }
}

@keyframes modalIn {
  from {
    transform: translateY(rem(24));
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
