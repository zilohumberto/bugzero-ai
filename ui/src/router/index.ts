import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/build/:id',
      name: 'build-output',
      component: () => import('@/views/BuildOutputView.vue')
    }
  ]
})

export default router
