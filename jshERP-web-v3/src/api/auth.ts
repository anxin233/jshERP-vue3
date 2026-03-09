/**
 * Auth API - login/logout/randomImage
 * Migrated from Vue 2 api/login.js
 */
import { postAction, getAction } from '@/api/http'

/**
 * Login
 * @param parameter - { loginName, password }
 */
export function login(parameter: any): Promise<any> {
  return postAction('/user/login', parameter)
}

/**
 * Logout
 */
export function logout(): Promise<any> {
  return getAction('/user/logout')
}

/**
 * Get random image captcha
 * @param key - captcha key
 */
export function randomImage(): Promise<any> {
  return getAction('/user/randomImage')
}
