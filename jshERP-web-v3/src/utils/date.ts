/**
 * 日期时间工具函数 - 从 Vue 2 utils/util.js 迁移
 * 使用 dayjs 替代手动日期格式化
 */

import dayjs from 'dayjs'

/**
 * 格式化日期
 * @param value 日期值（时间戳、字符串或 Date 对象）
 * @param fmt 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(value: any, fmt: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!value) return ''

  // 如果是纯数字（时间戳），直接解析
  const regPos = /^\d+(\.\d+)?$/
  if (regPos.test(String(value))) {
    return dayjs(Number(value)).format(fmt)
  }

  // 如果是字符串，尝试解析
  const parsed = dayjs(value)
  if (parsed.isValid()) {
    return parsed.format(fmt)
  }

  // 无法解析时，截取对应长度返回
  return String(value).trim().substring(0, fmt.length)
}

/**
 * 根据当前时间返回问候语
 * @returns 问候语字符串
 */
export function timeFix(): string {
  const hour = new Date().getHours()
  if (hour < 9) return '早上好'
  if (hour <= 11) return '上午好'
  if (hour <= 13) return '中午好'
  if (hour < 20) return '下午好'
  return '晚上好'
}

/**
 * 获取当前日期，格式 "YYYY-MM-DD"
 * @returns 格式化后的日期字符串
 */
export function getNowFormatDate(): string {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * 获取当前日期时间，格式 "YYYY-MM-DD HH:mm:ss"
 * @returns 格式化后的日期时间字符串
 */
export function getNowFormatDateTime(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取当前日期时间紧凑格式，格式 "YYYYMMDDHHmmss"
 * @returns 紧凑格式的日期时间字符串
 */
export function getNowFormatStr(): string {
  return dayjs().format('YYYYMMDDHHmmss')
}

/**
 * 获取当前年份，格式 "YYYY"
 * @returns 年份字符串
 */
export function getNowFormatYear(): string {
  return dayjs().format('YYYY')
}

/**
 * 获取当前月份，格式 "YYYY-MM"
 * @returns 年月字符串
 */
export function getNowFormatMonth(): string {
  return dayjs().format('YYYY-MM')
}

/**
 * 获取 N 天前的日期，格式 "YYYY-MM-DD"
 * @param day 天数
 * @returns 格式化后的日期字符串
 */
export function getBeforeFormatDate(day: number): string {
  return dayjs().subtract(day, 'day').format('YYYY-MM-DD')
}

/**
 * 获取 N 月前的日期，格式 "YYYY-MM-DD"
 * @param monthNum 月数
 * @returns 格式化后的日期字符串
 */
export function getPrevMonthFormatDate(monthNum: number): string {
  return dayjs().subtract(monthNum, 'month').format('YYYY-MM-DD')
}
