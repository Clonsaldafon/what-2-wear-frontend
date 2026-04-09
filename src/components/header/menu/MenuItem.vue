<script setup lang="ts">
defineProps<{
  route: string
  text: string
  selected: boolean
}>()
</script>

<template>
  <a
    :class="`menu-item ${selected ? 'menu-item--selected' : ''}`"
    :href="`/${route}`"
  >
    {{ text }}
  </a>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/helpers/' as *;

.menu-item {
  padding-bottom: rem(8);
  border-bottom: rem(2) solid transparent;

  @include hover {
    border-color: var(--color-dark);
  }

  &--selected {
    border-color: var(--color-dark);
  }
}
</style>