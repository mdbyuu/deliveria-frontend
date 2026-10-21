import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../src/stores/auth'
import { guard } from '../src/router'
import api from '../src/services/api'
const session = {
  access_token: 'test-token',
  user: { id: 'customer-1', role: 'customer', name: 'Test' },
  expires_in: 1800,
}
beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})
describe('session and navigation', () => {
  it('keeps tokens out of persistent browser storage and expires an idle session', () => {
    const store = useAuthStore()
    store.login(session)
    expect(sessionStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(store.isLoggedIn).toBe(true)
    vi.advanceTimersByTime(1800001)
    expect(store.accessToken).toBeNull()
    expect(store.notice).toContain('expired')
  })
  it('guards role routes and preserves a private return path', () => {
    expect(guard({ meta: { role: 'customer' }, fullPath: '/customer/shipments/123' })).toEqual({
      path: '/login',
      query: { redirect: '/customer/shipments/123' },
    })
    useAuthStore().login(session)
    expect(guard({ meta: { role: 'admin' } })).toBe('/customer/dashboard')
    expect(guard({ meta: { guestOnly: true } })).toBe('/customer/dashboard')
  })
  it('detects expiry on navigation even if the timer was throttled', () => {
    const store = useAuthStore()
    store.login(session)
    store.expiresAt = Date.now() - 1
    expect(guard({ meta: { role: 'customer' }, fullPath: '/customer/dashboard' }).path).toBe(
      '/login',
    )
    expect(store.accessToken).toBeNull()
  })
  it('clears state on logout', () => {
    const store = useAuthStore()
    store.login(session)
    store.logout()
    expect(store.user).toBeNull()
    expect(store.expiresAt).toBeNull()
  })
  it('adds bearer authorization only to protected calls', async () => {
    useAuthStore().login(session)
    const seen = []
    const adapter = async (config) => {
      seen.push(config)
      return { config, status: 200, data: {}, headers: {} }
    }
    await api.get('/shipments', { adapter })
    await api.post('/auth/login', {}, { adapter })
    expect(seen[0].headers.Authorization).toBe('Bearer test-token')
    expect(seen[1].headers.Authorization).toBeUndefined()
  })
  it('expires on protected 401 but ignores late rejection from an old token', async () => {
    const store = useAuthStore()
    store.login(session)
    const adapter = async (config) => {
      throw { config, response: { status: 401 } }
    }
    await expect(api.get('/shipments', { adapter })).rejects.toBeTruthy()
    expect(store.accessToken).toBeNull()
    store.login({ ...session, access_token: 'new-token' })
    await expect(
      api.get('/shipments', {
        adapter: async (config) => {
          config.headers.Authorization = 'Bearer old-token'
          throw { config, response: { status: 401 } }
        },
      }),
    ).rejects.toBeTruthy()
    expect(store.accessToken).toBe('new-token')
  })
})
