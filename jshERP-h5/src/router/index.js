import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/dev/components',
    name: 'dev-components',
    component: () => import('@/views/dev/ComponentsDemo.vue'),
    meta: { title: '组件演示' }
  },
  {
    path: '/',
    component: () => import('@/layout/TabBarLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', tab: true }
      },
      {
        path: 'sale',
        name: 'sale',
        component: () => import('@/views/sale/index.vue'),
        meta: { title: '开单', tab: true }
      },
      {
        path: 'stock',
        name: 'stock',
        component: () => import('@/views/stock/index.vue'),
        meta: { title: '库存', tab: true }
      },
      {
        path: 'bills',
        name: 'bills',
        component: () => import('@/views/bills/index.vue'),
        meta: { title: '单据', tab: true }
      },
      {
        path: 'mine',
        name: 'mine',
        component: () => import('@/views/mine/index.vue'),
        meta: { title: '我的', tab: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!userStore.token) {
    if (to.path === '/login') return true
    const query = to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : {}
    return { path: '/login', query }
  }
  if (to.path === '/login') {
    return { path: '/home' }
  }
  if (!userStore.sessionChecked) {
    // 应用启动后首次进入业务页时校验登录态并加载按钮权限（token 失效会被请求层拦截并跳登录）
    userStore.loadBtnPermissions().catch(() => {
      userStore.sessionChecked = false
    })
  }
  return true
})

router.afterEach((to) => {
  const title = to.meta && to.meta.title
  document.title = title ? `${title} - 管伊佳ERP` : '管伊佳ERP'
})

export default router
