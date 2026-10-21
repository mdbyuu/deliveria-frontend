import api from './api'
// Assignment selectors must include eligible accounts beyond the first API page.
export async function listAllCouriers(params = {}) {
  const items = []
  let page = 1,
    pages = 1
  do {
    const { data } = await api.get('/admin/couriers', {
      params: { ...params, page, page_size: 100 },
    })
    items.push(...data.items)
    pages = data.pages
    page++
  } while (page <= pages)
  return items
}
