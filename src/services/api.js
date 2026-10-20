
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://wad05-deliveria-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Tambahkan token ke setiap request jika tersedia
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  const expiresAt = Number(sessionStorage.getItem('expires_at'))

  // Jangan gunakan token yang sudah kedaluwarsa
  if (token && expiresAt && expiresAt <= Date.now()) {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('expires_at')

    config.headers.Authorization = undefined
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Tangani token yang ditolak oleh backend
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url || ''

    // Jangan mengalihkan halaman hanya karena login gagal
    const isLoginRequest = requestUrl.includes('/auth/login')

    if (status === 401 && !isLoginRequest) {
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('expires_at')

      // Hindari reload jika user sudah berada di halaman login
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default api
