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
      <div class="add-wardrobe-item-modal__field">
        <label class="add-wardrobe-item-modal__label" for="photo">Фото</label>
        <input
          class="add-wardrobe-item-modal__input"
          id="photo"
          type="file"
          accept="image/*"
          @change="handleFileChange"
          required
        >
        <div v-if="photoPreview" class="add-wardrobe-item-modal__preview">
          <img
            class="add-wardrobe-item-modal__preview-image"
            :src="photoPreview"
            alt="Preview"
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

  &__fields {
    display: flex;
    flex-direction: column;
    row-gap: rem(16);
  }

  &__preview {
    &-image {
      @include square(50);
    }
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
