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

type MessengerLoginResult = AuthResult & {
  status?: 'linked' | 'needs_account_link' | 'registered'
  telegramLinkToken?: string
}

export type UserGender = 'unspecified' | 'male' | 'female'

export type UserProfile = {
  id: number
  username: string | null
  email: string
  gender: UserGender
  has_usable_password: boolean
  messenger: string | null
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
  const accountEmail = ref<string | null>(localStorage.getItem('accountEmail') || null)
  const userGender = ref<UserGender>((localStorage.getItem('userGender') as UserGender | null) || 'unspecified')
  const hasPasswordLogin = ref(localStorage.getItem('hasPasswordLogin') === 'true')
  const telegramPhoto = ref<string | null>(null)
  const pendingMessengerLinkToken = ref<string | null>(null)
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

  const setAccountEmail = (email?: string | null) => {
    accountEmail.value = email || null

    if (accountEmail.value) {
      localStorage.setItem('accountEmail', accountEmail.value)
    } else {
      localStorage.removeItem('accountEmail')
    }
  }

  const setHasPasswordLogin = (value: boolean) => {
    hasPasswordLogin.value = value
    localStorage.setItem('hasPasswordLogin', String(value))
  }

  const setMessenger = (messengerType: string) => {
    messenger.value = messengerType
    localStorage.setItem('messenger', messengerType)
  }

  const setUserGender = (gender: UserGender) => {
    userGender.value = gender
    localStorage.setItem('userGender', gender)
  }

  const applyProfile = (profile: UserProfile) => {
    if (profile.username) setUsername(profile.username)
    setAccountEmail(profile.email)
    setUserGender(profile.gender)
    setHasPasswordLogin(profile.has_usable_password)

    if (profile.messenger) {
      setMessenger(profile.messenger)
    }
  }

  const fetchProfile = async () => {
    if (!accessToken.value) return null

    const response = await apiClient.get<UserProfile>('/auth/me/')
    applyProfile(response.data)
    return response.data
  }

  const updateProfile = async (payload: { username?: string; email?: string; gender?: UserGender; password?: string }) => {
    try {
      const response = await apiClient.patch<UserProfile>('/auth/me/', payload)
      applyProfile(response.data)
      return { success: true } as AuthResult
    } catch (error) {
      return getAuthErrorMessage(error, 'Не удалось сохранить профиль.')
    }
  }

  const setTelegramUserData = (initData: any) => {
    const user = initData?.user
    if (user) {
      const { first_name, last_name, photo_url } = user
      const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Пользователь'
      setUsername(fullName)
      if (photo_url) setTelegramPhoto(photo_url)
    }
  }

  const applyMessengerAuth = (messengerType: string, nextAccessToken: string, nextRefreshToken: string) => {
    setTokens(nextAccessToken, nextRefreshToken)
    setMessenger(messengerType)
    pendingMessengerLinkToken.value = null

    if (messengerType === 'telegram') {
      const initDataUnsafe = (window as any).Telegram?.WebApp?.initDataUnsafe
      setTelegramUserData(initDataUnsafe)
    }
  }

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/token/', credentials)

      setTokens(response.data.access_token, response.data.refresh_token)
      setUsername(credentials.username)
      setHasPasswordLogin(true)
      await fetchProfile()

      return {
        success: true
      } as AuthResult
    } catch (error) {
      return getAuthErrorMessage(error, 'Не удалось войти. Проверьте логин и пароль.')
    }
  }

  const register = async (credentials: { username: string; email?: string; password: string; gender?: UserGender }) => {
    try {
      const response = await apiClient.post('/auth/register/', credentials)

      setTokens(response.data.access_token, response.data.refresh_token)
      setUsername(credentials.username)
      setAccountEmail(credentials.email)
      setUserGender(credentials.gender ?? 'unspecified')
      setHasPasswordLogin(true)
      await fetchProfile()

      return {
        success: true
      } as AuthResult
    } catch (error) {
      return getAuthErrorMessage(error, 'Не удалось создать аккаунт. Попробуйте еще раз.')
    }
  }

  const messengerLogin = async (messengerType: string, messengerUserId: string, initData?: string, gender?: UserGender): Promise<MessengerLoginResult> => {
    try {
      const response = await apiClient.post('/auth/messenger/', {
        messenger_type: messengerType,
        messenger_user_id: messengerUserId,
        init_data: initData,
        gender: gender ?? 'unspecified'
      })

      if (response.data.status === 'linked' || (response.data.access_token && response.data.refresh_token)) {
        applyMessengerAuth(messengerType, response.data.access_token, response.data.refresh_token)
        await fetchProfile()
        return { success: true, status: 'linked' }
      }

      if (response.data.status === 'needs_account_link') {
        pendingMessengerLinkToken.value = response.data.telegram_link_token
        return {
          success: true,
          status: 'needs_account_link',
          telegramLinkToken: response.data.telegram_link_token
        }
      }

      return { success: false, message: 'Неожиданный ответ сервера.' }
    } catch (error) {
      return getAuthErrorMessage(error, 'Не удалось войти через Telegram.')
    }
  }

  const linkMessengerAccount = async (credentials: { username: string; password: string }) => {
    if (!pendingMessengerLinkToken.value) {
      return { success: false, message: 'Сессия Telegram не найдена. Откройте Mini App заново.' } as AuthResult
    }

    try {
      const response = await apiClient.post('/auth/messenger/link/', {
        telegram_link_token: pendingMessengerLinkToken.value,
        username: credentials.username,
        password: credentials.password
      })

      applyMessengerAuth('telegram', response.data.access_token, response.data.refresh_token)
      setHasPasswordLogin(true)
      await fetchProfile()
      return { success: true } as AuthResult
    } catch (error) {
      return getAuthErrorMessage(error, 'Не удалось привязать Telegram к аккаунту.')
    }
  }

  const registerMessengerAccount = async () => {
    if (!pendingMessengerLinkToken.value) {
      return { success: false, message: 'Сессия Telegram не найдена. Откройте Mini App заново.' } as AuthResult
    }

    try {
      const response = await apiClient.post('/auth/messenger/register/', {
        telegram_link_token: pendingMessengerLinkToken.value
      })

      applyMessengerAuth('telegram', response.data.access_token, response.data.refresh_token)
      setHasPasswordLogin(false)
      await fetchProfile()
      return { success: true } as AuthResult
    } catch (error) {
      return getAuthErrorMessage(error, 'Не удалось создать аккаунт через Telegram.')
    }
  }

  const setPasswordLogin = async (credentials: { username: string; password: string; email?: string }) => {
    try {
      return updateProfile(credentials)
    } catch (error) {
      return getAuthErrorMessage(error, 'Не удалось сохранить логин и пароль.')
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
    pendingMessengerLinkToken.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('messenger')
    localStorage.removeItem('accountEmail')
    localStorage.removeItem('hasPasswordLogin')
    localStorage.removeItem('userGender')

    username.value = null
    accountEmail.value = null
    hasPasswordLogin.value = false
    userGender.value = 'unspecified'
    telegramPhoto.value = null
    localStorage.removeItem('username')
  }

  return {
    accessToken,
    refreshToken,
    messenger,
    isAuthenticated,
    username,
    accountEmail,
    userGender,
    hasPasswordLogin,
    telegramPhoto,
    pendingMessengerLinkToken,
    setTokens,
    fetchProfile,
    updateProfile,
    login,
    register,
    messengerLogin,
    linkMessengerAccount,
    registerMessengerAccount,
    setPasswordLogin,
    setTelegramUserData,
    refreshAccessToken,
    logout
  }
})
