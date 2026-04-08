<script setup lang="ts">
import { ROUTES } from '@/utils/constants';
import MenuItem from './MenuItem.vue';

const props = defineProps<{
  isAuthenticated: boolean
}>()
</script>

<template>
  <nav class="menu hidden-tablet">
    <ul class="menu__list">
      <li class="menu__item">
        <MenuItem
          :route="ROUTES.WEATHER"
          :text="'Погода'"
          :selected="true"
        />
      </li>
      <li class="menu__item">
        <MenuItem
          :route="'/'"
          :text="'Одежда'"
          :selected="false"
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