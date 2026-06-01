import { createRouter, createWebHistory } from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes: constantRouterMap
})

export default router
