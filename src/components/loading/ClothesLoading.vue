<script setup lang="ts"></script>

<template>
  <div class="clothes-loading">
    <div class="clothes-loading__hanger">
      <div class="clothes-loading__hook"></div>
      <div class="clothes-loading__bar"></div>
      <div class="clothes-loading__body"></div>
    </div>

    <div class="clothes-loading__lines">
      <span class="clothes-loading__line clothes-loading__line--lg"></span>
      <span class="clothes-loading__line"></span>
      <span class="clothes-loading__line clothes-loading__line--sm"></span>
    </div>

    <div class="clothes-loading__text">Подбираем образ по погоде...</div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.clothes-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: rem(18);
  width: 100%;
  max-width: rem(420);
  margin-inline: auto;
  padding: rem(36) rem(24);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(245, 248, 245, 0.98));
  border: rem(1) solid rgba(44, 44, 44, 0.08);
  border-radius: rem(28);
  box-shadow: 0 rem(14) rem(34) rgba(44, 44, 44, 0.08);

  &__hanger {
    position: relative;
    width: rem(120);
    height: rem(108);
    animation: float 1.8s ease-in-out infinite;
  }

  &__hook {
    position: absolute;
    top: 0;
    left: 50%;
    width: rem(26);
    height: rem(26);
    border: rem(4) solid var(--color-dark-alt);
    border-bottom: none;
    border-radius: rem(26) rem(26) 0 0;
    transform: translateX(-50%);
    opacity: 0.75;
  }

  &__bar {
    position: absolute;
    top: rem(24);
    left: 50%;
    width: rem(92);
    height: rem(4);
    background: linear-gradient(90deg, rgba(44, 44, 44, 0.2), rgba(24, 169, 123, 0.65), rgba(44, 44, 44, 0.2));
    border-radius: rem(999);
    transform: translateX(-50%);
  }

  &__body {
    position: absolute;
    top: rem(28);
    left: 50%;
    width: rem(92);
    height: rem(72);
    background:
      linear-gradient(135deg, rgba(24, 169, 123, 0.95), rgba(95, 201, 167, 0.82));
    clip-path: polygon(0 0, 28% 0, 50% 18%, 72% 0, 100% 0, 84% 32%, 74% 100%, 26% 100%, 16% 32%);
    transform: translateX(-50%);
    box-shadow: 0 rem(8) rem(20) rgba(24, 169, 123, 0.28);
  }

  &__lines {
    display: flex;
    flex-direction: column;
    row-gap: rem(10);
    width: 100%;
  }

  &__line {
    height: rem(10);
    border-radius: rem(999);
    background: linear-gradient(90deg, rgba(44, 44, 44, 0.08), rgba(24, 169, 123, 0.22), rgba(44, 44, 44, 0.08));
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;

    &--lg {
      width: 100%;
    }

    &--sm {
      width: 62%;
    }
  }

  &__text {
    font-weight: 600;
    color: var(--color-dark-alt);
    text-align: center;
  }
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(rem(-6));
  }
}
</style>
