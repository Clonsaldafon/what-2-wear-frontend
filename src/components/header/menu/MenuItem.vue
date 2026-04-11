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
  position: relative;
  padding-block: rem(16);

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