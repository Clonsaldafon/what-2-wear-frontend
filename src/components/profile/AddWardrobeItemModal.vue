<script setup lang="ts">
import { computed, ref } from 'vue'

import Button from '../buttons/Button.vue'
import CrossButton from '../buttons/CrossButton.vue'

import { CATEGORY_OPTIONS, COLOR_OPTIONS, GENDER_OPTIONS, ITEM_TYPE_OPTIONS, SEASON_OPTIONS } from '@/utils/constants.ts'
import { useErrorStore } from '@/stores/error.ts'
import { useWardrobeStore } from '@/stores/wardrobes.ts'

const emit = defineEmits<{
  close: []
  success: []
}>()

const errorStore = useErrorStore()
const wardrobeStore = useWardrobeStore()

const fileInput = ref<HTMLInputElement | null>(null)
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)

const form = ref({
  category: '',
  item_type: '',
  color: '',
  season: '',
  gender: ''
})

const filteredItemTypes = computed(() => {
  if (!form.value.category) return []
  return ITEM_TYPE_OPTIONS[form.value.category] || []
})

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const onCategoryChange = () => {
  form.value.item_type = ''
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    photoFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    photoFile.value = null
    photoPreview.value = null
  }
}

const clearPhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const onSubmit = async () => {
  if (!photoFile.value) {
    errorStore.setError('Ошибка заполнения', 'Выберите фото')
    return
  }

  const formData = new FormData()
  formData.append('image', photoFile.value)
  formData.append('category', form.value.category)
  formData.append('item_type', form.value.item_type)
  formData.append('color', form.value.color)
  formData.append('season', form.value.season)
  formData.append('gender', form.value.gender)

  try {
    await wardrobeStore.addItem(formData)

    form.value = { category: '', item_type: '', color: '', season: '', gender: '' }
    photoFile.value = null
    photoPreview.value = null

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''

    emit('success')
  } catch (err) {
    errorStore.setError('Ошибка при загрузке', 'Не удалось добавить вещь. Попробуйте позже')
  }
}
</script>

<template>
  <form
    class="add-wardrobe-item-modal"
    @submit.prevent="onSubmit"
    enctype="multipart/form-data"
  >
    <div class="add-wardrobe-item-modal__close">
      <CrossButton @click="$emit('close')" />
    </div>
    <h2 class="add-wardrobe-item-modal__title h2">Новая вещь</h2>
    <div class="add-wardrobe-item-modal__fields">
      <div
        class="add-wardrobe-item-modal__photo"
        @click="triggerFileSelect"
      >
        <input
          ref="fileInput"
          class="add-wardrobe-item-modal__photo-input"
          id="photo"
          type="file"
          accept="image/*"
          @change="handleFileChange"
          required
        >
        <div
          v-if="!photoPreview"
          class="add-wardrobe-item-modal__photo-placeholder"
        >
          <svg
            class="add-wardrobe-item-modal__photo-icon"
            width="32" height="32" viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M28 6H24.5L21.5 3H10.5L7.5 6H4C2.9 6 2 6.9 2 8V24C2 25.1 2.9 26 4 26H28C29.1 26 30 25.1 30 24V8C30 6.9 29.1 6 28 6ZM16 22C12.7 22 10 19.3 10 16C10 12.7 12.7 10 16 10C19.3 10 22 12.7 22 16C22 19.3 19.3 22 16 22Z"
              fill="currentColor"
            />
            <path
              d="M16 12C13.8 12 12 13.8 12 16C12 18.2 13.8 20 16 20C18.2 20 20 18.2 20 16C20 13.8 18.2 12 16 12Z"
              fill="currentColor"
            />
          </svg>
          <span class="add-wardrobe-item-modal__photo-text">Выберите фото</span>
        </div>
        <div
          v-else
          class="add-wardrobe-item-modal__photo-preview"
        >
          <button
            type="button"
            class="add-wardrobe-item-modal__photo-remove"
            @click.stop="clearPhoto"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <img
            class="add-wardrobe-item-modal__photo-preview-image"
            :src="photoPreview"
            alt=""
          >
        </div>
      </div>
      <div class="add-wardrobe-item-modal__field">
        <label class="add-wardrobe-item-modal__label" for="category">Категория</label>
        <select
          class="add-wardrobe-item-modal__select"
          id="category"
          name="category"
          v-model="form.category"
          @change="onCategoryChange"
          required
        >
          <option disabled value="">Выберите категорию</option>
          <option v-for="category in CATEGORY_OPTIONS" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
      </div>
      <div class="add-wardrobe-item-modal__field">
        <label class="add-wardrobe-item-modal__label" for="type">Тип</label>
        <select
          class="add-wardrobe-item-modal__select"
          id="type"
          name="type"
          v-model="form.item_type"
          required
        >
          <option disabled value="">Выберите тип</option>
          <option v-for="type in filteredItemTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
      <div class="add-wardrobe-item-modal__field">
        <label class="add-wardrobe-item-modal__label" for="color">Цвет</label>
        <select
          class="add-wardrobe-item-modal__select"
          id="color"
          name="color"
          v-model="form.color"
          required
        >
          <option disabled value="">Выберите цвет</option>
          <option v-for="color in COLOR_OPTIONS" :key="color.value" :value="color.value">
            {{ color.label }}
          </option>
        </select>
      </div>
      <div class="add-wardrobe-item-modal__field">
        <label class="add-wardrobe-item-modal__label" for="season">Сезон</label>
        <select
          class="add-wardrobe-item-modal__select"
          id="season"
          name="season"
          v-model="form.season"
          required
        >
          <option disabled value="">Выберите сезон</option>
          <option v-for="season in SEASON_OPTIONS" :key="season.value" :value="season.value">
            {{ season.label }}
          </option>
        </select>
      </div>
      <div class="add-wardrobe-item-modal__field">
        <label class="add-wardrobe-item-modal__label" for="gender">Пол</label>
        <select
          class="add-wardrobe-item-modal__select"
          id="gender"
          name="gender"
          v-model="form.gender"
          required
        >
          <option disabled value="">Выберите пол</option>
          <option v-for="gender in GENDER_OPTIONS" :key="gender.value" :value="gender.value">
            {{ gender.label }}
          </option>
        </select>
      </div>
    </div>
    <Button
      :type="'submit'"
      :disabled="wardrobeStore.loading"
    >
      <template #text>
        {{ wardrobeStore.loading ? 'Загрузка...' : 'Добавить' }}
      </template>
    </Button>
  </form>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.add-wardrobe-item-modal {
  display: flex;
  flex-direction: column;
  row-gap: rem(20);
  width: min(100%, rem(520));
  padding: rem(20);
  background-color: var(--color-light-alt);
  border: rem(1) solid rgba(24, 169, 123, 0.18);
  border-radius: rem(30);
  box-shadow: 0 rem(20) rem(60) rgba(44, 44, 44, 0.16);
  overflow-y: auto;
  z-index: 1001;
  animation: modalIn 0.25s forwards;

  &__close {
    position: absolute;
    top: rem(20);
    right: rem(20);
  }

  &__title {
    text-align: center;
  }

  &__photo {
    position: relative;
    width: 100%;
    min-height: rem(160);
    border: rem(1) dashed var(--color-gray);
    border-radius: rem(16);
    cursor: pointer;
    transition-duration: var(--transition-duration);

    @include hover {
      border-color: var(--color-accent);
      background: rgba(24, 169, 123, 0.1);
    }

    &-input {
      display: none;
    }

    &-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      row-gap: rem(12);
      min-height: rem(160);
    }

    &-icon {
      color: var(--color-accent);
      width: rem(48);
      height: rem(48);
    }

    &-text {
      font-size: rem(14);
      color: var(--color-gray);
      text-align: center;
    }

    &-preview {
      width: 100%;
      min-height: rem(160);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: rem(8);
    }

    &-preview-image {
      max-width: 100%;
      max-height: rem(120);
      object-fit: contain;
      border-radius: rem(12);
    }
  }

  &__photo-remove {
    position: absolute;
    top: rem(8);
    right: rem(8);
    width: rem(28);
    height: rem(28);
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition-duration: var(--transition-duration);
    
    @include hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }

  &__fields {
    display: flex;
    flex-direction: column;
    row-gap: rem(16);
  }

  &__field {
    display: flex;
    flex-direction: column;
    row-gap: rem(6);
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
  }

  &__select {
    padding: rem(12) rem(24);
    background-color: transparent;
    border: rem(1) solid var(--color-gray);
    border-radius: rem(8);

    &:focus {
      border-color: var(--color-accent);
      outline: none;
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
