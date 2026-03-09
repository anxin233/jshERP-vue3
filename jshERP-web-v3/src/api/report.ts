/**
 * Report related API functions
 * Migrated from Vue 2 report views
 *
 * Covers: AccountReport, BuyInReport, SaleOutReport, RetailOutReport,
 *         InOutStockReport, StockWarningReport, and report sub-modules
 *         (AccountInOutList, DebtAccountList, HistoryFinancialList,
 *          MaterialDepotStockList, MaterialDepotStockListWithTime,
 *          MaterialInOutList)
 */
import { getAction } from '@/api/http'

// ===================== Account Report (AccountReport) =====================
/** List accounts with balance info */
export const getAccountListWithBalance = (params: any) => getAction('/account/listWithBalance', params)
/** Get account statistics (allMonthAmount, allCurrentAmount) */
export const getAccountStatistics = (params?: any) => getAction('/account/getStatistics', params)
/** Find account in/out list (AccountInOutList module) */
export const findAccountInOutList = (params: any) => getAction('/account/findAccountInOutList', params)

// ===================== Purchase Report (BuyInReport) =====================
/** Purchase statistics (depotItem/buyIn) */
export const getBuyInReport = (params: any) => getAction('/depotItem/buyIn', params)

// ===================== Sale Report (SaleOutReport) =====================
/** Sale statistics (depotItem/saleOut) */
export const getSaleOutReport = (params: any) => getAction('/depotItem/saleOut', params)

// ===================== Retail Report (RetailOutReport) =====================
/** Retail statistics (depotItem/retailOut) */
export const getRetailOutReport = (params: any) => getAction('/depotItem/retailOut', params)

// ===================== In/Out Stock Report (InOutStockReport) =====================
/** In/Out stock statistics */
export const getInOutStock = (params: any) => getAction('/depotItem/getInOutStock', params)
/** In/Out stock total count money */
export const getInOutStockCountMoney = (params: any) => getAction('/depotItem/getInOutStockCountMoney', params)

// ===================== Stock Warning Report (StockWarningReport) =====================
/** Stock warning count */
export const findStockWarningCount = (params: any) => getAction('/depotItem/findStockWarningCount', params)

// ===================== Material Depot Stock (report modules) =====================
/** Get material depot stock distribution */
export const getMaterialDepotStock = (params: any) => getAction('/material/getMaterialDepotStock', params)
/** Get material depot stock by param (with time range) */
export const getMaterialDepotStockByParam = (params: any) => getAction('/depotItem/getMaterialDepotStockByParam', params)

// ===================== Material In/Out Detail (MaterialInOutList module) =====================
/** Find detail by depot IDs and material ID */
export const findDetailByDepotIdsAndMaterialId = (params: any) => getAction('/depotItem/findDetailByDepotIdsAndMaterialId', params)

// ===================== Depot (used across report views) =====================
/** Find depots by current user */
export const findDepotByCurrentUser = (params?: any) => getAction('/depot/findDepotByCurrentUser', params)

// ===================== Debt Report (DebtAccountList module) =====================
/** Get debt list */
export const getDebtList = (params: any) => getAction('/depotHead/debtList', params)
/** Export debt list */
export const exportDebtList = (params: any) => getAction('/depotHead/debtExport', params)

// ===================== Financial History (HistoryFinancialList module) =====================
/** Get account head list (financial records) */
export const getAccountHeadList = (params: any) => getAction('/accountHead/list', params)

// ===================== Material Stock (MaterialStock) =====================
/** Get material list with stock info */
export const getListWithStock = (params: any) => getAction('/material/getListWithStock', params)

// ===================== Allocation Detail (AllocationDetail) =====================
/** Find allocation detail list */
export const findAllocationDetail = (params: any) => getAction('/depotHead/findAllocationDetail', params)
