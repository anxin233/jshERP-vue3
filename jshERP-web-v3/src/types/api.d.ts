/**
 * API 响应类型定义
 */

/** 通用 API 响应结构 */
interface ApiResult<T = any> {
  code: number
  data: T
  msg?: string
}

/** 分页查询结果 */
interface PageResult<T = any> {
  rows: T[]
  total: number
  current: number
  pageSize: number
}

/** 列表查询参数 */
interface PageQuery {
  currentPage?: number
  pageSize?: number
  [key: string]: any
}

/** 通用键值对 */
interface KeyValue<T = string> {
  key: string
  value: T
}

/** 下拉选项 */
interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  children?: SelectOption[]
}
