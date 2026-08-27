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
  <article class="wardrobe-item-card" :class="{ 'wardrobe-item-card--profile': isProfile }">
    <div class="wardrobe-item-card__media">
      <img
        class="wardrobe-item-card__image"
        :src="photoUrl"
        :alt="`${type}, ${color}`"
        loading="lazy"
      >
      <button
        v-if="isProfile"
        class="wardrobe-item-card__delete"
        type="button"
        aria-label="Удалить вещь"
        @click="emit('delete')"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="wardrobe-item-card__info">
      <strong class="wardrobe-item-card__type">{{ type }}</strong>
      <span class="wardrobe-item-card__color">
        {{ color }}
      </span>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.wardrobe-item-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(18);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  @include hover {
    border-color: rgba(46, 125, 100, 0.35);
    box-shadow: 0 rem(10) rem(28) rgba(44, 44, 44, 0.08);
    transform: translateY(rem(-2));
  }

  &__media {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background-color: var(--color-gray-alt);
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__delete {
    @include square(34);
    @include flex-center;

    position: absolute;
    top: rem(10);
    right: rem(10);
    color: var(--color-light);
    background-color: rgba(193, 78, 78, 0.94);
    border: rem(1) solid rgba(255, 255, 255, 0.36);
    border-radius: 50%;
    box-shadow: 0 rem(6) rem(18) rgba(44, 44, 44, 0.2);

    @include hover {
      background-color: var(--color-error);
      transform: scale(1.04);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    row-gap: rem(8);
    min-height: rem(84);
    padding: rem(12);
  }

  &__type {
    min-width: 0;
    color: var(--color-dark);
    font-size: rem(16);
    line-height: 1.25;
    overflow-wrap: anywhere;
    text-transform: lowercase;
  }

  &__color {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    max-width: 100%;
    padding: rem(6) rem(9);
    color: var(--color-dark-alt);
    font-size: rem(13);
    font-weight: 700;
    line-height: 1;
    background-color: var(--color-gray-alt);
    border-radius: rem(99);
    overflow-wrap: anywhere;
    text-transform: lowercase;
  }

  @include tablet {
    border-radius: rem(16);

    &__media {
      aspect-ratio: 5 / 3;
    }

    &__delete {
      @include square(30);

      top: rem(8);
      right: rem(8);
    }

    &__info {
      min-height: rem(66);
      row-gap: rem(6);
      padding: rem(9);
    }

    &__type {
      font-size: rem(14);
      line-height: 1.2;
    }

    &__color {
      padding: rem(5) rem(8);
      font-size: rem(12);
    }
  }
}
</style>
