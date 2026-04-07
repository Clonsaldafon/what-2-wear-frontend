<script setup lang="ts">
import { ref } from 'vue'

import Button from '../buttons/Button.vue'
import Logo from '../Logo.vue'
import Menu from './menu/Menu.vue'
import BurgerButton from '../buttons/BurgerButton.vue'
import MenuOverlay from './menu/overlay/MenuOverlay.vue'

const isMenuOpen = ref(false)

const openMenu = () => {
  isMenuOpen.value = true
  console.log('open')
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="header container">
    <Logo />
    <Menu />
    <div class="header__actions">
      <Button class="hidden-tablet">
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
      <BurgerButton
        class="visible-tablet"
        @click="openMenu"
      />
    </div>
  </div>
  <MenuOverlay
    :class="`${!isMenuOpen ? 'visually-hidden' : ''}`"
    :onClose="closeMenu"
  />
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: rem(60);

  &__actions {
    display: flex;
    align-items: center;
    column-gap: rem(12);
  }
}
</style>