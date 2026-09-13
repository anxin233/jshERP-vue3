import request from './request'

// 当前用户有权限的仓库
export function findDepotByCurrentUser () {
  return request.get('/depot/findDepotByCurrentUser')
}

// 结算账户
export function getAccount () {
  return request.get('/account/getAccount')
}

// 经手人：type 1-销售员 2-仓管员 3-财务员
export function getPersonByNumType (type) {
  return request.get('/person/getPersonByNumType', { params: { type } })
}
