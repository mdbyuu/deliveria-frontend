<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePagedList } from '../composables/usePagedList'
import { statuses, formatDate, errorMessage } from '../lib/domain'
import { listAllCouriers } from '../services/couriers'
import Icon from '../components/Icon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import FeedbackMessage from '../components/FeedbackMessage.vue'
import PaginationBar from '../components/PaginationBar.vue'
const auth = useAuthStore()
const admin = auth.role === 'admin',
  courier = auth.role === 'courier'
const endpoint = admin ? '/admin/shipments' : courier ? '/courier/shipments' : '/shipments'
const route = useRoute()
const initialStatus = statuses.some((s) => s.value === route.query.status)
  ? route.query.status
  : admin || courier
    ? 'active'
    : ''
const initialCourier = admin && route.query.unassigned === 'true' ? 'unassigned' : ''
const filters = reactive({ status: initialStatus, tracking_number: '', courier_id: initialCourier })
const applied = ref({
  ...(initialStatus === 'active'
    ? { active_only: true }
    : initialStatus
      ? { status: initialStatus }
      : {}),
  ...(initialCourier ? { unassigned_only: true } : {}),
})
const couriers = ref([]),
  courierError = ref('')
const { items, total, page, pages, loading, error, load } = usePagedList(
  endpoint,
  () => applied.value,
)
const title = computed(() =>
  admin ? 'All shipments' : courier ? 'Your delivery board' : 'Your shipments',
)
function apply() {
  applied.value = {
    ...(filters.status === 'active'
      ? { active_only: true }
      : filters.status
        ? { status: filters.status }
        : {}),
    ...(filters.tracking_number.trim() ? { tracking_number: filters.tracking_number.trim() } : {}),
    ...(filters.courier_id === 'unassigned'
      ? { unassigned_only: true }
      : filters.courier_id
        ? { courier_id: filters.courier_id }
        : {}),
  }
  load(1)
}
function reset() {
  Object.assign(filters, { status: '', tracking_number: '', courier_id: '' })
  apply()
}
async function loadCouriers() {
  courierError.value = ''
  try {
    couriers.value = await listAllCouriers()
  } catch (err) {
    courierError.value = errorMessage(err, 'Unable to load courier filters.')
  }
}
onMounted(() => {
  load()
  if (admin) loadCouriers()
})
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="eyebrow">{{
        admin
          ? 'DELIVERY OPERATIONS'
          : courier
            ? 'READY FOR THE ROAD'
            : 'EVERY PACKAGE, IN ONE PLACE'
      }}</span>
      <h1>{{ title }}</h1>
      <p class="muted">
        {{
          admin
            ? 'Keep every delivery moving, from request to doorstep.'
            : courier
              ? 'Your assigned packages and their next steps.'
              : `Hello, ${auth.user?.name?.split(' ')[0]}. Let’s get your next delivery moving.`
        }}
      </p>
    </div>
    <RouterLink v-if="!admin && !courier" class="button button-primary" to="/customer/shipments/new"
      ><Icon name="plus" :size="18" />New shipment</RouterLink
    ><button v-else class="button button-secondary" :disabled="loading" @click="load()">
      <Icon name="refresh" :size="17" />Refresh
    </button>
  </div>
  <div v-if="!admin && !courier" class="customer-banner">
    <div class="banner-icon"><Icon name="truck" :size="30" /></div>
    <div>
      <h2>A little less wondering.<br />A lot more knowing.</h2>
      <p>Follow every delivery from Placed to Delivered.</p>
    </div>
    <div class="banner-steps">
      <span>01 <b>Placed</b></span
      ><i /><span>02 <b>Picked up</b></span
      ><i /><span>03 <b>In transit</b></span
      ><i /><span>04 <b>Delivered</b></span>
    </div>
  </div>
  <section class="panel list-panel">
    <div class="panel-heading">
      <div>
        <h2>{{ courier ? 'Assigned deliveries' : 'Shipment history' }}</h2>
        <p class="muted">Newest requests first · Dates in WIB</p>
      </div>
      <button
        v-if="!admin && !courier"
        class="button button-secondary button-small"
        :disabled="loading"
        @click="load()"
      >
        <Icon name="refresh" :size="15" />Refresh</button
      ><span v-else class="count-chip">{{ loading ? '…' : total }} shipments</span>
    </div>
    <form class="filters" @submit.prevent="apply">
      <div class="search-field">
        <label for="tracking">Tracking number</label>
        <div class="input-icon">
          <Icon name="search" :size="17" /><input
            id="tracking"
            v-model="filters.tracking_number"
            placeholder="Enter full tracking number"
            maxlength="40"
          />
        </div>
      </div>
      <div class="form-field">
        <label for="status">Status</label
        ><select id="status" v-model="filters.status">
          <option value="">All statuses</option>
          <option v-if="admin || courier" value="active">Active deliveries</option>
          <option v-for="status in statuses" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>
      <div v-if="admin" class="form-field">
        <label for="courier-filter">Courier</label
        ><select id="courier-filter" v-model="filters.courier_id">
          <option value="">All couriers</option>
          <option value="unassigned">Unassigned</option>
          <option v-for="person in couriers" :key="person.id" :value="person.id">
            {{ person.name }}{{ person.is_active ? '' : ' (inactive)' }}
          </option>
        </select>
      </div>
      <button class="button button-secondary" :disabled="loading">Apply filters</button
      ><button type="button" class="text-button" :disabled="loading" @click="reset">Reset</button>
    </form>
    <div v-if="courierError" class="panel-body">
      <FeedbackMessage :message="courierError" /><button class="text-button" @click="loadCouriers">
        Retry courier filters
      </button>
    </div>
    <div v-if="loading" class="state-block" role="status">
      <span class="spinner" />Loading shipments…
    </div>
    <div v-else-if="error" class="state-block">
      <FeedbackMessage :message="error" /><button class="button button-secondary" @click="load()">
        Try again
      </button>
    </div>
    <div v-else-if="!items.length" class="state-block">
      <span class="empty-icon"><Icon name="box" :size="30" /></span>
      <h3>No shipments found</h3>
      <p class="muted">
        {{
          courier
            ? 'Assigned deliveries will appear here. Try adjusting your filters.'
            : 'Try different filters, or check back after a new request is created.'
        }}
      </p>
      <RouterLink
        v-if="auth.role === 'customer'"
        class="button button-primary"
        to="/customer/shipments/new"
        >Create a shipment</RouterLink
      >
    </div>
    <div v-else class="shipment-rows">
      <article v-for="shipment in items" :key="shipment.id" class="shipment-row">
        <div class="shipment-identity">
          <span class="package-icon"><Icon name="box" /></span>
          <div>
            <RouterLink class="tracking-link" :to="`/${auth.role}/shipments/${shipment.id}`">{{
              shipment.tracking_number
            }}</RouterLink
            ><small
              >{{ formatDate(shipment.created_at, true)
              }}<template v-if="admin"> · {{ shipment.customer?.name }}</template></small
            >
          </div>
        </div>
        <div class="shipment-route">
          <span class="route-origin">{{ shipment.origin_address }}</span
          ><span><Icon name="pin" :size="13" />{{ shipment.destination_address }}</span>
        </div>
        <div class="shipment-person">
          <strong>{{ shipment.recipient_name }}</strong
          ><small>{{ shipment.package_description }} · {{ shipment.weight_kg }} kg</small
          ><small v-if="admin" :class="{ unassigned: !shipment.courier_id }">{{
            shipment.courier?.name || 'Unassigned courier'
          }}</small>
        </div>
        <div class="shipment-status">
          <StatusBadge :status="shipment.current_status" /><RouterLink
            :to="`/${auth.role}/shipments/${shipment.id}`"
            class="detail-link"
            :aria-label="`View ${shipment.tracking_number}`"
            >View details <Icon name="arrow" :size="15"
          /></RouterLink>
        </div>
      </article>
    </div>
    <PaginationBar
      v-if="!error"
      :page="page"
      :pages="pages"
      :total="total"
      :busy="loading"
      @change="load"
    />
  </section>
</template>
