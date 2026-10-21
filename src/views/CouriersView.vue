<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../services/api'
import { usePagedList } from '../composables/usePagedList'
import { errorMessage, fieldErrors, validateFields } from '../lib/domain'
import FormField from '../components/FormField.vue'
import FeedbackMessage from '../components/FeedbackMessage.vue'
import PaginationBar from '../components/PaginationBar.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Icon from '../components/Icon.vue'
const status = ref(''),
  applied = ref('')
const { items, total, page, pages, loading, error, load } = usePagedList('/admin/couriers', () =>
  applied.value ? { is_active: applied.value === 'active' } : {},
)
const editing = ref(null),
  showForm = ref(false),
  form = reactive({ name: '', email: '', phone: '', password: '' }),
  formError = ref(''),
  errors = ref({}),
  saving = ref(false),
  success = ref(''),
  changing = ref(null),
  changeError = ref('')
function askToggle(courier) {
  changing.value = courier
  changeError.value = ''
}
function openForm(courier = null) {
  editing.value = courier
  formError.value = ''
  errors.value = {}
  success.value = ''
  Object.assign(form, {
    name: courier?.name || '',
    email: courier?.email || '',
    phone: courier?.phone || '',
    password: '',
  })
  showForm.value = true
}
function closeForm() {
  if (!saving.value) {
    showForm.value = false
    form.password = ''
  }
}
async function save() {
  if (saving.value) return
  const data = editing.value
    ? { name: form.name.trim(), phone: form.phone.trim() }
    : { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() }
  errors.value = validateFields(data, { account: !editing.value })
  formError.value = ''
  if (Object.keys(errors.value).length) return
  saving.value = true
  try {
    if (editing.value) await api.patch(`/admin/couriers/${editing.value.id}`, data)
    else await api.post('/admin/couriers', data)
    success.value = editing.value
      ? 'Courier profile updated.'
      : 'Courier account created. Share the initial password securely with the courier.'
    form.password = ''
    showForm.value = false
    await load(1)
  } catch (err) {
    formError.value = errorMessage(err)
    errors.value = fieldErrors(err)
  } finally {
    saving.value = false
  }
}
async function toggle() {
  if (saving.value) return
  saving.value = true
  changeError.value = ''
  success.value = ''
  try {
    await api.patch(`/admin/couriers/${changing.value.id}`, {
      is_active: !changing.value.is_active,
    })
    success.value = changing.value.is_active
      ? 'Courier deactivated. Their delivery history is preserved.'
      : 'Courier activated.'
    changing.value = null
    await load()
  } catch (err) {
    changeError.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}
function apply() {
  applied.value = status.value
  load(1)
}
onMounted(load)
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="eyebrow">THE PEOPLE BEHIND THE PACKAGES</span>
      <h1>Courier team</h1>
      <p class="muted">Manage the people who keep your deliveries moving.</p>
    </div>
    <button class="button button-primary" :disabled="saving" @click="openForm()">
      <Icon name="plus" :size="18" />Add courier
    </button>
  </div>
  <FeedbackMessage :message="success" success />
  <section v-if="showForm" class="panel panel-body courier-form">
    <div class="panel-title">
      <h2>{{ editing ? 'Edit courier' : 'New courier account' }}</h2>
      <button
        class="icon-button"
        aria-label="Close courier form"
        :disabled="saving"
        @click="closeForm"
      >
        <Icon name="close" />
      </button>
    </div>
    <p class="muted">
      {{
        editing
          ? 'Update contact details. Email addresses cannot be changed.'
          : 'The account will be created as an active courier.'
      }}
    </p>
    <form class="form-grid" @submit.prevent="save">
      <FormField
        v-model="form.name"
        label="Full name"
        name="name"
        required
        maxlength="100"
        :error="errors.name"
      /><FormField
        v-model="form.phone"
        label="Phone number"
        name="phone"
        type="tel"
        required
        maxlength="30"
        :error="errors.phone"
      /><FormField
        v-model="form.email"
        label="Email address"
        name="email"
        type="email"
        required
        maxlength="254"
        :disabled="!!editing"
        :error="errors.email"
      /><FormField
        v-if="!editing"
        v-model="form.password"
        label="Initial password"
        name="password"
        type="password"
        autocomplete="new-password"
        required
        minlength="10"
        maxlength="72"
        hint="At least 10 characters; share securely with the courier."
        :error="errors.password"
      />
      <div class="full-width">
        <FeedbackMessage :message="formError" />
        <div class="row">
          <button class="button button-primary" :disabled="saving">
            {{ saving ? 'Saving…' : editing ? 'Save changes' : 'Create courier' }}</button
          ><button
            type="button"
            class="button button-secondary"
            :disabled="saving"
            @click="closeForm"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  </section>
  <section class="panel list-panel">
    <div class="panel-heading">
      <div>
        <h2>All couriers</h2>
        <p class="muted">Accounts are deactivated, never deleted.</p>
      </div>
      <button
        class="button button-secondary button-small"
        :disabled="loading || saving"
        @click="load()"
      >
        <Icon name="refresh" :size="16" />Refresh
      </button>
    </div>
    <form class="filters" @submit.prevent="apply">
      <div class="form-field">
        <label for="account-status">Account status</label
        ><select id="account-status" v-model="status">
          <option value="">All accounts</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button class="button button-secondary" :disabled="loading">Apply filter</button>
    </form>
    <div v-if="loading" class="state-block" role="status">
      <span class="spinner" />Loading couriers…
    </div>
    <div v-else-if="error" class="state-block">
      <FeedbackMessage :message="error" /><button class="button button-secondary" @click="load()">
        Try again
      </button>
    </div>
    <div v-else-if="!items.length" class="state-block">
      <Icon name="users" :size="36" />
      <h3>No couriers found</h3>
      <p class="muted">Add a courier or change the account filter.</p>
    </div>
    <div v-else class="courier-list">
      <article v-for="courier in items" :key="courier.id" class="courier-row">
        <span class="avatar">{{ courier.name.slice(0, 1).toUpperCase() }}</span>
        <div class="courier-person">
          <strong>{{ courier.name }}</strong
          ><small>{{ courier.email }}</small>
        </div>
        <span class="courier-phone">{{ courier.phone }}</span
        ><span class="status-badge" :class="courier.is_active ? 'delivered' : 'inactive'"
          ><span />{{ courier.is_active ? 'Active' : 'Inactive' }}</span
        >
        <div class="row">
          <button
            class="button button-small button-secondary"
            :disabled="saving"
            :aria-label="`Edit ${courier.name}`"
            @click="openForm(courier)"
          >
            Edit</button
          ><button
            class="text-button"
            :disabled="saving"
            :aria-label="`${courier.is_active ? 'Deactivate' : 'Activate'} ${courier.name}`"
            @click="askToggle(courier)"
          >
            {{ courier.is_active ? 'Deactivate' : 'Activate' }}
          </button>
        </div>
      </article>
    </div>
    <PaginationBar
      v-if="!error"
      :page="page"
      :pages="pages"
      :total="total"
      :busy="loading || saving"
      @change="load"
    />
  </section>
  <p class="muted footnote">
    <Icon name="shield" :size="16" />Couriers with unfinished deliveries cannot be deactivated.
    Reassign Placed shipments first; picked-up shipments must be delivered.
  </p>
  <ConfirmDialog
    v-if="changing"
    :title="`${changing.is_active ? 'Deactivate' : 'Activate'} ${changing.name}?`"
    :message="
      changing.is_active
        ? 'They will lose access and cannot receive assignments. The server will reject this change if unfinished deliveries remain.'
        : 'They will be able to sign in and receive new assignments.'
    "
    :busy="saving"
    :confirm-label="changing.is_active ? 'Deactivate courier' : 'Activate courier'"
    @cancel="changing = null"
    @confirm="toggle"
    ><FeedbackMessage :message="changeError"
  /></ConfirmDialog>
</template>
