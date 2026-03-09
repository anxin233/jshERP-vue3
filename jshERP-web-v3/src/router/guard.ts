import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { generateIndexRouter } from './helper'
import { getStore, setStore } from '@/utils/storage'
import {
  USER_ID,
  INDEX_MAIN_PAGE_PATH,
} from '@/utils/constants'

/**
 * 路由守卫
 * 对应原 Vue 2 项目 permission.js
 *
 * 核心逻辑:
 * 1. 白名单路由直接放行
 * 2. 未登录跳转登录页
 * 3. 已登录但未加载权限路由时，请求权限并动态添加路由
 * 4. 已登录且已加载权限路由时，直接放行
 */

// NProgress 配置：不显示旋转图标
NProgress.configure({ showSpinner: false })

// 白名单路由，不需要登录即可访问
const whiteList = ['/user/login', '/user/register', '/user/register-result']

/**
 * 设置路由守卫
 * @param router Vue Router 实例
 */
export function setupRouterGuard(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    // 通过 storage 工具获取 userId（storage 内部已处理 'pro__' 前缀）
    const userId = getStore(USER_ID)

    if (userId) {
      /* 已登录 */
      if (to.path === '/' || to.path === '/user/login') {
        // 已登录用户访问首页或登录页时，重定向到主页
        next({ path: INDEX_MAIN_PAGE_PATH })
        NProgress.done()
      } else {
        const userStore = useUserStore()
        const permissionStore = usePermissionStore()

        if (permissionStore.addRouters.length === 0) {
          // 未加载权限路由，需要请求权限数据并动态添加路由
          try {
            const menuData = await userStore.getPermissionList()

            if (menuData === null || menuData === '' || menuData === undefined) {
              next()
              return
            }

            // 缓存用户的按钮权限
            try {
              const btnRes = await userStore.getUserBtnList()
              if (btnRes && btnRes.data) {
                setStore(
                  'winBtnStrList',
                  btnRes.data.userBtn,
                  7 * 24 * 60 * 60
                )
              }
            } catch (btnErr) {
              console.warn('[路由守卫] 获取按钮权限失败:', btnErr)
            }

            // 生成动态路由（根路由 + 所有业务路由作为 children）
            const constRoutes = generateIndexRouter(menuData)

            // 调试：打印生成的路由结构
            // console.log('[路由守卫] 生成的路由数量:', constRoutes.length)
            // console.log('[路由守卫] 根路由:', constRoutes[0]?.path, '子路由数量:', constRoutes[0]?.children?.length)

            // 更新 store 中的路由
            permissionStore.updateAppRouter(constRoutes)

            // 使用 Vue Router 4 的 addRoute 添加根路由
            // 根路由包含所有业务路由作为 children
            const addRouters = permissionStore.addRouters
            addRouters.forEach((route) => {
              // console.log('[路由守卫] 添加路由:', route.path, '子路由数:', route.children?.length)
              router.addRoute(route)
            })

            // 添加 404 catch-all 路由（必须在所有动态路由之后添加）
            router.addRoute({
              path: '/:pathMatch(.*)*',
              redirect: '/404',
            })

            // 处理登录后的重定向
            const redirect = decodeURIComponent(
              (from.query.redirect as string) || to.path
            )
            next({ path: redirect, replace: true })
          } catch (error) {
            console.error('[路由守卫] 获取权限列表失败:', error)
            // 获取权限失败，登出并跳转到登录页
            await userStore.logout()
            next({ path: '/user/login' })
          }
        } else {
          // 已加载权限路由，直接放行
          next()
        }
      }
    } else {
      /* 未登录 */
      if (whiteList.includes(to.path)) {
        // 在白名单中，直接放行
        next()
      } else {
        // 不在白名单中，重定向到登录页
        next({ path: '/user/login' })
        NProgress.done()
      }
    }
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
