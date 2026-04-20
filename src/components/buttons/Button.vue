<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    hasIcon?: boolean
    disabled?: boolean
  }>(), {
    type: 'button',
    hasIcon: false,
    disabled: false
  }
)
</script>

<template>
  <button
    class="button"
    :class="{ 'button--disabled': disabled }"
    :type="type"
    :disabled="disabled"
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
