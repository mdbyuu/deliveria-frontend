
<template>
  <main class="detail-page">
    <button class="back-button" @click="router.push('/customer/dashboard')">
      ← Back to shipments
    </button>

    <p class="eyebrow">DELIVERIA · SHIPMENT TRACKING</p>
    <h1>Shipment Details</h1>

    <p v-if="loading" class="muted">Loading shipment details...</p>

    <p v-else-if="errorMessage" class="error" role="alert">
      {{ errorMessage }}
    </p>

    <template v-else-if="shipment">
      <section class="tracking-card">
        <p class="muted">Tracking Number</p>
        <h2>{{ shipment.tracking_number }}</h2>

        <span class="status-badge">
          {{ formatStatus(shipment.current_status) }}
        </span>
      </section>

      <section class="card">
        <h2>Shipment Information</h2>

        <div class="info-grid">
          <div>
            <p class="muted">Sender</p>
            <strong>{{ shipment.sender_name }}</strong>
          </div>

          <div>
            <p class="muted">Recipient</p>
            <strong>{{ shipment.recipient_name }}</strong>
          </div>

          <div>
            <p class="muted">Origin Address</p>
            <strong>{{ shipment.origin_address }}</strong>
          </div>

          <div>
            <p class="muted">Destination Address</p>
            <strong>{{ shipment.destination_address }}</strong>
          </div>

          <div>
            <p class="muted">Package</p>
            <strong>{{ shipment.package_description }}</strong>
          </div>

          <div>
            <p class="muted">Weight</p>
            <strong>{{ shipment.weight_kg }} kg</strong>
          </div>

          <div>
            <p class="muted">Courier</p>
            <strong>{{ shipment.courier?.name || 'Not assigned yet' }}</strong>
          </div>

          <div>
            <p class="muted">Created At</p>
            <strong>{{ formatDate(shipment.created_at) }}</strong>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>Tracking Timeline</h2>

        <p v-if="!shipment.history?.length" class="muted">
          No tracking history available yet.
        </p>

        <ol v-else class="timeline">
          <li
            v-for="item in shipment.history"
            :key="item.id"
            class="timeline-item"
          >
            <span class="timeline-dot"></span>

            <div>
              <strong>{{ formatStatus(item.status) }}</strong>
              <p class="muted">{{ formatDate(item.occurred_at) }}</p>
            </div>
          </li>
        </ol>
      </section>
    </template>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const shipment = ref(null)
const loading = ref(true)
const errorMessage = ref('')

function formatStatus(status) {
  if (!status) return 'Unknown'

  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value) {
  if (!value) return 'Not available'

  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

async function loadShipment() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get(`/shipments/${route.params.id}`)
    shipment.value = response.data
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      'Failed to load shipment details.'
  } finally {
    loading.value = false
  }
}

onMounted(loadShipment)
</script>

<style scoped>
.detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  color: #172033;
}

.back-button {
  margin-bottom: 28px;
  border: 0;
  background: transparent;
  color: #3678d4;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.eyebrow {
  color: #3678d4;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
}

h1 {
  margin: 8px 0 24px;
  font-size: clamp(28px, 4vw, 36px);
}

h2 {
  margin-top: 0;
  font-size: 20px;
}

.tracking-card,
.card {
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #e3e8ef;
  border-radius: 16px;
  background: white;
  box-shadow: 0 5px 20px rgb(20 40 80 / 4%);
}

.tracking-card h2 {
  overflow-wrap: anywhere;
  color: #245da8;
}

.status-badge {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 20px;
  background: #eaf5ec;
  color: #26733c;
  font-size: 13px;
  font-weight: 700;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 32px;
}

.info-grid p {
  margin: 0 0 7px;
  font-size: 13px;
}

.info-grid strong {
  overflow-wrap: anywhere;
  line-height: 1.6;
}

.muted {
  color: #687386;
  line-height: 1.6;
}

.error {
  color: #b42318;
}

.timeline {
  list-style: none;
  padding: 0;
  margin: 24px 0 0 6px;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 0 0 28px 20px;
  border-left: 2px solid #dbe7f6;
}

.timeline-item:last-child {
  border-left-color: transparent;
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -7px;
  top: 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3678d4;
}

.timeline-item p {
  margin: 6px 0 0;
  font-size: 13px;
}

@media (max-width: 600px) {
  .detail-page {
    padding: 24px 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
