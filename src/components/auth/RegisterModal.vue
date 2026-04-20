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
  email: '',
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

  const result = await authStore.register({
    username: form.username.trim(),
    email: form.email.trim() || undefined,
    password: form.password
  })

  loading.value = false

  if (!result.success) {
    errorMessage.value = result.message || 'Не удалось создать аккаунт.'
    return
  }

  emit('success')
}
</script>

<template>
  <AuthModalLayout
    title="Регистрация"
    description="Создайте аккаунт, чтобы получать рекомендации именно под ваши условия и погоду."
    switch-text="Уже есть аккаунт?"
    switch-label="Войти"
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
          placeholder="Придумайте логин"
        >
      </label>
      <label class="auth-form__field">
        <span class="auth-form__label">Email <span class="auth-form__optional">(необязательно)</span></span>
        <input
          v-model.trim="form.email"
          class="auth-form__input"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="Введите email, если хотите"
        >
      </label>
      <label class="auth-form__field">
        <span class="auth-form__label">Пароль</span>
        <input
          v-model="form.password"
          class="auth-form__input"
          type="password"
          name="password"
          autocomplete="new-password"
          placeholder="Придумайте пароль"
        >
      </label>
      <p v-if="errorMessage" class="auth-form__error">{{ errorMessage }}</p>
      <Button
        class="auth-form__submit"
        type="submit"
        :disabled="loading"
      >
        <template #text>{{ loading ? 'Создаем аккаунт...' : 'Зарегистрироваться' }}</template>
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

  &__optional {
    font-weight: 400;
    color: var(--color-dark-alt);
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
