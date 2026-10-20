
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: sessionStorage.getItem('access_token') || null,
    user: (() => {
      try {
        return JSON.parse(sessionStorage.getItem('user') || 'null')
      } catch {
        return null
      }
    })(),
    expiresAt: Number(sessionStorage.getItem('expires_at')) || null,
  }),

  getters: {
    isLoggedIn: (state) =>
      Boolean(
        state.accessToken &&
        state.user?.role &&
        state.expiresAt &&
        state.expiresAt > Date.now()
      ),

    role: (state) => state.user?.role || null,
  },

  actions: {
    login(data) {
      this.accessToken = data.access_token
      this.user = data.user
      this.expiresAt = Date.now() + data.expires_in * 1000

      sessionStorage.setItem('access_token', this.accessToken)
      sessionStorage.setItem('user', JSON.stringify(this.user))
      sessionStorage.setItem('expires_at', String(this.expiresAt))
    },

    logout() {
      this.accessToken = null
      this.user = null
      this.expiresAt = null

      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('expires_at')
    },
  },
})
