/**
 * 权限 composable
 * 对应原 Vue 2 项目:
 * - utils/hasPermission.js (filterGlobalPermission)
 * - utils/authFilter.js (disabledAuthFilter, colAuthFilter 等)
 *
 * 提供组合式 API 形式的权限检查方法
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
  isAuth?: boolean // 用户是否拥有此权限
}

export function usePermission() {
  /**
   * 检查用户是否拥有指定权限（显示/隐藏类型）
   * 对应原 filterGlobalPermission 中的逻辑
   *
   * @param action 权限标识
   * @returns true 表示有权限，false 表示无权限
   */
  function hasPermission(action: string): boolean {
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
        if (action === itemG.action) {
          if (itemG.status === '0') {
            invalidFlag = true
            break
          }
        }
      }
    }

    // 无效命中，视为有权限（不做控制）
    if (invalidFlag) {
      return true
    }

    // 用户没有任何权限，视为无权限
    if (!permissionList || permissionList.length <= 0) {
      return false
    }

    // 检查用户是否拥有该权限
    const permissions: string[] = permissionList
      .filter((item) => item.type !== '2')
      .map((item) => item.action)

    return permissions.includes(action)
  }

  /**
   * 检查按钮禁用权限
   * 对应原 authFilter.js 中的 disabledAuthFilter
   *
   * @param code 权限标识
   * @param formData 表单数据（含流程节点权限）
   * @returns true 表示需要禁用，false 表示不需要禁用
   */
  function checkBtnPermission(
    code: string,
    formData?: { permissionList?: AuthItem[] }
  ): boolean {
    // 先检查节点权限
    if (nodeDisabledAuth(code, formData)) {
      return true
    }
    // 再检查全局权限
    return globalDisabledAuth(code)
  }

  /**
   * 流程节点禁用权限检查
   */
  function nodeDisabledAuth(
    code: string,
    formData?: { permissionList?: AuthItem[] }
  ): boolean {
    let permissionList: AuthItem[] = []

    try {
      if (formData) {
        const bpmList: AuthItem[] = formData.permissionList || []
        permissionList = bpmList.filter((item) => item.type === '2')
      } else {
        return false
      }
    } catch {
      return false
    }

    if (permissionList.length === 0) {
      return false
    }

    const permissions: string[] = permissionList
      .filter((item) => item.type === '2')
      .map((item) => item.action)

    if (!permissions.includes(code)) {
      return false
    } else {
      for (const item of permissionList) {
        if (code === item.action) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 全局禁用权限检查
   * 对应原 authFilter.js 中的 globalDisabledAuth
   */
  function globalDisabledAuth(code: string): boolean {
    const permissionList: AuthItem[] = []
    const allPermissionList: AuthItem[] = []

    // 从 sessionStorage 获取用户权限列表
    const authList: AuthItem[] = JSON.parse(
      sessionStorage.getItem(USER_AUTH) || '[]'
    )
    for (const auth of authList) {
      if (auth.type === '2') {
        permissionList.push(auth)
      }
    }

    // 从 sessionStorage 获取系统全局按钮权限列表
    const allAuthList: AuthItem[] = JSON.parse(
      sessionStorage.getItem(SYS_BUTTON_AUTH) || '[]'
    )
    for (const gauth of allAuthList) {
      if (gauth.type === '2') {
        allPermissionList.push(gauth)
      }
    }

    // 检查全局配置是否有命中
    let gFlag = false // 禁用命中
    let invalidFlag = false // 无效命中
    if (allPermissionList.length > 0) {
      for (const itemG of allPermissionList) {
        if (code === itemG.action) {
          if (itemG.status === '0') {
            invalidFlag = true
            break
          } else {
            gFlag = true
            break
          }
        }
      }
    }

    // 无效命中，不禁用
    if (invalidFlag) {
      return false
    }

    // 用户没有任何禁用权限
    if (!permissionList || permissionList.length <= 0) {
      return gFlag
    }

    const permissions: string[] = permissionList
      .filter((item) => item.type === '2')
      .map((item) => item.action)

    if (!permissions.includes(code)) {
      return gFlag
    } else {
      for (const item of permissionList) {
        if (code === item.action) {
          // 全局页面权限解除禁用
          gFlag = false
        }
      }
      return gFlag
    }
  }

  /**
   * 列权限过滤
   * 对应原 authFilter.js 中的 colAuthFilter
   * 根据权限配置过滤表格列
   *
   * @param columns 表格列配置
   * @param pre 授权码前缀
   * @returns 过滤后的列配置
   */
  function filterColumns<T extends { dataIndex?: string }>(
    columns: T[],
    pre: string
  ): T[] {
    const noAuthCols = getNoAuthCols(pre)
    return columns.filter((item) => {
      return !noAuthCols.includes(item.dataIndex || '')
    })
  }

  /**
   * 获取未授权的列信息
   * 对应原 authFilter.js 中的 getNoAuthCols
   */
  function getNoAuthCols(pre: string): string[] {
    const permissionList: string[] = []
    const allPermissionList: string[] = []

    const authList: AuthItem[] = JSON.parse(
      sessionStorage.getItem(USER_AUTH) || '[]'
    )
    for (const auth of authList) {
      if (auth.type === '1' && auth.action.startsWith(pre)) {
        permissionList.push(auth.action.substring(pre.length))
      }
    }

    const allAuthList: AuthItem[] = JSON.parse(
      sessionStorage.getItem(SYS_BUTTON_AUTH) || '[]'
    )
    for (const gauth of allAuthList) {
      if (
        gauth.type === '1' &&
        gauth.status === '1' &&
        gauth.action.startsWith(pre)
      ) {
        allPermissionList.push(gauth.action.substring(pre.length))
      }
    }

    // 过滤出用户未授权的列
    return allPermissionList.filter((item) => !permissionList.includes(item))
  }

  return {
    hasPermission,
    checkBtnPermission,
    filterColumns,
  }
}
