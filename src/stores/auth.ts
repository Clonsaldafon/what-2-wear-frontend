import { defineStore } from 'pinia'

import apiClient from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    messenger: localStorage.getItem('messenger') || null
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken
  },
  actions: {
    async login(credentials: { username: string; password: string }) {
      try {
        const response = await apiClient.post('/auth/token/', credentials)

        this.accessToken = response.data.access_token
        this.refreshToken = response.data.refresh_token

        if (this.accessToken) localStorage.setItem('accessToken', this.accessToken)
        if (this.refreshToken) localStorage.setItem('refreshToken', this.refreshToken)

        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },
    async messengerLogin(messengerType: string, messengerUserId: string, initData?: string) {
      try {
        const response = await apiClient.post('/auth/messenger/', {
          messenger_type: messengerType,
          messenger_user_id: messengerUserId,
          init_data: initData
        })

        this.accessToken = response.data.access_token
        this.refreshToken = response.data.refresh_token
        this.messenger = messengerType

        if (this.accessToken) localStorage.setItem('accessToken', this.accessToken)
        if (this.refreshToken) localStorage.setItem('refreshToken', this.refreshToken)
        localStorage.setItem('messenger', 'telegram')

        return true
      } catch (error) {
        console.error('Messenger login failed:', error)
        return false
      }
    },
    async refreshAccessToken() {
      try {
        const response = await apiClient.post('/auth/token/refresh/', { refresh: this.refreshToken })

        this.accessToken = response.data.access_token

        if (this.accessToken) localStorage.setItem('accessToken', this.accessToken)

        return response.data.access_token
      } catch (error) {
        this.logout()
        throw error
      }
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('messenger')
    }
  }
})