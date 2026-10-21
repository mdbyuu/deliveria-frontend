import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { dashboardPath } from '../lib/domain'

// Deliberately memory-only: follows the API's documented token-storage policy.
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const user = ref(null)
  const expiresAt = ref(null)
  const notice = ref('')
  let expiryTimer
  const role = computed(() => user.value?.role || null)
  const isLoggedIn = computed(() =>
    Boolean(accessToken.value && user.value && expiresAt.value > Date.now()),
  )
  const home = computed(() => dashboardPath(role.value))
  function logout(message = '') {
    clearTimeout(expiryTimer)
    accessToken.value = null
    user.value = null
    expiresAt.value = null
    notice.value = message
  }
  function login(data) {
    if (
      !data.access_token ||
      !['customer', 'courier', 'admin'].includes(data.user?.role) ||
      !(data.expires_in > 0)
    )
      throw new Error('Invalid login response')
    logout()
    accessToken.value = data.access_token
    user.value = data.user
    expiresAt.value = Date.now() + data.expires_in * 1000
    expiryTimer = setTimeout(expire, data.expires_in * 1000)
  }
  function expire() {
    logout('Your session has expired. Please sign in again.')
  }
  return { accessToken, user, expiresAt, notice, role, isLoggedIn, home, login, logout, expire }
})
