<script setup lang="ts">
defineProps<{
  username?: string
  email?: string
  photoUrl?: string
  messenger?: string | null
  hasPasswordLogin?: boolean
}>()
</script>

<template>
  <div class="user-card">
    <img
      v-if="photoUrl"
      class="user-card__photo"
      :src="photoUrl"
      alt=""
      width="64" height="64"
    >
    <div v-else class="user-card__avatar" aria-hidden="true">
      {{ (username || 'П').slice(0, 1).toUpperCase() }}
    </div>
    <div class="user-card__info">
      <div class="user-card__username">{{ username }}</div>
      <div class="user-card__email">{{ email || 'Почта не указана' }}</div>
      <div class="user-card__badges">
        <span v-if="messenger === 'telegram'" class="user-card__badge">Telegram</span>
        <span
          class="user-card__badge"
          :class="hasPasswordLogin ? 'user-card__badge--success' : 'user-card__badge--warning'"
        >
          {{ hasPasswordLogin ? 'Логин и пароль настроены' : 'Нужен логин и пароль' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.user-card {
  display: flex;
  align-items: center;
  column-gap: rem(14);
  padding: rem(20);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(24);

  &__photo,
  &__avatar {
    @include square(64);

    flex: 0 0 auto;
    border-radius: 50%;
  }

  &__photo {
    object-fit: cover;
    border: rem(1) solid rgba(46, 125, 100, 0.32);
  }

  &__avatar {
    @include flex-center;

    color: var(--color-light);
    font-size: rem(24);
    font-weight: 700;
    background-color: var(--color-accent);
  }

  &__info {
    display: flex;
    flex-direction: column;
    row-gap: rem(8);
    min-width: 0;
  }

  &__username {
    overflow-wrap: anywhere;
    font-size: rem(20);
    font-weight: 700;
  }

  &__email {
    overflow-wrap: anywhere;
    color: var(--color-dark-alt);
    font-size: rem(14);
  }

  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: rem(6);
  }

  &__badge {
    padding: rem(5) rem(9);
    color: var(--color-accent);
    font-size: rem(12);
    font-weight: 700;
    background-color: rgba(46, 125, 100, 0.10);
    border-radius: rem(12);

    &--success {
      color: var(--color-accent);
    }

    &--warning {
      color: #a46b16;
      background-color: rgba(224, 189, 54, 0.18);
    }
  }
}
</style>
