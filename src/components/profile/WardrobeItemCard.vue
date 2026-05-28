<script setup lang="ts">
const props = defineProps<{
  photoUrl: string
  type: string
  color: string
}>()
</script>

<template>
  <div class="wardrobe-item-card">
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
  padding: rem(10);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(15);

  &__image {
    @include square(50);

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
