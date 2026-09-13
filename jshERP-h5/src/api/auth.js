import request from './request'

export function login (data) {
  return request.post('/user/login', data)
}

export function getCaptcha () {
  return request.get('/user/randomImage')
}

export function logout () {
  return request.get('/user/logout')
}

export function updatePwd (data) {
  return request.put('/user/updatePwd', data)
}

export function getUserBtn () {
  return request.get('/user/getUserBtnByCurrentUser')
}

export function getCheckcodeFlag () {
  return request.get('/platformConfig/getPlatform/checkcodeFlag')
}

export function getAppVersion () {
  return request.get('/platformConfig/getPlatform/appVersion')
}
