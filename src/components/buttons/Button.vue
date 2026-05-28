<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    hasIcon?: boolean
    hasText?: boolean
    disabled?: boolean
    accent?: boolean
  }>(), {
    type: 'button',
    hasIcon: false,
    hasText: true,
    disabled: false,
    accent: false
  }
)
</script>

<template>
  <button
    class="button"
    :class="`${!hasText ? 'button--no-text' : ''} ${accent ? 'button--accent' : ''} ${disabled ? 'button--disabled' : ''}`"
    :type="type"
    :disabled="disabled"
  >
    <div v-if="hasIcon" class="button__icon">
      <slot name="icon"></slot>
    </div>
    <div v-if="hasText" class="button__text">
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

  &--no-text {
    @include square(44);

    padding: rem(10);
  }

  &--accent {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
    box-shadow: 0 rem(4) rem(4) 0 rgba($color: #2E7D64, $alpha: 0.25);
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
}
</style>
