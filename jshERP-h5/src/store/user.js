import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getUserBtn } from '@/api/auth'
import { get, set } from '@/utils/storage'
import {
  TOKEN_KEY,
  USER_ID_KEY,
  USER_INFO_KEY,
  BTN_ALL_KEY,
  BTN_MAP_KEY,
  BTN_LOADED_KEY,
  clearAuthStorage
} from '@/utils/auth'

const LOGIN_MSG = {
  'user is not exist': '用户不存在',
  'user password error': '用户密码不正确',
  'user is black': '用户被禁用',
  'tenant is black': '用户所属的租户被禁用',
  'tenant is expire': '试用期已结束，请联系客服续费',
  'access service error': '查询服务异常',
  'access service exception': '查询服务异常',
  'user already login': '该账号已在其他地方登录'
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: get(TOKEN_KEY) || '',
    userId: get(USER_ID_KEY) || '',
    userInfo: get(USER_INFO_KEY) || null,
    btnAll: get(BTN_ALL_KEY) === true,
    btnStrMap: get(BTN_MAP_KEY) || {},
    btnLoaded: get(BTN_LOADED_KEY) === true,
    // 本次应用启动是否已向后端校验过登录态（不持久化，刷新后重新校验）
    sessionChecked: false
  }),
  getters: {
    isLogin: (state) => !!state.token,
    displayName: (state) => {
      if (!state.userInfo) return ''
      return state.userInfo.username || state.userInfo.loginName || ''
    },
    loginName: (state) => (state.userInfo && state.userInfo.loginName) || ''
  },
  actions: {
    async login ({ loginName, password, code, uuid }) {
      const res = await loginApi({ loginName, password, code, uuid })
      const data = (res && res.data) || {}
      if (data.msgTip !== 'user can login') {
        throw new Error(LOGIN_MSG[data.msgTip] || data.message || '登录失败')
      }
      this.token = data.token || ''
      this.userId = (data.user && data.user.id) || ''
      this.userInfo = data.user || null
      set(TOKEN_KEY, this.token)
      set(USER_ID_KEY, this.userId)
      set(USER_INFO_KEY, this.userInfo)
      return data
    },
    async loadBtnPermissions () {
      const res = await getUserBtn()
      if (res && res.code === 200) {
        const userBtn = res.data && res.data.userBtn
        if (Array.isArray(userBtn)) {
          const map = {}
          userBtn.forEach((item) => {
            if (item && item.url) {
              map[item.url] = item.btnStr || ''
            }
          })
          this.btnAll = false
          this.btnStrMap = map
        } else {
          // admin 返回 data={}（无 userBtn 字段），视为拥有全部按钮权限
          this.btnAll = true
          this.btnStrMap = {}
        }
        this.btnLoaded = true
        this.sessionChecked = true
        set(BTN_ALL_KEY, this.btnAll)
        set(BTN_MAP_KEY, this.btnStrMap)
        set(BTN_LOADED_KEY, true)
      }
      return this.btnStrMap
    },
    // 按钮权限判断：code 见 26 号文档（1 编辑 / 2 审核 / 7 反审核 / 3 导出 / 4 启用禁用 / 5 打印 / 6 作废）
    hasBtn (url, code) {
      if (this.btnAll) return true
      const str = this.btnStrMap[url]
      if (!str) return false
      return String(str).split(',').indexOf(String(code)) !== -1
    },
    async logout () {
      try {
        await logoutApi()
      } catch {
        // 退出接口异常不影响本地清理
      }
      this.reset()
    },
    reset () {
      this.token = ''
      this.userId = ''
      this.userInfo = null
      this.btnAll = false
      this.btnStrMap = {}
      this.btnLoaded = false
      this.sessionChecked = false
      clearAuthStorage()
    }
  }
})
