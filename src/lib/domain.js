export const statuses = [
  { value: 'placed', label: 'Placed', description: 'Request received. Waiting for pickup.' },
  { value: 'picked_up', label: 'Picked Up', description: 'Your package is with the courier.' },
  { value: 'in_transit', label: 'In Transit', description: 'Your package is on its way.' },
  { value: 'delivered', label: 'Delivered', description: 'Delivery completed.' },
]
export const statusLabel = (value) => statuses.find((s) => s.value === value)?.label || 'Unknown'
export const nextStatus = (value) =>
  ({ placed: 'picked_up', picked_up: 'in_transit', in_transit: 'delivered' })[value]
export const dashboardPath = (role) =>
  ['customer', 'courier', 'admin'].includes(role) ? `/${role}/dashboard` : '/login'
export function formatDate(value, short = false) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—'
  return (
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      ...(short ? {} : { timeStyle: 'short' }),
    }).format(new Date(value)) + (short ? '' : ' WIB')
  )
}
export function defaultDateRange(now = new Date()) {
  const end = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const start = new Date(`${end}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() - 29)
  return { start_date: start.toISOString().slice(0, 10), end_date: end }
}
export function dateRangeError(start, end) {
  if (!start || !end) return 'Choose both a start and end date.'
  const days = (Date.parse(end) - Date.parse(start)) / 86400000
  if (!Number.isFinite(days) || days < 0) return 'End date must be on or after the start date.'
  if (days >= 366) return 'Choose a range of at most 366 days.'
  return ''
}
export function sortHistory(history = []) {
  return [...history].sort(
    (a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at) || a.id.localeCompare(b.id),
  )
}
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.status === 409)
    return (
      error.response.data?.error?.message || 'The record has changed. Refresh before trying again.'
    )
  if (error?.response?.status === 429)
    return 'Too many attempts. Please wait a minute before trying again.'
  if (error?.code === 'ECONNABORTED')
    return 'The server took too long to respond. Please try again.'
  if (!error?.response && error?.isAxiosError)
    return 'Unable to reach the server. Check your connection and try again.'
  const data = error?.response?.data
  return data?.error?.message || (typeof data?.detail === 'string' ? data.detail : fallback)
}
export function fieldErrors(error) {
  const fields = error?.response?.data?.error?.fields || []
  return Object.fromEntries(
    fields.map(({ field, message }) => [field.replace(/^body\./, ''), message]),
  )
}
export function validateFields(data, { account = false, shipment = false } = {}) {
  const errors = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && !value.trim()) errors[key] = 'This field is required.'
    if (key.endsWith('phone') && !/^\+?[0-9 ()\-.]{3,30}$/.test(value.trim()))
      errors[key] = 'Enter a phone number with 3–30 characters.'
  }
  if (account) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = 'Enter a valid email address.'
    if (data.password.length < 10 || new TextEncoder().encode(data.password).length > 72)
      errors.password = 'Use at least 10 characters and at most 72 UTF-8 bytes.'
  }
  if (shipment) {
    const weight = String(data.weight_kg)
    if (!/^\d{1,7}(\.\d{1,3})?$/.test(weight) || Number(weight) <= 0)
      errors.weight_kg =
        'Enter a positive weight, up to 9,999,999.999 kg, with at most 3 decimal places.'
  }
  return errors
}
