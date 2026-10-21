<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppShell from './components/AppShell.vue'
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
watch(
  () => auth.accessToken,
  (token) => {
    if (!token && route.meta.role)
      router.replace({ path: '/login', query: { redirect: route.fullPath } })
  },
)
</script>
<template>
  <AppShell v-if="auth.isLoggedIn && route.meta.role"><router-view :key="route.path" /></AppShell>
  <router-view v-else :key="route.path" />
</template>
