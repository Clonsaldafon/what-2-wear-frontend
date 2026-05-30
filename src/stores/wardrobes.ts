import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from './auth'

import apiClient from '@/services/api'
import { getReadableApiErrorMessage } from '@/utils/apiErrors'

export interface ClothingItem {
  id: number
  image: string
  image_url: string
  category: string
  category_display: string
  item_type: string
  item_type_display: string
  color: string
  color_display: string
  season: string
  gender: string
  created_at: string
}

export const useWardrobeStore = defineStore('wardrobes', () => {
  const authStore = useAuthStore()
  const items = ref<ClothingItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchItems = async () => {
    if (!authStore.isAuthenticated) return

    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get<ClothingItem[]>('/wardrobes/')
      items.value = response.data
    } catch (err) {
      error.value = getReadableApiErrorMessage(err, 'Не удалось загрузить гардероб')
      console.error(error.value)
    } finally {
      loading.value = false
    }
  }

  const addItem = async (formData: FormData) => {
    if (!authStore.isAuthenticated) {
      throw new Error('Требуется авторизация')
    }

    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post<ClothingItem>('/wardrobes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      items.value = [response.data, ...items.value]
      
      return response.data
    } catch (err) {
      error.value = getReadableApiErrorMessage(err, 'Ошибка при добавлении вещи')
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id: number) => {
    if (!authStore.isAuthenticated) return

    loading.value = true
    try {
      await apiClient.delete(`/wardrobes/${id}/`)
      items.value = items.value.filter(item => item.id !== id)
    } catch (err) {
      error.value = getReadableApiErrorMessage(err, 'Не удалось удалить вещь')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    deleteItem
  }
})
