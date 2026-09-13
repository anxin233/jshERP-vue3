/**
 * 项目默认配置项
 * primaryColor - 默认主题色（与 config/layout.js、layout-tokens.less 一致）
 * navTheme - 侧栏主题：light = 白底侧栏（默认，与参考布局一致），dark = 深色侧栏
 * colorWeak - 色盲模式
 * layout - 整体布局方式 ['sidemenu', 'topmenu'] 两种布局
 * fixedHeader - 固定 Header : boolean
 * fixSiderbar - 固定左侧菜单栏 ： boolean
 * autoHideHeader - 向下滚动时，隐藏 Header : boolean
 * contentWidth - 内容区布局： 流式 |  固定
 *
 * storageOptions: {} - 本地存储配置项 (localStorage/sessionStorage)
 *
 */
import { PRIMARY_COLOR } from '@/config/layout'

export default {
  primaryColor: PRIMARY_COLOR,
  navTheme: 'light',
  layout: 'sidemenu',
  contentWidth: 'Fixed',
  fixedHeader: true,
  fixSiderbar: true,
  autoHideHeader: false,
  colorWeak: false,
  multipage: true,
  storageOptions: {
    namespace: 'pro__',
    name: 'ls',
    storage: 'local',
  }
}
