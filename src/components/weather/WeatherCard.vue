<script setup lang="ts">
const props = defineProps<{
  city: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
}>()
</script>

<template>
  <article class="weather-card">
    <div class="weather-card__body">
      <div class="weather-card__info">
        <div class="weather-card__info-city">{{ city }}</div>
        <div class="weather-card__info-temperature">
          {{ temperature }}<span>°C</span>
        </div>
      </div>
      <div class="weather-card__icon">
        <slot name="icon"></slot>
      </div>
    </div>
    <footer class="weather-card__footer">
      <div class="weather-card__footer-item">
        <div class="weather-card__footer-item-title">Ощущается</div>
        <div class="weather-card__footer-item-value">{{ feelsLike }}°</div>
      </div>
      <div class="weather-card__footer-item">
        <div class="weather-card__footer-item-title">Влажность</div>
        <div class="weather-card__footer-item-value">{{ humidity }}%</div>
      </div>
      <div class="weather-card__footer-item">
        <div class="weather-card__footer-item-title">Ветер</div>
        <div class="weather-card__footer-item-value">{{ windSpeed }} м/с</div>
      </div>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.weather-card {
  display: inline-flex;
  flex-direction: column;
  row-gap: rem(20);
  padding: rem(30);
  color: var(--color-light);
  background: linear-gradient(120deg, #F5A345, #F0CE0A);
  border-radius: rem(30);
  box-shadow: 0 rem(4) rem(20) 0 rgba(0, 0, 0, 0.25);

  &__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: rem(1) solid rgba(252, 250, 247, 0.15);

    &:not(:last-child) {
      padding-bottom: rem(20);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    align-items: start;
    row-gap: rem(20);

    &-city {
      font-weight: 500;
    }

    &-temperature {
      @include fluid-text(64, 56);
      
      display: flex;
      align-items: start;
      font-weight: 700;

      & span {
        @include fluid-text(18, 14);

        font-weight: 500;
      }
    }
  }

  &__icon {
    @include flex-center;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: rem(80);

    &-item {
      display: flex;
      flex-direction: column;
      row-gap: rem(10);

      &-title {
        @include fluid-text(14, 12);
      }

      &-value {
        font-weight: 500;
      }
    }

    @include mobile-l {
      column-gap: rem(10);
    }
  }

  @include mobile-l {
    width: 100%;
  }
}
</style>