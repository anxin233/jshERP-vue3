/**
 * User Store - user authentication and info
 * Migrated from Vue 2 store/modules/user.js
 * Uses Pinia Composition API style
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { queryPermissionsByUser, getUserBtnByCurrentUser } from '@/api/system'
import { getStore, setStore, clearStore } from '@/utils/storage'
import { getToken, setToken, removeToken } from '@/utils/auth'

// Storage keys (matching original mutation-types.js)
const USER_ID = 'Login_userId'
const USER_LOGIN_NAME = 'Login_loginName'
const USER_NAME = 'Login_Username'
const USER_INFO = 'Login_Userinfo'
const UI_CACHE_DB_DICT_DATA = 'UI_CACHE_DB_DICT_DATA'
const CACHE_INCLUDED_ROUTES = 'CACHE_INCLUDED_ROUTES'

// 7 days in seconds
const TOKEN_EXPIRE = 7 * 24 * 60 * 60

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>('')
  const username = ref<string>('')
  const realname = ref<string>('')
  const avatar = ref<string>('')
  const permissionList = ref<any[]>([])
  const info = ref<any>({})

  /**
   * Login action
   * Migrated from Vue 2 Login action
   */
  async function login(userInfo: any): Promise<any> {
    const response = await loginApi(userInfo)
    if (response.code === 200) {
      if (response.data.msgTip === 'user can login') {
        const result = response.data
        setStore(USER_ID, result.user.id, TOKEN_EXPIRE)
        setStore(USER_LOGIN_NAME, result.user.loginName, TOKEN_EXPIRE)
        // Frontend 7-day validity, backend default 1-day, auto-renews within the day until 7 days
        setToken(result.token, TOKEN_EXPIRE)
        setStore(USER_INFO, result.user, TOKEN_EXPIRE)
        token.value = result.token
      }
      info.value = userInfo
    }
    return response
  }

  /**
   * Get user permission list (menu data)
   * Migrated from Vue 2 GetPermissionList action
   */
  async function getPermissionList(): Promise<any> {
    const userId = getStore(USER_ID)
    const params = { pNumber: 0, userId: userId }
    const response = await queryPermissionsByUser(params)
    const menuData = response
    if (menuData === null || menuData === '' || menuData === undefined) {
      throw new Error('getPermissionList: permissions must be a non-null array !')
    }
    permissionList.value = menuData
    return response
  }

  /**
   * Get user button permissions
   * Migrated from Vue 2 GetUserBtnList action
   */
  async function getUserBtnList(): Promise<any> {
    return await getUserBtnByCurrentUser()
  }

  /**
   * Logout action
   * Migrated from Vue 2 Logout action
   */
  async function logout(): Promise<void> {
    token.value = ''
    permissionList.value = []
    clearStore(USER_ID)
    clearStore(USER_LOGIN_NAME)
    clearStore(USER_INFO)
    clearStore(UI_CACHE_DB_DICT_DATA)
    clearStore(CACHE_INCLUDED_ROUTES)
    removeToken()
    try {
      await logoutApi()
    } catch {
      // ignore logout API error
    }
  }

  /**
   * Restore state from storage
   */
  function initFromStorage() {
    const storedToken = getToken()
    if (storedToken) {
      token.value = storedToken
    }
    const storedUserInfo = getStore(USER_INFO)
    if (storedUserInfo) {
      info.value = storedUserInfo
      if (storedUserInfo.username) {
        username.value = storedUserInfo.username
      }
      if (storedUserInfo.loginName) {
        username.value = storedUserInfo.loginName
      }
      if (storedUserInfo.realname) {
        realname.value = storedUserInfo.realname
      }
      if (storedUserInfo.avatar) {
        avatar.value = storedUserInfo.avatar
      }
    }
  }

  return {
    // State
    token,
    username,
    realname,
    avatar,
    permissionList,
    info,

    // Actions
    login,
    getPermissionList,
    getUserBtnList,
    logout,
    initFromStorage
  }
})
