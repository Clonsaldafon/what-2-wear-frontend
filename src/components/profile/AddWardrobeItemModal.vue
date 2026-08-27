<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import Button from '../buttons/Button.vue'
import CrossButton from '../buttons/CrossButton.vue'

import { CATEGORY_OPTIONS, COLOR_OPTIONS, GENDER_OPTIONS, ITEM_TYPE_OPTIONS, SEASON_OPTIONS } from '@/utils/constants.ts'
import { useAuthStore } from '@/stores/auth.ts'
import { useErrorStore } from '@/stores/error.ts'
import { useWardrobeStore } from '@/stores/wardrobes.ts'

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const errorStore = useErrorStore()
const wardrobeStore = useWardrobeStore()
const { userGender } = storeToRefs(authStore)

const modalForm = ref<HTMLFormElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const keepAdding = ref(false)

const defaultGender = computed(() => (
  userGender.value === 'male' || userGender.value === 'female' ? userGender.value : 'unisex'
))

const form = reactive({
  category: '',
  item_type: '',
  color: '',
  season: 'any',
  gender: defaultGender.value
})

watch(defaultGender, (nextGender) => {
  if (!form.gender || form.gender === 'unisex') {
    form.gender = nextGender
  }
})

const colorSwatches: Record<string, string> = {
  black: '#222222',
  white: '#ffffff',
  red: '#d84a4a',
  blue: '#3c74c9',
  green: '#3f8f5f',
  yellow: '#e0bd36',
  gray: '#8a8f98',
  brown: '#8b5f3d',
  beige: '#d8c4a0',
  orange: '#df8135',
  pink: '#d979a5',
  purple: '#8c63b8',
  multicolor: 'linear-gradient(135deg, #d84a4a 0 25%, #e0bd36 25% 50%, #3f8f5f 50% 75%, #3c74c9 75%)'
}

const filteredItemTypes = computed(() => {
  if (!form.category) return []
  return ITEM_TYPE_OPTIONS[form.category] || []
})

const canSubmit = computed(() => (
  Boolean(photoFile.value)
  && Boolean(form.category)
  && Boolean(form.item_type)
  && Boolean(form.color)
  && Boolean(form.season)
  && Boolean(form.gender)
))

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const selectCategory = (value: string) => {
  form.category = value
  form.item_type = ''
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    clearPhoto()
    return
  }

  photoFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearPhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const resetForm = () => {
  form.category = ''
  form.item_type = ''
  form.color = ''
  form.season = 'any'
  form.gender = defaultGender.value
  clearPhoto()
}

const scrollFormToTop = async () => {
  await nextTick()
  modalForm.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

const onSubmit = async () => {
  if (!canSubmit.value || !photoFile.value) {
    errorStore.setError('Ошибка заполнения', 'Добавьте фото и выберите параметры вещи.')
    return
  }

  const formData = new FormData()
  formData.append('image', photoFile.value)
  formData.append('category', form.category)
  formData.append('item_type', form.item_type)
  formData.append('color', form.color)
  formData.append('season', form.season)
  formData.append('gender', form.gender)

  try {
    await wardrobeStore.addItem(formData)

    if (keepAdding.value) {
      resetForm()
      await scrollFormToTop()
      return
    }

    emit('success')
  } catch {
    errorStore.setError('Ошибка при загрузке', 'Не удалось добавить вещь. Попробуйте позже.')
  }
}
</script>

<template>
  <form
    ref="modalForm"
    class="add-wardrobe-item-modal"
    enctype="multipart/form-data"
    @submit.prevent="onSubmit"
  >
    <div class="add-wardrobe-item-modal__top">
      <div>
        <h2 class="add-wardrobe-item-modal__title h2">Новая вещь</h2>
      </div>
      <CrossButton @click="$emit('close')" />
    </div>

    <button
      class="photo-picker"
      type="button"
      @click="triggerFileSelect"
    >
      <input
        ref="fileInput"
        class="photo-picker__input"
        type="file"
        accept="image/*"
        @change="handleFileChange"
      >
      <span v-if="!photoPreview" class="photo-picker__placeholder">
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
          <path d="M28 6H24.5L21.5 3H10.5L7.5 6H4C2.9 6 2 6.9 2 8V24C2 25.1 2.9 26 4 26H28C29.1 26 30 25.1 30 24V8C30 6.9 29.1 6 28 6ZM16 22C12.7 22 10 19.3 10 16C10 12.7 12.7 10 16 10C19.3 10 22 12.7 22 16C22 19.3 19.3 22 16 22Z" fill="currentColor"/>
        </svg>
        <strong>Добавьте фото</strong>
        <small>Нажмите, чтобы выбрать изображение</small>
      </span>
      <span v-else class="photo-picker__preview">
        <img :src="photoPreview" alt="">
      </span>
    </button>
    <button
      v-if="photoPreview"
      class="add-wardrobe-item-modal__secondary-action"
      type="button"
      @click="clearPhoto"
    >
      Убрать фото
    </button>

    <section class="choice-group">
      <h3 class="choice-group__title">Категория</h3>
      <div class="choice-grid choice-grid--categories">
        <button
          v-for="category in CATEGORY_OPTIONS"
          :key="category.value"
          class="choice-chip"
          :class="{ 'choice-chip--active': form.category === category.value }"
          type="button"
          @click="selectCategory(category.value)"
        >
          {{ category.label }}
        </button>
      </div>
    </section>

    <section class="choice-group">
      <h3 class="choice-group__title">Тип</h3>
      <div v-if="filteredItemTypes.length" class="choice-grid">
        <button
          v-for="type in filteredItemTypes"
          :key="type.value"
          class="choice-chip"
          :class="{ 'choice-chip--active': form.item_type === type.value }"
          type="button"
          @click="form.item_type = type.value"
        >
          {{ type.label }}
        </button>
      </div>
      <p v-else class="choice-group__empty">Сначала выберите категорию.</p>
    </section>

    <section class="choice-group">
      <h3 class="choice-group__title">Цвет</h3>
      <div class="color-grid">
        <button
          v-for="color in COLOR_OPTIONS"
          :key="color.value"
          class="color-swatch"
          :class="{ 'color-swatch--active': form.color === color.value }"
          type="button"
          @click="form.color = color.value"
        >
          <span
            class="color-swatch__dot"
            :style="{ background: colorSwatches[color.value] }"
          ></span>
          <span>{{ color.label }}</span>
        </button>
      </div>
    </section>

    <section class="choice-group choice-group--compact">
      <h3 class="choice-group__title">Сезон</h3>
      <div class="segmented">
        <button
          v-for="season in SEASON_OPTIONS"
          :key="season.value"
          type="button"
          :class="{ 'segmented__button--active': form.season === season.value }"
          @click="form.season = season.value"
        >
          {{ season.label }}
        </button>
      </div>
    </section>

    <section class="choice-group choice-group--compact">
      <h3 class="choice-group__title">Для кого</h3>
      <div class="segmented">
        <button
          v-for="gender in GENDER_OPTIONS"
          :key="gender.value"
          type="button"
          :class="{ 'segmented__button--active': form.gender === gender.value }"
          @click="form.gender = gender.value"
        >
          {{ gender.label }}
        </button>
      </div>
    </section>

    <button
      class="keep-adding"
      :class="{ 'keep-adding--active': keepAdding }"
      type="button"
      :aria-pressed="keepAdding"
      @click="keepAdding = !keepAdding"
    >
      <span class="keep-adding__switch"><span></span></span>
      <span class="keep-adding__content">
        <strong>Добавлять несколько вещей подряд</strong>
        <small>Форма очистится и останется открытой.</small>
      </span>
    </button>

    <Button
      class="add-wardrobe-item-modal__submit"
      type="submit"
      :disabled="wardrobeStore.loading || !canSubmit"
      :accent="true"
    >
      <template #text>
        {{ wardrobeStore.loading ? 'Сохраняем...' : 'Добавить вещь' }}
      </template>
    </Button>
  </form>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.add-wardrobe-item-modal {
  display: flex;
  flex-direction: column;
  row-gap: rem(18);
  width: min(100%, rem(640));
  max-height: min(92vh, rem(860));
  padding: rem(22) rem(20) rem(30);
  background-color: var(--color-light-alt);
  border: rem(1) solid rgba(24, 169, 123, 0.18);
  border-radius: rem(24);
  box-shadow: 0 rem(20) rem(60) rgba(44, 44, 44, 0.16);
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-padding-block: rem(22);
  z-index: 1001;
  animation: modalIn 0.25s forwards;

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    column-gap: rem(16);
  }

  &__title {
    margin: 0;
  }

  &__secondary-action {
    align-self: flex-start;
    color: var(--color-dark-alt);
    font-weight: 600;

    @include hover {
      color: var(--color-accent);
    }
  }

  &__submit {
    width: 100%;
  }
}

.photo-picker {
  position: relative;
  min-height: rem(190);
  overflow: hidden;
  color: var(--color-accent);
  background-color: var(--color-gray-alt);
  border: rem(1) dashed rgba(46, 125, 100, 0.45);
  border-radius: rem(18);

  @include hover {
    border-color: var(--color-accent);
    background-color: rgba(46, 125, 100, 0.08);
  }

  &__input {
    display: none;
  }

  &__placeholder {
    @include flex-center;

    flex-direction: column;
    row-gap: rem(8);
    min-height: rem(190);
    padding: rem(18);
    text-align: center;

    small {
      color: var(--color-dark-alt);
    }
  }

  &__preview {
    display: block;
    height: rem(240);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.choice-group {
  display: flex;
  flex-direction: column;
  row-gap: rem(10);

  &__title {
    margin: 0;
    font-size: rem(16);
    font-weight: 700;
  }

  &__empty {
    color: var(--color-dark-alt);
  }
}

.choice-grid,
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: rem(8);
}

.choice-chip,
.color-swatch,
.segmented button {
  min-height: rem(38);
  padding: rem(8) rem(12);
  color: var(--color-dark);
  font-weight: 600;
  background-color: var(--color-light);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(14);

  @include hover {
    border-color: var(--color-accent);
  }
}

.choice-chip--active,
.segmented__button--active {
  color: var(--color-light) !important;
  background-color: var(--color-accent) !important;
  border-color: var(--color-accent) !important;
}

.color-swatch {
  display: inline-flex;
  align-items: center;
  column-gap: rem(8);

  &--active {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 rem(2) rgba(46, 125, 100, 0.18);
  }

  &__dot {
    @include square(18);

    border: rem(1) solid rgba(0, 0, 0, 0.16);
    border-radius: 50%;
  }
}

.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: rem(8);
}

.keep-adding {
  display: flex;
  align-items: center;
  column-gap: rem(12);
  padding: rem(12);
  color: var(--color-dark);
  text-align: left;
  background-color: var(--color-light);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(16);

  @include hover {
    border-color: var(--color-accent);
  }

  &__switch {
    position: relative;
    flex: 0 0 rem(44);
    width: rem(44);
    height: rem(26);
    background-color: var(--color-gray);
    border-radius: rem(99);
    transition: background-color 0.2s ease;

    span {
      position: absolute;
      top: rem(3);
      left: rem(3);
      width: rem(20);
      height: rem(20);
      background-color: var(--color-light-alt);
      border-radius: 50%;
      box-shadow: 0 rem(2) rem(6) rgba(44, 44, 44, 0.18);
      transition: transform 0.2s ease;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    row-gap: rem(3);

    strong {
      font-weight: 700;
    }

    small {
      color: var(--color-dark-alt);
    }
  }

  &--active {
    border-color: rgba(46, 125, 100, 0.42);
    background-color: rgba(46, 125, 100, 0.08);

    .keep-adding__switch {
      background-color: var(--color-accent);

      span {
        transform: translateX(rem(18));
      }
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
