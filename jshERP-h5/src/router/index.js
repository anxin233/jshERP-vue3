import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
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

router.afterEach((to) => {
  const title = to.meta && to.meta.title
  document.title = title ? `${title} - 管伊佳ERP` : '管伊佳ERP'
})

export default router
