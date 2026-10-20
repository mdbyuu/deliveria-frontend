
<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const shipments = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

function formatStatus(status) {
  const labels = {
    placed: 'Menunggu Pickup',
    picked_up: 'Sudah Diambil',
    in_transit: 'Dalam Perjalanan',
    delivered: 'Terkirim',
  }

  return labels[status] || status || '-'
}

async function loadShipments() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/courier/shipments')
    const data = response.data

    shipments.value = Array.isArray(data)
      ? data
      : data.items || data.shipments || []
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      'Gagal memuat pengiriman. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

async function updateStatus(shipment) {
  const nextStatus = {
    placed: 'picked_up',
    picked_up: 'in_transit',
    in_transit: 'delivered',
  }

  const newStatus = nextStatus[shipment.current_status]

  if (!newStatus) return

  const confirmed = window.confirm(
    `Ubah status pengiriman menjadi ${newStatus}?`
  )

  if (!confirmed) return

  try {
    await api.patch(`/shipments/${shipment.id}/status`, {
      status: newStatus,
      expected_version: shipment.version,
    })

    await loadShipments()
    alert('Status pengiriman berhasil diperbarui!')
  } catch (error) {
    alert(
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      'Gagal memperbarui status pengiriman.'
    )
  }
}


function openShipment(shipment) {
  router.push(`/courier/shipments/${shipment.id}`)
}

function logout() {
  authStore.logout()
  router.replace('/login')
}

onMounted(loadShipments)
</script>

<template>
  <main class="courier-page">
    <header class="courier-header">
      <div>
        <p class="eyebrow">DELIVERIA • COURIER</p>
        <h1>Pengiriman Saya</h1>
        <p class="subtitle">
          Halo, {{ authStore.user?.name || 'Kurir' }}!
          Berikut pengiriman yang ditugaskan kepada Anda.
        </p>
      </div>

      <button class="logout-button" @click="logout">
        Logout
      </button>
    </header>

    <section class="shipments-section">
      <div class="section-heading">
        <h2>Daftar Pengiriman</h2>
        <button
          class="refresh-button"
          :disabled="isLoading"
          @click="loadShipments"
        >
          Muat Ulang
        </button>
      </div>

      <p v-if="isLoading" class="info-message">
        Memuat daftar pengiriman...
      </p>

      <div v-else-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
        <button class="refresh-button" @click="loadShipments">
          Coba Lagi
        </button>
      </div>

      <div v-else-if="shipments.length === 0" class="empty-state">
        <h3>Belum ada pengiriman</h3>
        <p>Pengiriman yang ditugaskan kepada Anda akan muncul di sini.</p>
      </div>

      <div v-else class="shipment-list">
        <article
          v-for="shipment in shipments"
          :key="shipment.id"
          class="shipment-card"
        >
          <div class="shipment-top">
            <div>
              <p class="tracking-label">Nomor Tracking</p>
              <h3>{{ shipment.tracking_number || shipment.id }}</h3>
            </div>

            <span class="status-badge">
              {{ formatStatus(shipment.current_status) }}
            </span>
          </div>

          <div class="shipment-addresses">
            <div>
              <span class="address-label">Asal</span>
              <p>{{ shipment.origin_address || '-' }}</p>
            </div>

            <div>
              <span class="address-label">Tujuan</span>
              <p>{{ shipment.destination_address || '-' }}</p>
            </div>
          </div>

          <button
            class="detail-button"
            @click="openShipment(shipment)"
          >
            Lihat Detail →
          </button>

          <button
            v-if="shipment.current_status !== 'delivered'"
            class="status-button"
            @click="updateStatus(shipment)"
          >
            {{
              {
                placed: 'Ambil Paket',
                picked_up: 'Mulai Pengiriman',
                in_transit: 'Tandai Terkirim',
              }[shipment.current_status] || 'Update Status'
            }}
         </button>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.courier-page {
  min-height: 100vh;
  padding: 32px;
  background: #f5f7fb;
  color: #172033;
}

.courier-header,
.section-heading,
.shipment-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.courier-header {
  margin: 0 auto 32px;
  max-width: 1000px;
}

.eyebrow {
  color: #5267c8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

h1 {
  margin: 8px 0;
  font-size: 32px;
}

.subtitle {
  color: #657087;
}

.shipments-section {
  max-width: 1000px;
  margin: auto;
}

.section-heading {
  margin-bottom: 20px;
}

.shipment-list {
  display: grid;
  gap: 16px;
}

.shipment-card {
  padding: 24px;
  border: 1px solid #e2e7f0;
  border-radius: 14px;
  background: white;
}

.tracking-label,
.address-label {
  color: #657087;
  font-size: 12px;
}

.shipment-top h3 {
  overflow-wrap: anywhere;
  font-size: 16px;
}

.status-badge {
  padding: 7px 11px;
  border-radius: 20px;
  background: #e8edff;
  color: #3449a3;
  font-size: 12px;
  font-weight: 600;
}

.shipment-addresses {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.shipment-addresses p {
  overflow-wrap: anywhere;
}

.detail-button,
.refresh-button,
.logout-button {
  padding: 10px 15px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.detail-button {
  background: #3449a3;
  color: white;
}

.refresh-button {
  background: #e8edff;
  color: #3449a3;
}

.logout-button {
  background: #fee9e9;
  color: #a52828;
}

.info-message,
.empty-state,
.error-message {
  padding: 24px;
  border-radius: 12px;
  background: white;
}

.error-message {
  color: #a52828;
}

@media (max-width: 600px) {
  .courier-page {
    padding: 20px 14px;
  }

  .courier-header {
    align-items: flex-start;
  }

  h1 {
    font-size: 25px;
  }

  .shipment-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .shipment-addresses {
    grid-template-columns: 1fr;
  }

  
.status-button {
  margin-left: 8px;
  padding: 10px 15px;
  border: 0;
  border-radius: 8px;
  background: #167344;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.status-button:hover {
  background: #105b35;
}

@media (max-width: 600px) {
  .status-button {
    margin: 8px 0 0;
  }
}

}
</style>
