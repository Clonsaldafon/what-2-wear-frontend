<script setup lang="ts">
import { useRoute } from 'vue-router'

import MenuItem from './MenuItem.vue'

import { ROUTES } from '@/utils/constants'

const props = defineProps<{
  isAuthenticated: boolean
}>()

const emit = defineEmits(['clothesMessageOpen'])
const route = useRoute()

const onClothesMessageOpen = () => {
  emit('clothesMessageOpen')
}
</script>

<template>
  <nav class="menu hidden-tablet">
    <ul class="menu__list">
      <li class="menu__item">
        <MenuItem
          :route="ROUTES.WEATHER"
          :text="'Погода'"
          :selected="route.name === ROUTES.WEATHER"
        />
      </li>
      <li class="menu__item">
        <MenuItem
          :route="ROUTES.CLOTHES"
          :text="'Одежда'"
          :selected="route.name === ROUTES.CLOTHES"
          @clothes="onClothesMessageOpen"
        />
      </li>
      <li
        v-if="isAuthenticated"
        class="menu__item visually-hidden"
      >
        <MenuItem
          :route="'/'"
          :text="'Профиль'"
          :selected="false"
        />
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/helpers/' as *;

.menu {
  &__list {
    display: flex;
    align-items: center;
    column-gap: rem(50);

    @include tablet-l {
      column-gap: rem(30);
    }
  }
}
</style>
