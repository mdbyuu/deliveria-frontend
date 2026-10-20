
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
const couriers = ref([])
const selectedCouriers = ref({})
const assigningShipmentId = ref(null)
const assignmentMessage = ref('')

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
    const response = await api.get('/admin/shipments')
    const data = response.data

    shipments.value = Array.isArray(data)
      ? data
      : data.items || data.shipments || []
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      'Gagal memuat pengiriman.'
  } finally {
    isLoading.value = false
  }
}

async function loadCouriers() {
  try {
    const response = await api.get('/admin/couriers')
    const data = response.data

    couriers.value = Array.isArray(data)
      ? data
      : data.items || data.couriers || []
  } catch (error) {
    console.error('Gagal memuat kurir:', error)
  }
}

async function assignCourier(shipment) {
  const courierId = selectedCouriers.value[shipment.id]

  if (!courierId) {
    alert('Pilih kurir terlebih dahulu.')
    return
  }

  if (shipment.version == null) {
    alert('Versi pengiriman tidak tersedia. Muat ulang data.')
    return
  }

  const confirmed = window.confirm(
    'Tugaskan kurir yang dipilih ke pengiriman ini?'
  )

  if (!confirmed) return

  assigningShipmentId.value = shipment.id
  assignmentMessage.value = ''

  try {
    await api.patch(`/admin/shipments/${shipment.id}/courier`, {
      courier_id: courierId,
      expected_version: shipment.version,
    })

    assignmentMessage.value = 'Kurir berhasil ditugaskan!'
    await loadShipments()
  } catch (error) {
    assignmentMessage.value =
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      'Gagal menugaskan kurir.'
  } finally {
    assigningShipmentId.value = null
  }
}

function logout() {
  authStore.logout()
  router.replace('/login')
}

onMounted(() => {
  loadShipments()
  loadCouriers()
})
</script>

<template>
  <main class="admin-page">
    <header class="admin-header">
      <div>
        <p class="eyebrow">DELIVERIA • ADMIN</p>
        <h1>Dashboard Admin</h1>
        <p class="subtitle">
          Halo, {{ authStore.user?.name || 'Admin' }}!
          Pantau seluruh pengiriman di sini.
        </p>
      </div>

      <button class="logout-button" @click="logout">
        Logout
      </button>
    </header>

    <section class="shipments-section">
      <div class="section-heading">
        <h2>Semua Pengiriman</h2>
        <button
          class="refresh-button"
          :disabled="isLoading"
          @click="loadShipments"
        >
          Muat Ulang
        </button>
      </div>

      <p v-if="isLoading" class="message">
        Memuat pengiriman...
      </p>

      <div v-else-if="errorMessage" class="message error">
        <p>{{ errorMessage }}</p>
        <button class="refresh-button" @click="loadShipments">
          Coba Lagi
        </button>
      </div>

      <div v-else-if="shipments.length === 0" class="message">
        Belum ada pengiriman.
      </div>

      <div v-else class="shipment-list">
        <article
          v-for="shipment in shipments"
          :key="shipment.id"
          class="shipment-card"
        >
          <div class="shipment-heading">
            <div>
              <p class="label">Nomor Tracking</p>
              <h3>{{ shipment.tracking_number || shipment.id }}</h3>
            </div>

            <span class="status-badge">
              {{ formatStatus(shipment.current_status) }}
            </span>
          </div>

          
<div class="shipment-info">
  <p>
    <strong>Pengirim:</strong>
    {{ shipment.sender_name || '-' }}
  </p>

  <p>
    <strong>Penerima:</strong>
    {{ shipment.recipient_name || '-' }}
  </p>

  <p>
    <strong>Asal:</strong>
    {{ shipment.origin_address || '-' }}
  </p>

  <p>
    <strong>Tujuan:</strong>
    {{ shipment.destination_address || '-' }}
  </p>

  <p>
    <strong>Kurir saat ini:</strong>
    {{
      couriers.find(c => c.id === shipment.courier_id)?.name ||
      (shipment.courier_id
        ? shipment.courier_id
        : 'Belum ditugaskan')
    }}
  </p>

  <div v-if="shipment.current_status === 'placed'" class="assign-courier">
    <select
      v-model="selectedCouriers[shipment.id]"
      :disabled="assigningShipmentId === shipment.id"
    >
      <option value="">-- Pilih Kurir --</option>

      <option
        v-for="courier in couriers.filter(
          c => c.is_active && c.role === 'courier'
        )"
        :key="courier.id"
        :value="courier.id"
      >
        {{ courier.name }} ({{ courier.email }})
      </option>
    </select>

    <button
      class="refresh-button"
      :disabled="
        assigningShipmentId === shipment.id ||
        !selectedCouriers[shipment.id]
      "
      @click="assignCourier(shipment)"
    >
      {{
        assigningShipmentId === shipment.id
          ? 'Menyimpan...'
          : 'Tugaskan Kurir'
      }}
    </button>
  </div>
  <p v-else class="assignment-message">
  Kurir hanya dapat ditugaskan atau diganti sebelum pickup.
  </p>
  
  <p
    v-elseclass="assignmentMessage"
    class="assignment-message"
  >
    {{ assignmentMessage }}
  </p>
</div>

        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 32px;
  background: #f5f7fb;
  color: #172033;
}

.admin-header,
.section-heading,
.shipment-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.admin-header,
.shipments-section {
  max-width: 1000px;
  margin: 0 auto;
}

.admin-header {
  margin-bottom: 32px;
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

.subtitle,
.label {
  color: #657087;
}

.section-heading {
  margin-bottom: 20px;
}

.shipment-list {
  display: grid;
  gap: 16px;
}

.shipment-card,
.message {
  padding: 24px;
  border: 1px solid #e2e7f0;
  border-radius: 14px;
  background: white;
}

.shipment-heading h3 {
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

.shipment-info {
  margin-top: 18px;
  overflow-wrap: anywhere;
}

.error {
  color: #a52828;
}

.refresh-button,
.logout-button {
  padding: 10px 15px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.refresh-button {
  background: #e8edff;
  color: #3449a3;
}

.logout-button {
  background: #fee9e9;
  color: #a52828;
}

.assign-courier {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.assign-courier select {
  flex: 1;
  min-width: 200px;
  padding: 10px;
  border: 1px solid #d5dbea;
  border-radius: 8px;
  background: white;
  color: #172033;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.assignment-message {
  margin-top: 10px;
  overflow-wrap: anywhere;
  color: #3449a3;
}

@media (max-width: 600px) {
  .admin-page {
    padding: 20px 14px;
  }

  .admin-header,
  .shipment-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    font-size: 25px;
  }
}
</style>
