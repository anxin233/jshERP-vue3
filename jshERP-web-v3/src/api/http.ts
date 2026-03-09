/**
 * Axios HTTP client with interceptors
 * Migrated from Vue 2 utils/request.js and api/manage.js
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'

/**
 * baseURL configuration
 * Uses VITE_API_BASE_URL from env or defaults to '/jshERP-boot'
 */
const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL || '/jshERP-boot'

// Create axios instance
const service: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 300000
})

// Request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers['X-Access-Token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const data = error.response.data
      const token = getToken()
      switch (error.response.status) {
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 500:
          if (token && data === 'loginOut') {
            ElMessageBox.confirm('很抱歉，登录已过期，请重新登录', '登录已过期', {
              confirmButtonText: '重新登录',
              showCancelButton: false,
              showClose: false,
              type: 'error'
            }).then(() => {
              removeToken()
              window.location.reload()
            })
          }
          break
        case 404:
          ElMessage.error('很抱歉，资源未找到!')
          break
        case 504:
          ElMessage.error('网络超时')
          break
        case 401:
          ElMessage.error('未授权，请重新登录')
          if (token) {
            removeToken()
            setTimeout(() => {
              router.push('/user/login')
            }, 1500)
          }
          break
        default:
          ElMessage.error(data.message || '系统错误')
          break
      }
    }
    return Promise.reject(error)
  }
)

// ===================== Exported API Functions =====================
// Same signatures as original manage.js

/**
 * GET request
 */
export function getAction(url: string, params?: any): Promise<any> {
  return service({
    url: url,
    method: 'get',
    params: params
  })
}

/**
 * POST request
 */
export function postAction(url: string, data?: any): Promise<any> {
  return service({
    url: url,
    method: 'post',
    data: data
  })
}

/**
 * PUT request
 */
export function putAction(url: string, data?: any): Promise<any> {
  return service({
    url: url,
    method: 'put',
    data: data
  })
}

/**
 * DELETE request
 */
export function deleteAction(url: string, params?: any): Promise<any> {
  return service({
    url: url,
    method: 'delete',
    params: params
  })
}

/**
 * HTTP request with custom method (post | put)
 */
export function httpAction(url: string, data: any, method: string): Promise<any> {
  return service({
    url: url,
    method: method as AxiosRequestConfig['method'],
    data: data
  })
}

/**
 * File upload (multipart/form-data)
 */
export function uploadAction(url: string, data: any): Promise<any> {
  return service({
    url: url,
    data: data,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * File download via GET (for excel export etc.)
 */
export function downFile(url: string, params?: any): Promise<any> {
  return service({
    url: url,
    params: params,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * File download via POST (for excel export etc.)
 * Overloaded: can be called with just data (uses default export URL) or with url + data
 */
export function downFilePost(urlOrData: string | any, data?: any): Promise<any> {
  // 兼容原始调用方式：downFilePost(paramObj)
  if (typeof urlOrData !== 'string') {
    return service({
      url: '/systemConfig/exportExcelByParam',
      data: urlOrData,
      method: 'post',
      responseType: 'blob'
    })
  }
  return service({
    url: urlOrData,
    data: data,
    method: 'post',
    responseType: 'blob'
  })
}

/**
 * Get file access HTTP URL
 */
export function getFileAccessHttpUrl(avatar: string, subStr?: string): string {
  if (!subStr) subStr = 'http'
  if (avatar && avatar.startsWith(subStr)) {
    return avatar
  } else {
    if (avatar && avatar.length > 0 && avatar.indexOf('[') === -1) {
      return apiBaseUrl + '/' + avatar
    }
  }
  return ''
}

export { service as axios }
