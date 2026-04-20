import { computed, ref } from 'vue'

import { defineStore } from 'pinia'
import { AxiosError } from 'axios'

import apiClient from '@/services/api'

type AuthResult = {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string[]>
}

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

    const firstError = Object.values(normalizedFieldErrors)[0]?.[0]

    return {
      success: false,
      message: firstError || fallbackMessage,
      fieldErrors: normalizedFieldErrors
    }
  }

  return {
    success: false,
    message: fallbackMessage
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const messenger = ref(localStorage.getItem('messenger') || null)

  const isAuthenticated = computed(() => !!accessToken.value)

  const setTokens = (nextAccessToken: string, nextRefreshToken: string) => {
    accessToken.value = nextAccessToken
    refreshToken.value = nextRefreshToken

    localStorage.setItem('accessToken', nextAccessToken)
    localStorage.setItem('refreshToken', nextRefreshToken)
  }

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/token/', credentials)

      setTokens(response.data.access_token, response.data.refresh_token)

      return {
        success: true
      } as AuthResult
    } catch (error) {
      console.error('Login failed:', error)
      return getAuthErrorMessage(error, 'Не удалось войти. Проверьте логин и пароль.')
    }
  }

  const register = async (credentials: { username: string; email?: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/register/', credentials)

      setTokens(response.data.access_token, response.data.refresh_token)

      return {
        success: true
      } as AuthResult
    } catch (error) {
      console.error('Registration failed:', error)
      return getAuthErrorMessage(error, 'Не удалось создать аккаунт. Попробуйте еще раз.')
    }
  }

  const messengerLogin = async (messengerType: string, messengerUserId: string, initData?: string) => {
    try {
      const response = await apiClient.post('/auth/messenger/', {
        messenger_type: messengerType,
        messenger_user_id: messengerUserId,
        init_data: initData
      })

      setTokens(response.data.access_token, response.data.refresh_token)
      messenger.value = messengerType

      localStorage.setItem('messenger', messengerType)

      return true
    } catch (error) {
      console.error('Messenger login failed:', error)
      return false
    }
  }

  const refreshAccessToken = async () => {
    try {
      const response = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken.value })

      accessToken.value = response.data.access_token

      if (accessToken.value) {
        localStorage.setItem('accessToken', accessToken.value)
      }

      return response.data.access_token
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
  }

  return {
    accessToken,
    refreshToken,
    messenger,
    isAuthenticated,
    setTokens,
    login,
    register,
    messengerLogin,
    refreshAccessToken,
    logout
  }
})
