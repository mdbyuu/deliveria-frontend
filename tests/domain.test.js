import { describe, expect, it } from 'vitest'
import {
  dateRangeError,
  defaultDateRange,
  errorMessage,
  fieldErrors,
  formatDate,
  nextStatus,
  sortHistory,
  validateFields,
} from '../src/lib/domain'
describe('workflow and API contract helpers', () => {
  it('exposes only the next stage, and none for final or unknown states', () => {
    expect(
      ['placed', 'picked_up', 'in_transit', 'delivered', 'unknown', undefined].map(nextStatus),
    ).toEqual(['picked_up', 'in_transit', 'delivered', undefined, undefined, undefined])
  })
  it('uses Jakarta calendar days across UTC midnight and leap years', () => {
    expect(defaultDateRange(new Date('2026-10-19T18:00:00Z'))).toEqual({
      start_date: '2026-09-21',
      end_date: '2026-10-20',
    })
    expect(defaultDateRange(new Date('2024-03-01T00:00:00Z')).start_date).toBe('2024-02-01')
    expect(formatDate('2026-10-19T18:00:00Z')).toContain('20 Oct 2026')
    expect(formatDate('2026-10-19T18:00:00Z')).toContain('WIB')
  })
  it('accepts at most 366 inclusive days and rejects reverse ranges', () => {
    expect(dateRangeError('2024-01-01', '2024-12-31')).toBe('')
    expect(dateRangeError('2024-01-01', '2025-01-01')).toContain('366')
    expect(dateRangeError('2026-10-20', '2026-10-19')).toContain('on or after')
  })
  it('sorts timestamps with a deterministic ID tie-breaker without mutating the API result', () => {
    const history = [
      { id: 'b', occurred_at: '2026-10-20T00:00:00Z' },
      { id: 'a', occurred_at: '2026-10-20T00:00:00Z' },
      { id: 'c', occurred_at: '2026-10-19T00:00:00Z' },
    ]
    expect(sortHistory(history).map((x) => x.id)).toEqual(['c', 'a', 'b'])
    expect(history[0].id).toBe('b')
  })
  it('rejects whitespace, invalid phones, non-positive and overprecision weights', () => {
    expect(
      validateFields(
        { sender_name: ' ', sender_phone: 'hello', weight_kg: '0' },
        { shipment: true },
      ),
    ).toHaveProperty('weight_kg')
    for (const weight of ['1.0001', '-1', 'Infinity', '10000000'])
      expect(validateFields({ weight_kg: weight }, { shipment: true }).weight_kg).toBeTruthy()
    expect(
      validateFields({ sender_phone: '+62 0812-345', weight_kg: '0.001' }, { shipment: true }),
    ).toEqual({})
  })
  it('validates password byte limits without converting phone strings', () => {
    const data = {
      name: 'Test',
      phone: '081234',
      email: 'demo@example.com',
      password: 'é'.repeat(37),
    }
    expect(validateFields(data, { account: true }).password).toBeTruthy()
    expect(data.phone).toBe('081234')
  })
  it('maps structured validation errors and never renders an error object as text', () => {
    const error = {
      response: {
        status: 422,
        data: {
          error: {
            message: 'Check fields',
            fields: [{ field: 'body.weight_kg', message: 'Must be positive' }],
          },
        },
      },
    }
    expect(fieldErrors(error)).toEqual({ weight_kg: 'Must be positive' })
    expect(errorMessage(error)).toBe('Check fields')
    expect(errorMessage({ response: { data: { detail: [{ msg: 'invalid' }] } } })).toBe(
      'Something went wrong. Please try again.',
    )
  })
})
