<script setup lang="ts"></script>

<template>
  <button
    class="burger-button"
    type="button"
  >
    <span class="visually-hidden">Открыть меню навигации</span>
  </button>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.burger-button {
  @include square(48);

  position: relative;
  border-radius: rem(5);

  @include hover {
    opacity: 0.7;
  }

  &::after {
    @include abs-center;

    content: '';
    width: 50%;
    height: rem(2);
    background-color: var(--color-dark);
    border-radius: rem(5);
    box-shadow: 0 rem(-8), 0 rem(8);
  }
}
</style>