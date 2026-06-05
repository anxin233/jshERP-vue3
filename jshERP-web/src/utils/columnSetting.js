const DEFAULT_COLUMN_TITLE_MAP = {
  action: '操作',
  rowIndex: '#'
}

/** 列设置弹窗展示用标题（title 缺失时兜底） */
export function getColumnSettingTitle(column, columnTitleMap) {
  if (!column) {
    return ''
  }
  if (column.title && typeof column.title === 'string') {
    return column.title
  }
  const map = columnTitleMap || DEFAULT_COLUMN_TITLE_MAP
  return map[column.dataIndex] || column.dataIndex || ''
}

/** 参与列设置勾选的列（排除 hideInColumnSetting） */
export function getColumnSettingColumns(defColumns) {
  return (defColumns || []).filter(col => col && col.hideInColumnSetting !== true)
}

/** 过滤缓存中已废弃的 dataIndex，空结果时回退默认列 */
export function sanitizeSettingDataIndex(settingDataIndex, defColumns, defDataIndex) {
  const validSet = new Set((defColumns || []).map(item => item.dataIndex).filter(Boolean))
  let result = (settingDataIndex || []).filter(item => validSet.has(item))
  if (!result.length) {
    result = [...(defDataIndex || [])]
  }
  return result
}
