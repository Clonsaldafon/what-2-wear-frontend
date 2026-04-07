<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: string
  }>(), {
    type: 'button'
  }
)
</script>

<template>
  <button
    v-if="type === 'button'"
    class="button"
    type="button"
  >
    <div class="button__icon">
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
  border-radius: rem(30);

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