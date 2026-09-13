import axios from 'axios'
import { showToast } from 'vant'
import { getToken, clearAuthStorage } from '@/utils/auth'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE || '/jshERP-boot',
  timeout: 60000
})

service.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['X-Access-Token'] = token
  }
  return config
})

let loginOutHandling = false

function handleLoginOut () {
  if (loginOutHandling) return
  loginOutHandling = true
  clearAuthStorage()
  showToast('登录已过期，请重新登录')
  // 由 main.js 监听事件完成 store 重置与路由跳转，避免循环依赖
  window.dispatchEvent(new CustomEvent('jsh:login-out'))
  setTimeout(() => {
    loginOutHandling = false
  }, 1000)
}

function resolveErrorMessage (data, fallback) {
  if (!data) return fallback
  if (typeof data === 'string') return data
  return data.message || data.msg || fallback
}

service.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && !Array.isArray(body) && 'code' in body) {
      if (body.code === 200) {
        return body
      }
      const message = resolveErrorMessage(body.data, '操作失败')
      showToast(message)
      return Promise.reject(new Error(message))
    }
    return body
  },
  (error) => {
    const response = error.response
    if (response && response.status === 500 && response.data === 'loginOut') {
      handleLoginOut()
      return Promise.reject(error)
    }
    let message = '网络异常，请稍后重试'
    if (response) {
      if (response.status === 403) {
        message = '没有操作权限'
      } else if (response.status === 404) {
        message = '请求地址不存在'
      } else if (response.status >= 500) {
        message = '服务异常，请稍后重试'
      } else if (response.status === 400) {
        message = '请求参数有误'
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请检查网络后重试'
    }
    showToast(message)
    return Promise.reject(error)
  }
)

export default service
