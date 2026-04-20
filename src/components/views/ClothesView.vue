<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { storeToRefs } from 'pinia'

import Header from '../header/Header.vue'
import ClothesLoading from '../loading/ClothesLoading.vue'

import { useWeatherStore } from '@/stores/weather'

type SignalItem = {
  label: string
  value: string
}

const weatherStore = useWeatherStore()
const { city, currentWeather, loading } = storeToRefs(weatherStore)

const hasSelectedCity = computed(() => !!city.value.trim())
const heroCity = computed(() => currentWeather.value?.city || city.value || '')
const heroWindSpeed = computed(() => {
  if (currentWeather.value?.wind_speed == null) return null
  return Math.round(currentWeather.value.wind_speed * 1000 / 3600)
})

const signalItems = computed<SignalItem[]>(() => {
  if (!hasSelectedCity.value) {
    return [
      { label: 'Статус', value: 'Город не выбран' },
      { label: 'Доступность', value: 'Рекомендации появятся после загрузки погоды' }
    ]
  }

  if (!currentWeather.value) {
    return [
      { label: 'Статус', value: 'Ждем прогноз' },
      { label: 'Город', value: city.value },
      { label: 'После загрузки', value: 'Покажем комплект' },
      { label: 'Основа подбора', value: 'Температура и осадки' }
    ]
  }

  return [
    { label: 'Температура', value: `${currentWeather.value.temperature}°C` },
    { label: 'Ощущается', value: `${currentWeather.value.feels_like}°C` },
    { label: 'Влажность', value: `${currentWeather.value.humidity}%` },
    { label: 'Ветер', value: `${heroWindSpeed.value} м/с` }
  ]
})

const wardrobeDirection = computed(() => {
  if (!hasSelectedCity.value) {
    return 'Рекомендации по одежде доступны после выбора города и загрузки прогноза погоды. Как только данные появятся, мы подберем образ под условия дня.'
  }

  if (!currentWeather.value) {
    return `Для ${city.value} еще не загружен прогноз. Как только данные о погоде появятся, мы покажем рекомендации с учетом температуры, ветра и осадков.`
  }

  if (currentWeather.value.has_precipitation) {
    return 'Лучше выбрать практичный верхний слой, закрытую обувь и вещи, которые спокойно переживут влажный воздух и переменчивую улицу.'
  }

  if (currentWeather.value.temperature <= 10) {
    return 'Ставка на многослойность: база, утепляющий средний слой и уверенный верх, который держит форму и защищает от прохлады.'
  }

  if (currentWeather.value.temperature >= 22) {
    return 'Держите образ легким и дышащим: свободная база, минимум лишних слоев и обувь, в которой комфортно весь день.'
  }

  return 'Идеальный сценарий на день это аккуратный многослойный образ: дышащая база, выразительный верхний слой и закрытая обувь.'
})

const recommendationTitle = computed(() => {
  if (!hasSelectedCity.value) {
    return 'Сначала выберите город'
  }

  if (loading.value) {
    return 'Подбираем рекомендации'
  }

  if (!currentWeather.value) {
    return 'Ожидаем погодные данные'
  }

  return 'Рекомендации скоро появятся'
})

const recommendationItems = computed(() => {
  if (!hasSelectedCity.value) {
    return [
      'Откройте поиск города на странице погоды',
      'Выберите нужный населенный пункт',
      'Дождитесь загрузки текущей погоды',
      'Вернитесь за персональной рекомендацией'
    ]
  }

  if (loading.value) {
    return [
      'Считываем текущие погодные условия',
      'Уточняем температуру, ветер и влажность',
      'Подготавливаем основу для подбора одежды'
    ]
  }

  if (!currentWeather.value) {
    return [
      'Проверяем температуру и ощущаемую погоду',
      'Учитываем осадки, влажность и ветер',
      'Готовим рекомендации под ритм дня',
      'Покажем список вещей сразу после загрузки'
    ]
  }

  return [
    `Прогноз для ${heroCity.value} уже загружен`,
    `Сейчас на улице ${currentWeather.value.temperature}°C, ощущается как ${currentWeather.value.feels_like}°C`,
    'Как только модуль подбора одежды будет подключен, здесь появятся персональные рекомендации'
  ]
})

const recommendationNote = computed(() => {
  if (!hasSelectedCity.value) {
      return 'Без выбранного города мы не можем рассчитать условия дня, поэтому рекомендации по одежде пока недоступны.'
  }

  if (loading.value) {
    return 'Немного подождите. Система обновляет погодные данные, чтобы подготовить подбор на основе актуальных условий.'
  }

  if (!currentWeather.value) {
    return 'Город уже выбран. Осталось дождаться загрузки прогноза погоды, и рекомендации появятся автоматически.'
  }

  return 'Погода уже подгружена. Следующий шаг — подключить источник реальных рекомендаций, и этот экран начнет показывать подбор одежды вместо информационного состояния.'
})

onMounted(async () => {
  if (weatherStore.city && !currentWeather.value && !loading.value) {
    await weatherStore.fetchCurrentWeather()
  }
})

</script>

<template>
  <Header />
  <section class="clothes section container">
    <div class="clothes__hero">
      <div class="clothes__copy">
        <span class="clothes__eyebrow">Подбор одежды</span>
        <h1 class="clothes__title h1">
          Что надеть сегодня
          <span
            v-if="heroCity"
            class="clothes__title-accent"
          >
            в {{ heroCity }}
          </span>
        </h1>
        <p class="clothes__description">
          {{ wardrobeDirection }}
        </p>

        <div class="clothes__signals">
          <div
            v-for="item in signalItems"
            :key="item.label"
            class="signal-card"
          >
            <span class="signal-card__label">{{ item.label }}</span>
            <span class="signal-card__value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <div class="clothes__recommendation">
        <div class="clothes__card">
          <div class="clothes__card-head">
            <span class="clothes__card-kicker">Рекомендация</span>
            <h2 class="clothes__card-title h3">{{ recommendationTitle }}</h2>
          </div>

          <ClothesLoading v-if="loading && hasSelectedCity" />

          <ul
            v-else
            class="clothes__list"
          >
            <li
              v-for="item in recommendationItems"
              :key="item"
              class="clothes__list-item"
            >
              {{ item }}
            </li>
          </ul>

          <div class="clothes__note">
            {{ recommendationNote }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.clothes {
  &__hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(rem(360), 0.95fr);
    gap: rem(24);
    padding: rem(34);
    background:
      radial-gradient(circle at top left, rgba(244, 201, 75, 0.2), transparent 22%),
      radial-gradient(circle at 85% 15%, rgba(24, 169, 123, 0.18), transparent 24%),
      linear-gradient(135deg, #ffffff, #f5f8f5 72%);
    border: rem(1) solid rgba(44, 44, 44, 0.08);
    border-radius: rem(36);
    box-shadow: 0 rem(18) rem(45) rgba(44, 44, 44, 0.08);
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      right: rem(-40);
      bottom: rem(-80);
      width: rem(280);
      height: rem(280);
      background: radial-gradient(circle, rgba(24, 169, 123, 0.12), transparent 70%);
      filter: blur(rem(10));
      pointer-events: none;
    }
  }

  &__copy {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: rem(28);
  }

  &__eyebrow {
    display: inline-flex;
    align-self: flex-start;
    padding: rem(9) rem(14);
    font-size: rem(13);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-dark);
    background-color: rgba(255, 255, 255, 0.75);
    border: rem(1) solid rgba(44, 44, 44, 0.08);
    border-radius: rem(999);
    backdrop-filter: blur(rem(10));
  }

  &__title {
    max-width: rem(700);
  }

  &__title-accent {
    display: block;
    color: var(--color-accent);
  }

  &__description {
    max-width: rem(680);
    color: var(--color-dark-alt);
  }

  &__signals {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: rem(14);
  }

  &__recommendation {
    position: relative;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }

  &__card {
    border: rem(1) solid rgba(44, 44, 44, 0.08);
    box-shadow: 0 rem(16) rem(40) rgba(44, 44, 44, 0.08);
  }

  &__card {
    display: flex;
    flex-direction: column;
    row-gap: rem(18);
    padding: rem(26);
    background: rgba(255, 255, 255, 0.82);
    border-radius: rem(28);
    backdrop-filter: blur(rem(18));
  }

  &__card-head {
    display: flex;
    flex-direction: column;
    row-gap: rem(8);
  }

  &__card-kicker {
    display: inline-flex;
    align-self: flex-start;
    padding: rem(7) rem(12);
    font-size: rem(13);
    font-weight: 700;
    color: var(--color-accent);
    background-color: rgba(24, 169, 123, 0.1);
    border-radius: rem(999);
  }

  &__list {
    display: grid;
    gap: rem(12);
  }

  &__list-item {
    position: relative;
    padding-left: rem(20);

    &::before {
      content: '';
      position: absolute;
      top: rem(10);
      left: 0;
      width: rem(9);
      height: rem(9);
      background: linear-gradient(135deg, var(--color-accent), #7cd2b5);
      border-radius: 50%;
      box-shadow: 0 0 rem(10) rgba(24, 169, 123, 0.35);
    }
  }

  &__note {
    padding: rem(16) rem(18);
    color: var(--color-dark-alt);
    background-color: var(--color-gray-alt);
    border-radius: rem(18);
  }

  @include tablet-l {
    &__hero {
      grid-template-columns: 1fr;
    }
  }

  @include mobile-l {
    &__hero {
      padding: rem(22);
      border-radius: rem(28);
    }

    &__signals {
      grid-template-columns: 1fr;
    }
  }
}

.signal-card {
  display: flex;
  flex-direction: column;
  row-gap: rem(4);
  padding: rem(16) rem(18);
  background-color: rgba(255, 255, 255, 0.76);
  border: rem(1) solid rgba(44, 44, 44, 0.06);
  border-radius: rem(22);
  backdrop-filter: blur(rem(12));

  &__label {
    font-size: rem(13);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-dark-alt);
  }

  &__value {
    font-weight: 700;
  }
}
</style>
