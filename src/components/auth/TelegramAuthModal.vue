<script setup lang="ts">
import { reactive, ref } from 'vue'

import Button from '@/components/buttons/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { useErrorStore } from '@/stores/error'

import AuthModalLayout from './AuthModalLayout.vue'

const emit = defineEmits<{
  close: []
  success: []
  switch: []
}>()

const authStore = useAuthStore()
const errorStore = useErrorStore()

const mode = ref<'choice' | 'link'>('choice')
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const onRegister = async () => {
  loading.value = true
  errorStore.clearError()

  const result = await authStore.registerMessengerAccount()

  loading.value = false

  if (!result.success) {
    errorStore.setError('Ошибка регистрации', result.message || 'Не удалось создать аккаунт.')
    return
  }

  emit('success')
}

const onLink = async () => {
  if (!form.username || !form.password) {
    errorStore.setError('Ошибка входа', 'Заполните логин и пароль.')
    return
  }

  loading.value = true
  errorStore.clearError()

  const result = await authStore.linkMessengerAccount({
    username: form.username.trim(),
    password: form.password
  })

  loading.value = false

  if (!result.success) {
    errorStore.setError('Ошибка входа', result.message || 'Не удалось войти в аккаунт.')
    return
  }

  emit('success')
}
</script>

<template>
  <AuthModalLayout
    title="Telegram"
    description="Выберите, как продолжить вход в аккаунт."
    switch-text="Открыть обычный вход?"
    switch-label="Войти"
    @close="emit('close')"
    @switch="emit('switch')"
  >
    <div v-if="mode === 'choice'" class="telegram-auth">
      <Button
        class="telegram-auth__button"
        :accent="true"
        :disabled="loading"
        @click="onRegister"
      >
        <template #text>{{ loading ? 'Создаем аккаунт...' : 'Создать новый аккаунт' }}</template>
      </Button>
      <Button
        class="telegram-auth__button"
        :outlined="true"
        :disabled="loading"
        @click="mode = 'link'"
      >
        <template #text>Войти в существующий</template>
      </Button>
    </div>

    <form v-else class="auth-form" @submit.prevent="onLink">
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
      <div class="auth-form__actions">
        <Button
          class="auth-form__submit"
          type="submit"
          :disabled="loading"
        >
          <template #text>{{ loading ? 'Входим...' : 'Войти и привязать' }}</template>
        </Button>
        <Button
          class="auth-form__submit"
          :outlined="true"
          :disabled="loading"
          @click="mode = 'choice'"
        >
          <template #text>Назад</template>
        </Button>
      </div>
    </form>
  </AuthModalLayout>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.telegram-auth,
.auth-form {
  display: flex;
  flex-direction: column;
  row-gap: rem(16);
}

.telegram-auth__button,
.auth-form__submit {
  width: 100%;
}

.auth-form {
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

  &__actions {
    display: flex;
    flex-direction: column;
    row-gap: rem(10);
  }
}
</style>
