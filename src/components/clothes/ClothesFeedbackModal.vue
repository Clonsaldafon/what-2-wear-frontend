<script setup lang="ts">
import { computed, ref } from 'vue'

import Button from '@/components/buttons/Button.vue'
import CrossButton from '@/components/buttons/CrossButton.vue'

const props = defineProps<{
  submitting?: boolean
  error?: string | null
}>()

type FeedbackRating = 'good' | 'too_cold' | 'too_warm' | 'wet'

const emit = defineEmits<{
  close: []
  submit: [payload: { score: number; rating?: FeedbackRating; comment?: string }]
}>()

const feedbackReasons: { value: FeedbackRating; label: string }[] = [
  { value: 'good', label: 'Все подошло' },
  { value: 'too_cold', label: 'Было холодно' },
  { value: 'too_warm', label: 'Было жарко' },
  { value: 'wet', label: 'Не хватило защиты от осадков' }
]

const selectedScore = ref<number | null>(null)
const hoveredScore = ref<number | null>(null)
const selectedReason = ref<FeedbackRating | null>(null)
const comment = ref('')

const canSubmit = computed(() => selectedScore.value !== null && !props.submitting)
const displayedScore = computed(() => hoveredScore.value ?? selectedScore.value)

const onSubmit = () => {
  if (!canSubmit.value || selectedScore.value === null) return

  emit('submit', {
    score: selectedScore.value,
    rating: selectedReason.value || undefined,
    comment: comment.value.trim() || undefined
  })
}
</script>

<template>
  <form class="feedback-modal" @submit.prevent="onSubmit">
    <div class="feedback-modal__close">
      <CrossButton @click="$emit('close')" />
    </div>

    <div class="feedback-modal__header">
      <h3 class="feedback-modal__title h3">Оцените рекомендацию</h3>
      <p class="feedback-modal__description">
        Насколько хорошо этот комплект подходит под погоду?
      </p>
    </div>

    <div class="feedback-modal__rating">
      <span class="feedback-modal__rating-bound">1</span>
      <div
        class="feedback-modal__stars"
        role="radiogroup"
        aria-label="Оценка рекомендации от 1 до 10"
        @mouseleave="hoveredScore = null"
      >
        <button
          v-for="score in 10"
          :key="score"
          class="feedback-modal__star"
          :class="{ 'feedback-modal__star--active': displayedScore !== null && score <= displayedScore }"
          type="button"
          role="radio"
          :aria-checked="selectedScore === score"
          :aria-label="`Оценка ${score} из 10`"
          @mouseenter="hoveredScore = score"
          @focus="hoveredScore = score"
          @blur="hoveredScore = null"
          @click="selectedScore = score"
        >
          ★
        </button>
      </div>
      <span class="feedback-modal__rating-bound">10</span>
    </div>

    <p class="feedback-modal__selected-score">
      {{ selectedScore ? `Выбрана оценка: ${selectedScore}/10` : 'Выберите оценку' }}
    </p>

    <div
      v-if="selectedScore"
      class="feedback-modal__reasons"
    >
      <span class="feedback-modal__section-label">Что точнее всего описывает рекомендацию?</span>
      <div class="feedback-modal__reason-list">
        <button
          v-for="reason in feedbackReasons"
          :key="reason.value"
          class="feedback-modal__reason"
          :class="{ 'feedback-modal__reason--active': selectedReason === reason.value }"
          type="button"
          @click="selectedReason = selectedReason === reason.value ? null : reason.value"
        >
          {{ reason.label }}
        </button>
      </div>
    </div>

    <label class="feedback-modal__comment">
      <span class="feedback-modal__section-label">Комментарий</span>
      <textarea
        v-model="comment"
        class="feedback-modal__textarea"
        rows="4"
        placeholder="Что можно улучшить?"
      />
    </label>

    <p v-if="error" class="feedback-modal__error">{{ error }}</p>

    <Button type="submit" :disabled="!canSubmit">
      <template #text>{{ submitting ? 'Отправляем...' : 'Отправить оценку' }}</template>
    </Button>
  </form>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.feedback-modal {
  display: flex;
  flex-direction: column;
  row-gap: rem(22);
  width: min(100%, rem(520));
  padding: rem(24);
  background-color: var(--color-light-alt);
  border: rem(1) solid rgba(24, 169, 123, 0.18);
  border-radius: rem(30);
  box-shadow: 0 rem(20) rem(60) rgba(44, 44, 44, 0.16);
  overflow-y: auto;
  z-index: 1001;
  animation: modalIn 0.25s forwards;

  &__close {
    display: flex;
    justify-content: end;
  }

  &__header {
    display: flex;
    flex-direction: column;
    row-gap: rem(10);
    text-align: center;
  }

  &__description,
  &__section-label {
    color: var(--color-dark-alt);
  }

  &__rating {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: rem(10);
  }

  &__rating-bound {
    font-size: rem(14);
    font-weight: 700;
    color: var(--color-dark-alt);
  }

  &__stars {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    gap: rem(4);
  }

  &__star {
    @include flex-center;

    min-width: 0;
    height: rem(36);
    font-size: rem(24);
    line-height: 1;
    color: var(--color-gray);
    border-radius: rem(8);

    @include hover {
      color: #f4c94b;
      background-color: rgba(244, 201, 75, 0.08);
    }

    &--active {
      color: #f4c94b;
    }
  }

  &__selected-score {
    align-self: center;
    padding: rem(8) rem(12);
    font-weight: 700;
    color: var(--color-dark);
    background-color: rgba(244, 201, 75, 0.16);
    border-radius: rem(8);
  }

  &__reasons {
    display: flex;
    flex-direction: column;
    row-gap: rem(10);
  }

  &__reason-list {
    display: flex;
    flex-wrap: wrap;
    gap: rem(8);
  }

  &__reason {
    @include flex-center;

    min-height: rem(40);
    padding: rem(9) rem(12);
    font-weight: 700;
    color: var(--color-dark);
    background-color: var(--color-gray-alt);
    border: rem(1) solid var(--color-gray);
    border-radius: rem(8);

    @include hover {
      border-color: var(--color-accent);
    }

    &--active {
      color: var(--color-light);
      background-color: var(--color-accent);
      border-color: var(--color-accent);
    }
  }

  &__comment {
    display: flex;
    flex-direction: column;
    row-gap: rem(8);
  }

  &__section-label {
    font-size: rem(14);
    font-weight: 700;
  }

  &__textarea {
    width: 100%;
    resize: vertical;
    min-height: rem(104);
    padding: rem(14);
    color: var(--color-dark);
    background-color: var(--color-gray-alt);
    border: rem(1) solid var(--color-gray);
    border-radius: rem(14);
    outline: none;

    &:focus {
      border-color: var(--color-accent);
    }
  }

  &__error {
    color: var(--color-error);
    font-weight: 700;
  }

  @include mobile {
    padding: rem(18);
    border-radius: rem(24);

    &__stars {
      gap: rem(2);
    }

    &__star {
      height: rem(32);
      font-size: rem(20);
    }
  }
}

@keyframes modalIn {
  from {
    transform: translateY(rem(24));
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
