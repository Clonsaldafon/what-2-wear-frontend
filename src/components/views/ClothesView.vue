<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'

import Header from '../header/Header.vue'
import ClothesLoading from '../loading/ClothesLoading.vue'
import ClothesFeedbackModal from '../clothes/ClothesFeedbackModal.vue'
import Overlay from '../Overlay.vue'
import Button from '../buttons/Button.vue'
import WardrobeItemCard from '../profile/WardrobeItemCard.vue'

import { useWeatherStore } from '@/stores/weather'
import { useWardrobeStore } from '@/stores/wardrobes'
import type { ClothingItem } from '@/stores/wardrobes'
import { useAuthStore } from '@/stores/auth'
import CitySearch from '../CitySearch.vue'

// константы
const UMBRELLA_ACCESSORIES = new Set(['umbrella'])
const UMBRELLA_PROBABILITY_THRESHOLD = 50

const authStore = useAuthStore()
const weatherStore = useWeatherStore()
const wardrobeStore = useWardrobeStore()

const { city, currentWeather, hourlyForecast, loading } = storeToRefs(weatherStore)
const isFeedbackModalOpen = ref(false)
const feedbackSubmitting = ref(false)
const feedbackSubmitted = ref(false)
const feedbackError = ref<string | null>(null)

// город для заголовка
const heroCity = computed(() => currentWeather.value?.city || city.value || '')
const recommendation = computed(() => currentWeather.value?.recommendation ?? null)

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
const onFeedbackOpen = () => {
  feedbackError.value = null
  isFeedbackModalOpen.value = true
}
const onFeedbackClose = () => {
  if (feedbackSubmitting.value) return
  isFeedbackModalOpen.value = false
}
type ClothingFeedbackRating = 'good' | 'too_cold' | 'too_warm' | 'wet' | 'corrected' | 'score'
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
    isFeedbackModalOpen.value = false
  } catch {
    feedbackError.value = 'Не удалось отправить оценку. Попробуйте еще раз.'
  } finally {
    feedbackSubmitting.value = false
  }
}
watch(
  () => currentWeather.value?.request_id,
  () => {
    feedbackSubmitted.value = false
    feedbackError.value = null
    isFeedbackModalOpen.value = false
  }
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
      <!-- сообщение о дожде -->
      <div v-if="needsUmbrella" class="clothes__rain-message">
        <svg
          class="clothes__rain-message-icon"
          width="32" height="32" viewBox="0 0 32 32"
          fill="none"
        >
          <path d="M29.3062 15.0672C29.3158 15.0304 29.327 14.9952 29.3286 14.9568C29.3291 14.9488 29.3334 14.9419 29.3334 14.9333C29.3334 7.76 23.639 1.89493 16.5334 1.61333V0.533333C16.5334 0.2384 16.2945 0 16.0001 0C15.7057 0 15.4667 0.2384 15.4667 0.533333V1.61333C8.36115 1.89493 2.66675 7.76 2.66675 14.9333C2.66675 14.9419 2.67101 14.9488 2.67155 14.9573C2.67315 14.9952 2.68381 15.0304 2.69395 15.0677C2.70248 15.0992 2.70728 15.1307 2.72061 15.1595C2.73395 15.1877 2.75475 15.2112 2.77288 15.2368C2.79528 15.2683 2.81608 15.2997 2.84488 15.3259C2.85075 15.3312 2.85341 15.3392 2.85981 15.3445C2.87901 15.3605 2.90248 15.3659 2.92275 15.3787C2.95421 15.3984 2.98408 15.4181 3.01981 15.4309C3.05715 15.4448 3.09501 15.4491 3.13341 15.4539C3.15635 15.456 3.17661 15.4667 3.20008 15.4667C3.20808 15.4667 3.21448 15.4624 3.22248 15.4624C3.26301 15.4608 3.30088 15.4496 3.33981 15.4389C3.36861 15.4309 3.39795 15.4267 3.42408 15.4139C3.45448 15.4 3.47955 15.3776 3.50728 15.3579C3.53661 15.3365 3.56648 15.3168 3.59101 15.2901C3.59688 15.2837 3.60488 15.2811 3.61075 15.2741C4.36275 14.3664 5.35368 13.8667 6.40008 13.8667C7.44648 13.8667 8.43741 14.3664 9.18941 15.2741C9.19955 15.2864 9.21501 15.2912 9.22621 15.3024C9.23901 15.3152 9.24541 15.3323 9.25981 15.344C9.28115 15.3616 9.30675 15.368 9.32915 15.3819C9.35635 15.3984 9.38141 15.4149 9.41021 15.4256C9.45395 15.4427 9.49768 15.4496 9.54301 15.4544C9.56275 15.4565 9.58088 15.4667 9.60008 15.4667C9.60861 15.4667 9.61661 15.4629 9.62461 15.4624C9.65181 15.4613 9.67688 15.4544 9.70355 15.4491C9.74035 15.4416 9.77555 15.4331 9.81021 15.4176C9.83688 15.4059 9.86088 15.3909 9.88541 15.3744C9.90301 15.3632 9.92275 15.3573 9.93928 15.3435C9.95208 15.3328 9.95795 15.3179 9.96968 15.3061C9.98195 15.2939 9.99848 15.2875 10.0097 15.2736C10.7627 14.3664 11.7537 13.8667 12.8001 13.8667C13.7921 13.8667 14.7307 14.32 15.4667 15.1392V29.3333C15.4667 30.2155 14.7489 30.9333 13.8667 30.9333C12.9846 30.9333 12.2667 30.2155 12.2667 29.3333C12.2667 29.0384 12.0278 28.8 11.7334 28.8C11.439 28.8 11.2001 29.0384 11.2001 29.3333C11.2001 30.8037 12.3963 32 13.8667 32C15.3371 32 16.5334 30.8037 16.5334 29.3333V15.1392C17.2694 14.32 18.2081 13.8667 19.2001 13.8667C20.2465 13.8667 21.2374 14.3664 21.9894 15.2741C21.9995 15.2864 22.015 15.2912 22.0262 15.3024C22.039 15.3152 22.0454 15.3323 22.0598 15.344C22.0811 15.3616 22.1067 15.3675 22.1291 15.3813C22.1563 15.3979 22.1814 15.4144 22.2107 15.4256C22.2539 15.4421 22.2977 15.4496 22.3435 15.4544C22.3627 15.4565 22.3809 15.4667 22.4001 15.4667C22.4086 15.4667 22.4166 15.4629 22.4246 15.4624C22.4518 15.4613 22.4774 15.4544 22.5041 15.4485C22.5403 15.4411 22.5755 15.4325 22.6102 15.4176C22.6374 15.4059 22.6614 15.3904 22.6859 15.3744C22.7035 15.3632 22.7233 15.3573 22.7398 15.344C22.7526 15.3333 22.7585 15.3184 22.7697 15.3067C22.7819 15.2944 22.7985 15.288 22.8102 15.2741C23.5627 14.3664 24.5537 13.8667 25.6001 13.8667C26.6465 13.8667 27.6374 14.3664 28.3894 15.2741C28.3947 15.2805 28.4022 15.2821 28.4081 15.2885C28.4454 15.3296 28.4902 15.3605 28.5387 15.3888C28.5553 15.3984 28.5681 15.4128 28.5857 15.4203C28.6513 15.4491 28.7233 15.4667 28.8001 15.4667C28.8657 15.4667 28.9307 15.4523 28.9926 15.4277C29.0166 15.4181 29.0363 15.4027 29.0587 15.3899C29.0859 15.3744 29.1153 15.3643 29.1398 15.3435C29.1462 15.3381 29.1489 15.3307 29.1547 15.3248C29.1835 15.2987 29.2038 15.2677 29.2267 15.2357C29.2449 15.2101 29.2657 15.1861 29.279 15.1584C29.2929 15.1301 29.2982 15.0987 29.3062 15.0672ZM25.6001 12.8C24.4171 12.8 23.3003 13.2773 22.4001 14.1515C21.4998 13.2773 20.383 12.8 19.2001 12.8C18.0171 12.8 16.9003 13.2773 16.0001 14.1515C15.0998 13.2773 13.983 12.8 12.8001 12.8C11.6171 12.8 10.5003 13.2773 9.60008 14.1515C8.69981 13.2773 7.58301 12.8 6.40008 12.8C5.46675 12.8 4.57715 13.1019 3.80008 13.656C4.44115 7.49013 9.66781 2.66667 16.0001 2.66667C22.3323 2.66667 27.559 7.49013 28.2001 13.656C27.423 13.1019 26.5334 12.8 25.6001 12.8Z" fill="#5C8BB5"/>
        </svg>
        <div class="clothes__rain-message-info">
          <h2 class="clothes__rain-message-title h3">Возможен дождь</h2>
          <div class="clothes__rain-message-description">
            <p>Не забудьте взять зонт</p>
          </div>
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

      <!-- кнопка оценки -->
      <div v-if="currentWeather?.recommendation_source === 'ml' && currentWeather?.request_id && !feedbackSubmitted" class="clothes__feedback">
        <Button :accent="true" @click="onFeedbackOpen">
          <template #text>Оценить</template>
        </Button>
      </div>
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

  <!-- модалка оценки -->
  <Overlay v-if="isFeedbackModalOpen" :onClose="onFeedbackClose">
    <template #modal>
      <ClothesFeedbackModal
        :submitting="feedbackSubmitting"
        :error="feedbackError"
        @close="onFeedbackClose"
        @submit="onFeedbackSubmit"
      />
    </template>
  </Overlay>
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
      grid-template-columns: repeat(2, 1fr);
      gap: rem(16);
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
    display: flex;
    align-items: center;
    column-gap: rem(20);
    padding: rem(20);
    color: var(--color-rain);
    background-color: var(--color-light-alt);
    border: rem(1) solid var(--color-gray);
    border-radius: rem(15);

    &-icon {
      @include square(32);
    }

    &-info {
      display: flex;
      flex-direction: column;
      row-gap: rem(5);
    }

    &-description {
      @include fluid-text(18, 14);
    }
  }

  &__feedback {
    margin-top: rem(16);
    &-thanks {
      font-weight: 700;
      color: var(--color-accent);
    }
  }
}

.city-search {
  margin-inline: auto;
}
</style>
