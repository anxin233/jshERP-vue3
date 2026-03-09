import type { RouteRecordRaw } from 'vue-router'
import { isURL } from '@/utils/validate'

/**
 * 动态路由生成器
 * 对应原 Vue 2 项目 utils/util.js 中的 generateIndexRouter 和 generateChildRouters
 *
 * 使用 Vite 的 import.meta.glob 替代 webpack 的动态 import
 */

// 使用 import.meta.glob 预加载所有视图组件和布局组件
const viewModules = import.meta.glob('../views/**/*.vue')
const layoutModules = import.meta.glob('../components/layouts/*.vue')

/**
 * 布局组件名称映射
 * 用于根据后端返回的 component 路径匹配对应的布局组件
 */
const layoutComponentMap: Record<string, string> = {
  BlankLayout: 'BlankLayout',
  RouteView: 'RouteView',
  TabLayout: 'TabLayout',
  BasicLayout: 'BasicLayout',
  IframePageView: 'IframePageView',
  PageView: 'PageView',
}

/**
 * 根据组件路径查找布局组件
 * @param componentPath 后端返回的组件路径，例如 "/layouts/TabLayout"
 */
function resolveLayoutComponent(componentPath: string) {
  // 从路径中提取组件名称
  const index = componentPath.lastIndexOf('/')
  const componentName = componentPath.substring(index + 1)

  // 在 layoutModules 中匹配
  const matchKey = Object.keys(layoutModules).find((key) => {
    return key.includes(`${componentName}.vue`)
  })

  if (matchKey) {
    return layoutModules[matchKey]
  }

  console.warn(`[路由] 未找到布局组件: ${componentPath}`)
  return undefined
}

/**
 * 根据组件路径查找视图组件
 * @param componentPath 后端返回的组件路径，例如 "/bill/BillList"
 */
function resolveViewComponent(componentPath: string) {
  // 标准化路径: 去掉开头的 "/" 并添加 ".vue" 后缀
  let normalizedPath = componentPath
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1)
  }

  // 尝试多种路径匹配方式
  const possibleKeys = [
    `../views/${normalizedPath}.vue`,
    `../views/${normalizedPath}/index.vue`,
  ]

  for (const key of possibleKeys) {
    if (viewModules[key]) {
      return viewModules[key]
    }
  }

  // 模糊匹配：只比较组件名称
  const index = normalizedPath.lastIndexOf('/')
  const componentName = normalizedPath.substring(index + 1)
  const matchKey = Object.keys(viewModules).find((key) => {
    return key.includes(`${componentName}.vue`)
  })

  if (matchKey) {
    return viewModules[matchKey]
  }

  console.warn(`[路由] 未找到视图组件: ${componentPath}`)
  return undefined
}

/**
 * 菜单数据项接口定义
 */
export interface MenuItem {
  id: string | number
  text: string
  url: string
  component: string
  icon?: string
  route?: string
  children?: MenuItem[]
}

/**
 * 扩展的路由记录，支持 iframe 组件
 */
export interface ExtendedRouteRecord extends RouteRecordRaw {
  iframeComponent?: () => Promise<any>
}

/**
 * 生成首页路由
 * 对应原 generateIndexRouter 函数
 *
 * 所有业务路由（首页 + 菜单路由）都作为根路由 '/' 的 children，
 * 根路由使用 TabLayout 作为布局组件
 *
 * @param data 后端返回的菜单数据
 */
export function generateIndexRouter(data: MenuItem[]): ExtendedRouteRecord[] {
  const childRoutes = generateChildRouters(data)

  // 首页路由使用 TabLayout 作为根布局组件
  // 所有业务路由（首页 + 菜单路由）都作为根路由的 children
  const indexRoute: ExtendedRouteRecord = {
    path: '/',
    name: '__root_layout__',
    component: resolveLayoutComponent('/layouts/TabLayout'),
    meta: {
      title: '首页',
      icon: 'icon-present',
      url: '/dashboard/analysis',
    },
    redirect: '/dashboard/analysis',
    children: [
      // 首页路由
      {
        path: '/dashboard/analysis',
        name: 'Analysis',
        component: resolveViewComponent('/dashboard/Analysis'),
        meta: {
          title: '首页',
          icon: 'icon-present',
          keepAlive: true,
        },
      },
      // 所有菜单路由
      ...childRoutes,
    ],
  }

  // 只返回根路由
  return [indexRoute]
}

/**
 * 生成嵌套路由（子路由）
 * 对应原 generateChildRouters 函数
 * @param data 后端返回的菜单项数组
 */
function generateChildRouters(data: MenuItem[]): ExtendedRouteRecord[] {
  const routers: ExtendedRouteRecord[] = []

  for (const item of data) {
    // 默认设置 route 为 "1"
    item.route = '1'

    // 根据组件路径判断是布局组件还是视图组件
    let componentResolver: (() => Promise<any>) | undefined

    // 特殊处理：如果是有子路由的父级菜单，且 component 是布局组件，则替换为 RouteView
    // 避免嵌套布局问题（根路由已经使用了 TabLayout）
    let componentPath = item.component
    if (item.children && item.children.length > 0) {
      if (componentPath.indexOf('TabLayout') > -1) {
        // console.warn(`[路由生成] 父级菜单 ${item.url} 的 component 是 TabLayout，自动替换为 RouteView`)
        componentPath = componentPath.replace('TabLayout', 'RouteView')
      } else if (componentPath.indexOf('BasicLayout') > -1) {
        // console.warn(`[路由生成] 父级菜单 ${item.url} 的 component 是 BasicLayout，自动替换为 RouteView`)
        componentPath = componentPath.replace('BasicLayout', 'RouteView')
      } else if (componentPath.indexOf('GlobalLayout') > -1) {
        // console.warn(`[路由生成] 父级菜单 ${item.url} 的 component 是 GlobalLayout，自动替换为 RouteView`)
        componentPath = componentPath.replace('GlobalLayout', 'RouteView')
      }
    }

    // 如果是布局组件（如 RouteView），则用于嵌套路由的父级
    // 如果是视图组件，则直接作为页面组件
    if (componentPath.indexOf('layouts') >= 0) {
      componentResolver = resolveLayoutComponent(componentPath) as (() => Promise<any>)
    } else {
      componentResolver = resolveViewComponent(componentPath) as (() => Promise<any>)
    }

    // URL 支持 {{ window.xxx }} 占位符变量
    let url = (item.url || '').replace(
      /\{\{([^}}]+)?}}/g,
      (_s1: string, s2: string) => {
        try {
          const keys = s2.trim().split('.')
          let result: any = window
          for (const key of keys) {
            if (key === 'window') continue
            result = result?.[key]
          }
          return String(result ?? '')
        } catch {
          return ''
        }
      }
    )
    if (isURL(url)) {
      item.url = url
    }

    // 提取组件名称
    let componentName = ''
    if (item.component) {
      const index = item.component.lastIndexOf('/')
      componentName = item.component.substring(index + 1, item.component.length)
    }

    // 构建路由菜单对象
    const menu: ExtendedRouteRecord = {
      path: item.url,
      name: item.text,
      meta: {
        id: item.id,
        title: item.text,
        icon: item.icon,
        url: item.url,
        componentName: componentName,
        internalOrExternal: true,
        keepAlive: true,
      },
    } as ExtendedRouteRecord

    // 判断是否为 IframePageView 组件
    if (item.component.indexOf('IframePageView') > -1) {
      // 给带 iframe 的页面进行改造
      menu.iframeComponent = componentResolver
    } else {
      // 只有当组件存在时才设置 component
      // 如果是布局组件（如 RouteView），需要设置 component 以支持嵌套路由
      // 如果是视图组件，直接设置为页面组件
      menu.component = componentResolver
    }

    // 递归处理子菜单
    if (item.children && item.children.length > 0) {
      menu.children = [...generateChildRouters(item.children)]
    }

    // 调试日志：打印路由信息
    // console.log('[路由生成]', {
    //   path: item.url,
    //   component: item.component,
    //   hasChildren: !!(item.children && item.children.length > 0),
    //   childrenCount: item.children?.length || 0,
    // })

    // 根据后台菜单配置，判断是否路由菜单字段，动态选择是否生成路由
    // route === '0' 表示不生成路由（为了支持参数URL菜单）
    if (item.route && item.route === '0') {
      // 不生成路由
    } else {
      routers.push(menu)
    }
  }

  return routers
}
