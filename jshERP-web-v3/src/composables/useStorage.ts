import { getStore, setStore, clearStore } from '@/utils/storage'

/**
 * 存储 composable
 * 对 @/utils/storage 的封装，提供统一的存储操作接口
 *
 * storage 工具内部已处理 'pro__' 命名空间前缀，
 * 与原 Vue 2 项目中 Vue.ls 的行为保持一致
 *
 * 使用方式:
 * ```ts
 * const { get, set, remove } = useStorage()
 * set('key', 'value', 7 * 24 * 60 * 60) // 7天过期（秒）
 * const value = get('key')
 * remove('key')
 * ```
 */
export function useStorage() {
  /**
   * 获取存储值
   * @param key 存储键名（不含命名空间前缀）
   * @returns 存储的值，如果过期或不存在则返回 undefined
   */
  function get<T = any>(key: string): T | undefined {
    return getStore(key)
  }

  /**
   * 设置存储值
   * @param key 存储键名（不含命名空间前缀）
   * @param value 存储值
   * @param maxAge 过期时间(秒)，可选
   */
  function set(key: string, value: any, maxAge?: number | null): void {
    setStore(key, value, maxAge ?? null)
  }

  /**
   * 移除存储值
   * @param key 存储键名（不含命名空间前缀）
   */
  function remove(key: string): void {
    clearStore(key)
  }

  return {
    get,
    set,
    remove,
  }
}
