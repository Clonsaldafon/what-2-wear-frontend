<script setup lang="ts">
const props = defineProps<{
  isProfile: boolean
  photoUrl: string
  type: string
  color: string
}>()

const emit = defineEmits<{
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="wardrobe-item-card">
    <button
      v-if="isProfile"
      class="wardrobe-item-card__delete"
      @click="emit('delete')"
    >
      <svg
        width="16" height="16" viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M12 4L4 12M4 4L12 12"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
        />
      </svg>
    </button>
    <img
      class="wardrobe-item-card__image"
      :src="photoUrl"
      alt=""
      width="50" height="50"
    >
    <div class="wardrobe-item-card__info">
      <div class="wardrobe-item-card__type">{{ type }}</div>
      <div class="wardrobe-item-card__color">{{ color }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.wardrobe-item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: rem(10);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(15);

  &__delete {
    @include square(24);
    @include flex-center;

    position: absolute;
    top: rem(-10);
    right: rem(-10);
    color: var(--color-light);
    background-color: var(--color-error);
    border-radius: 50%;
    transition-duration: var(--transition-duration);

    @include hover {
      opacity: 0.7;
    }
  }

  &__image {
    @include square(60);

    object-fit: cover;
    border-radius: rem(5);
  }

  &__info {
    display: flex;
    flex-direction: column;
    align-items: end;
    row-gap: rem(20);
    text-transform: lowercase;
    font-size: 14px;
  }

  &__color {
    color: var(--color-dark-alt);
    border-top: rem(1) solid var(--color-gray);
  }
}
</style>
