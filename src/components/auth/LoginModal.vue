<script setup lang="ts">
import { reactive, ref } from 'vue'

import Button from '@/components/buttons/Button.vue'
import { useAuthStore } from '@/stores/auth'

import AuthModalLayout from './AuthModalLayout.vue'

const emit = defineEmits<{
  close: []
  switch: []
  success: []
}>()

const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  if (!form.username || !form.password) {
    errorMessage.value = 'Заполните логин и пароль.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const result = await authStore.login({
    username: form.username.trim(),
    password: form.password
  })

  loading.value = false

  if (!result.success) {
    errorMessage.value = result.message || 'Не удалось войти.'
    return
  }

  emit('success')
}
</script>

<template>
  <AuthModalLayout
    title="Вход в аккаунт"
    description="Войдите, чтобы получать персональные рекомендации по одежде с учетом погоды."
    switch-text="Еще нет аккаунта?"
    switch-label="Зарегистрироваться"
    @close="emit('close')"
    @switch="emit('switch')"
  >
    <form class="auth-form" @submit.prevent="onSubmit">
      <label class="auth-form__field">
        <span class="auth-form__label">Логин</span>
        <input
          v-model.trim="form.username"
          class="auth-form__input"
          type="text"
          name="username"
          autocomplete="username"
          placeholder="Введите логин"
        >
      </label>
      <label class="auth-form__field">
        <span class="auth-form__label">Пароль</span>
        <input
          v-model="form.password"
          class="auth-form__input"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="Введите пароль"
        >
      </label>
      <p v-if="errorMessage" class="auth-form__error">{{ errorMessage }}</p>
      <Button
        class="auth-form__submit"
        type="submit"
        :disabled="loading"
      >
        <template #text>{{ loading ? 'Входим...' : 'Войти' }}</template>
      </Button>
    </form>
  </AuthModalLayout>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.auth-form {
  display: flex;
  flex-direction: column;
  row-gap: rem(16);

  &__field {
    display: flex;
    flex-direction: column;
    row-gap: rem(8);
  }

  &__label {
    font-weight: 600;
  }

  &__input {
    min-height: rem(52);
    padding: rem(14) rem(18);
    color: var(--color-dark);
    background-color: var(--color-gray-alt);
    border: rem(1) solid transparent;
    border-radius: rem(18);
    outline: none;

    &:focus {
      border-color: var(--color-accent);
      background-color: var(--color-light);
    }
  }

  &__error {
    color: var(--color-error);
  }

  &__submit {
    width: 100%;
    margin-top: rem(4);
  }
}
</style>
