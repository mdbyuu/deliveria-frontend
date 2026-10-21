import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://wad05-deliveria-api.onrender.com/api/v1',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const publicRequest = ['/auth/login', '/auth/register'].includes(config.url)
  if (!publicRequest && auth.accessToken) {
    if (auth.expiresAt <= Date.now()) {
      auth.expire()
      return Promise.reject(new axios.CanceledError('Session expired'))
    }
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const auth = useAuthStore()
    const publicRequest = ['/auth/login', '/auth/register'].includes(error.config?.url)
    // Ignore late 401s from a previous session after switching accounts.
    if (
      error.response?.status === 401 &&
      !publicRequest &&
      error.config?.headers?.Authorization === `Bearer ${auth.accessToken}`
    )
      auth.expire()
    return Promise.reject(error)
  },
)
export default api
