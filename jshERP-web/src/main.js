import '@/config/api-base-bootstrap'
import Vue, { createApp, h } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'

import { VueAxios } from "@/utils/request"

import Antd from 'ant-design-vue'
import Viser from 'viser-vue'
import 'ant-design-vue/dist/antd.less';  // or 'ant-design-vue/dist/antd.less'

import '@/permission' // permission control
import '@/utils/filter' // base filter
import Print from 'vue-print-nb-jeecg'
/*import '@babel/polyfill'*/
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
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
import '@/assets/less/JAreaLinkage.less'
import VueAreaLinkage from 'vue-area-linkage'
import DictData from '@/components/DictData'
import DictTag from '@/components/DictTag'
import storage, { installStorage } from '@/utils/storage'
import { patchAntdVue2ForVue3Compat } from '@/utils/antd-vue2-compat'

Vue.config.productionTip = false
Vue.component('DictTag', DictTag)
patchAntdVue2ForVue3Compat()
Vue.use(Antd)
Vue.use(VueAxios, router)
Vue.use(Viser)
Vue.use(hasPermission)
Vue.use(Print)
Vue.use(preview)
Vue.use(vueBus);
Vue.use(JeecgComponents)
Vue.use(VueAreaLinkage)
DictData.install()

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

installStorage(app)
app.use(store)
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})
