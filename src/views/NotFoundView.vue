<script setup>
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>
<template>
  <main class="state-block not-found">
    <span class="eyebrow">404 · OFF THE ROUTE</span>
    <h1>Page not found.</h1>
    <p class="muted">This address doesn’t lead to a Deliveria page.</p>
    <RouterLink :to="auth.home" class="button button-primary">Back to your workspace</RouterLink>
  </main>
</template>
