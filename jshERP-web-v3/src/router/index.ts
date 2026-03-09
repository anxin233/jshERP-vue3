import { createRouter, createWebHistory } from 'vue-router'
import { constantRouterMap } from './constants'
import { setupRouterGuard } from './guard'

/**
 * Vue Router 4 实例
 * 对应原 Vue 2 项目 router/index.js
 *
 * 变更说明:
 * - new Router({ mode: 'history' }) -> createRouter({ history: createWebHistory() })
 * - scrollBehavior 返回值从 { y: 0 } 改为 { top: 0 }
 * - 路由实例通过 createRouter 创建而非 new Router()
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRouterMap,
})

// 设置路由守卫
setupRouterGuard(router)

export default router
