// 单据类型/前缀与价格字段映射（后端会按 prefixNo 分派 billPrice，此处用于展示兜底）
export const BILL_PRICE_FIELD = {
  LSCK: 'commodityDecimal',
  LSTH: 'commodityDecimal',
  XSDD: 'wholesaleDecimal',
  XSCK: 'wholesaleDecimal',
  XSTH: 'wholesaleDecimal',
  CGDD: 'purchaseDecimal',
  CGRK: 'purchaseDecimal',
  CGTH: 'purchaseDecimal',
  QTRK: 'purchaseDecimal',
  QTCK: 'purchaseDecimal',
  DBCK: 'purchaseDecimal',
  ZZD: 'purchaseDecimal',
  CXD: 'purchaseDecimal'
}

// 按钮权限码（与 PC 端一致）
export const BTN_CODE = {
  EDIT: 1,
  AUDIT: 2,
  EXPORT: 3,
  ENABLE: 4,
  PRINT: 5,
  INVALID: 6,
  UNAUDIT: 7
}

// 单据状态
export const BILL_STATUS = {
  UNAUDITED: '0',
  AUDITED: '1'
}
