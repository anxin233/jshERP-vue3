import request from './request'

// 商品搜索（名称/条码/规格，分页）
export function getMaterialBySelect (params) {
  return request.get('/material/findBySelect', { params })
}

// 简单关键词联想（返回 materialStr/barCode）
export function getMaterialByParam (q) {
  return request.get('/material/getMaterialByParam', { params: { q } })
}

// 条码查询（返回 billPrice、stock、meId 等，按 prefixNo 分派价格）
export function getMaterialByBarCode (params) {
  return request.get('/material/getMaterialByBarCode', { params })
}
