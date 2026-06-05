import '@/config/api-base-bootstrap'
import { createApp, h } from 'vue'
import App from './App.vue'
import store from './store/'

import { VueAxios } from "@/utils/request"

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

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

const app = createApp({
  mounted () {
    // store.commit('SET_SIDEBAR_TYPE', storage.get(SIDEBAR_TYPE, true))
    store.commit('SET_SIDEBAR_TYPE', true)
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

app.config.globalProperties.$renderColumnSlot = function (slotName, cell) {
  const payload = cell && typeof cell === 'object'
    ? cell
    : { text: cell }
  const text = Object.prototype.hasOwnProperty.call(payload, 'text') ? payload.text : cell
  const slot = this.$slots && this.$slots[slotName]
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
