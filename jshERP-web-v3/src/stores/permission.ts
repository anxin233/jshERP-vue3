/**
 * Permission Store - route generation and filtering
 * Migrated from Vue 2 store/modules/permission.js
 * Uses Pinia Composition API style
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

/**
 * Check if a route has the required permission
 */
function hasPermission(permission: string[], route: RouteRecordRaw): boolean {
  if (route.meta && (route.meta as any).permission) {
    const routePermission = (route.meta as any).permission as string[]
    let flag = -1
    for (let i = 0, len = permission.length; i < len; i++) {
      flag = routePermission.indexOf(permission[i])
      if (flag >= 0) {
        return true
      }
    }
    return false
  }
  return true
}

/**
 * Filter async router map based on permissions
 */
function filterAsyncRouter(routerMap: RouteRecordRaw[], roles: { permissionList: string[] }): RouteRecordRaw[] {
  const accessedRouters = routerMap.filter(route => {
    if (hasPermission(roles.permissionList, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

export const usePermissionStore = defineStore('permission', () => {
  // State
  const routers = ref<RouteRecordRaw[]>([])
  const addRouters = ref<RouteRecordRaw[]>([])

  /**
   * Generate routes based on roles/permissions
   * Migrated from Vue 2 GenerateRoutes action
   */
  function generateRoutes(data: { roles: { permissionList: string[] } }, asyncRouterMap: RouteRecordRaw[]) {
    const { roles } = data
    const accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
    addRouters.value = accessedRouters
    routers.value = accessedRouters
  }

  /**
   * Update app router dynamically (needs caching)
   * Migrated from Vue 2 UpdateAppRouter action
   */
  function updateAppRouter(routeList: RouteRecordRaw[]) {
    addRouters.value = routeList
    routers.value = routeList
  }

  /**
   * Set routers directly
   */
  function setRouters(data: RouteRecordRaw[]) {
    addRouters.value = data
    routers.value = data
  }

  return {
    // State
    routers,
    addRouters,

    // Actions
    generateRoutes,
    updateAppRouter,
    setRouters
  }
})
