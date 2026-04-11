<script setup lang="ts">
import { onMounted } from 'vue'

import CitySearch from '../CitySearch.vue'
import Header from '../header/Header.vue'
import WeatherCard from '../weather/WeatherCard.vue'
import WeatherHourly from '../weather/hourly/WeatherHourly.vue'

import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'

const weatherStore = useWeatherStore()
const { currentWeather, hourlyForecast, loading, error } = storeToRefs(weatherStore)

const onCitySearch = async (cityName: string) => {
  weatherStore.setCity(cityName)

  // await weatherStore.fetchCurrentWeather()
  // await weatherStore.fetchHourlyForecast()
}

onMounted(async () => {
  if (weatherStore.city) {
    // await weatherStore.fetchCurrentWeather()
    // await weatherStore.fetchHourlyForecast()
  }
})
</script>

<template>
  <Header />
  <section class="weather section container">
    <h1 class="section__title h1 visually-hidden">Погода в текущий момент</h1>
    <div class="weather__body">
      <CitySearch @search="onCitySearch" />
      <WeatherCard
        v-if="currentWeather"
        class="weather__card"
        :city="currentWeather.city"
        :temperature="currentWeather.temperature"
        :feelsLike="currentWeather.feels_like"
        :humidity="currentWeather.humidity"
        :windSpeed="currentWeather.wind_speed"
        :description="currentWeather.description"
        :icon="currentWeather.icon"
      />
      <h2 class="section__title h2 visually-hidden">Почасовой прогноз</h2>
      <WeatherHourly :forecast="hourlyForecast" />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.weather {
  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: rem(40)
  }

  &__current-icon {
    @include square(64);
  }
}
</style>
