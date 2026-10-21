import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const shipments = () => import('../views/ShipmentsView.vue')
const detail = () => import('../views/ShipmentDetailView.vue')
export const routes = [
  {
    path: '/',
    component: () => import('../views/LandingView.vue'),
    meta: { title: 'Delivery, made simple' },
  },
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { guestOnly: true } },
  {
    path: '/register',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/customer/dashboard',
    component: shipments,
    meta: { role: 'customer', title: 'My shipments' },
  },
  {
    path: '/customer/shipments/new',
    component: () => import('../views/CreateShipmentView.vue'),
    meta: { role: 'customer', title: 'New shipment' },
  },
  {
    path: '/courier/dashboard',
    component: shipments,
    meta: { role: 'courier', title: 'My deliveries' },
  },
  {
    path: '/admin/dashboard',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: { role: 'admin', title: 'Overview' },
  },
  {
    path: '/admin/shipments',
    component: shipments,
    meta: { role: 'admin', title: 'All shipments' },
  },
  {
    path: '/admin/couriers',
    component: () => import('../views/CouriersView.vue'),
    meta: { role: 'admin', title: 'Couriers' },
  },
  ...['customer', 'courier', 'admin'].map((role) => ({
    path: `/${role}/shipments/:id`,
    component: detail,
    meta: { role, title: 'Shipment details' },
  })),
  { path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') },
]
export function guard(to) {
  const auth = useAuthStore()
  if (auth.accessToken && auth.expiresAt <= Date.now()) auth.expire()
  if (to.meta.role && !auth.isLoggedIn) return { path: '/login', query: { redirect: to.fullPath } }
  if (to.meta.role && to.meta.role !== auth.role) return auth.home
  if (to.meta.guestOnly && auth.isLoggedIn) return auth.home
}
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, _from, savedPosition) =>
    savedPosition || (to.hash ? { el: to.hash, top: 24 } : { top: 0 }),
})
router.beforeEach(guard)
router.afterEach((to) => {
  document.title = `${to.meta.title || (to.path === '/register' ? 'Create account' : 'Welcome')} · Deliveria`
})
export default router
