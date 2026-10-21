<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Icon from './Icon.vue'
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const navigation = ref(null)
const menuButton = ref(null)
async function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    await nextTick()
    navigation.value?.querySelector('nav a')?.focus()
  }
}
function closeMenu() {
  menuOpen.value = false
  menuButton.value?.focus()
}
watch(
  () => route.path,
  () => {
    menuOpen.value = false
  },
)
function logout() {
  auth.logout()
  router.replace('/login')
}
</script>
<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="app-layout" @keydown.esc="closeMenu">
    <aside
      id="primary-navigation"
      ref="navigation"
      class="sidebar"
      :class="{ 'is-open': menuOpen }"
    >
      <RouterLink :to="auth.home" class="brand"
        ><span class="brand-mark"><Icon name="box" :size="23" /></span>deliveria<span
          class="brand-period"
          >.</span
        ></RouterLink
      >
      <p class="nav-label">
        WORKSPACE <span>{{ auth.role }}</span>
      </p>
      <nav aria-label="Main navigation">
        <template v-if="auth.role === 'admin'">
          <RouterLink to="/admin/dashboard"><Icon name="grid" /> Overview</RouterLink>
          <RouterLink to="/admin/shipments"><Icon name="box" /> All shipments</RouterLink>
          <RouterLink to="/admin/couriers"><Icon name="users" /> Couriers</RouterLink>
        </template>
        <template v-else-if="auth.role === 'customer'">
          <RouterLink to="/customer/dashboard"><Icon name="box" /> My shipments</RouterLink>
          <RouterLink to="/customer/shipments/new"><Icon name="plus" /> New shipment</RouterLink>
        </template>
        <RouterLink v-else to="/courier/dashboard"><Icon name="truck" /> My deliveries</RouterLink>
      </nav>
      <div class="sidebar-note">
        <Icon name="shield" :size="24" /><strong>Every step, accounted for.</strong>
        <p>From the first pickup to the final doorstep.</p>
      </div>
      <div class="profile">
        <span class="avatar">{{ auth.user?.name?.slice(0, 1).toUpperCase() }}</span>
        <div>
          <strong>{{ auth.user?.name }}</strong
          ><small>{{ auth.role }} account</small>
        </div>
        <button class="icon-button" aria-label="Sign out" title="Sign out" @click="logout">
          <Icon name="logout" />
        </button>
      </div>
    </aside>
    <button
      v-if="menuOpen"
      class="sidebar-overlay"
      aria-label="Close navigation"
      @click="closeMenu"
    />
    <div class="workspace">
      <header class="topbar">
        <div class="row">
          <button
            ref="menuButton"
            class="icon-button mobile-menu"
            aria-controls="primary-navigation"
            aria-label="Toggle navigation"
            :aria-expanded="menuOpen"
            @click="toggleMenu"
          >
            <Icon name="menu" /></button
          ><span class="breadcrumb"
            >Workspace <span>/</span> <strong>{{ route.meta.title }}</strong></span
          >
        </div>
        <span class="timezone"><span class="online-dot" /> Asia/Jakarta · WIB</span>
      </header>
      <main id="main-content" class="main-content" tabindex="-1"><slot /></main>
      <footer class="app-footer">
        <span>Deliveria · Delivery operations, made simple.</span
        ><span>All times in Asia/Jakarta (WIB)</span>
      </footer>
    </div>
  </div>
</template>
