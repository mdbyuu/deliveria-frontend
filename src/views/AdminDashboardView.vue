<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../services/api'
import { dateRangeError, defaultDateRange, errorMessage, formatDate } from '../lib/domain'
import Icon from '../components/Icon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import FeedbackMessage from '../components/FeedbackMessage.vue'
const range = reactive(defaultDateRange()),
  volume = ref(null),
  volumeLoading = ref(true),
  volumeError = ref('')
const stats = ref(null),
  recent = ref([]),
  loading = ref(true),
  error = ref('')
const maxCount = computed(() => Math.max(1, ...(volume.value?.points.map((p) => p.count) || [])))
const peak = computed(() =>
  volume.value?.points.reduce((best, point) => (point.count > best.count ? point : best), {
    count: 0,
    date: '',
  }),
)
async function loadVolume() {
  if (dateRangeError(range.start_date, range.end_date)) {
    volumeError.value = dateRangeError(range.start_date, range.end_date)
    return
  }
  volumeLoading.value = true
  volumeError.value = ''
  try {
    volume.value = (await api.get('/admin/metrics/delivery-volume', { params: { ...range } })).data
  } catch (err) {
    volumeError.value = errorMessage(err, 'Unable to load delivery volume.')
    volume.value = null
  } finally {
    volumeLoading.value = false
  }
}
async function loadOverview() {
  loading.value = true
  error.value = ''
  try {
    const results = await Promise.all([
      api.get('/admin/shipments', { params: { page_size: 5, active_only: true } }),
      api.get('/admin/shipments', {
        params: { page_size: 1, unassigned_only: true, active_only: true },
      }),
      api.get('/admin/shipments', { params: { page_size: 1, status: 'delivered' } }),
      api.get('/admin/couriers', { params: { page_size: 1, is_active: true } }),
    ])
    stats.value = results.map((r) => r.data.total)
    recent.value = results[0].data.items
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load the overview.')
    stats.value = null
    recent.value = []
  } finally {
    loading.value = false
  }
}
function refresh() {
  loadOverview()
  loadVolume()
}
function shortDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}
onMounted(refresh)
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="eyebrow">YOUR OPERATIONS, AT A GLANCE</span>
      <h1>A clear view. A smoother day.</h1>
      <p class="muted">Stay on top of deliveries and keep your team moving.</p>
    </div>
    <button class="button button-secondary" :disabled="loading || volumeLoading" @click="refresh">
      <Icon name="refresh" :size="17" />Refresh overview
    </button>
  </div>
  <FeedbackMessage :message="error" />
  <div class="stat-grid">
    <RouterLink
      v-for="(stat, index) in [
        {
          label: 'Active deliveries',
          icon: 'truck',
          sub: 'Placed, picked up & in transit',
          to: '/admin/shipments',
        },
        {
          label: 'Awaiting assignment',
          icon: 'clock',
          sub: 'Ready for a courier',
          to: '/admin/shipments?unassigned=true',
        },
        {
          label: 'Delivered',
          icon: 'check',
          sub: 'Completed deliveries · all time',
          to: '/admin/shipments?status=delivered',
        },
        {
          label: 'Active couriers',
          icon: 'users',
          sub: 'Your delivery team',
          to: '/admin/couriers',
        },
      ]"
      :key="stat.label"
      :to="stat.to"
      class="stat-card"
      ><div class="stat-top">
        <span>{{ stat.label }}</span
        ><span class="stat-icon" :class="`stat-${index}`"
          ><Icon :name="stat.icon" :size="20"
        /></span>
      </div>
      <strong>{{ loading ? '…' : (stats?.[index] ?? '—') }}</strong
      ><small>{{ stat.sub }}</small></RouterLink
    >
  </div>
  <section class="panel volume-panel">
    <div class="panel-heading">
      <div>
        <span class="eyebrow">DELIVERY VOLUME</span>
        <h2>Shipments created</h2>
        <p class="muted">All requests by creation date, regardless of delivery status.</p>
      </div>
      <span class="chart-legend"><span />Shipments created</span>
    </div>
    <form class="filters date-filters" @submit.prevent="loadVolume">
      <div class="form-field">
        <label for="start-date">Start date</label
        ><input id="start-date" v-model="range.start_date" type="date" required />
      </div>
      <span class="date-separator">to</span>
      <div class="form-field">
        <label for="end-date">End date</label
        ><input id="end-date" v-model="range.end_date" type="date" required />
      </div>
      <button class="button button-secondary" :disabled="volumeLoading">Apply range</button
      ><span class="muted small">Inclusive dates · Asia/Jakarta</span>
    </form>
    <div v-if="volumeLoading" class="state-block" role="status">
      <span class="spinner" />Loading shipment volume…
    </div>
    <div v-else-if="volumeError" class="panel-body">
      <FeedbackMessage :message="volumeError" /><button
        class="button button-secondary"
        @click="loadVolume"
      >
        Try again
      </button>
    </div>
    <template v-else-if="volume"
      ><div class="chart-summary">
        <strong>{{ volume.total.toLocaleString() }}<span> shipments created</span></strong
        ><span class="muted small"
          >{{ shortDate(volume.start_date) }} — {{ shortDate(volume.end_date) }} ·
          {{ volume.points.length }} days</span
        >
      </div>
      <p v-if="volume.total === 0" class="chart-empty">
        No shipments were created in this date range. Zero-volume dates are shown below.
      </p>
      <div class="chart-container">
        <div class="chart-y-axis" aria-hidden="true">
          <span>{{ maxCount }}</span
          ><span>{{ Math.round(maxCount / 2) }}</span
          ><span>0</span>
        </div>
        <div class="chart-scroll">
          <div
            class="bar-chart"
            :style="{ minWidth: `${Math.max(300, volume.points.length * 15)}px` }"
            role="img"
            :aria-label="`Shipments created from ${volume.start_date} to ${volume.end_date}: ${volume.total} total. Daily counts are available in the data table below.`"
          >
            <div v-for="(point, index) in volume.points" :key="point.date" class="chart-column">
              <div class="bar-area">
                <div
                  class="chart-bar"
                  :style="{ height: `${(point.count / maxCount) * 100}%` }"
                  :title="`${point.date}: ${point.count} shipments`"
                />
              </div>
              <span class="chart-date">{{
                index === 0 ||
                index === volume.points.length - 1 ||
                index % Math.max(1, Math.ceil(volume.points.length / 7)) === 0
                  ? shortDate(point.date)
                  : ''
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-footer">
        <span>Daily count · Includes days with zero shipments</span
        ><span v-if="peak?.count"
          >Busiest day: {{ shortDate(peak.date) }} · {{ peak.count }} shipments</span
        >
      </div>
      <details class="chart-data">
        <summary>View daily counts</summary>
        <div class="data-table-wrap">
          <table>
            <caption>
              Shipments created · Asia/Jakarta
            </caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Shipments</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="point in volume.points" :key="point.date">
                <td>{{ point.date }}</td>
                <td>{{ point.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details></template
    >
  </section>
  <section class="panel list-panel">
    <div class="panel-heading">
      <div>
        <h2>Active deliveries</h2>
        <p class="muted">The five most recently created active shipments.</p>
      </div>
      <RouterLink class="detail-link" to="/admin/shipments"
        >View all shipments<Icon name="arrow" :size="16"
      /></RouterLink>
    </div>
    <div v-if="loading" class="state-block" role="status">Loading deliveries…</div>
    <div v-else-if="error" class="state-block">
      <button class="button button-secondary" @click="loadOverview">Retry overview</button>
    </div>
    <div v-else-if="!recent.length" class="state-block">
      <Icon name="check" :size="30" />
      <h3>All caught up.</h3>
      <p class="muted">New active shipments will appear here.</p>
    </div>
    <div v-else class="shipment-rows">
      <article v-for="shipment in recent" :key="shipment.id" class="shipment-row overview-row">
        <div class="shipment-identity">
          <span class="package-icon"><Icon name="box" /></span>
          <div>
            <RouterLink class="tracking-link" :to="`/admin/shipments/${shipment.id}`">{{
              shipment.tracking_number
            }}</RouterLink
            ><small
              >{{ formatDate(shipment.created_at, true) }} · {{ shipment.customer?.name }}</small
            >
          </div>
        </div>
        <div class="shipment-person">
          <strong>{{ shipment.recipient_name }}</strong
          ><small>{{ shipment.destination_address }}</small>
        </div>
        <span :class="shipment.courier ? 'muted small' : 'unassigned small'">{{
          shipment.courier?.name || 'Unassigned courier'
        }}</span
        ><StatusBadge :status="shipment.current_status" />
      </article>
    </div>
  </section>
</template>
