import type { RouteRecordRaw } from 'vue-router'

/**
 * 基础路由 - 不需要权限控制的静态路由
 * 对应原 Vue 2 项目 config/router.config.js 中的 constantRouterMap
 *
 * 注意：/dashboard 和其他业务路由由后端菜单数据动态生成，
 * 通过 router/helper.ts 的 generateIndexRouter 处理，
 * 统一使用 BasicLayout 作为根布局组件
 */
export const constantRouterMap: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('@/components/layouts/UserLayout.vue'),
    redirect: '/user/login',
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/user/Login.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/user/Register.vue'),
      },
    ],
  },
  // 异常页面 - 独立显示（不带布局框架）
  {
    path: '/404',
    name: 'Exception404',
    component: () => import('@/views/exception/404.vue'),
  },
  {
    path: '/403',
    name: 'Exception403',
    component: () => import('@/views/exception/403.vue'),
  },
  {
    path: '/500',
    name: 'Exception500',
    component: () => import('@/views/exception/500.vue'),
  },
]
