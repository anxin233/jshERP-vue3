/**
 * 表单验证工具函数 - 从 Vue 2 utils/validate.js 迁移
 */

/**
 * 验证邮箱
 * @param s 待验证字符串
 * @returns 是否为合法邮箱
 */
export function isEmail(s: string): boolean {
  return /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * 验证手机号码
 * @param s 待验证字符串
 * @returns 是否为合法手机号
 */
export function isMobile(s: string): boolean {
  return /^1[0-9]{10}$/.test(s)
}

/**
 * 验证电话号码
 * @param s 待验证字符串
 * @returns 是否为合法电话号码
 */
export function isPhone(s: string): boolean {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}

/**
 * 验证 URL 地址
 * @param s 待验证字符串
 * @returns 是否为合法 URL
 */
export function isURL(s: string): boolean {
  return /^http[s]?:\/\/.*/.test(s)
}

/**
 * 验证两位小数
 * @param s 待验证字符串
 * @returns 是否为合法的两位小数
 */
export function isDecimalTwo(s: string): boolean {
  const reg = /^[0-9]+(\.[0-9]{1,2})?$/
  return reg.test(s)
}

/**
 * 验证三位小数
 * @param s 待验证字符串
 * @returns 是否为合法的三位小数
 */
export function isDecimalThree(s: string): boolean {
  const reg = /^[0-9]+(\.[0-9]{1,3})?$/
  return reg.test(s)
}

/**
 * 验证是否为纯数字（含小数）
 * @param s 待验证字符串
 * @returns 是否为数字
 */
export function isNumber(s: string): boolean {
  return /^\d+(\.\d+)?$/.test(s)
}

/**
 * 验证是否为整数
 * @param s 待验证字符串
 * @returns 是否为整数
 */
export function isInteger(s: string): boolean {
  return /^-?\d+$/.test(s)
}

/**
 * 验证身份证号码
 * @param s 待验证字符串
 * @returns 是否为合法身份证号
 */
export function isIdCard(s: string): boolean {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(s)
}

/**
 * 验证字符串是否为空
 * @param s 待验证字符串
 * @returns 是否为空
 */
export function isEmpty(s: string | null | undefined): boolean {
  return s === null || s === undefined || s.trim() === ''
}
