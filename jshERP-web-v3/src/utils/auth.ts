/**
 * Token 管理 - 从 Vue 2 utils/auth.js 迁移
 * 使用 storage 工具替代 Vue-ls
 */

import { getStore, setStore, clearStore } from '@/utils/storage'
import { ACCESS_TOKEN } from '@/utils/constants'

/** Token 存储的 key */
export const TokenKey = ACCESS_TOKEN

/** 默认过期时间：7天（秒） */
const DEFAULT_TOKEN_EXPIRE = 7 * 24 * 60 * 60

/**
 * 获取 Token
 * @returns Token 字符串或 null
 */
export function getToken(): string | null {
  return getStore<string>(TokenKey)
}

/**
 * 设置 Token
 * @param token Token 字符串
 * @param expire 可选，过期时间（秒），默认 7 天
 */
export function setToken(token: string, expire?: number): void {
  setStore(TokenKey, token, expire ?? DEFAULT_TOKEN_EXPIRE)
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  clearStore(TokenKey)
}
