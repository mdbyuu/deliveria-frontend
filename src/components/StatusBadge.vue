<script setup>
import { statusLabel } from '../lib/domain'
defineProps({ status: { type: String, required: true } })
</script>
<template>
  <span class="status-badge" :class="status"><span />{{ statusLabel(status) }}</span>
</template>
