<script setup lang="ts">
defineProps<{
  color?: string
}>()
</script>

<template>
  <button
    :class="`cross-button ${color === 'light' ? 'cross-button--light' : ''}`"
    type="button"
  >
    <span class="visually-hidden">Закрыть меню навигации</span>
  </button>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.cross-button {
  @include square(48);

  position: relative;
  border-radius: rem(5);

  @include hover {
    opacity: 0.7;
  }

  &--light {
    color: var(--color-light);
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: rem(7);
    width: 70%;
    height: rem(2);
    background-color: currentColor;
    border-radius: rem(5);
  }

  &::before {
    rotate: 45deg;
  }

  &::after {
      rotate: -45deg;
  }

  @include mobile {
    @include square(32);
  }
}
</style>
