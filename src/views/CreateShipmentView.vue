<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { errorMessage, fieldErrors, validateFields } from '../lib/domain'
import FormField from '../components/FormField.vue'
import FeedbackMessage from '../components/FeedbackMessage.vue'
import Icon from '../components/Icon.vue'
const auth = useAuthStore()
const form = reactive({
  sender_name: auth.user?.name || '',
  sender_phone: auth.user?.phone || '',
  origin_address: '',
  recipient_name: '',
  recipient_phone: '',
  destination_address: '',
  package_description: '',
  weight_kg: '',
})
const errors = ref({}),
  error = ref(''),
  busy = ref(false),
  created = ref(null)
async function submit() {
  if (busy.value || created.value) return
  errors.value = validateFields(form, { shipment: true })
  error.value = ''
  if (Object.keys(errors.value).length) return
  busy.value = true
  try {
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, String(value).trim()]),
    )
    created.value = (await api.post('/shipments', payload)).data
  } catch (err) {
    error.value = errorMessage(
      err,
      'Unable to create shipment. Your details are still here; please try again.',
    )
    errors.value = fieldErrors(err)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <RouterLink to="/customer/dashboard" class="back-link"
    ><Icon name="back" :size="16" />Back to shipments</RouterLink
  >
  <div class="page-heading">
    <div>
      <span class="eyebrow">START SOMETHING GOOD</span>
      <h1>New shipment</h1>
      <p class="muted">Tell us where it’s going. We’ll keep you in the loop.</p>
    </div>
  </div>
  <section v-if="created" class="panel success-panel" role="status">
    <span class="success-icon"><Icon name="check" :size="32" /></span>
    <h2>Your shipment is placed.</h2>
    <p class="muted">Keep this tracking number handy.</p>
    <strong class="tracking-number">{{ created.tracking_number }}</strong
    ><RouterLink :to="`/customer/shipments/${created.id}`" class="button button-primary"
      >Track this shipment<Icon name="arrow" :size="17" /></RouterLink
    ><RouterLink to="/customer/dashboard" class="text-button">Back to all shipments</RouterLink>
  </section>
  <form v-else class="create-layout" @submit.prevent="submit">
    <div class="stack">
      <section class="panel panel-body">
        <div class="form-section-title">
          <span>01</span>
          <div>
            <h2>Pickup details</h2>
            <p class="muted">Where should the courier collect your package?</p>
          </div>
        </div>
        <div class="form-grid">
          <FormField
            v-model="form.sender_name"
            label="Sender name"
            name="sender_name"
            autocomplete="name"
            maxlength="100"
            required
            :error="errors.sender_name"
          /><FormField
            v-model="form.sender_phone"
            label="Sender phone"
            name="sender_phone"
            type="tel"
            autocomplete="tel"
            maxlength="30"
            required
            :error="errors.sender_phone"
          /><FormField
            v-model="form.origin_address"
            class="full-width"
            label="Pickup address"
            name="origin_address"
            multiline
            maxlength="1000"
            required
            :error="errors.origin_address"
            placeholder="Street, building, city, and postal code"
          />
        </div>
      </section>
      <section class="panel panel-body">
        <div class="form-section-title">
          <span>02</span>
          <div>
            <h2>Delivery details</h2>
            <p class="muted">Who’s waiting on the other end?</p>
          </div>
        </div>
        <div class="form-grid">
          <FormField
            v-model="form.recipient_name"
            label="Recipient name"
            name="recipient_name"
            maxlength="100"
            required
            :error="errors.recipient_name"
          /><FormField
            v-model="form.recipient_phone"
            label="Recipient phone"
            name="recipient_phone"
            type="tel"
            maxlength="30"
            required
            :error="errors.recipient_phone"
          /><FormField
            v-model="form.destination_address"
            class="full-width"
            label="Delivery address"
            name="destination_address"
            multiline
            maxlength="1000"
            required
            :error="errors.destination_address"
            placeholder="Street, building, city, and postal code"
          />
        </div>
      </section>
      <section class="panel panel-body">
        <div class="form-section-title">
          <span>03</span>
          <div>
            <h2>The package</h2>
            <p class="muted">A few details to help us handle it right.</p>
          </div>
        </div>
        <div class="form-grid">
          <FormField
            v-model="form.package_description"
            label="Package description"
            name="package_description"
            multiline
            maxlength="2000"
            required
            :error="errors.package_description"
            placeholder="e.g. Three paperback books"
          /><FormField
            v-model="form.weight_kg"
            label="Weight (kg)"
            name="weight_kg"
            type="number"
            min="0.001"
            max="9999999.999"
            step="0.001"
            required
            :error="errors.weight_kg"
            placeholder="e.g. 1.250"
            hint="Positive weight, up to 3 decimal places."
          />
        </div>
      </section>
    </div>
    <aside class="panel panel-body request-summary">
      <Icon name="box" :size="32" />
      <h2>Ready for pickup.</h2>
      <p class="muted">
        Your request starts at Placed. An admin will assign a courier to take it from there.
      </p>
      <ol class="mini-steps">
        <li>Request placed</li>
        <li>Courier assigned</li>
        <li>Picked up & on the way</li>
        <li>Delivered to the doorstep</li>
      </ol>
      <FeedbackMessage :message="error" /><button class="button button-primary" :disabled="busy">
        {{ busy ? 'Creating shipment…' : 'Create shipment'
        }}<Icon name="arrow" :size="17" /></button
      ><small class="muted"
        >All fields are required. Check the contact details before submitting.</small
      >
    </aside>
  </form>
</template>
