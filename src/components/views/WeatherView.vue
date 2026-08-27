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
import TelegramAuthModal from '../auth/TelegramAuthModal.vue'

import { useAuthStore, type UserGender } from '@/stores/auth'
import { ROUTES } from '@/utils/constants'

const ACCOUNT_NOTICE_DISMISSED_UNTIL_KEY = 'accountNoticeDismissedUntil'
const GENDER_PROMPT_DISMISSED_UNTIL_KEY = 'genderPromptDismissedUntil'
const ACCOUNT_NOTICE_DISMISS_MS = 24 * 60 * 60 * 1000

const authStore = useAuthStore()
const weatherStore = useWeatherStore()
const { currentWeather, hourlyForecast, loading, error } = storeToRefs(weatherStore)

type ModalView = 'clothes' | 'login' | 'register' | 'telegram' | null

const activeModal = ref<ModalView>(null)
const accountNoticeDismissedUntil = ref(Number(localStorage.getItem(ACCOUNT_NOTICE_DISMISSED_UNTIL_KEY) || 0))
const genderPromptDismissedUntil = ref(Number(localStorage.getItem(GENDER_PROMPT_DISMISSED_UNTIL_KEY) || 0))


const showAccountNotice = computed(() => (
  authStore.isAuthenticated
  && authStore.messenger === 'telegram'
  && !authStore.hasPasswordLogin
  && Date.now() >= accountNoticeDismissedUntil.value
))

const onAccountNoticeDismiss = () => {
  const dismissedUntil = Date.now() + ACCOUNT_NOTICE_DISMISS_MS
  accountNoticeDismissedUntil.value = dismissedUntil
  localStorage.setItem(ACCOUNT_NOTICE_DISMISSED_UNTIL_KEY, String(dismissedUntil))
}

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


const genderSaving = ref(false)

const showGenderPrompt = computed(() => (
  authStore.isAuthenticated
  && authStore.userGender === 'unspecified'
  && !loading.value
  && Date.now() >= genderPromptDismissedUntil.value
))

const onGenderSelect = async (gender: UserGender) => {
  genderSaving.value = true
  await authStore.updateProfile({ gender })
  genderSaving.value = false
}

const onGenderPromptDismiss = () => {
  const dismissedUntil = Date.now() + ACCOUNT_NOTICE_DISMISS_MS
  genderPromptDismissedUntil.value = dismissedUntil
  localStorage.setItem(GENDER_PROMPT_DISMISSED_UNTIL_KEY, String(dismissedUntil))
}

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

const onAuthOpen = (view: Extract<ModalView, 'login' | 'register' | 'telegram'> = 'login') => {
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
      <aside
        v-if="showAccountNotice && !loading"
        class="weather-account-notice"
      >
        <div class="weather-account-notice__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L19 6V11C19 15.4 16.2 19.3 12 20.8C7.8 19.3 5 15.4 5 11V6L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 15H12.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="weather-account-notice__content">
          <strong class="weather-account-notice__title">Защитите доступ к аккаунту</strong>
          <span class="weather-account-notice__text">Добавьте почту и пароль, чтобы не потерять доступ к аккаунту.</span>
          <RouterLink
            class="weather-account-notice__link"
            :to="{ name: ROUTES.PROFILE }"
          >
            Заполнить профиль
          </RouterLink>
        </div>
        <button
          class="weather-account-notice__dismiss"
          type="button"
          aria-label="Скрыть сообщение на сутки"
          @click="onAccountNoticeDismiss"
        >
          <span aria-hidden="true"></span>
        </button>
      </aside>
      <div
        v-if="showGenderPrompt"
        class="weather-gender-prompt"
      >
        <div class="weather-gender-prompt__text">
          <strong>Подстроить рекомендации?</strong>
          <span>Выберите пол, чтобы комплекты одежды стали точнее.</span>
        </div>
        <div class="weather-gender-prompt__actions">
          <button type="button" :disabled="genderSaving" @click="onGenderSelect('female')">Женский</button>
          <button type="button" :disabled="genderSaving" @click="onGenderSelect('male')">Мужской</button>
          <button type="button" :disabled="genderSaving" @click="onGenderPromptDismiss">Позже</button>
        </div>
      </div>
      <CitySearch v-if="!loading" @search="onCitySearch" />
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
      v-else-if="activeModal === 'telegram'"
      #modal
    >
      <TelegramAuthModal
        @close="onModalClose"
        @switch="onAuthOpen('login')"
        @success="onModalClose"
      />
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



.weather-gender-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: rem(14);
  width: 100%;
  max-width: rem(760);
  padding: rem(14) rem(16);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(18);

  &__text {
    display: flex;
    flex-direction: column;
    row-gap: rem(4);

    span {
      color: var(--color-dark-alt);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: rem(8);

    button {
      min-height: rem(36);
      padding: rem(8) rem(12);
      color: var(--color-dark);
      font-weight: 600;
      border: rem(1) solid var(--color-gray);
      border-radius: rem(18);

      @include hover {
        color: var(--color-light);
        background-color: var(--color-accent);
        border-color: var(--color-accent);
      }
    }
  }

  @include mobile-l {
    align-items: stretch;
    flex-direction: column;
  }
}

.weather-account-notice {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  column-gap: rem(14);
  width: 100%;
  max-width: rem(760);
  padding: rem(18) rem(18);
  color: var(--color-dark);
  background-color: var(--color-light-alt);
  border: rem(1) solid rgba(46, 125, 100, 0.32);
  border-left: rem(6) solid var(--color-accent);
  border-radius: rem(20);
  box-shadow: 0 rem(12) rem(34) rgba(46, 125, 100, 0.14);

  &__icon {
    @include square(48);
    @include flex-center;

    color: var(--color-accent);
    background-color: rgba(46, 125, 100, 0.12);
    border-radius: rem(14);
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: rem(8);
    min-width: 0;
  }

  &__title {
    font-size: rem(18);
    font-weight: 700;
  }

  &__text {
    max-width: rem(560);
    color: var(--color-dark-alt);
    line-height: 1.45;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    min-height: rem(38);
    padding: rem(8) rem(14);
    color: var(--color-light);
    font-weight: 700;
    background-color: var(--color-accent);
    border-radius: rem(18);

    @include hover {
      color: var(--color-accent);
      background-color: var(--color-light);
    }
  }

  &__dismiss {
    @include square(36);
    @include flex-center;

    color: var(--color-dark-alt);
    border-radius: rem(10);

    @include hover {
      color: var(--color-dark);
      background-color: rgba(46, 125, 100, 0.10);
    }

    span {
      position: relative;
      display: block;
      width: rem(18);
      height: rem(18);

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: rem(2);
        background-color: currentColor;
        border-radius: rem(2);
      }

      &::before {
        rotate: 45deg;
      }

      &::after {
        rotate: -45deg;
      }
    }
  }

  @include mobile-l {
    grid-template-columns: auto minmax(0, 1fr);
    padding: rem(16);

    &__dismiss {
      position: absolute;
      top: rem(10);
      right: rem(10);
    }

    &__content {
      padding-right: rem(28);
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
