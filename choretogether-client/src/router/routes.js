import { useAuthStore } from '@/stores/auth-store'
import { useShoppingStore } from '@/stores/shopping-store'

const routes = [
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'prijava', component: () => import('@/pages/auth/LoginPage.vue') },
      { path: 'registracija', component: () => import('@/pages/auth/RegisterPage.vue') },
    ],
  },
  {
    path: '/kucanstvo',
    component: () => import('@/pages/auth/HouseholdSetupPage.vue'),
    beforeEnter: () => {
      const authStore = useAuthStore()
      if (!authStore.jePrijavljen) return '/auth/prijava'
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    beforeEnter: () => {
      const authStore = useAuthStore()
      if (!authStore.jePrijavljen) return '/auth/prijava'
      if (!authStore.imaKucanstvo) return '/kucanstvo'
    },
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      {
        path: 'kupovina',
        component: () => import('@/pages/ShoppingPage.vue'),
        beforeEnter: () => {
          const shoppingStore = useShoppingStore()
          if (shoppingStore.liste.length === 0) return '/'
        },
      },
      { path: 'kalendar', component: () => import('@/pages/CalendarPage.vue') },
      { path: 'profil', component: () => import('@/pages/ProfilePage.vue') },
      { path: 'postavke', component: () => import('@/pages/SettingsPage.vue') },
      { path: 'statistika', component: () => import('@/pages/StatsPage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
