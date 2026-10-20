import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ShipmentDetailView from '../views/ShipmentDetailView.vue'
import CourierDashboardView from '../views/CourierDashboardView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/customer/dashboard',
    name: 'customer-dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      role: 'customer',
    },
  },
  {
    path: '/customer/shipments/:id',
    name: 'shipment-detail',
    component: ShipmentDetailView,
    meta: {
      requiresAuth: true,
      role: 'customer',
    },
  },
  {
    path: '/courier/dashboard',
    name: 'courier-dashboard',
    component: CourierDashboardView,
    meta: {
      requiresAuth: true,
      role: 'courier',
    },
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: {
      requiresAuth: true,
      role: 'admin',
    },
  },
  {
    path: '/courier/shipments/:id',
    name: 'courier-shipment-detail',
    component: ShipmentDetailView,
    meta: { requiresAuth: true, role: 'courier' },
},

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function getDashboardPath(role) {
  const dashboards = {
    customer: '/customer/dashboard',
    courier: '/courier/dashboard',
    admin: '/admin/dashboard',
  }

  return dashboards[role] || '/login'
}


router.beforeEach((to) => {
  const token = sessionStorage.getItem('access_token')
  const storedUser = sessionStorage.getItem('user')
  const expiresAt = Number(sessionStorage.getItem('expires_at'))

  let user = null

  try {
    user = storedUser ? JSON.parse(storedUser) : null
  } catch {
    user = null
  }

  const isAuthenticated = Boolean(
    token &&
    user?.role &&
    expiresAt &&
    expiresAt > Date.now()
  )

  if (!isAuthenticated && token) {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('expires_at')
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return getDashboardPath(user.role)
  }

  if (to.meta.role && user?.role !== to.meta.role) {
    if (isAuthenticated) {
      return getDashboardPath(user.role)
    }

    return '/login'
  }

  return true
})


export default router
