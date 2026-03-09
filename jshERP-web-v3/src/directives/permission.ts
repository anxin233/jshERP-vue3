import type { Directive, DirectiveBinding } from 'vue'

/**
 * 权限指令 v-has
 * 对应原 Vue 2 项目 utils/hasPermission.js
 *
 * 使用方式: <el-button v-has="'btn:add'">新增</el-button>
 *
 * 核心逻辑:
 * 1. 先检查节点级权限（流程节点配置的权限）
 * 2. 如果节点权限未命中，再检查全局权限
 * 3. 如果全局权限中也未找到匹配项，则从 DOM 中移除元素
 */

// 存储常量 - 对应原 mutation-types.js
const USER_AUTH = 'LOGIN_USER_BUTTON_AUTH'
const SYS_BUTTON_AUTH = 'SYS_BUTTON_AUTH'

/**
 * 权限项接口
 */
interface AuthItem {
  action: string
  type: string // '1' = 显示/隐藏, '2' = 启用/禁用
  status?: string // '0' = 无效, '1' = 有效
}

/**
 * 流程节点权限控制
 * 检查组件 props 中是否有 formData.permissionList，并进行权限匹配
 */
function filterNodePermission(
  el: HTMLElement,
  binding: DirectiveBinding,
  vnode: any
): boolean {
  let permissionList: AuthItem[] = []

  try {
    // Vue 3 中通过 vnode 获取组件实例的 props
    const instance = vnode.ctx || vnode.component
    const formData = instance?.props?.formData
    if (formData) {
      const bpmList: AuthItem[] = formData.permissionList || []
      permissionList = bpmList.filter((bpm) => bpm.type !== '2')
    } else {
      return false
    }
  } catch {
    return false
  }

  if (!permissionList || permissionList.length <= 0) {
    return false
  }

  const permissions: string[] = permissionList
    .filter((item) => item.type !== '2')
    .map((item) => item.action)

  if (!permissions.includes(binding.value)) {
    return false
  } else {
    for (const item of permissionList) {
      if (binding.value === item.action) {
        return true
      }
    }
  }

  return false
}

/**
 * 全局权限控制
 * 从 sessionStorage 中获取用户权限列表和系统按钮权限列表进行匹配
 */
function filterGlobalPermission(
  el: HTMLElement,
  binding: DirectiveBinding
): void {
  const permissionList: AuthItem[] = []
  const allPermissionList: AuthItem[] = []

  // 从 sessionStorage 获取用户权限列表
  const authList: AuthItem[] = JSON.parse(
    sessionStorage.getItem(USER_AUTH) || '[]'
  )
  for (const auth of authList) {
    if (auth.type !== '2') {
      permissionList.push(auth)
    }
  }

  // 从 sessionStorage 获取系统全局按钮权限列表
  const allAuthList: AuthItem[] = JSON.parse(
    sessionStorage.getItem(SYS_BUTTON_AUTH) || '[]'
  )
  for (const gauth of allAuthList) {
    if (gauth.type !== '2') {
      allPermissionList.push(gauth)
    }
  }

  // 检查全局配置是否有命中（无效状态的权限不做控制）
  let invalidFlag = false
  if (allPermissionList.length > 0) {
    for (const itemG of allPermissionList) {
      if (binding.value === itemG.action) {
        if (itemG.status === '0') {
          invalidFlag = true
          break
        }
      }
    }
  }

  // 无效命中，不做控制
  if (invalidFlag) {
    return
  }

  // 用户没有任何权限，移除元素
  if (!permissionList || permissionList.length <= 0) {
    el.parentNode?.removeChild(el)
    return
  }

  // 检查用户是否拥有该权限
  const permissions: string[] = permissionList
    .filter((item) => item.type !== '2')
    .map((item) => item.action)

  if (!permissions.includes(binding.value)) {
    el.parentNode?.removeChild(el)
  }
}

/**
 * v-has 权限指令
 * Vue 3 自定义指令使用 mounted 钩子替代 Vue 2 的 inserted 钩子
 */
export const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding, vnode) {
    // 先检查节点权限，如果未命中则检查全局权限
    if (!filterNodePermission(el, binding, vnode)) {
      filterGlobalPermission(el, binding)
    }
  },
}
