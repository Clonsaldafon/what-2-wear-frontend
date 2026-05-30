<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import Button from '@/components/buttons/Button.vue'
import Header from '@/components/header/Header.vue'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/utils/constants'

const authStore = useAuthStore()
const router = useRouter()

const showLogoutButton = computed(() => {
  return authStore.isAuthenticated && authStore.messenger !== 'telegram'
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: ROUTES.WEATHER })
}
</script>

<template>
  <Header />
  <section class="settings section container">
    <h1 class="settings__title h1">Настройки</h1>
    <div class="settings__content">
      Появятся позже...
      <Button
        v-if="showLogoutButton"
        :outlined="true"
        @click="handleLogout"
      >
        <template #text>Выйти из аккаунта</template>
      </Button>
      <p v-else-if="authStore.isAuthenticated && authStore.messenger === 'telegram'">
        Вы вошли через Telegram. Выход возможен только внутри приложения Telegram.
      </p>
      <p v-else>
        Чтобы увидеть настройки, войдите в аккаунт.
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.settings {
  &__content {
    display: flex;
    flex-direction: column;
    row-gap: rem(20);
  }
}
</style>
