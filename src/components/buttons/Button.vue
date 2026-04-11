<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: string
    hasIcon?: boolean
  }>(), {
    type: 'button',
    hasIcon: false
  }
)
</script>

<template>
  <button
    v-if="type === 'button'"
    class="button"
    type="button"
  >
    <div v-if="hasIcon" class="button__icon">
      <slot name="icon"></slot>
    </div>
    <div class="button__text">
      <slot name="text"></slot>
    </div>
  </button>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers' as *;

.button {
  @include flex-center;

  column-gap: rem(12);
  padding: rem(12) rem(32);
  color: var(--color-light);
  background-color: var(--color-dark);
  border: rem(1) solid var(--color-dark);
  border-radius: rem(30);

  @include hover {
    color: var(--color-dark);
    background-color: transparent;
  }

  &__icon {
    @include square(24);
    @include flex-center;
  }

  &__text {
    @include fluid-text(18, 14);
    
    font-weight: 600;
  }

  @include tablet-l {
    padding: rem(8) rem(24);
  }
}
</style>