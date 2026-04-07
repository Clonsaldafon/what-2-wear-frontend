<script setup lang="ts">
defineProps<{
  route: string
  text: string
  selected: boolean
}>()
</script>

<template>
  <div :class="`menu-overlay-item ${selected ? 'menu-overlay-item--selected' : ''}`">
    <a
      class="menu-overlay-item__link"
      :href="`/${route}`"
    >
      {{ text }}
    </a>
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
  position: relative;

  &--selected {
    &::before {
      position: absolute;
      content: '';
      top: 50%;
      left: rem(-30);
      transform: translateY(-50%);
      width: rem(15);
      height: rem(2);
      background-color: var(--color-dark);
    }
  }

  &__link {
    @include fluid-text(24, 20);
  }

  &__icon {
    @include square(24);
    @include flex-center;
  }
}
</style>