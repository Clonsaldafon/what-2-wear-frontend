import { createRouter, createWebHistory } from 'vue-router'

import { ROUTES } from '@/utils/constants'

const Weather = () => import('@/components/views/WeatherView.vue')
const Clothes = () => import('@/components/views/ClothesView.vue')
const Profile = () => import('@/components/views/ProfileView.vue')

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
      component: Weather,
      meta: { requiresGuest: true }
    },
    {
      path: `/${ROUTES.CLOTHES}`,
      name: `${ROUTES.CLOTHES}`,
      component: Clothes
    },
    {
      path: `/${ROUTES.PROFILE}`,
      name: `${ROUTES.PROFILE}`,
      component: Profile
    }
  ]
})

export default router
