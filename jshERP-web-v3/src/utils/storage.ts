/**
 * localStorage 封装，带过期时间支持
 * 从 Vue 2 utils/storage.js 迁移，替代 Vue-ls
 * 使用命名空间前缀 'pro__' 以兼容原有 Vue-ls 配置
 *
 * 过期时间单位：秒（与原项目 Vue-ls 保持一致）
 */

const NAMESPACE = 'pro__'
const EXPIRE_SUFFIX = '_expire'

/**
 * 获取带命名空间的 key
 */
function getNamespacedKey(key: string): string {
  return `${NAMESPACE}${key}`
}

/**
 * 从 localStorage 中获取值
 * @param key 存储的 key
 * @returns 解析后的值，过期或不存在返回 null
 */
export function getStore<T = any>(key: string): T | null {
  if (!key) {
    return null
  }

  const namespacedKey = getNamespacedKey(key)
  const content = window.localStorage.getItem(namespacedKey)
  const expireStr = window.localStorage.getItem(`${namespacedKey}${EXPIRE_SUFFIX}`)

  if (content === null) {
    return null
  }

  // 检查是否过期
  if (expireStr) {
    const now = Date.now()
    const expireTime = parseInt(expireStr, 10)
    if (now > expireTime) {
      // 已过期，清除并返回 null
      clearStore(key)
      return null
    }
  }

  try {
    return JSON.parse(content) as T
  } catch {
    return content as unknown as T
  }
}

/**
 * 向 localStorage 中存储值
 * @param key 存储的 key
 * @param value 要存储的值
 * @param expire 可选，过期时间（秒）
 */
export function setStore(key: string, value: any, expire?: number): void {
  if (!key) {
    return
  }

  const namespacedKey = getNamespacedKey(key)
  const content = typeof value === 'string' ? value : JSON.stringify(value)

  window.localStorage.setItem(namespacedKey, content)

  if (expire && !isNaN(expire)) {
    // expire 是秒，转换为毫秒时间戳
    const expireTime = Date.now() + expire * 1000
    window.localStorage.setItem(`${namespacedKey}${EXPIRE_SUFFIX}`, String(expireTime))
  }
}

/**
 * 从 localStorage 中移除指定 key
 * @param key 要移除的 key
 */
export function clearStore(key: string): void {
  if (!key) {
    return
  }

  const namespacedKey = getNamespacedKey(key)
  window.localStorage.removeItem(namespacedKey)
  window.localStorage.removeItem(`${namespacedKey}${EXPIRE_SUFFIX}`)
}

/**
 * 清除所有 localStorage 数据
 */
export function clearAll(): void {
  window.localStorage.clear()
}

export default {
  getStore,
  setStore,
  clearStore,
  clearAll,
}
