import request from './request'

// 会员（返回 advanceIn 预付款余额）
export function findBySelectRetail (key = '', limit = 50) {
  return request.post('/supplier/findBySelect_retail', { key, limit })
}

// 客户
export function findBySelectCus (key = '', limit = 50) {
  return request.post('/supplier/findBySelect_cus', { key, limit })
}

// 供应商
export function findBySelectSup (key = '', limit = 50) {
  return request.post('/supplier/findBySelect_sup', { key, limit })
}

// 会员详情（含 advanceIn）
export function getSupplierInfo (id) {
  return request.get('/supplier/info', { params: { id } })
}
