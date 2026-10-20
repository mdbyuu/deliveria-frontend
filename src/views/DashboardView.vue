
<template>
  <main class="dashboard">
    <header class="topbar">
      <div>
        <p class="eyebrow">DELIVERIA · CUSTOMER</p>
        <h1>My Shipments</h1>
        <p class="muted">
          Welcome, {{ authStore.user?.name }}.
          Track and manage your deliveries here.
        </p>
      </div>

      <button class="secondary-button" @click="handleLogout">
        Logout
      </button>
    </header>

    <section class="summary">
      <div class="summary-card">
        <p>Total Shipments</p>
        <h2>{{ total }}</h2>
      </div>

      <div class="summary-card">
        <p>Current Page</p>
        <h2>{{ page }} / {{ pages }}</h2>
      </div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <h2>Create Shipment</h2>
          <p class="muted">Enter the sender and recipient details.</p>
        </div>
      </div>

      <form class="shipment-form" @submit.prevent="createShipment">
        <label>
          Sender name
          <input v-model="form.sender_name" required />
        </label>

        <label>
          Sender phone
          <input v-model="form.sender_phone" required />
        </label>

        <label class="full-width">
          Origin address
          <textarea v-model="form.origin_address" required />
        </label>

        <label>
          Recipient name
          <input v-model="form.recipient_name" required />
        </label>

        <label>
          Recipient phone
          <input v-model="form.recipient_phone" required />
        </label>

        <label class="full-width">
          Destination address
          <textarea v-model="form.destination_address" required />
        </label>

        <label class="full-width">
          Package description
          <input
            v-model="form.package_description"
            placeholder="Example: Clothes"
            required
          />
        </label>

        <label>
          Weight (kg)
          <input
            v-model.number="form.weight_kg"
            type="number"
            min="0.01"
            step="0.01"
            required
          />
        </label>

        <div class="full-width">
          <button type="submit" :disabled="submitting">
            {{ submitting ? 'Creating...' : 'Create Shipment' }}
          </button>
        </div>
      </form>

      <p v-if="formMessage" class="notice" role="status">
        {{ formMessage }}
      </p>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <h2>Your Shipments</h2>
          <p class="muted">Shipments associated with your account.</p>
        </div>

        <button class="secondary-button" @click="loadShipments">
          Refresh
        </button>
      </div>

      <p v-if="loading" class="muted">Loading shipments...</p>

      <p v-else-if="loadError" class="notice" role="alert">
        {{ loadError }}
      </p>

      <div v-else-if="shipments.length === 0" class="empty-state">
        <h3>No shipments yet</h3>
        <p class="muted">
          Create your first shipment using the form above.
        </p>
      </div>

      <div v-else class="shipment-list">
        <article
          v-for="shipment in shipments"
          :key="shipment.id || shipment.shipment_id || shipment.tracking_number"
          class="shipment-item clickable"
          @click="router.push(`/customer/shipments/${shipment.id}`)"
        >
          <div>
            <p class="muted">Tracking number</p>
            <strong>
              {{ shipment.tracking_number || 'Not available' }}
            </strong>
          </div>

          <div>
            <p class="muted">Recipient</p>
            <strong>{{ shipment.recipient_name || '—' }}</strong>
          </div>

          <div>
            <p class="muted">Status</p>
            <strong>{{ shipment.status || 'Pending' }}</strong>
          </div>
        </article>
      </div>

      <p v-if="shipments.length" class="muted pagination">
        Page {{ page }} of {{ pages }} · {{ total }} total shipments
      </p>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const shipments = ref([])
const total = ref(0)
const page = ref(1)
const pages = ref(0)

const loading = ref(false)
const submitting = ref(false)
const loadError = ref('')
const formMessage = ref('')

const initialForm = () => ({
  sender_name: authStore.user?.name || '',
  sender_phone: authStore.user?.phone || '',
  origin_address: '',
  recipient_name: '',
  recipient_phone: '',
  destination_address: '',
  package_description: '',
  weight_kg: 1,
})

const form = reactive(initialForm())

async function loadShipments() {
  loading.value = true
  loadError.value = ''

  try {
    const response = await api.get('/shipments', {
      params: { page: page.value, page_size: 20 },
    })

    shipments.value = response.data.items || []
    total.value = response.data.total ?? shipments.value.length
    page.value = response.data.page ?? 1
    pages.value = response.data.pages ?? 1
  } catch (error) {
    loadError.value =
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      'Failed to load shipments. Please try again.'
  } finally {
    loading.value = false
  }
}

async function createShipment() {
  submitting.value = true
  formMessage.value = ''

  try {
    const response = await api.post('/shipments', { ...form })

    formMessage.value =
      'Shipment created successfully. Your shipment list is being refreshed.'

    Object.assign(form, initialForm())
    page.value = 1
    await loadShipments()

    console.log('Create shipment response:', response.data)
  } catch (error) {
    formMessage.value =
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      'Failed to create shipment. Please check the form.'
  } finally {
    submitting.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(loadShipments)
</script>

<style scoped>
.dashboard {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 24px 60px;
  color: #172033;
}

.topbar,
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.eyebrow {
  color: #3678d4;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

h1 {
  margin: 8px 0;
  font-size: clamp(28px, 4vw, 38px);
}

h2 {
  margin: 0 0 8px;
  font-size: 21px;
}

h3 {
  margin-bottom: 8px;
}

.muted {
  color: #687386;
  line-height: 1.6;
}

.summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 28px 0;
}

.summary-card,
.panel {
  border: 1px solid #e3e8ef;
  border-radius: 16px;
  padding: 24px;
  background: white;
  box-shadow: 0 5px 20px rgb(20 40 80 / 4%);
}

.summary-card p {
  color: #687386;
  margin: 0;
}

.summary-card h2 {
  margin-top: 12px;
  font-size: 30px;
}

.panel {
  margin-bottom: 24px;
}

.shipment-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}

.shipment-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.full-width {
  grid-column: 1 / -1;
}

input,
textarea {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #d6dce6;
  border-radius: 9px;
  padding: 12px;
  font: inherit;
  font-weight: 400;
  background: white;
}

textarea {
  min-height: 76px;
  resize: vertical;
}

button {
  border: 0;
  border-radius: 9px;
  padding: 12px 18px;
  background: #3678d4;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.secondary-button {
  background: #eef4fc;
  color: #245da8;
}

.notice {
  margin-top: 18px;
  color: #245da8;
  overflow-wrap: anywhere;
}

.empty-state {
  text-align: center;
  padding: 35px 12px;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 20px;
}

.shipment-list {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.shipment-item {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  border: 1px solid #e3e8ef;
  border-radius: 10px;
  padding: 16px;
  overflow-wrap: anywhere;
}

.shipment-item p {
  margin: 0 0 6px;
  font-size: 13px;
}

.pagination {
  margin-top: 18px;
  font-size: 13px;
}

@media (max-width: 650px) {
  .dashboard {
    padding: 24px 16px;
  }

  .topbar,
  .section-heading {
    align-items: flex-start;
  }

  .summary,
  .shipment-form,
  .shipment-item {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }
  .clickable {
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.clickable:hover {
  border-color: #3678d4;
}
}
</style>
