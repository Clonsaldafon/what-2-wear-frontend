<script setup lang="ts">
defineProps<{
  message?: string
}>()

const reload = () => {
  window.location.reload()
}
</script>

<template>
  <div class="global-error-banner">
    <div class="global-error__content">
      <header class="global-error__header">
        <h3 class="global-error__title h3">Что-то пошло не так</h3>
      </header>
      <p class="global-error__message">{{ message || 'Произошла критическая ошибка' }}</p>
      <button @click="reload" class="global-error__button">Перезагрузить страницу</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.global-error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: rem(20);
  color: var(--color-dark);
  background: var(--color-light-alt);
  z-index: 10000;
  
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: rem(20);
    text-align: center;
    max-width: rem(500);
  }

  &__message {
    @include fluid-text(16, 14);
  }
  
  &__button {
    @include fluid-text(16, 14);

    padding: rem(8) rem(16);
    font-weight: 500;
    color: var(--color-light);
    background-color: var(--color-error);
    border-radius: rem(8);

    @include hover {
      opacity: 0.7;
    }
  }
}
</style>
