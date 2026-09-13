import { get, set, remove } from './storage'

export const TOKEN_KEY = 'token'
export const USER_ID_KEY = 'userId'
export const USER_INFO_KEY = 'userInfo'
export const BTN_ALL_KEY = 'btnAll'
export const BTN_MAP_KEY = 'btnStrMap'
export const BTN_LOADED_KEY = 'btnLoaded'
export const LAST_LOGIN_NAME_KEY = 'lastLoginName'

export function getToken () {
  return get(TOKEN_KEY) || ''
}

export function setToken (token) {
  set(TOKEN_KEY, token || '')
}

export function clearAuthStorage () {
  ;[TOKEN_KEY, USER_ID_KEY, USER_INFO_KEY, BTN_ALL_KEY, BTN_MAP_KEY, BTN_LOADED_KEY].forEach(remove)
}
