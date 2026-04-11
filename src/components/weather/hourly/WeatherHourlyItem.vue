<script setup lang="ts">
import { computed } from 'vue'

import type { HourlyForecast } from '@/stores/weather'

import { formatTime24 } from '@/utils/date'
import WeatherIcon from '../WeatherIcon.vue';

const props = defineProps<{
  data: HourlyForecast
}>()

const formattedTime = computed(() => formatTime24(props.data.datetime))
</script>

<template>
  <div class="weather-hourly-item">
    <div class="weather-hourly-item__info">
      <time class="weather-hourly-item__time" :datetime="formattedTime">{{ formattedTime }}</time>
      <div class="weather-hourly-item__icon">
        <WeatherIcon
          :iconCode="data.icon"
          :description="data.phrase"
        />
      </div>
      <div class="weather-hourly-item__temperature">{{ Math.round(data.temperature) }}°C</div>
    </div>
    <div class="weather-hourly-item__precipitation-probability">{{ data.precipitation_probability }}%</div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/helpers/' as *;

.weather-hourly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: rem(20);

  &__info {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: rem(10);
  }

  &__time {
    @include fluid-text(16, 14);

    color: var(--color-dark-alt);
  }

  &__icon {
    @include square(48);
    @include flex-center;

    padding: rem(8);
    background-color: var(--color-gray-alt);
    border-radius: rem(15);
  }

  &__temperature {
    @include fluid-text(18, 16);
    
    font-weight: 500;
  }

  &__precipitation-probability {
    font-size: rem(14);
    color: var(--color-rain);
  }
}
</style>