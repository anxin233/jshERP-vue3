/**
 * Material related API functions
 * Migrated from Vue 2 api/api.js
 *
 * Covers: material, materialProperty, materialCategory,
 *         serialNumber, materialAttribute
 */
import { getAction, postAction, putAction } from '@/api/http'

// ===================== Material Property =====================
export const addOrUpdateMaterialProperty = (params: any) => postAction('/materialProperty/addOrUpdate', params)

// ===================== Material Category =====================
export const queryMaterialCategoryTreeList = (params?: any) => getAction('/materialCategory/getMaterialCategoryTree', params)
export const queryMaterialCategoryById = (params: any) => getAction('/materialCategory/findById', params)
export const checkMaterialCategory = (params: any) => getAction('/materialCategory/checkIsNameExist', params)

// ===================== Material Management =====================
export const addMaterial = (params: any) => postAction('/material/add', params)
export const editMaterial = (params: any) => putAction('/material/update', params)
export const checkMaterial = (params: any) => getAction('/material/checkIsExist', params)
export const getMaterialBySelect = (params: any) => getAction('/material/findBySelect', params)
export const getSerialMaterialBySelect = (params: any) => getAction('/material/getMaterialEnableSerialNumberList', params)
export const getMaterialByParam = (params: any) => getAction('/material/getMaterialByParam', params)
export const getMaterialByBarCode = (params: any) => getAction('/material/getMaterialByBarCode', params)
export const getMaxBarCode = (params?: any) => getAction('/material/getMaxBarCode', params)
export const checkMaterialBarCode = (params: any) => getAction('/materialsExtend/checkIsBarCodeExist', params)
export const batchUpdateMaterial = (params: any) => postAction('/material/batchUpdate', params)
export const changeNameToPinYin = (params: any) => postAction('/material/changeNameToPinYin', params)

// ===================== Serial Number =====================
export const batAddSerialNumber = (params: any) => postAction('/serialNumber/batAddSerialNumber', params)
export const getEnableSerialNumberList = (params: any) => postAction('/serialNumber/getEnableSerialNumberList', params)

// ===================== Material Attribute =====================
export const addMaterialAttribute = (params: any) => postAction('/materialAttribute/add', params)
export const editMaterialAttribute = (params: any) => putAction('/materialAttribute/update', params)
export const checkMaterialAttribute = (params: any) => getAction('/materialAttribute/checkIsNameExist', params)
export const getMaterialAttributeNameList = (params?: any) => getAction('/materialAttribute/getNameList', params)
export const getMaterialAttributeValueListById = (params: any) => getAction('/materialAttribute/getValueListById', params)
