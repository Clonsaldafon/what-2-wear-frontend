<script setup lang="ts">
import WeatherIcon from './WeatherIcon.vue';

const props = defineProps<{
  city: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  description: string
  hasPrecipitation: boolean
  precipitationType: string
  isDayTime: boolean
  icon: string
}>()

const backgroundModifier = 
  props.precipitationType === 'rain' ? 'rain' : 
  props.precipitationType === 'snow' ? 'snow' : 
  props.precipitationType === 'ice' ? 'ice' : 
  props.precipitationType === 'mix' ? 'mix' : 'sunny'
</script>

<template>
  <article :class="`weather-card weather-card--${backgroundModifier} ${!isDayTime ? 'weather-card--night' : ''}`">
    <div class="weather-card__body">
      <div class="weather-card__info">
        <div class="weather-card__info-city">{{ city }}</div>
        <div class="weather-card__info-temperature">
          {{ temperature }}<span>°C</span>
        </div>
      </div>
      <div class="weather-card__icon">
        <WeatherIcon
          :iconCode="icon"
          :description="description"
        />
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
        <div class="weather-card__footer-item-value">{{ Math.round(windSpeed) }} м/с</div>
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
  line-height: 0.75;
  color: var(--color-dark);
  border-radius: rem(30);
  box-shadow: 0 rem(4) rem(20) 0 rgba(0, 0, 0, 0.25);

  &--sunny {
    color: var(--color-light);
    background: var(--color-sunny-background);
  }

  &--rain {
    color: var(--color-light);
    background: var(--color-rain-background);
  }

  &--snow {
    background: var(--color-snow-background);
  }

  &--ice {
    background: var(--color-ice-background);
  }

  &--mix {
    background: var(--color-mix-background);
  }

  &--night {
    color: var(--color-light);
    background: var(--color-night-background);
  }

  &__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: rem(10);
    border-bottom: rem(1) solid rgba($color: #FFFFFF, $alpha: 0.25);

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

    filter: drop-shadow(0 rem(2) rem(5) rgba(0, 0, 0, 0.25));
    -webkit-filter: drop-shadow(0 rem(2) rem(5) rgba(0, 0, 0, 0.25));
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    column-gap: rem(80);
    row-gap: rem(20);

    &-item {
      display: flex;
      flex-direction: column;
      row-gap: rem(10);
      white-space: nowrap;

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
