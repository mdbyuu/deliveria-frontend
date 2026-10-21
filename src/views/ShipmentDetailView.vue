<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { listAllCouriers } from '../services/couriers'
import {
  errorMessage,
  formatDate,
  nextStatus,
  sortHistory,
  statuses,
  statusLabel,
} from '../lib/domain'
import Icon from '../components/Icon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import FeedbackMessage from '../components/FeedbackMessage.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
const route = useRoute(),
  auth = useAuthStore()
const shipment = ref(null),
  loading = ref(true),
  error = ref(''),
  actionError = ref(''),
  success = ref(''),
  busy = ref(false),
  confirmation = ref(''),
  stale = ref(false)
const couriers = ref([]),
  selectedCourier = ref(''),
  courierError = ref(''),
  couriersLoading = ref(false),
  audits = ref([]),
  auditError = ref(''),
  auditsLoading = ref(false)
const timeline = computed(() => sortHistory(shipment.value?.history))
const next = computed(() => nextStatus(shipment.value?.current_status))
const back = computed(() => (auth.role === 'admin' ? '/admin/shipments' : auth.home))
async function load() {
  if (busy.value) return
  loading.value = true
  error.value = ''
  actionError.value = ''
  try {
    shipment.value = (await api.get(`/shipments/${route.params.id}`)).data
    selectedCourier.value = shipment.value.courier_id || ''
    stale.value = false
  } catch (err) {
    shipment.value = null
    error.value = errorMessage(err, 'Shipment not found or no longer accessible.')
  } finally {
    loading.value = false
  }
  if (shipment.value && auth.role === 'admin') await Promise.all([loadCouriers(), loadAudits()])
}
async function loadCouriers() {
  courierError.value = ''
  couriersLoading.value = true
  try {
    couriers.value = await listAllCouriers({ is_active: true })
  } catch (err) {
    courierError.value = errorMessage(err, 'Unable to load active couriers.')
  } finally {
    couriersLoading.value = false
  }
}
async function loadAudits() {
  auditError.value = ''
  auditsLoading.value = true
  try {
    audits.value = (await api.get(`/admin/shipments/${route.params.id}/assignments`)).data
  } catch (err) {
    auditError.value = errorMessage(err, 'Unable to load assignment history.')
  } finally {
    auditsLoading.value = false
  }
}
function ask(kind) {
  actionError.value = ''
  success.value = ''
  confirmation.value = kind
}
async function confirm() {
  if (busy.value || stale.value) return
  busy.value = true
  actionError.value = ''
  success.value = ''
  const isStatus = confirmation.value === 'status'
  try {
    const url = isStatus
      ? `/shipments/${shipment.value.id}/status`
      : `/admin/shipments/${shipment.value.id}/courier`
    const payload = {
      expected_version: shipment.value.version,
      ...(isStatus ? { status: next.value } : { courier_id: selectedCourier.value }),
    }
    shipment.value = (await api.patch(url, payload)).data
    success.value = isStatus
      ? `Shipment updated to ${statusLabel(shipment.value.current_status)}.`
      : 'Courier assigned. Delivery status is unchanged.'
    confirmation.value = ''
    if (!isStatus) await loadAudits()
  } catch (err) {
    actionError.value = errorMessage(err)
    if ([404, 409].includes(err.response?.status)) stale.value = true
    confirmation.value = ''
  } finally {
    busy.value = false
  }
}
function courierName(id) {
  return couriers.value.find((c) => c.id === id)?.name || (id ? `Courier ${id}` : 'Unassigned')
}
onMounted(load)
</script>
<template>
  <RouterLink :to="back" class="back-link"
    ><Icon name="back" :size="16" />Back to
    {{ auth.role === 'courier' ? 'deliveries' : 'shipments' }}</RouterLink
  >
  <div class="page-heading">
    <div>
      <span class="eyebrow">EVERY STEP OF THE JOURNEY</span>
      <h1>Shipment details</h1>
      <p class="muted">The full story of your delivery, in one place.</p>
    </div>
    <button class="button button-secondary" :disabled="loading || busy" @click="load">
      <Icon name="refresh" :size="17" />Refresh
    </button>
  </div>
  <div v-if="loading" class="panel state-block" role="status">
    <span class="spinner" />Loading shipment…
  </div>
  <FeedbackMessage v-else-if="error" :message="error" />
  <template v-else-if="shipment">
    <section class="tracking-header panel">
      <span class="package-icon large"><Icon name="box" :size="28" /></span>
      <div>
        <span class="eyebrow">TRACKING NUMBER</span>
        <h2 class="tracking-number">{{ shipment.tracking_number }}</h2>
        <p class="muted">Created {{ formatDate(shipment.created_at) }}</p>
      </div>
      <StatusBadge :status="shipment.current_status" />
    </section>
    <FeedbackMessage :message="success" success /><FeedbackMessage :message="actionError" />
    <div v-if="stale" class="notice notice-error">
      Refresh this shipment to see the latest assignment and status.<button
        class="text-button"
        @click="load"
      >
        Refresh shipment
      </button>
    </div>
    <div class="detail-grid">
      <div class="stack">
        <section class="panel panel-body">
          <h2>Delivery route</h2>
          <div class="address-block">
            <span class="address-marker" />
            <div>
              <span class="eyebrow">PICKUP</span>
              <h3>{{ shipment.sender_name }}</h3>
              <p>{{ shipment.origin_address }}</p>
              <p class="muted">{{ shipment.sender_phone }}</p>
            </div>
          </div>
          <div class="address-block destination">
            <Icon name="pin" :size="20" />
            <div>
              <span class="eyebrow">DESTINATION</span>
              <h3>{{ shipment.recipient_name }}</h3>
              <p>{{ shipment.destination_address }}</p>
              <p class="muted">{{ shipment.recipient_phone }}</p>
            </div>
          </div>
        </section>
        <section class="panel panel-body">
          <h2>Package information</h2>
          <dl class="details-list">
            <div>
              <dt>Description</dt>
              <dd>{{ shipment.package_description }}</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{{ shipment.weight_kg }} kg</dd>
            </div>
            <div>
              <dt>Assigned courier</dt>
              <dd>
                {{ shipment.courier?.name || 'Not assigned yet'
                }}<small v-if="shipment.courier">{{ shipment.courier.phone }}</small>
              </dd>
            </div>
            <div v-if="auth.role === 'admin'">
              <dt>Customer</dt>
              <dd>{{ shipment.customer?.name }}</dd>
            </div>
          </dl>
        </section>
        <section v-if="auth.role === 'courier' && next" class="panel panel-body action-panel">
          <span class="eyebrow">NEXT MILESTONE</span>
          <h2>{{ statusLabel(next) }}</h2>
          <p class="muted">Confirm only after this delivery milestone has taken place.</p>
          <button
            class="button button-primary"
            :disabled="busy || stale || !shipment.version"
            @click="ask('status')"
          >
            Mark as {{ statusLabel(next) }}<Icon name="arrow" :size="17" />
          </button>
        </section>
        <section v-if="auth.role === 'admin'" class="panel panel-body">
          <h2>Courier assignment</h2>
          <template v-if="shipment.current_status === 'placed'"
            ><p class="muted">Assign or reassign an active courier before pickup.</p>
            <FeedbackMessage :message="courierError" /><button
              v-if="courierError"
              class="text-button"
              @click="loadCouriers"
            >
              Retry couriers
            </button>
            <div class="assignment-form">
              <div class="form-field">
                <label for="assigned-courier">Active courier</label
                ><select
                  id="assigned-courier"
                  v-model="selectedCourier"
                  :disabled="busy || stale || couriersLoading || !!courierError"
                >
                  <option value="">
                    {{ couriersLoading ? 'Loading couriers…' : 'Choose a courier' }}
                  </option>
                  <option v-for="courier in couriers" :key="courier.id" :value="courier.id">
                    {{ courier.name }} · {{ courier.email }}
                  </option>
                </select>
              </div>
              <button
                class="button button-primary"
                :disabled="
                  busy ||
                  stale ||
                  couriersLoading ||
                  !!courierError ||
                  !selectedCourier ||
                  selectedCourier === shipment.courier_id ||
                  !shipment.version
                "
                @click="ask('assignment')"
              >
                {{ shipment.courier_id ? 'Reassign courier' : 'Assign courier' }}
              </button>
            </div>
            <p v-if="!couriersLoading && !courierError && !couriers.length" class="muted">
              No active couriers.
              <RouterLink to="/admin/couriers">Create or activate one.</RouterLink>
            </p></template
          >
          <p v-else class="muted">
            Assignment is locked after pickup. The current courier remains responsible for this
            delivery.
          </p>
        </section>
      </div>
      <div class="stack">
        <section class="panel panel-body">
          <div class="panel-title">
            <h2>Tracking timeline</h2>
            <Icon name="clock" :size="19" />
          </div>
          <p class="muted small">All timestamps in Asia/Jakarta (WIB).</p>
          <ol v-if="timeline.length" class="timeline">
            <li
              v-for="(entry, index) in timeline"
              :key="entry.id"
              :class="{ latest: index === timeline.length - 1 }"
            >
              <span class="timeline-dot"><Icon name="check" :size="13" /></span
              ><strong>{{ statusLabel(entry.status) }}</strong>
              <p>{{ statuses.find((s) => s.value === entry.status)?.description }}</p>
              <time :datetime="entry.occurred_at">{{ formatDate(entry.occurred_at) }}</time>
            </li>
          </ol>
          <p v-else class="notice">No history was returned. Refresh to try again.</p>
          <div v-if="shipment.current_status === 'delivered'" class="delivered-note">
            <Icon name="check" :size="18" />Delivered. A journey well completed.
          </div>
        </section>
        <section v-if="auth.role === 'admin'" class="panel panel-body">
          <h2>Assignment history</h2>
          <FeedbackMessage :message="auditError" /><button
            v-if="auditError"
            class="text-button"
            @click="loadAudits"
          >
            Retry assignment history
          </button>
          <p v-else-if="auditsLoading" class="muted" role="status">Loading assignment history…</p>
          <p v-else-if="!audits.length" class="muted">No courier has been assigned yet.</p>
          <ol v-else class="audit-list">
            <li v-for="entry in audits" :key="entry.id">
              <strong>{{ courierName(entry.new_courier_id) }}</strong>
              <p>From: {{ courierName(entry.old_courier_id) }}</p>
              <small>{{ formatDate(entry.assigned_at) }}</small
              ><small>Assigned by admin {{ entry.assigned_by_admin_id }}</small>
            </li>
          </ol>
        </section>
      </div>
    </div>
    <ConfirmDialog
      v-if="confirmation"
      :title="
        confirmation === 'status' ? `Mark as ${statusLabel(next)}?` : 'Confirm courier assignment?'
      "
      :message="
        confirmation === 'status'
          ? 'This adds a permanent timestamped entry to the delivery history. Status updates cannot be reversed.'
          : `Assign ${courierName(selectedCourier)} to ${shipment.tracking_number}? The shipment will remain Placed.`
      "
      :confirm-label="
        confirmation === 'status' ? `Confirm ${statusLabel(next)}` : 'Confirm assignment'
      "
      :busy="busy"
      @cancel="confirmation = ''"
      @confirm="confirm"
    />
  </template>
</template>
