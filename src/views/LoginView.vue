
<template>
  <main class="login-page">
    <section class="login-card">
      <div class="brand">
        <span class="brand-icon"></span>
        <span>Deliveria</span>
      </div>

      <p class="eyebrow">LOGISTICS MANAGEMENT</p>
      <h1>Welcome back.</h1>
      <p class="description">
        Sign in to manage and track your deliveries.
      </p>

      <form @submit.prevent="handleLogin">
        <label for="email">Email address</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="you@example.com"
          required
        />

        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p v-if="message" class="message" role="status">
        {{ message }}
      </p>

      <p class="footer-text">
        Delivery operations, made simple.
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const message = ref('')
const isLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()


async function handleLogin() {
  message.value = ''
  isLoading.value = true

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })

    authStore.login(response.data)

    if (authStore.role === 'customer') {
      await router.push('/customer/dashboard')
    } else if (authStore.role === 'courier') {
      await router.push('/courier/dashboard')
    } else if (authStore.role === 'admin') {
      await router.push('/admin/dashboard')
    } else {
      message.value = 'Role akun tidak dikenali.'
    }
  } catch (error) {
    message.value =
      error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      'Login gagal. Periksa email dan password.'
  } finally {
    isLoading.value = false
  }
}

</script>
