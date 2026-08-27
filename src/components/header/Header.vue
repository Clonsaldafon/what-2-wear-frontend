<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { isTMA, retrieveLaunchParams, retrieveRawInitData } from '@tma.js/sdk-vue'

import Button from '../buttons/Button.vue'
import Logo from '../Logo.vue'
import Menu from './menu/Menu.vue'

import { useAuthStore } from '@/stores/auth'
import MenuMobile from './menu/mobile/MenuMobile.vue'

type TelegramWebApp = {
  initData?: string
  initDataUnsafe?: any
  ready?: () => void
  expand?: () => void
}

const emit = defineEmits(['clothesMessageOpen', 'authOpen'])

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isTelegram = ref(false)
const telegramAuthChecking = ref(false)
const messenger = computed(() => authStore.messenger)

const getTelegramWebApp = () => {
  return (window as any).Telegram?.WebApp as TelegramWebApp | undefined
}

const getTelegramContext = async () => {
  const webApp = getTelegramWebApp()
  let initDataRaw = webApp?.initData || ''
  let initDataParsed = webApp?.initDataUnsafe || null
  let isTelegramEnvironment = Boolean(initDataRaw || initDataParsed?.user)

  try {
    const sdkIsTelegram = await Promise.resolve(isTMA())
    isTelegramEnvironment = isTelegramEnvironment || sdkIsTelegram

    if (sdkIsTelegram) {
      const launchParams = retrieveLaunchParams()
      initDataParsed = launchParams.tgWebAppData || initDataParsed
      initDataRaw = retrieveRawInitData() || initDataRaw
    }
  } catch {
    // Fallback to window.Telegram.WebApp above.
  }

  return {
    isTelegramEnvironment,
    initDataRaw,
    initDataParsed,
  }
}

onMounted(async () => {
  const webApp = getTelegramWebApp()
  webApp?.ready?.()
  webApp?.expand?.()

  telegramAuthChecking.value = true

  try {
    const { isTelegramEnvironment, initDataRaw, initDataParsed } = await getTelegramContext()
    isTelegram.value = isTelegramEnvironment

    if (!isTelegramEnvironment) return

    authStore.setTelegramUserData(initDataParsed)

    if (authStore.isAuthenticated) return

    const telegramUserId = initDataParsed?.user?.id
    if (!telegramUserId || !initDataRaw) return

    const result = await authStore.messengerLogin(
      'telegram',
      String(telegramUserId),
      initDataRaw
    )

    if (result.status === 'needs_account_link') {
      emit('authOpen', 'telegram')
    }
  } finally {
    telegramAuthChecking.value = false
  }
})

const onAuthOpen = () => {
  emit('authOpen', 'login')
}
</script>

<template>
  <div class="header container">
    <Logo class="header__logo" />
    <Menu
      class="header__menu"
      :isAuthenticated="isAuthenticated"
      @clothesMessageOpen="emit('clothesMessageOpen')"
    />
    <div class="header__actions">
      <Button
        v-if="!isAuthenticated && !messenger && !telegramAuthChecking"
        :hasIcon="true"
        :accent="true"
        @click="onAuthOpen"
      >
        <template #icon>
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3"
              stroke="#FCFAF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            />
          </svg>
        </template>
        <template #text>Войти</template>
      </Button>
    </div>
  </div>
  <MenuMobile
    :isAuthenticated="isAuthenticated"
    @clothesMessageOpen="emit('clothesMessageOpen')"
  />
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding-top: rem(60);

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  &__logo {
    justify-self: start;
  }

  &__menu {
    justify-self: center;
  }

  &__actions {
    justify-self: end;
    display: flex;
    align-items: center;
    column-gap: rem(12);
  }
}
</style>
