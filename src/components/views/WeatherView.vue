<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import CitySearch from '../CitySearch.vue'
import Header from '../header/Header.vue'
import WeatherCard from '../weather/WeatherCard.vue'
import WeatherHourly from '../weather/hourly/WeatherHourly.vue'

import { useWeatherStore } from '@/stores/weather'
import { storeToRefs } from 'pinia'
import Overlay from '../Overlay.vue'
import ClothesMessageAuthenticate from '../clothes/ClothesMessageAuthenticate.vue'
import WeatherLoading from '../loading/WeatherLoading.vue'
import LoginModal from '../auth/LoginModal.vue'
import RegisterModal from '../auth/RegisterModal.vue'

const weatherStore = useWeatherStore()
const { currentWeather, hourlyForecast, loading, error } = storeToRefs(weatherStore)

type ModalView = 'clothes' | 'login' | 'register' | null

const activeModal = ref<ModalView>(null)

const precipitationProbability = computed(() => {
  const hourlyProbability = hourlyForecast.value.length
    ? Math.max(...hourlyForecast.value.map((item) => item.precipitation_probability ?? 0))
    : null

  return hourlyProbability ?? currentWeather.value?.precipitation_probability ?? null
})

const hasMeaningfulPrecipitation = computed(() => (
  Boolean(currentWeather.value?.has_precipitation)
  && (precipitationProbability.value ?? 0) > 0
))

const effectivePrecipitationType = computed(() => {
  if (!hasMeaningfulPrecipitation.value) return 'none'

  return currentWeather.value?.precipitation_type ?? 'none'
})

const precipitationLabel = computed(() => {
  if (!currentWeather.value) return 'Нет данных'

  if (precipitationProbability.value === 0) return 'Без осадков'
  if (effectivePrecipitationType.value === 'rain') return 'Дождь'
  if (effectivePrecipitationType.value === 'snow') return 'Снег'
  if (effectivePrecipitationType.value === 'sleet') return 'Мокрый снег'

  return hasMeaningfulPrecipitation.value ? 'Возможны осадки' : 'Без осадков'
})

const weatherDetails = computed(() => {
  if (!currentWeather.value) return []

  return [
    {
      label: 'Осадки',
      value: precipitationProbability.value === null ? 'Нет данных' : `${precipitationProbability.value}%`,
      caption: precipitationLabel.value
    },
    {
      label: 'Состояние',
      value: currentWeather.value.description,
      caption: currentWeather.value.is_day_time ? 'Сейчас день' : 'Сейчас ночь'
    },
    {
      label: 'Ощущается',
      value: `${currentWeather.value.feels_like}°C`,
      caption: currentWeather.value.feels_like < currentWeather.value.temperature ? 'Холоднее фактической' : 'Близко к фактической'
    },
    {
      label: 'Ветер',
      value: `${Math.round(currentWeather.value.wind_speed)} м/с`,
      caption: currentWeather.value.wind_speed >= 10 ? 'Сильный ветер' : 'Умеренно'
    }
  ]
})

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
  activeModal.value = 'clothes'
}

const onAuthOpen = (view: Extract<ModalView, 'login' | 'register'> = 'login') => {
  activeModal.value = view
}

const onModalClose = () => {
  activeModal.value = null
}
</script>

<template>
  <Header
    @clothesMessageOpen="onClothesMessageOpen"
    @authOpen="onAuthOpen"
  />
  <section class="weather section container">
    <h1 class="section__title h1 visually-hidden">Погода в текущий момент</h1>
    <div class="weather__body">
      <CitySearch @search="onCitySearch" />
      <WeatherLoading v-if="loading" />
      <div
        v-if="currentWeather && !loading"
        class="weather__current"
      >
        <WeatherCard
          class="weather__card"
          :city="currentWeather.city"
          :temperature="currentWeather.temperature"
          :feelsLike="currentWeather.feels_like"
          :humidity="currentWeather.humidity"
          :windSpeed="currentWeather.wind_speed"
          :description="currentWeather.description"
          :hasPrecipitation="hasMeaningfulPrecipitation"
          :precipitationType="effectivePrecipitationType"
          :isDayTime="currentWeather.is_day_time"
          :icon="currentWeather.icon"
          :showFooter="false"
        />

        <aside class="weather__details">
          <article
            v-for="item in weatherDetails"
            :key="item.label"
            class="weather-detail-card"
          >
            <span class="weather-detail-card__label">{{ item.label }}</span>
            <strong class="weather-detail-card__value">{{ item.value }}</strong>
            <span class="weather-detail-card__caption">{{ item.caption }}</span>
          </article>
        </aside>
      </div>
      <h2 class="section__title h2 visually-hidden">Почасовой прогноз</h2>
      <WeatherHourly
        v-if="hourlyForecast.length > 0 && !loading"
        :forecast="hourlyForecast"
      />
    </div>
  </section>
  <Overlay
    v-if="activeModal"
    :onClose="onModalClose"
  >
    <template
      v-if="activeModal === 'clothes'"
      #modal
    >
      <ClothesMessageAuthenticate @authOpen="onAuthOpen" />
    </template>
    <template
      v-else-if="activeModal === 'login'"
      #modal
    >
      <LoginModal
        @close="onModalClose"
        @switch="onAuthOpen('register')"
        @success="onModalClose"
      />
    </template>
    <template
      v-else-if="activeModal === 'register'"
      #modal
    >
      <RegisterModal
        @close="onModalClose"
        @switch="onAuthOpen('login')"
        @success="onModalClose"
      />
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

  &__current {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: rem(18);
    width: 100%;
    max-width: rem(900);
  }

  &__card {
    width: 100%;
  }

  &__details {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: rem(12);
  }

  &__current-icon {
    @include square(64);
  }

  @include tablet-l {
    &__current {
      max-width: rem(500);
    }

    &__details {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @include mobile-l {
    &__details {
      grid-template-columns: 1fr;
    }
  }
}

.weather-detail-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  row-gap: rem(10);
  min-height: rem(118);
  padding: rem(18);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(24);

  &__label {
    font-size: rem(13);
    font-weight: 600;
    color: var(--color-dark-alt);
  }

  &__value {
    @include fluid-text(24, 18);

    line-height: 1.1;
    font-weight: 700;
    color: var(--color-dark);
  }

  &__caption {
    font-size: rem(13);
    line-height: 1.25;
    color: var(--color-dark-alt);
  }
}
</style>
