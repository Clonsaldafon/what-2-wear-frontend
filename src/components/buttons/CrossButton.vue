<script setup lang="ts"></script>

<template>
  <button class="cross-button">
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

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: rem(7);
    width: 70%;
    height: rem(2);
    background-color: var(--color-dark);
    border-radius: rem(5);
  }

  &::before {
    rotate: 45deg;
  }

  &::after {
      rotate: -45deg;
  }
}
</style>