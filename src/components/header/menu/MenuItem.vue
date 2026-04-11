<script setup lang="ts">
import { useRouter } from 'vue-router'

import { ROUTES } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const router = useRouter()

const props = defineProps<{
  route: string
  text: string
  selected: boolean
}>()

const emit = defineEmits(['clothes'])

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
    :class="`menu-item ${selected ? 'menu-item--selected' : ''}`"
    @click="navigate(route)"
  >
    {{ text }}
  </div>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/helpers/' as *;

.menu-item {
  position: relative;
  padding-block: rem(8);
  transition-duration: var(--transition-duration);
  user-select: none;
  cursor: pointer;

  @include hover {
    color: var(--color-accent);
    
    &::after {
      background-color: var(--color-accent);
    }
  }

  &--selected {
    &::after {
      background-color: var(--color-accent);
    }
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: rem(2);
    transition-duration: var(--transition-duration);
  }
}
</style>