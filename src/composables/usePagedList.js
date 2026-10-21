import { onScopeDispose, ref } from 'vue'
import api from '../services/api'
import { errorMessage } from '../lib/domain'
export function usePagedList(endpoint, getFilters = () => ({})) {
  const items = ref([]),
    total = ref(0),
    page = ref(1),
    pages = ref(0),
    loading = ref(false),
    error = ref('')
  let controller
  async function load(targetPage = page.value) {
    controller?.abort()
    const request = new AbortController()
    controller = request
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get(endpoint, {
        params: { ...getFilters(), page: targetPage, page_size: 12 },
        signal: request.signal,
      })
      if (request.signal.aborted) return
      if (!data.items.length && data.pages > 0 && targetPage > data.pages)
        return await load(data.pages)
      items.value = data.items
      total.value = data.total
      page.value = data.page
      pages.value = data.pages
    } catch (err) {
      if (!request.signal.aborted) {
        error.value = errorMessage(err)
        items.value = []
      }
    } finally {
      if (controller === request) loading.value = false
    }
  }
  onScopeDispose(() => controller?.abort())
  return { items, total, page, pages, loading, error, load }
}
