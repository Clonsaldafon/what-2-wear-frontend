import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import router from '@/router'

import { useAuthStore } from '@/stores/auth'
import { useErrorStore } from '@/stores/error'
import { getReadableApiErrorMessage } from '@/utils/apiErrors'
import { ROUTES } from '@/utils/constants'

const apiClient = axios.create({
  baseURL: (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const errorStore = useErrorStore()

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ERR_CONNECTION_REFUSED') {
      errorStore.setError('Ошибка соединения', getReadableApiErrorMessage(error, 'Нет соединения с сервером.'), undefined, false);
    } else if (error.response?.status === 500) {
      errorStore.setError('Ошибка сервера', 'Внутренняя ошибка сервера. Попробуйте позже.', 500, true);
    } else if (error.response?.status === 403) {
      errorStore.setError('Нет доступа', 'У вас нет доступа к этому действию.', 403, false);
    } else if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      const authStore = useAuthStore()

      if (!authStore.refreshToken) {
        authStore.logout()
        router.push({ name: ROUTES.WEATHER })
        return Promise.reject(error)
      }

      originalRequest._retry = true
      
      try {
        await authStore.refreshAccessToken()
        
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`

        return apiClient(originalRequest)
      } catch (refreshError) {
        errorStore.setError('Ошибка авторизации', 'Вам нужно заново зайти в свой аккаунт.', 401, false);

        authStore.logout()

        router.push({ name: ROUTES.WEATHER })

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
