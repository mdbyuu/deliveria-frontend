<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
const props = defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirm' },
  busy: Boolean,
})
const emit = defineEmits(['confirm', 'cancel'])
const dialog = ref(null)
onMounted(() => dialog.value.showModal())
onBeforeUnmount(() => dialog.value?.close())
function cancel() {
  if (!props.busy) emit('cancel')
}
</script>
<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-labelledby="confirm-title"
    aria-describedby="confirm-message"
    @cancel.prevent="cancel"
  >
    <h2 id="confirm-title">{{ title }}</h2>
    <p id="confirm-message" class="muted">{{ message }}</p>
    <slot />
    <div class="dialog-actions">
      <button autofocus class="button button-secondary" :disabled="busy" @click="cancel">
        Cancel</button
      ><button class="button button-primary" :disabled="busy" @click="$emit('confirm')">
        {{ busy ? 'Saving…' : confirmLabel }}
      </button>
    </div>
  </dialog>
</template>
