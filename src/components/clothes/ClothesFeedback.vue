<script setup lang="ts">
import { computed, ref } from 'vue'

import Button from '@/components/buttons/Button.vue'

const props = defineProps<{
  submitting?: boolean
  error?: string | null
}>()

type FeedbackRating = 'good' | 'too_cold' | 'too_warm' | 'wet' | 'score'
type FeedbackMood = 'positive' | 'negative'

const emit = defineEmits<{
  dismiss: []
  submit: [payload: { score: number; rating?: FeedbackRating; comment?: string }]
}>()

const problemReasons: { value: Exclude<FeedbackRating, 'good' | 'score'>; label: string }[] = [
  { value: 'too_cold', label: 'Холодно' },
  { value: 'too_warm', label: 'Жарко' },
  { value: 'wet', label: 'Осадки' }
]

const mood = ref<FeedbackMood | null>(null)
const selectedReason = ref<FeedbackRating | null>(null)
const comment = ref('')
const isCommentOpen = ref(false)

const canSubmitNegative = computed(() => mood.value === 'negative' && !props.submitting)

const submitPositive = () => {
  if (props.submitting) return

  mood.value = 'positive'
  emit('submit', {
    score: 10,
    rating: 'good'
  })
}

const selectNegative = () => {
  if (props.submitting) return
  mood.value = 'negative'
}

const submitNegative = () => {
  if (!canSubmitNegative.value) return

  emit('submit', {
    score: selectedReason.value ? 3 : 2,
    rating: selectedReason.value || 'score',
    comment: comment.value.trim() || undefined
  })
}
</script>

<template>
  <aside class="clothes-feedback">
    <button
      class="clothes-feedback__dismiss"
      type="button"
      aria-label="Скрыть оценку"
      :disabled="submitting"
      @click="emit('dismiss')"
    >
      <span aria-hidden="true"></span>
    </button>

    <div class="clothes-feedback__header">
      <strong>Оцените рекомендацию</strong>
    </div>

    <div class="clothes-feedback__actions" role="group" aria-label="Оценка рекомендации">
      <button
        class="clothes-feedback__choice clothes-feedback__choice--like"
        :class="{ 'clothes-feedback__choice--active': mood === 'positive' }"
        type="button"
        :disabled="submitting"
        @click="submitPositive"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 11V20M7 11L11.4 3.7C11.9 2.9 13.1 3.2 13.1 4.1V8.5H18.6C19.9 8.5 20.8 9.8 20.4 11L18.2 18C17.9 19.2 16.8 20 15.6 20H4.8C4 20 3.4 19.4 3.4 18.6V12.4C3.4 11.6 4 11 4.8 11H7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ submitting && mood === 'positive' ? 'Отправляем...' : 'Хорошо' }}</span>
      </button>

      <button
        class="clothes-feedback__choice clothes-feedback__choice--dislike"
        :class="{ 'clothes-feedback__choice--active': mood === 'negative' }"
        type="button"
        :disabled="submitting"
        @click="selectNegative"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 13V4M7 13L11.4 20.3C11.9 21.1 13.1 20.8 13.1 19.9V15.5H18.6C19.9 15.5 20.8 14.2 20.4 13L18.2 6C17.9 4.8 16.8 4 15.6 4H4.8C4 4 3.4 4.6 3.4 5.4V11.6C3.4 12.4 4 13 4.8 13H7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Плохо</span>
      </button>
    </div>

    <div v-if="mood === 'negative'" class="clothes-feedback__details">
      <div class="clothes-feedback__reasons">
        <span>Что не так?</span>
        <div class="clothes-feedback__reason-list">
          <button
            v-for="reason in problemReasons"
            :key="reason.value"
            class="clothes-feedback__reason"
            :class="{ 'clothes-feedback__reason--active': selectedReason === reason.value }"
            type="button"
            :disabled="submitting"
            @click="selectedReason = selectedReason === reason.value ? null : reason.value"
          >
            {{ reason.label }}
          </button>
        </div>
      </div>

      <button
        class="clothes-feedback__comment-toggle"
        type="button"
        :disabled="submitting"
        @click="isCommentOpen = !isCommentOpen"
      >
        {{ isCommentOpen ? 'Скрыть комментарий' : 'Добавить комментарий' }}
      </button>

      <label v-if="isCommentOpen" class="clothes-feedback__comment">
        <span class="visually-hidden">Комментарий</span>
        <textarea
          v-model="comment"
          rows="3"
          placeholder="Что можно улучшить?"
          :disabled="submitting"
        />
      </label>

      <p v-if="error" class="clothes-feedback__error">{{ error }}</p>

      <Button
        class="clothes-feedback__submit"
        type="button"
        :disabled="!canSubmitNegative"
        @click="submitNegative"
      >
        <template #text>{{ submitting ? 'Отправляем...' : 'Отправить оценку' }}</template>
      </Button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.clothes-feedback {
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: rem(14);
  padding: rem(18);
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(20);

  &__dismiss {
    position: absolute;
    top: rem(12);
    right: rem(12);
    width: rem(28);
    height: rem(28);
    border-radius: 50%;

    span,
    span::before {
      position: absolute;
      top: 50%;
      left: 50%;
      width: rem(13);
      height: rem(2);
      background-color: var(--color-dark-alt);
      border-radius: rem(4);
      content: '';
    }

    span {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    span::before {
      transform: translate(-50%, -50%) rotate(90deg);
    }

    @include hover {
      background-color: var(--color-gray-alt);
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    row-gap: rem(4);
    padding-right: rem(30);

    strong {
      font-size: rem(18);
    }

    span {
      color: var(--color-dark-alt);
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: rem(10);
  }

  &__choice {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: rem(10);
    min-height: rem(52);
    padding: rem(12);
    color: var(--color-dark);
    font-weight: 700;
    background-color: var(--color-light);
    border: rem(1) solid var(--color-gray);
    border-radius: rem(16);

    svg {
      flex: 0 0 rem(24);
    }

    @include hover {
      border-color: var(--color-accent);
    }

    &--like.clothes-feedback__choice--active {
      color: var(--color-light);
      background-color: var(--color-accent);
      border-color: var(--color-accent);
    }

    &--dislike.clothes-feedback__choice--active {
      border-color: rgba(193, 78, 78, 0.45);
      background-color: rgba(193, 78, 78, 0.08);
    }
  }

  &__details,
  &__reasons {
    display: flex;
    flex-direction: column;
    row-gap: rem(10);
  }

  &__reasons > span {
    color: var(--color-dark-alt);
    font-size: rem(14);
    font-weight: 700;
  }

  &__reason-list {
    display: flex;
    flex-wrap: wrap;
    gap: rem(8);
  }

  &__reason {
    min-height: rem(38);
    padding: rem(8) rem(12);
    color: var(--color-dark);
    font-weight: 700;
    background-color: var(--color-light);
    border: rem(1) solid var(--color-gray);
    border-radius: rem(14);

    @include hover {
      border-color: var(--color-accent);
    }

    &--active {
      color: var(--color-light);
      background-color: var(--color-accent);
      border-color: var(--color-accent);
    }
  }

  &__comment-toggle {
    align-self: flex-start;
    color: var(--color-accent);
    font-weight: 700;

    @include hover {
      color: var(--color-dark);
    }
  }

  &__comment textarea {
    width: 100%;
    min-height: rem(92);
    padding: rem(14);
    color: var(--color-dark);
    background-color: var(--color-light);
    border: rem(1) solid var(--color-gray);
    border-radius: rem(14);
    outline: none;
    resize: none;

    &:focus {
      border-color: var(--color-accent);
      background-color: var(--color-light-alt);
    }
  }

  &__error {
    color: var(--color-error);
    font-weight: 700;
  }

  &__submit {
    align-self: flex-start;
  }

  @include mobile-l {
    &__actions {
      grid-template-columns: 1fr;
    }

    &__submit {
      width: 100%;
    }
  }
}
</style>
