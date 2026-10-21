import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent } from 'vue'
import { useAuthStore } from '../src/stores/auth'
import api from '../src/services/api'
import CreateShipmentView from '../src/views/CreateShipmentView.vue'
import ShipmentDetailView from '../src/views/ShipmentDetailView.vue'
import ShipmentsView from '../src/views/ShipmentsView.vue'
import CouriersView from '../src/views/CouriersView.vue'
import AdminDashboardView from '../src/views/AdminDashboardView.vue'
import LoginView from '../src/views/LoginView.vue'
import { usePagedList } from '../src/composables/usePagedList'
import { listAllCouriers } from '../src/services/couriers'
import { shipment, page } from './fixtures'
vi.mock('../src/services/api', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }))
let pinia
beforeEach(() => {
  vi.resetAllMocks()
  pinia = createPinia()
  setActivePinia(pinia)
})
async function render(component, role = 'customer', path = `/${role}/shipments/shipment-1`) {
  const auth = useAuthStore()
  auth.login({
    access_token: 'token',
    expires_in: 1800,
    user: { id: `${role}-1`, name: 'Demo User', phone: '08123456789', role },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component }],
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(component, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}
const button = (wrapper, text) => wrapper.findAll('button').find((b) => b.text().includes(text))
async function fillShipment(wrapper) {
  for (const [field, value] of Object.entries({
    origin_address: 'Jakarta',
    recipient_name: 'Demo Recipient',
    recipient_phone: '08123456789',
    destination_address: 'Bandung',
    package_description: 'Books',
    weight_kg: '1.25',
  }))
    await wrapper.get(`#${field}`).setValue(value)
}
describe('customer workflows', () => {
  it('retains entered form data on failure and shows a tracking link on success', async () => {
    api.post
      .mockRejectedValueOnce({
        response: {
          status: 422,
          data: {
            error: {
              message: 'Check fields',
              fields: [{ field: 'body.weight_kg', message: 'Invalid weight' }],
            },
          },
        },
      })
      .mockResolvedValueOnce({ data: shipment })
    const wrapper = await render(CreateShipmentView)
    await fillShipment(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('#destination_address').element.value).toBe('Bandung')
    expect(wrapper.text()).toContain('Invalid weight')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.post.mock.calls[1][1]).not.toHaveProperty('customer_id')
    expect(api.post.mock.calls[1][1].sender_phone).toBe('08123456789')
    expect(wrapper.text()).toContain('DLV-TEST-001')
    expect(wrapper.find('a[href="/customer/shipments/shipment-1"]').exists()).toBe(true)
  })
  it('blocks duplicate submission while the create request is pending', async () => {
    let resolve
    api.post.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const wrapper = await render(CreateShipmentView)
    await fillShipment(wrapper)
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    expect(api.post).toHaveBeenCalledTimes(1)
    resolve({ data: shipment })
    await flushPromises()
  })
  it('registers customers without submitting a role and returns to login', async () => {
    api.post.mockResolvedValue({ data: {} })
    const wrapper = await render(LoginView, 'customer', '/register')
    for (const [key, value] of Object.entries({
      name: 'Demo Customer',
      email: 'new@example.com',
      phone: '08123456',
      password: 'demoPassword123',
    }))
      await wrapper.get(`#${key}`).setValue(value)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.post.mock.calls[0][0]).toBe('/auth/register')
    expect(api.post.mock.calls[0][1]).not.toHaveProperty('role')
    expect(wrapper.vm.$route.path).toBe('/login')
  })
  it('uses current_status, filters on the server, and exposes page navigation', async () => {
    api.get.mockResolvedValue({ data: page([shipment], { pages: 2, total: 13 }) })
    const wrapper = await render(ShipmentsView)
    expect(wrapper.text()).toContain('Placed')
    expect(wrapper.text()).not.toContain('Pending')
    await wrapper.get('#tracking').setValue('DLV-TEST-001')
    await wrapper.get('#status').setValue('delivered')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.get.mock.calls.at(-1)[1].params).toMatchObject({
      page: 1,
      status: 'delivered',
      tracking_number: 'DLV-TEST-001',
    })
    await button(wrapper, 'Next').trigger('click')
    await flushPromises()
    expect(api.get.mock.calls.at(-1)[1].params.page).toBe(2)
  })
})
describe('courier and admin mutations', () => {
  it('asks for confirmation, sends the latest version, blocks duplicate clicks, and displays the new history', async () => {
    api.get.mockResolvedValue({ data: structuredClone(shipment) })
    let resolve
    api.patch.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const wrapper = await render(ShipmentDetailView, 'courier')
    expect(wrapper.get('.back-link').attributes('href')).toBe('/courier/dashboard')
    await button(wrapper, 'Mark as Picked Up').trigger('click')
    expect(api.patch).not.toHaveBeenCalled()
    await button(wrapper, 'Confirm Picked Up').trigger('click')
    expect(api.patch).toHaveBeenCalledWith('/shipments/shipment-1/status', {
      status: 'picked_up',
      expected_version: 2,
    })
    expect(wrapper.get('dialog button:last-child').element.disabled).toBe(true)
    resolve({
      data: {
        ...shipment,
        current_status: 'picked_up',
        version: 3,
        history: [
          ...shipment.history,
          { id: 'history-2', status: 'picked_up', occurred_at: '2026-10-20T02:00:00Z' },
        ],
      },
    })
    await flushPromises()
    expect(wrapper.findAll('.timeline li')).toHaveLength(2)
    expect(wrapper.text()).toContain('Mark as In Transit')
  })
  it('requires refresh after a conflict without inventing a history entry', async () => {
    api.get.mockResolvedValue({ data: structuredClone(shipment) })
    api.patch.mockRejectedValue({
      response: { status: 409, data: { error: { message: 'Version conflict' } } },
    })
    const wrapper = await render(ShipmentDetailView, 'courier')
    await button(wrapper, 'Mark as Picked Up').trigger('click')
    await button(wrapper, 'Confirm Picked Up').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.timeline li')).toHaveLength(1)
    expect(button(wrapper, 'Mark as Picked Up').element.disabled).toBe(true)
    expect(wrapper.text()).toContain('Refresh this shipment')
    await button(wrapper, 'Refresh shipment').trigger('click')
    await flushPromises()
    expect(button(wrapper, 'Mark as Picked Up').element.disabled).toBe(false)
  })
  it('does not offer a status action on a delivered shipment', async () => {
    api.get.mockResolvedValue({ data: { ...shipment, current_status: 'delivered' } })
    const wrapper = await render(ShipmentDetailView, 'courier')
    expect(button(wrapper, 'Mark as')).toBeUndefined()
  })
  it('hides old shipment details after access is revoked on refresh', async () => {
    api.get
      .mockResolvedValueOnce({ data: shipment })
      .mockRejectedValueOnce({ response: { status: 404 } })
    const wrapper = await render(ShipmentDetailView, 'courier')
    await button(wrapper, 'Refresh').trigger('click')
    await flushPromises()
    expect(wrapper.text()).not.toContain(shipment.sender_phone)
    expect(wrapper.text()).not.toContain(shipment.tracking_number)
  })
  it('loads all pages of courier choices', async () => {
    api.get
      .mockResolvedValueOnce({ data: page([{ id: 'a' }], { pages: 2 }) })
      .mockResolvedValueOnce({ data: page([{ id: 'b' }], { pages: 2, page: 2 }) })
    expect(await listAllCouriers({ is_active: true })).toEqual([{ id: 'a' }, { id: 'b' }])
    expect(api.get.mock.calls[1][1].params).toEqual({ page: 2, page_size: 100, is_active: true })
  })
  it('assigns using expected_version and preserves Placed', async () => {
    api.get.mockImplementation((url) =>
      Promise.resolve({
        data: url.endsWith('/assignments')
          ? []
          : url.endsWith('/couriers')
            ? page([
                { id: 'courier-2', name: 'New Courier', email: 'new@example.com', is_active: true },
              ])
            : shipment,
      }),
    )
    api.patch.mockResolvedValue({ data: { ...shipment, version: 3, courier_id: 'courier-2' } })
    const wrapper = await render(ShipmentDetailView, 'admin')
    await wrapper.get('#assigned-courier').setValue('courier-2')
    await button(wrapper, 'Reassign courier').trigger('click')
    await button(wrapper, 'Confirm assignment').trigger('click')
    await flushPromises()
    expect(api.patch).toHaveBeenCalledWith('/admin/shipments/shipment-1/courier', {
      courier_id: 'courier-2',
      expected_version: 2,
    })
    expect(wrapper.findAll('.timeline li')).toHaveLength(1)
    expect(wrapper.text()).toContain('Delivery status is unchanged')
  })
  it('shows deactivation conflicts without changing the account state', async () => {
    api.get.mockResolvedValue({
      data: page([
        {
          id: 'c',
          name: 'Demo Courier',
          email: 'demo@example.com',
          phone: '08123456789',
          is_active: true,
        },
      ]),
    })
    api.patch.mockRejectedValue({
      response: { status: 409, data: { error: { message: 'Unfinished shipments remain' } } },
    })
    const wrapper = await render(CouriersView, 'admin')
    await button(wrapper, 'Deactivate').trigger('click')
    await wrapper.get('dialog .button-primary').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Unfinished shipments remain')
    expect(wrapper.get('.courier-row .status-badge').text()).toBe('Active')
  })
})
describe('reporting and request races', () => {
  it('shows zero-volume dates and rejects an inverted range before requesting', async () => {
    api.get.mockImplementation((url) =>
      Promise.resolve({
        data: url.includes('/metrics/')
          ? {
              total: 2,
              start_date: '2026-10-19',
              end_date: '2026-10-20',
              points: [
                { date: '2026-10-19', count: 0 },
                { date: '2026-10-20', count: 2 },
              ],
            }
          : page([]),
      }),
    )
    const wrapper = await render(AdminDashboardView, 'admin')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('0')
    const before = api.get.mock.calls.length
    await wrapper.get('#start-date').setValue('2026-10-22')
    await wrapper.get('#end-date').setValue('2026-10-21')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.get.mock.calls.length).toBe(before)
    expect(wrapper.text()).toContain('End date must be on or after')
  })
  it('prevents a late older list response from replacing newer filters', async () => {
    const pending = []
    api.get.mockImplementation(() => new Promise((resolve) => pending.push(resolve)))
    let list
    mount(
      defineComponent({
        setup() {
          list = usePagedList('/shipments')
          return () => null
        },
      }),
    )
    const first = list.load(1),
      second = list.load(2)
    pending[1]({ data: page([{ id: 'new' }], { page: 2, pages: 2 }) })
    await second
    pending[0]({ data: page([{ id: 'old' }]) })
    await first
    expect(list.items.value).toEqual([{ id: 'new' }])
    expect(list.page.value).toBe(2)
  })
})
