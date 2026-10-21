<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { errorMessage, fieldErrors, validateFields } from '../lib/domain'
import Icon from '../components/Icon.vue'
import FormField from '../components/FormField.vue'
import FeedbackMessage from '../components/FeedbackMessage.vue'
const route = useRoute(),
  router = useRouter(),
  auth = useAuthStore()
const register = computed(() => route.path === '/register')
const form = reactive({ name: '', email: '', phone: '', password: '' })
const errors = ref({}),
  error = ref(''),
  busy = ref(false)
async function submit() {
  if (busy.value) return
  error.value = ''
  errors.value = register.value ? validateFields(form, { account: true }) : {}
  if (Object.keys(errors.value).length) return
  busy.value = true
  try {
    if (register.value) {
      await api.post('/auth/register', {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      })
      auth.notice = 'Account created. Sign in to book your first delivery.'
      await router.replace('/login')
    } else {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      })
      auth.login(data)
      const redirect = route.query.redirect
      await router.replace(
        typeof redirect === 'string' && redirect.startsWith(`/${auth.role}/`)
          ? redirect
          : auth.home,
      )
    }
    form.password = ''
  } catch (err) {
    error.value = errorMessage(err, 'Unable to sign in. Check your email and password.')
    errors.value = fieldErrors(err)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <main class="auth-layout">
    <section class="auth-story">
      <RouterLink to="/login" class="brand"
        ><span class="brand-mark"><Icon name="box" :size="25" /></span>deliveria<span
          class="brand-period"
          >.</span
        ></RouterLink
      >
      <div class="auth-story-content">
        <span class="eyebrow">A BETTER WAY TO DELIVER</span>
        <h1>Good things.<br />On their way.</h1>
        <p>
          One place for every package, every update,<br class="desktop-only" />
          and every step of the journey.
        </p>
        <div class="journey-illustration" aria-label="Placed, picked up, in transit, delivered">
          <div class="parcel"><Icon name="box" :size="94" /></div>
          <div class="journey-line">
            <span><Icon name="check" :size="16" /></span
            ><span><Icon name="check" :size="16" /></span
            ><span class="current"><Icon name="truck" :size="20" /></span
            ><span class="pending"><Icon name="pin" :size="18" /></span>
          </div>
          <div class="journey-labels">
            <span>Placed</span><span>Picked up</span><span>In transit</span><span>Delivered</span>
          </div>
          <div class="delivery-note">
            <span class="online-dot" /> Every milestone. Always in the loop.
          </div>
        </div>
      </div>
      <div class="auth-story-footer">
        <Icon name="shield" :size="17" /> Your deliveries, connected.
      </div>
    </section>
    <section class="auth-form-side">
      <div class="auth-form-wrap">
        <span class="eyebrow">{{
          register ? 'LET’S GET STARTED' : 'YOUR DELIVERY WORKSPACE'
        }}</span>
        <h2>{{ register ? 'Create your account.' : 'Welcome back.' }}</h2>
        <p class="muted">
          {{
            register
              ? 'Send something good. Your next delivery starts here.'
              : 'Sign in to keep things moving.'
          }}
        </p>
        <FeedbackMessage
          :message="auth.notice"
          :success="auth.notice.startsWith('Account created')"
        />
        <FeedbackMessage :message="error" />
        <form class="stack-form" @submit.prevent="submit">
          <FormField
            v-if="register"
            v-model="form.name"
            label="Full name"
            name="name"
            autocomplete="name"
            maxlength="100"
            required
            :error="errors.name"
            placeholder="Your full name"
          />
          <FormField
            v-model="form.email"
            label="Email address"
            name="email"
            type="email"
            autocomplete="username"
            maxlength="254"
            required
            :error="errors.email"
            placeholder="you@example.com"
          />
          <FormField
            v-if="register"
            v-model="form.phone"
            label="Phone number"
            name="phone"
            type="tel"
            autocomplete="tel"
            maxlength="30"
            required
            :error="errors.phone"
            placeholder="+62 812 3456 7890"
          />
          <FormField
            v-model="form.password"
            label="Password"
            name="password"
            type="password"
            :autocomplete="register ? 'new-password' : 'current-password'"
            :minlength="register ? 10 : 1"
            :maxlength="register ? 72 : 128"
            required
            :error="errors.password"
            :hint="register ? 'At least 10 characters; at most 72 UTF-8 bytes.' : ''"
            placeholder="Enter your password"
          />
          <button class="button button-primary auth-submit" :disabled="busy">
            {{ busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'
            }}<Icon name="arrow" :size="18" />
          </button>
        </form>
        <p class="auth-switch">
          {{ register ? 'Already have an account?' : 'New to Deliveria?' }}
          <RouterLink :to="register ? '/login' : '/register'">{{
            register ? 'Sign in' : 'Create an account'
          }}</RouterLink>
        </p>
        <p class="auth-help">
          <Icon name="shield" :size="16" />
          {{
            register
              ? 'Customer registration. Team accounts are created by an admin.'
              : 'A secure workspace for customers, couriers, and admins.'
          }}
        </p>
      </div>
      <p class="auth-copyright">
        © {{ new Date().getFullYear() }} Deliveria. Every delivery matters.
      </p>
    </section>
  </main>
</template>
