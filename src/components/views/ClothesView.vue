<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'

import Header from '../header/Header.vue'
import ClothesLoading from '../loading/ClothesLoading.vue'
import ClothesFeedback from '../clothes/ClothesFeedback.vue'
import WardrobeItemCard from '../profile/WardrobeItemCard.vue'

import { useWeatherStore } from '@/stores/weather'
import CitySearch from '../CitySearch.vue'

// константы
const UMBRELLA_ACCESSORIES = new Set(['umbrella'])
const UMBRELLA_PROBABILITY_THRESHOLD = 50
const FEEDBACK_REQUEST_COUNT_KEY = 'clothesFeedbackRequestCount'
const FEEDBACK_LAST_COUNTED_REQUEST_KEY = 'clothesFeedbackLastCountedRequestId'

const weatherStore = useWeatherStore()
const { city, currentWeather, hourlyForecast, loading } = storeToRefs(weatherStore)
const feedbackSubmitting = ref(false)
const feedbackSubmitted = ref(false)
const feedbackError = ref<string | null>(null)
const feedbackPromptRequestId = ref<number | null>(null)
const feedbackRequestCount = ref(Number(localStorage.getItem(FEEDBACK_REQUEST_COUNT_KEY) || 0))

// город для заголовка
const heroCity = computed(() => currentWeather.value?.city || city.value || '')
const recommendation = computed(() => currentWeather.value?.recommendation ?? null)
const canCollectFeedback = computed(() => Boolean(
  currentWeather.value?.recommendation_source === 'ml'
  && currentWeather.value?.request_id
))
const showFeedbackPrompt = computed(() => Boolean(
  canCollectFeedback.value
  && currentWeather.value?.request_id === feedbackPromptRequestId.value
  && !feedbackSubmitted.value
))

const onCitySearch = async (cityName: string) => {
  weatherStore.setCity(cityName)
  await weatherStore.fetchCurrentWeather()
  await weatherStore.fetchHourlyForecast()
}

// вероятность осадков (максимальная из текущей и почасовой)
const precipitationProbability = computed(() => {
  const current = currentWeather.value?.precipitation_probability
  const hourlyMax = hourlyForecast.value.length
    ? Math.max(...hourlyForecast.value.map((h) => h.precipitation_probability ?? 0))
    : null
  return hourlyMax ?? current ?? null
})

// нужно ли брать зонт
const needsUmbrella = computed(() => {
  if (currentWeather.value?.precipitation_type !== 'rain') return false
  const prob = precipitationProbability.value ?? 0
  if (prob < UMBRELLA_PROBABILITY_THRESHOLD) return false
  const accessories = recommendation.value?.accessories ?? []
  const hasUmbrella = accessories.some(a => UMBRELLA_ACCESSORIES.has(a))
  return hasUmbrella || Boolean(currentWeather.value?.has_precipitation)
})

// список категорий с карточками и fallback-списками
const categories = computed(() => [
  {
    key: 'outerwear',
    title: 'Верхняя одежда',
    match: currentWeather.value?.wardrobe_matches?.outerwear ?? null,
    fallbackText: recommendation.value?.items?.find(i => i.startsWith('Верхняя одежда:')) || ''
  },
  {
    key: 'top',
    title: 'Верх',
    match: currentWeather.value?.wardrobe_matches?.top ?? null,
    fallbackText: recommendation.value?.items?.find(i => i.startsWith('Верх:') || i.startsWith('Базовый верх:')) || ''
  },
  {
    key: 'bottom',
    title: 'Низ',
    match: currentWeather.value?.wardrobe_matches?.bottom ?? null,
    fallbackText: recommendation.value?.items?.find(i => i.startsWith('Низ:')) || ''
  },
  {
    key: 'footwear',
    title: 'Обувь',
    match: currentWeather.value?.wardrobe_matches?.footwear ?? null,
    fallbackText: recommendation.value?.items?.find(i => i.startsWith('Обувь:')) || ''
  }
])

const getFallbackItems = (fallbackText: string): string[] => {
  if (!fallbackText) return []
  const afterColon = fallbackText.split(':')[1] || ''
  return afterColon.split(',').map(s => s.trim()).filter(Boolean)
}

onMounted(async () => {
  if (weatherStore.city && !currentWeather.value && !loading.value) {
    await weatherStore.fetchCurrentWeather()
  }
  if (weatherStore.city && !hourlyForecast.value.length && !loading.value) {
    await weatherStore.fetchHourlyForecast()
  }
})

// -------------------------------------------------------------------
// Обработка оценки
// -------------------------------------------------------------------
type ClothingFeedbackRating = 'good' | 'too_cold' | 'too_warm' | 'wet' | 'corrected' | 'score'

const onFeedbackDismiss = () => {
  feedbackPromptRequestId.value = null
  feedbackError.value = null
}

const onFeedbackSubmit = async (payload: {
  score: number
  rating?: ClothingFeedbackRating
  comment?: string
}) => {
  if (!currentWeather.value?.request_id) return
  feedbackSubmitting.value = true
  feedbackError.value = null
  try {
    await weatherStore.submitClothingFeedback({
      weather_request_id: currentWeather.value.request_id,
      score: payload.score,
      rating: payload.rating,
      comment: payload.comment
    })
    feedbackSubmitted.value = true
    feedbackPromptRequestId.value = null
  } catch {
    feedbackError.value = 'Не удалось отправить оценку. Попробуйте еще раз.'
  } finally {
    feedbackSubmitting.value = false
  }
}

watch(
  () => currentWeather.value?.request_id,
  (requestId) => {
    feedbackSubmitted.value = false
    feedbackError.value = null
    feedbackPromptRequestId.value = null

    if (!requestId || !canCollectFeedback.value) return

    const lastCountedRequestId = Number(localStorage.getItem(FEEDBACK_LAST_COUNTED_REQUEST_KEY) || 0)
    if (lastCountedRequestId === requestId) return

    const nextCount = feedbackRequestCount.value + 1
    feedbackRequestCount.value = nextCount
    localStorage.setItem(FEEDBACK_REQUEST_COUNT_KEY, String(nextCount))
    localStorage.setItem(FEEDBACK_LAST_COUNTED_REQUEST_KEY, String(requestId))

    if (nextCount % 3 === 0) {
      feedbackPromptRequestId.value = requestId
    }
  },
  { immediate: true }
)
</script>

<template>
  <Header />
  <section v-if="heroCity" class="clothes section container">
    <div class="clothes__title">
      <h1 class="h1">Что надеть сегодня?</h1>
      <div v-if="heroCity" class="clothes__title-accent">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6C11.5404 6 11.0852 6.09053 10.6606 6.26642C10.236 6.44231 9.85013 6.70012 9.52513 7.02513C9.20012 7.35013 8.94231 7.73597 8.76642 8.16061C8.59053 8.58525 8.5 9.04037 8.5 9.5C8.5 9.95963 8.59053 10.4148 8.76642 10.8394C8.94231 11.264 9.20012 11.6499 9.52513 11.9749C9.85013 12.2999 10.236 12.5577 10.6606 12.7336C11.0852 12.9095 11.5404 13 12 13C12.9283 13 13.8185 12.6313 14.4749 11.9749C15.1313 11.3185 15.5 10.4283 15.5 9.5C15.5 8.57174 15.1313 7.6815 14.4749 7.02513C13.8185 6.36875 12.9283 6 12 6ZM10.5 9.5C10.5 9.10218 10.658 8.72064 10.9393 8.43934C11.2206 8.15804 11.6022 8 12 8C12.3978 8 12.7794 8.15804 13.0607 8.43934C13.342 8.72064 13.5 9.10218 13.5 9.5C13.5 9.89782 13.342 10.2794 13.0607 10.5607C12.7794 10.842 12.3978 11 12 11C11.6022 11 11.2206 10.842 10.9393 10.5607C10.658 10.2794 10.5 9.89782 10.5 9.5Z" fill="#2E7D64"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C7.828 2 4.5 5.483 4.5 9.712C4.5 11.901 5.714 14.101 7.065 15.998C7.988 17.294 9.075 18.576 10.022 19.692C10.462 20.212 10.872 20.695 11.222 21.128L12 22.092L12.778 21.128C13.128 20.695 13.538 20.212 13.978 19.692C14.925 18.576 16.012 17.294 16.935 15.998C18.286 14.1 19.5 11.9 19.5 9.712C19.5 5.483 16.172 2 12 2ZM6.5 9.712C6.5 6.527 8.992 4 12 4C15.008 4 17.5 6.527 17.5 9.712C17.5 11.231 16.625 12.986 15.306 14.837C14.429 16.068 13.451 17.221 12.534 18.302C12.3527 18.514 12.1747 18.724 12 18.932L11.466 18.302C10.549 17.222 9.571 16.068 8.694 14.837C7.376 12.987 6.5 11.231 6.5 9.712Z" fill="#2E7D64"/>
        </svg>
        <h1 class="h1">{{ heroCity }}</h1>
      </div>
    </div>

    <!-- загрузка -->
    <ClothesLoading v-if="loading && heroCity" />

    <!-- основной контент -->
    <div v-else class="clothes__content">
      <div v-if="needsUmbrella" class="clothes__rain-message">
        <span class="clothes__rain-message-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 11.5C4 7.4 7.4 4 11.5 4C15.6 4 19 7.4 19 11.5V12H4V11.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M11.5 4V2.5M11.5 12V20C11.5 21.1 10.6 22 9.5 22C8.4 22 7.5 21.1 7.5 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 12C5.2 10.9 6.6 10.9 8 12C9.2 10.9 10.7 10.9 12 12C13.3 10.9 14.8 10.9 16 12C17.4 10.9 18.8 10.9 20 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="clothes__rain-message-info">
          <h2 class="clothes__rain-message-title h3">Возможен дождь</h2>
        </div>
      </div>

      <!-- блоки по категориям -->
      <div class="clothes__categories">
        <div v-for="cat in categories" :key="cat.key" class="clothes__category">
          <h2 class="clothes__category-title">{{ cat.title }}</h2>
          <div class="clothes__category-grid">
            <!-- карточка из гардероба (если есть) -->
            <WardrobeItemCard
              v-if="cat.match"
              :isProfile="false"
              :photoUrl="cat.match.image_url"
              :type="cat.match.type"
              :color="cat.match.color"
            />
            <!-- fallback: список вещей с маркерами -->
            <ul v-else class="clothes__fallback-list">
              <li v-for="item in getFallbackItems(cat.fallbackText)" :key="item" class="clothes__fallback-item">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ClothesFeedback
        v-if="showFeedbackPrompt"
        class="clothes__feedback"
        :submitting="feedbackSubmitting"
        :error="feedbackError"
        @dismiss="onFeedbackDismiss"
        @submit="onFeedbackSubmit"
      />
      <p v-else-if="feedbackSubmitted" class="clothes__feedback-thanks">
        Спасибо, оценка отправлена.
      </p>
    </div>
  </section>

  <section v-else class="section container">
    <CitySearch
      class="city-search"
      @search="onCitySearch"
    />
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.clothes {
  &__title {
    margin-bottom: rem(24);

    &-accent {
      display: flex;
      align-items: center;
      column-gap: rem(10);
      color: var(--color-accent);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: rem(32);
  }

  &__categories {
    display: flex;
    flex-direction: column;
    gap: rem(28);
  }

  &__category {
    &-title {
      font-size: rem(20);
      font-weight: 600;
      margin-bottom: rem(16);
      color: var(--color-dark);
    }
    &-grid {
      display: grid;
      grid-template-columns: minmax(0, rem(260));
      gap: rem(16);

      @include mobile-l {
        grid-template-columns: 1fr;
      }
    }
  }

  &__fallback-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  &__fallback-item {
    position: relative;
    padding-left: rem(20);
    margin-bottom: rem(8);

    &:last-child {
      margin-bottom: 0;
    }

    &::before {
      content: '';
      position: absolute;
      top: rem(8);
      left: 0;
      width: rem(9);
      height: rem(9);
      background: linear-gradient(135deg, var(--color-accent), #7cd2b5);
      border-radius: 50%;
      box-shadow: 0 0 rem(10) rgba(24, 169, 123, 0.35);
    }
  }

  &__rain-message {
    position: relative;
    display: flex;
    align-items: center;
    column-gap: rem(14);
    padding: rem(16) rem(18) rem(16) rem(20);
    color: var(--color-dark);
    background-color: rgba(92, 139, 181, 0.1);
    border: rem(1) solid rgba(92, 139, 181, 0.28);
    border-radius: rem(18);
    box-shadow: 0 rem(10) rem(28) rgba(92, 139, 181, 0.08);

    &::before {
      position: absolute;
      inset: rem(12) auto rem(12) 0;
      width: rem(4);
      background-color: var(--color-rain);
      border-radius: 0 rem(99) rem(99) 0;
      content: '';
    }

    &-icon {
      @include square(48);
      @include flex-center;

      flex: 0 0 rem(48);
      color: var(--color-rain);
      background-color: var(--color-light-alt);
      border: rem(1) solid rgba(92, 139, 181, 0.22);
      border-radius: rem(16);
    }

    &-info {
      display: flex;
      flex-direction: column;
      row-gap: rem(4);
      min-width: 0;
    }

    &-title {
      margin: 0;
      color: var(--color-dark);
      font-size: rem(18);
    }

    @include mobile-l {
      align-items: flex-start;
      padding: rem(14) rem(14) rem(14) rem(16);

      &-icon {
        @include square(42);

        flex-basis: rem(42);
        border-radius: rem(14);
      }
    }
  }

  &__feedback {
    margin-top: rem(4);

    &-thanks {
      align-self: flex-start;
      padding: rem(12) rem(14);
      font-weight: 700;
      color: var(--color-accent);
      background-color: rgba(46, 125, 100, 0.08);
      border: rem(1) solid rgba(46, 125, 100, 0.18);
      border-radius: rem(14);
    }
  }
}

.city-search {
  margin-inline: auto;
}
</style>
