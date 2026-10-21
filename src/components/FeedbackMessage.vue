<script setup>
defineProps({ message: { type: String, default: '' }, success: Boolean })
</script>
<template>
  <div
    v-if="message"
    class="notice"
    :class="success ? 'notice-success' : 'notice-error'"
    :role="success ? 'status' : 'alert'"
  >
    {{ message }}<slot />
  </div>
</template>
