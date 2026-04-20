<script setup lang="ts">
import Button from '../buttons/Button.vue';

defineEmits<{
  authOpen: ['login']
}>()
</script>

<template>
  <div class="clothes-message-authenticate">
    <div class="clothes-message-authenticate__icon">
      <svg
        width="48" height="48" viewBox="0 0 48 48"
        fill="none"
      >
        <path
          d="M36 21H33V12C33 9.61305 32.0518 7.32387 30.364 5.63604C28.6761 3.94821 26.3869 3 24 3C21.6131 3 19.3239 3.94821 17.636 5.63604C15.9482 7.32387 15 9.61305 15 12V21H12C11.2044 21 10.4413 21.3161 9.87868 21.8787C9.31607 22.4413 9 23.2044 9 24V42C9 42.7957 9.31607 43.5587 9.87868 44.1213C10.4413 44.6839 11.2044 45 12 45H36C36.7956 45 37.5587 44.6839 38.1213 44.1213C38.6839 43.5587 39 42.7957 39 42V24C39 23.2044 38.6839 22.4413 38.1213 21.8787C37.5587 21.3161 36.7956 21 36 21ZM18 12C18 10.4087 18.6321 8.88258 19.7574 7.75736C20.8826 6.63214 22.4087 6 24 6C25.5913 6 27.1174 6.63214 28.2426 7.75736C29.3679 8.88258 30 10.4087 30 12V21H18V12ZM36 42H12V24H36V42Z"
          fill="#2C2C2C"
        />
      </svg>
    </div>
    <div class="clothes-message-authenticate__body">
      <h4 class="clothes-message-authenticate__title h4">Персональные рекомендации</h4>
      <div class="clothes-message-authenticate__description">
        <p>
          Войдите или создайте аккаунт, 
          чтобы получать советы по одежде 
          с учетом погоды и вашего местоположения
        </p>
      </div>
    </div>
    <Button
      class="clothes-message-authenticate__button"
      @click="$emit('authOpen', 'login')"
    >
      <template #text>Начать</template>
    </Button>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.clothes-message-authenticate {
  display: flex;
  align-items: center;
  flex-direction: column;
  row-gap: rem(20);
  padding: rem(40);
  max-width: rem(467);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(30);
  box-shadow: 0 0 rem(20) rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideIn 0.3s forwards;

  &__icon {
    @include square(64);
    @include flex-center;

    padding: rem(8);
    background-color: var(--color-gray);
    border-radius: 50%;
  }

  &__body {
    display: flex;
    flex-direction: column;
    row-gap: rem(10);
    
    text-align: center;
  }

  &__title {
    text-align: center;
  }

  &__description {
    @include fluid-text(18, 14);

    color: var(--color-dark-alt);
  }

  @include tablet {
    padding: rem(20);
  }
}

@keyframes slideIn {
  from {
    transform: translateY(rem(60));
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
