/**
 * 必须在 main.js 最顶部 import，保证早于 @/utils/request 读取 window._CONFIG。
 * 子路径部署时在构建环境变量中设置 VUE_APP_API_BASE，例如 /erp/jshERP-boot
 */
if (typeof window !== 'undefined') {
  window._CONFIG = window._CONFIG || {}
  if (process.env.VUE_APP_API_BASE) {
    window._CONFIG['domianURL'] = process.env.VUE_APP_API_BASE
  }
}
