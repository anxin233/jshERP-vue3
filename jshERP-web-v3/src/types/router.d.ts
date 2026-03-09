/**
 * Vue Router 路由元信息类型扩展
 */

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 菜单图标 */
    icon?: string
    /** 是否缓存（keep-alive） */
    keepAlive?: boolean
    /** 是否在菜单中隐藏 */
    hidden?: boolean
    /** 路由对应的 URL */
    url?: string
    /** 是否为内部或外部链接 */
    internalOrExternal?: boolean
    /** 组件名称（用于 keep-alive 匹配） */
    componentName?: string
    /** 菜单 ID */
    id?: number | string
    /** 是否需要登录 */
    requiresAuth?: boolean
  }
}
