/**
 * Bill/Document related API functions
 * Migrated from Vue 2 api/api.js
 *
 * Covers: depotHead, depotItem related
 */
import { getAction, postAction } from '@/api/http'

// ===================== Bill (DepotHead) =====================
export const findBillDetailByNumber = (params: any) => getAction('/depotHead/getDetailByNumber', params)
export const getNeedCount = (params: any) => getAction('/depotHead/getNeedCount', params)
export const batchAddDepotHeadAndDetail = (params: any) => postAction('/depotHead/batchAddDepotHeadAndDetail', params)

// ===================== Bill Items (DepotItem) =====================
export const findStockByDepotAndBarCode = (params: any) => getAction('/depotItem/findStockByDepotAndBarCode', params)
export const getBatchNumberList = (params: any) => getAction('/depotItem/getBatchNumberList', params)
