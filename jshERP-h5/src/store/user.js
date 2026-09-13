import { defineStore } from 'pinia'

// P1 将补充登录、退出、按钮权限等逻辑
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userId: '',
    userInfo: null,
    btnStrMap: {}
  }),
  actions: {}
})
