/**
 * Financial related API functions
 * Migrated from Vue 2 api/api.js
 *
 * Covers: accountHead (financial documents)
 */
import { getAction } from '@/api/http'

// ===================== Financial Documents =====================
export const findFinancialDetailByNumber = (params: any) => getAction('/accountHead/getDetailByNumber', params)
