<script setup lang="ts">
const props = defineProps<{
  username?: string
  email?: string
  photoUrl?: string
}>()
</script>

<template>
  <div class="user-card">
    <img
      v-if="photoUrl"
      class="user-card__photo"  
      :src="photoUrl"
      alt=""
      width="50" height="50"
    >
    <div class="user-card__info">
      <div class="user-card__username">{{ username }}</div>
      <div class="user-card__email">{{ email || 'Почта не указана' }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.user-card {
  display: flex;
  align-items: center;
  column-gap: rem(10);
  padding: rem(20);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(30);

  &__photo {
    @include square(50);

    object-fit: cover;
    border: rem(1) solid var(--color-dark);
    border-radius: 50%;
  }

  &__info {
    display: flex;
    flex-direction: column;
    row-gap: rem(10);
  }

  &__username {
    font-size: 18px;
    font-weight: 600;
  }

  &__email {
    color: var(--color-dark-alt);
    font-size: 14px;
  }
}
</style>
