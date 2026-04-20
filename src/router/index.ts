import { createRouter, createWebHistory } from 'vue-router'

import { ROUTES } from '@/utils/constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: `/${ROUTES.WEATHER}`
    },
    {
      path: `/${ROUTES.WEATHER}`,
      name: `${ROUTES.WEATHER}`,
      component: () => import('@/components/views/WeatherView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: `/${ROUTES.CLOTHES}`,
      name: `${ROUTES.CLOTHES}`,
      component: () => import('@/components/views/ClothesView.vue')
    }
  ]
})

export default router
