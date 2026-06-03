import { computed, ref } from 'vue'

import { defineStore } from 'pinia'
import { AxiosError } from 'axios'

import apiClient from '@/services/api'
import { getReadableApiErrorMessage } from '@/utils/apiErrors'

type AuthResult = {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string[]>
}

export type UserGender = 'unspecified' | 'male' | 'female'

const getAuthErrorMessage = (error: unknown, fallbackMessage: string): AuthResult => {
  if (!(error instanceof AxiosError)) {
    return {
      success: false,
      message: fallbackMessage
    }
  }

  const fieldErrors = error.response?.data as Record<string, string[] | string> | undefined

  if (fieldErrors && typeof fieldErrors === 'object') {
    const normalizedFieldErrors = Object.entries(fieldErrors).reduce<Record<string, string[]>>((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value : [String(value)]
      return acc
    }, {})

    return {
      success: false,
      message: getReadableApiErrorMessage(error, fallbackMessage),
      fieldErrors: normalizedFieldErrors
    }
  }

  return {
    success: false,
    message: getReadableApiErrorMessage(error, fallbackMessage)
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const messenger = ref(localStorage.getItem('messenger') || null)
  const username = ref<string | null>(localStorage.getItem('username') || null)
  const telegramPhoto = ref<string | null>(null)
  const isAuthenticated = computed(() => !!accessToken.value)

  const setTokens = (nextAccessToken: string, nextRefreshToken: string) => {
    accessToken.value = nextAccessToken
    refreshToken.value = nextRefreshToken

    localStorage.setItem('accessToken', nextAccessToken)
    localStorage.setItem('refreshToken', nextRefreshToken)
  }

  const setUsername = (name: string) => {
    username.value = name
    localStorage.setItem('username', name)
  }

  const setTelegramPhoto = (photo: string) => {
    telegramPhoto.value = photo
  }

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/token/', credentials)

      setTokens(response.data.access_token, response.data.refresh_token)
      setUsername(credentials.username)

      return {
        success: true
      } as AuthResult
    } catch (error) {
      console.error('Login failed:', error)
      return getAuthErrorMessage(error, 'Не удалось войти. Проверьте логин и пароль.')
    }
  }

  const register = async (credentials: { username: string; email?: string; password: string; gender?: UserGender }) => {
    try {
      const response = await apiClient.post('/auth/register/', credentials)

      setTokens(response.data.access_token, response.data.refresh_token)
      setUsername(credentials.username)

      return {
        success: true
      } as AuthResult
    } catch (error) {
      console.error('Registration failed:', error)
      return getAuthErrorMessage(error, 'Не удалось создать аккаунт. Попробуйте еще раз.')
    }
  }

  const messengerLogin = async (messengerType: string, messengerUserId: string, initData?: string, gender?: UserGender) => {
    try {
      const response = await apiClient.post('/auth/messenger/', {
        messenger_type: messengerType,
        messenger_user_id: messengerUserId,
        init_data: initData,
        gender: gender ?? 'unspecified'
      })

      setTokens(response.data.access_token, response.data.refresh_token)
      messenger.value = messengerType

      localStorage.setItem('messenger', messengerType)

      if (messengerType === 'telegram') {
        const initDataUnsafe = (window as any).Telegram?.WebApp?.initDataUnsafe
        if (initDataUnsafe?.user) {
          const { first_name, last_name, photo_url } = initDataUnsafe.user
          const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Пользователь'
          setUsername(fullName)
          if (photo_url) setTelegramPhoto(photo_url)
        }
      }

      return true
    } catch (error) {
      console.error('Messenger login failed:', error)
      return false
    }
  }

  const refreshAccessToken = async () => {
    try {
      const response = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken.value })
      const nextAccessToken = response.data.access_token || response.data.access
      const nextRefreshToken = response.data.refresh_token || response.data.refresh

      accessToken.value = nextAccessToken

      if (accessToken.value) {
        localStorage.setItem('accessToken', accessToken.value)
      }

      if (nextRefreshToken) {
        refreshToken.value = nextRefreshToken
        localStorage.setItem('refreshToken', nextRefreshToken)
      }

      return nextAccessToken
    } catch (error) {
      logout()
      throw error
    }
  }

  const logout = () => {
    accessToken.value = null
    refreshToken.value = null
    messenger.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('messenger')

    username.value = null
    telegramPhoto.value = null
    localStorage.removeItem('username')
  }

  return {
    accessToken,
    refreshToken,
    messenger,
    isAuthenticated,
    username,
    telegramPhoto,
    setTokens,
    login,
    register,
    messengerLogin,
    refreshAccessToken,
    logout
  }
})
