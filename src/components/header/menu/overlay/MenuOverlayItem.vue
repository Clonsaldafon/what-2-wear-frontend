<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import { ROUTES } from '@/utils/constants'

const props = defineProps<{
  route: string
  text: string
  selected: boolean
}>()

const emit = defineEmits(['clothes'])

const router = useRouter()

const authStore = useAuthStore()

const navigate = async (route: string) => {
  if (props.route === ROUTES.CLOTHES && !authStore.isAuthenticated) {
    emit('clothes')
    return
  }

  router.push(`/${route}`)
}
</script>

<template>
  <div
    :class="`menu-overlay-item ${selected ? 'menu-overlay-item--selected' : ''}`"
    @click="navigate(route)"
  >
    <div class="menu-overlay-item__text">{{ text }}</div>
    <div class="menu-overlay-item__icon">
      <slot name="icon"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../../assets/styles/helpers/' as *;

.menu-overlay-item {
  display: flex;
  align-items: center;
  column-gap: rem(10);
  padding: rem(12) rem(24);
  position: relative;
  border: rem(1) solid transparent;
  border-radius: rem(30);
  transition: var(--transition-duration);
  user-select: none;
  cursor: pointer;

  @include hover {
    border-color: var(--color-accent);
  }

  &--selected {
    border-color: var(--color-accent);
  }

  &__text {
    @include fluid-text(24, 20);
  }

  &__icon {
    @include square(24);
    @include flex-center;
  }
}
</style>