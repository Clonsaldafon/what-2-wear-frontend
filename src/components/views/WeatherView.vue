<script setup lang="ts">
import { onMounted, ref } from 'vue'

import CitySearch from '../CitySearch.vue'
import Header from '../header/Header.vue'
import WeatherCard from '../weather/WeatherCard.vue'
import WeatherHourly from '../weather/hourly/WeatherHourly.vue'

import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'
import Overlay from '../Overlay.vue'
import ClothesMessageAuthenticate from '../clothes/ClothesMessageAuthenticate.vue'
import WeatherLoading from '../loading/WeatherLoading.vue'

const weatherStore = useWeatherStore()
const { currentWeather, hourlyForecast, loading, error } = storeToRefs(weatherStore)

const isModalOpen = ref(false)
const isClothesMessageOpen = ref(false)

const onCitySearch = async (cityName: string) => {
  weatherStore.setCity(cityName)

  await weatherStore.fetchCurrentWeather()
  await weatherStore.fetchHourlyForecast()
}

onMounted(async () => {
  if (weatherStore.city) {
    await weatherStore.fetchCurrentWeather()
    await weatherStore.fetchHourlyForecast()
  }
})

const onClothesMessageOpen = () => {
  isClothesMessageOpen.value = true
}

const onModalOpen = () => {
  isModalOpen.value = true
}

const onModalClose = () => {
  isModalOpen.value = false
  isClothesMessageOpen.value = false
}
</script>

<template>
  <Header @clothesMessageOpen="onClothesMessageOpen" />
  <section class="weather section container">
    <h1 class="section__title h1 visually-hidden">Погода в текущий момент</h1>
    <div class="weather__body">
      <CitySearch @search="onCitySearch" />
      <WeatherLoading v-if="loading" />
      <WeatherCard
        v-if="currentWeather && !loading"
        class="weather__card"
        :city="currentWeather.city"
        :temperature="currentWeather.temperature"
        :feelsLike="currentWeather.feels_like"
        :humidity="currentWeather.humidity"
        :windSpeed="currentWeather.wind_speed"
        :description="currentWeather.description"
        :hasPrecipitation="currentWeather.has_precipitation"
        :precipitationType="currentWeather.precipitation_type"
        :isDayTime="currentWeather.is_day_time"
        :icon="currentWeather.icon"
      />
      <h2 class="section__title h2 visually-hidden">Почасовой прогноз</h2>
      <WeatherHourly
        v-if="hourlyForecast.length > 0 && !loading"
        :forecast="hourlyForecast"
      />
    </div>
  </section>
  <Overlay
    v-if="isModalOpen || isClothesMessageOpen"
    :onClose="onModalClose"
  >
    <template
      v-if="isClothesMessageOpen"
      #modal
    >
      <ClothesMessageAuthenticate />
    </template>
  </Overlay>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.weather {
  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: rem(40);
  }

  &__current-icon {
    @include square(64);
  }
}
</style>
