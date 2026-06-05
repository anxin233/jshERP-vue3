import dayjs from 'dayjs'

export function NumberFormat(value) {
  if (!value) {
    return '0'
  }
  return value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
}

export function dayjsFormat(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(dataStr).format(pattern)
}

export function momentFormat(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(dataStr).format(pattern)
}

export function ellipsis(value, vlength = 25) {
  if (!value) {
    return ''
  }
  if (value.length > vlength) {
    return value.slice(0, vlength) + '...'
  }
  return value
}
