<script setup>
defineProps({
  page: { type: Number, required: true },
  pages: { type: Number, required: true },
  total: { type: Number, required: true },
  busy: Boolean,
})
defineEmits(['change'])
</script>
<template>
  <div class="pagination">
    <span
      >{{ total }} {{ total === 1 ? 'record' : 'records' }} · Page {{ page }} of
      {{ Math.max(1, pages) }}</span
    >
    <div class="row">
      <button
        class="button button-small button-secondary"
        :disabled="busy || page <= 1"
        @click="$emit('change', page - 1)"
      >
        Previous</button
      ><button
        class="button button-small button-secondary"
        :disabled="busy || page >= pages"
        @click="$emit('change', page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
