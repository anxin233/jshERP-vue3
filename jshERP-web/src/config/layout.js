/**
 * 布局常量（与 layout-tokens.less 保持一致，供 JS 模板绑定）
 * 文档 24 阶段 1
 */
export const HEADER_HEIGHT = 49
export const LOGO_HEIGHT = 49
export const SIDER_WIDTH = 180
export const SIDER_COLLAPSED_WIDTH = 80
/** 弹窗/遮罩距视口顶部的偏移 = 顶栏 49 + 页签 44 */
export const MODAL_OFFSET_TOP = 93
/** 与 layout-tokens.less、Vite modifyVars 保持一致 */
export const PRIMARY_COLOR = '#1890FF'

export default {
  HEADER_HEIGHT,
  LOGO_HEIGHT,
  SIDER_WIDTH,
  SIDER_COLLAPSED_WIDTH,
  MODAL_OFFSET_TOP,
  PRIMARY_COLOR
}
