/**
 * Common API functions
 * Migrated from Vue 2 api/api.js
 *
 * Covers: statistics, waitBillCount, file upload/download related
 */
import { getAction, downFile, downFilePost, uploadAction, getFileAccessHttpUrl } from '@/api/http'

// ===================== Dashboard Statistics =====================
export const getBuyAndSaleStatistics = (params?: any) => getAction('/depotHead/getBuyAndSaleStatistics', params)
export const buyOrSalePrice = (params?: any) => getAction('/depotItem/buyOrSalePrice', params)

// ===================== Pending Bill Count =====================
export const waitBillCount = (params?: any) => getAction('/depotHead/waitBillCount', params)

// ===================== Re-export file utility functions =====================
export {
  downFile,
  downFilePost,
  uploadAction,
  getFileAccessHttpUrl
}
