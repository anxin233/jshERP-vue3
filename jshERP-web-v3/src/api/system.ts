/**
 * System management API functions
 * Migrated from Vue 2 api/api.js
 *
 * Covers: user, role, function, organization, person, account, depot,
 *         supplier, unit, inOutItem, systemConfig, platformConfig,
 *         tenant, userBusiness
 */
import { getAction, postAction, putAction } from '@/api/http'

// ===================== Tenant Management =====================
export const checkTenant = (params: any) => getAction('/tenant/checkIsNameExist', params)
export const addTenant = (params: any) => postAction('/tenant/add', params)
export const editTenant = (params: any) => putAction('/tenant/update', params)

// ===================== Role Management =====================
export const addRole = (params: any) => postAction('/role/add', params)
export const editRole = (params: any) => putAction('/role/update', params)
export const checkRole = (params: any) => getAction('/role/checkIsNameExist', params)
export const roleAllList = (params: any) => getAction('/role/allList', params)
export const getTenantRoleList = (params: any) => getAction('/role/tenantRoleList', params)

// ===================== User Management =====================
export const registerUser = (params: any) => postAction('/user/registerUser', params)
export const addUser = (params: any) => postAction('/user/addUser', params)
export const editUser = (params: any) => putAction('/user/updateUser', params)
export const getUserList = (params: any) => getAction('/user/getUserList', params)
export const getUserBtnByCurrentUser = (params?: any) => getAction('/user/getUserBtnByCurrentUser', params)
export const queryPermissionsByUser = (params: any) => postAction('/function/findMenuByPNumber', params)
export const resetPwd = (params: any) => postAction('/user/resetPwd', params)

// ===================== Organization Management =====================
export const queryOrganizationTreeList = (params?: any) => getAction('/organization/getOrganizationTree', params)
export const getAllOrganizationTreeByUser = (params?: any) => getAction('/organization/getAllOrganizationTreeByUser', params)
export const queryOrganizationById = (params: any) => getAction('/organization/findById', params)
export const checkOrganization = (params: any) => getAction('/organization/checkIsNameExist', params)

// ===================== Person Management =====================
export const addPerson = (params: any) => postAction('/person/add', params)
export const editPerson = (params: any) => putAction('/person/update', params)
export const checkPerson = (params: any) => getAction('/person/checkIsNameExist', params)
export const getPersonByType = (params: any) => getAction('/person/getPersonByType', params)
export const getPersonByNumType = (params: any) => getAction('/person/getPersonByNumType', params)

// ===================== Account Management =====================
export const addAccount = (params: any) => postAction('/account/add', params)
export const editAccount = (params: any) => putAction('/account/update', params)
export const checkAccount = (params: any) => getAction('/account/checkIsNameExist', params)
export const getAccount = (params: any) => getAction('/account/getAccount', params)

// ===================== InOutItem (Revenue/Expenditure Items) =====================
export const addInOutItem = (params: any) => postAction('/inOutItem/add', params)
export const editInOutItem = (params: any) => putAction('/inOutItem/update', params)
export const checkInOutItem = (params: any) => getAction('/inOutItem/checkIsNameExist', params)
export const findInOutItemByParam = (params: any) => getAction('/inOutItem/findBySelect', params)

// ===================== Depot (Warehouse) Management =====================
export const addDepot = (params: any) => postAction('/depot/add', params)
export const editDepot = (params: any) => putAction('/depot/update', params)
export const checkDepot = (params: any) => getAction('/depot/checkIsNameExist', params)
export const findUserDepot = (params: any) => getAction('/depot/findUserDepot', params)

// ===================== Supplier/Customer/Member =====================
export const addSupplier = (params: any) => postAction('/supplier/add', params)
export const editSupplier = (params: any) => putAction('/supplier/update', params)
export const checkSupplier = (params: any) => getAction('/supplier/checkIsNameAndTypeExist', params)
export const findBySelectSup = (params: any) => postAction('/supplier/findBySelect_sup', params)
export const findBySelectCus = (params: any) => postAction('/supplier/findBySelect_cus', params)
export const findBySelectRetail = (params: any) => postAction('/supplier/findBySelect_retail', params)
export const findBySelectOrgan = (params: any) => postAction('/supplier/findBySelect_organ', params)
export const getAllCustomer = (params?: any) => getAction('/supplier/getAllCustomer', params)
export const getUserCustomerValue = (params: any) => getAction('/supplier/getUserCustomerValue', params)

// ===================== Unit Management =====================
export const addUnit = (params: any) => postAction('/unit/add', params)
export const editUnit = (params: any) => putAction('/unit/update', params)
export const checkUnit = (params: any) => getAction('/unit/checkIsNameExist', params)

// ===================== Function Management =====================
export const addFunction = (params: any) => postAction('/function/add', params)
export const editFunction = (params: any) => putAction('/function/update', params)
export const checkFunction = (params: any) => getAction('/function/checkIsNameExist', params)
export const checkNumber = (params: any) => getAction('/function/checkIsNumberExist', params)

// ===================== System Config =====================
export const addSystemConfig = (params: any) => postAction('/systemConfig/add', params)
export const editSystemConfig = (params: any) => putAction('/systemConfig/update', params)
export const checkSystemConfig = (params: any) => getAction('/systemConfig/checkIsNameExist', params)
export const getCurrentSystemConfig = (params?: any) => getAction('/systemConfig/getCurrentInfo', params)
export const fileSizeLimit = (params?: any) => getAction('/systemConfig/fileSizeLimit', params)

// ===================== Platform Config =====================
export const addPlatformConfig = (params: any) => postAction('/platformConfig/add', params)
export const editPlatformConfig = (params: any) => putAction('/platformConfig/update', params)
export const getPlatformConfigByKey = (params: any) => getAction('/platformConfig/getInfoByKey', params)

// ===================== User Business (User|Role|Module Relations) =====================
export const addUserBusiness = (params: any) => postAction('/userBusiness/add', params)
export const editUserBusiness = (params: any) => putAction('/userBusiness/update', params)
export const checkUserBusiness = (params: any) => getAction('/userBusiness/checkIsValueExist', params)
export const updateBtnStrByRoleId = (params: any) => postAction('/userBusiness/updateBtnStr', params)
export const updateOneValueByKeyIdAndType = (params: any) => postAction('/userBusiness/updateOneValueByKeyIdAndType', params)
