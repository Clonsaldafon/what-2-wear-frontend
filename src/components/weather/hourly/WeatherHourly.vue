<script setup lang="ts">
import type { HourlyForecast } from '@/stores/weather'

import WeatherHourlyItem from './WeatherHourlyItem.vue'

const props = defineProps<{
  forecast: HourlyForecast[]
}>()
</script>

<template>
  <div class="weather-hourly">
    <ul class="weather-hourly__list">
      <li
        v-for="(data, index) in forecast"
        :key="index"
        class="weather-hourly__item"
      >
        <WeatherHourlyItem :data="data" />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/helpers/' as *;

.weather-hourly {
  display: inline-flex;
  padding: rem(20);
  width: 100%;
  max-width: rem(500);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(30);
  overflow-x: auto;
  scrollbar-width: none;

  &__list {
    display: flex;
    align-items: center;
    column-gap: rem(20);
  }
}
</style>