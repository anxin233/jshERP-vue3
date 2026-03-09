/**
 * 通用工具函数 - 从 Vue 2 utils/util.js 迁移
 * 注意：路由相关函数不在此处，请参见 router/helper.ts
 */

/**
 * 过滤对象中为空的属性
 * @param obj 待过滤的对象
 * @returns 过滤后的对象
 */
export function filterObj(obj: Record<string, any>): Record<string, any> | undefined {
  if (typeof obj !== 'object' || obj === null) {
    return undefined
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
        delete obj[key]
      }
    }
  }
  return obj
}

/**
 * 深度克隆对象、数组
 * @param obj 被克隆的对象
 * @returns 克隆后的对象
 */
export function cloneObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 随机生成数字
 *
 * 示例：生成长度为 12 的随机数：randomNumber(12)
 * 示例：生成 3~23 之间的随机数：randomNumber(3, 23)
 *
 * @param minOrLength 最小值 | 长度
 * @param max 最大值（可选）
 * @returns 生成后的数字
 */
export function randomNumber(minOrLength: number, max?: number): number {
  const random = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  if (max === undefined) {
    // 生成指定长度的随机数字，首位一定不是 0
    const length = minOrLength
    const nums = [...Array(length).keys()].map((i) =>
      i > 0 ? random(0, 9) : random(1, 9),
    )
    return parseInt(nums.join(''))
  } else {
    return random(minOrLength, max)
  }
}

/**
 * 随机生成字符串
 * @param length 字符串的长度
 * @param chats 可选字符串区间（只会生成传入的字符串中的字符）
 * @returns 生成的字符串
 */
export function randomString(length: number = 1, chats?: string): string {
  if (!chats) chats = '0123456789qwertyuioplkjhgfdsazxcvbnm'
  let str = ''
  for (let i = 0; i < length; i++) {
    const num = randomNumber(0, chats.length - 1)
    str += chats[num]
  }
  return str
}

/**
 * 随机生成 UUID
 * @returns 生成的 UUID 字符串
 */
export function randomUUID(): string {
  const chats = '0123456789abcdef'
  return randomString(32, chats)
}

/**
 * 下划线转驼峰
 * @param str 下划线字符串
 * @returns 驼峰字符串
 */
export function underLine2CamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_all: string, letter: string) => {
    return letter.toUpperCase()
  })
}

/**
 * 触发 window.resize 事件
 */
export function triggerWindowResizeEvent(): void {
  const event = new Event('resize')
  window.dispatchEvent(event)
}

/**
 * 欢迎语
 * @returns 随机欢迎语
 */
export function welcome(): string {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

/**
 * 如果值不存在就 push 进数组，反之不处理
 * @param array 要操作的数组
 * @param value 要添加的值
 * @param key 可选，对象唯一字段名
 * @returns 成功 push 返回 true，不处理返回 false
 */
export function pushIfNotExist<T>(array: T[], value: T, key?: string): boolean {
  for (const item of array) {
    if (key && (item as any)[key] === (value as any)[key]) {
      return false
    } else if (!key && item === value) {
      return false
    }
  }
  array.push(value)
  return true
}

/**
 * 简单防抖函数
 * @param fn 要防抖的函数
 * @param delay 防抖的毫秒数
 * @returns 防抖后的函数
 */
export function simpleDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 100,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 不用正则的方式替换所有值
 * @param text 被替换的字符串
 * @param checker 替换前的内容
 * @param replacer 替换后的内容
 * @returns 替换后的字符串
 */
export function replaceAll(text: string, checker: string, replacer: string): string {
  let lastText = text
  text = text.replace(checker, replacer)
  if (lastText !== text) {
    return replaceAll(text, checker, replacer)
  }
  return text
}

/**
 * 转换商品扩展字段的格式
 * @param thisRows 行数据数组
 * @returns 逗号拼接的 anotherName 字符串
 */
export function getMpListShort(thisRows: Array<{ anotherName: string }>): string {
  let mPropertyListShort = ''
  let anotherNameStr = ''
  for (let i = 0; i < thisRows.length; i++) {
    anotherNameStr += thisRows[i].anotherName + ','
  }
  if (anotherNameStr) {
    mPropertyListShort = anotherNameStr.substring(0, anotherNameStr.length - 1)
  }
  return mPropertyListShort
}

/**
 * 自定义大数加法函数
 * @param a 数值 a
 * @param b 数值 b
 * @returns 相加结果字符串
 */
export function addBigNumbers(a: number | string, b: number | string): string {
  const aStr = a.toString()
  const bStr = b.toString()
  const aRev = aStr.split('').reverse()
  const bRev = bStr.split('').reverse()
  const maxLength = Math.max(aRev.length, bRev.length)
  const result: number[] = []
  let carry = 0
  for (let i = 0; i < maxLength; i++) {
    const digitA = i < aRev.length ? parseInt(aRev[i]) : 0
    const digitB = i < bRev.length ? parseInt(bRev[i]) : 0
    const sum = digitA + digitB + carry
    result.push(sum % 10)
    carry = Math.floor(sum / 10)
  }
  if (carry > 0) {
    result.push(carry)
  }
  return result.reverse().join('')
}

/**
 * 根据指定值删除数组中的元素
 * @param arrylist 数组
 * @param val 要删除的值
 */
export function removeByVal<T>(arrylist: T[], val: T): void {
  for (let i = 0; i < arrylist.length; i++) {
    if (arrylist[i] === val) {
      arrylist.splice(i, 1)
      break
    }
  }
}

/**
 * 判断是否显示办理按钮
 * @param bpmStatus 状态值
 * @returns 是否显示
 */
export function showDealBtn(bpmStatus: string): boolean {
  return bpmStatus !== '1' && bpmStatus !== '3' && bpmStatus !== '4'
}

/**
 * 获取审核标志
 * @param multiBillType 多单据类型（逗号分隔）
 * @param multiLevelApprovalFlag 多级审核标志
 * @param prefixNo 前缀编号
 * @returns 审核标志
 */
export function getCheckFlag(
  multiBillType: string,
  multiLevelApprovalFlag: string,
  prefixNo: string,
): boolean {
  if (multiLevelApprovalFlag === '1') {
    if (multiBillType) {
      const multiBillTypeArr = multiBillType.split(',')
      return multiBillTypeArr.indexOf(prefixNo) <= -1
    } else {
      return true
    }
  } else {
    return true
  }
}

/**
 * 将字符串中单个金额中的数值转为负数
 * @param str 逗号分隔的金额字符串
 * @returns 转为负数后的数组
 */
export function changeListFmtMinus(str: string): string[] {
  const newArr: string[] = []
  if (str) {
    let arr: string[]
    if (str.indexOf(',') > -1) {
      arr = str.split(',')
    } else {
      arr = [str]
    }
    for (let i = 0; i < arr.length; i++) {
      const num = Number(arr[i])
      if (num < 0) {
        newArr.push(num.toString())
      } else {
        newArr.push((0 - num).toString())
      }
    }
  }
  return newArr
}

/**
 * 增强 CSS，可以在页面上输出全局 css
 * @param css 要增强的 css
 * @param id style 标签的 id，可以用来清除旧样式
 */
export function cssExpand(css: string, id?: string): void {
  const style = document.createElement('style')
  style.innerHTML = `@charset "UTF-8"; ${css}`
  // 清除旧样式
  if (id) {
    const $style = document.getElementById(id)
    if ($style != null) $style.outerHTML = ''
    style.id = id
  }
  // 应用新样式
  document.head.appendChild(style)
}

/**
 * 回车后自动跳到下一个 input
 * @param domInfo 容器元素的 id
 */
export function autoJumpNextInput(domInfo: string): void {
  let domIndex = 0
  const container = document.getElementById(domInfo)
  if (!container) return

  const inputs = container.getElementsByTagName('input')
  if (inputs.length === 0) return

  inputs[domIndex].focus()

  container.addEventListener('keydown', function (e: KeyboardEvent) {
    if (e.key === 'Enter') {
      domIndex++
      if (domIndex === inputs.length) {
        domIndex = 0
      }
      inputs[domIndex].focus()
    }
  })

  for (let i = 0; i < inputs.length; i++) {
    ;(inputs[i] as any).index = i
    inputs[i].onclick = function (this: any) {
      domIndex = this.index
    }
  }
}

/**
 * 获取当前格式化时间字符串 yyyyMMddHHmmss
 * @returns 格式化后的时间字符串
 */
export function getNowFormatStr(): string {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}${m}${d}${h}${mi}${s}`
}

/**
 * 导出 Excel（通过 POST 方式）
 * @param fileName 导出文件名
 * @param titleStr 工作表标题
 * @param head 表头(逗号分隔)
 * @param tip 提示信息
 * @param list 数据列表
 */
export function exportXlsPost(
  fileName: string,
  titleStr: string,
  head: string,
  tip: string,
  list: any[][],
): void {
  import('@/api/http').then(({ downFilePost }) => {
    if (!fileName || typeof fileName !== 'string') {
      fileName = '导出文件'
    }
    const paramObj = { title: titleStr, head, tip, list }
    downFilePost(paramObj).then((data: any) => {
      if (!data) {
        console.warn('文件下载失败')
        return
      }
      const url = window.URL.createObjectURL(
        new Blob([data], { type: 'application/vnd.ms-excel' }),
      )
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', fileName + '_' + getNowFormatStr() + '.xls')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    })
  })
}
