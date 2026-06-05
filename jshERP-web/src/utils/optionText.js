function vnodeText(value) {
  if (value == null) {
    return ''
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(vnodeText).join('')
  }
  if (value.text != null) {
    return String(value.text)
  }
  if (value.children != null) {
    return vnodeText(value.children)
  }
  if (value.componentOptions && value.componentOptions.children) {
    return vnodeText(value.componentOptions.children)
  }
  return ''
}

export function getOptionText(option) {
  if (!option) {
    return ''
  }
  const rawText = option.label != null
    ? option.label
    : option.children != null
      ? option.children
      : option.title != null
        ? option.title
        : option.value
  return vnodeText(rawText)
}

export function antSelectFilterOption(input, option) {
  const keyword = String(input || '').toLowerCase()
  return getOptionText(option).toLowerCase().indexOf(keyword) >= 0
}
