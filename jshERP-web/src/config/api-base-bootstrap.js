/**
 * Must be imported before request utilities read window._CONFIG.
 * For sub-path deployment, set VITE_APP_API_BASE, for example /erp/jshERP-boot.
 */
if (typeof window !== 'undefined') {
  window._CONFIG = window._CONFIG || {}
  const apiBase = import.meta.env.VITE_APP_API_BASE
  if (apiBase) {
    window._CONFIG['domianURL'] = apiBase
  }
}
