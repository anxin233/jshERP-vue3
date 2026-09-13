import '@/config/api-base-bootstrap'
import { createApp, h } from 'vue'
import App from './App.vue'
import store from './store/'

import { VueAxios } from "@/utils/request"

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/assets/less/layout-tokens.less'
import '@/assets/less/common.less'

import router, { preloadDynamicRoutes } from '@/permission' // permission control + 路由预加载
import '@/utils/filter' // base filter
import Print from '@/utils/print'
/*import '@babel/polyfill'*/
import 'intro.js/introjs.css'

import {
  ACCESS_TOKEN,
  DEFAULT_COLOR,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR_WEAK,
  SIDEBAR_TYPE,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_PAGE
} from "@/store/mutation-types"
import config from '@/defaultSettings'

import hasPermission from '@/utils/hasPermission'
import vueBus from '@/utils/vueBus';
import JeecgComponents from '@/components/jeecg/index'
import DictData from '@/components/DictData'
import DictTag from '@/components/DictTag'
import LegacyIcon from '@/components/legacy/LegacyIcon.vue'
import storage, { installStorage } from '@/utils/storage'

// 一次性纠正为参考布局：白侧栏 + 主色 #1890FF（之后仍尊重用户手动切换）
const NAV_THEME_RESTORE_KEY = 'NAV_THEME_RESTORE_LIGHT_20260727'
const PRIMARY_COLOR_RESTORE_KEY = 'PRIMARY_COLOR_RESTORE_1890_20260727'

const app = createApp({
  mounted () {
    // store.commit('SET_SIDEBAR_TYPE', storage.get(SIDEBAR_TYPE, true))
    store.commit('SET_SIDEBAR_TYPE', true)
    if (!storage.get(NAV_THEME_RESTORE_KEY)) {
      storage.set(DEFAULT_THEME, config.navTheme)
      storage.set(NAV_THEME_RESTORE_KEY, 1)
    }
    if (!storage.get(PRIMARY_COLOR_RESTORE_KEY)) {
      storage.set(DEFAULT_COLOR, config.primaryColor)
      storage.set(PRIMARY_COLOR_RESTORE_KEY, 1)
    }
    store.commit('TOGGLE_THEME', storage.get(DEFAULT_THEME, config.navTheme))
    store.commit('TOGGLE_LAYOUT_MODE', storage.get(DEFAULT_LAYOUT_MODE, config.layout))
    store.commit('TOGGLE_FIXED_HEADER', storage.get(DEFAULT_FIXED_HEADER, config.fixedHeader))
    store.commit('TOGGLE_FIXED_SIDERBAR', storage.get(DEFAULT_FIXED_SIDEMENU, config.fixSiderbar))
    store.commit('TOGGLE_CONTENT_WIDTH', storage.get(DEFAULT_CONTENT_WIDTH_TYPE, config.contentWidth))
    store.commit('TOGGLE_FIXED_HEADER_HIDDEN', storage.get(DEFAULT_FIXED_HEADER_HIDDEN, config.autoHideHeader))
    store.commit('TOGGLE_WEAK', storage.get(DEFAULT_COLOR_WEAK, config.colorWeak))
    store.commit('TOGGLE_COLOR', storage.get(DEFAULT_COLOR, config.primaryColor))
    store.commit('SET_TOKEN', storage.get(ACCESS_TOKEN))
    store.commit('SET_MULTI_PAGE',storage.get(DEFAULT_MULTI_PAGE,config.multipage))
  },
  render: () => h(App)
})

// Vue3 下页面模板里的具名插槽实际挂在子组件（a-table）实例上，页面自身 $slots 为空，
// 因此需要先在页面 refs 的子组件里查找插槽，否则自定义列会退化为纯文本。
function resolveColumnSlot (vm, slotName) {
  if (vm.$slots && vm.$slots[slotName]) {
    return vm.$slots[slotName]
  }
  const refs = vm.$refs || {}
  for (const key of Object.keys(refs)) {
    const ref = refs[key]
    const list = Array.isArray(ref) ? ref : [ref]
    for (const item of list) {
      if (item && item.$slots && item.$slots[slotName]) {
        return item.$slots[slotName]
      }
    }
  }
  return null
}

app.config.globalProperties.$renderColumnSlot = function (slotName, cell) {
  const payload = cell && typeof cell === 'object'
    ? cell
    : { text: cell }
  const text = Object.prototype.hasOwnProperty.call(payload, 'text') ? payload.text : cell
  const slot = resolveColumnSlot(this, slotName)
  return slot ? slot({
    text,
    value: text,
    record: payload.record,
    index: payload.index,
    column: payload.column
  }) : text
}

installStorage(app)
app.use(Antd)
app.use(VueAxios, router)
app.use(hasPermission)
app.use(Print)
app.use(vueBus)
app.use(JeecgComponents)
app.use(DictData)
app.component('DictTag', DictTag)
app.component('LegacyIcon', LegacyIcon)
app.use(store)

async function bootstrap() {
  try {
    await preloadDynamicRoutes()
  } catch (e) {
    console.warn('[router] preloadDynamicRoutes failed', e)
  }
  app.use(router)
  await router.isReady()
  app.mount('#app')
}

bootstrap()
