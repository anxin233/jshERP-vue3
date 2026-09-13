import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { showToast, showConfirmDialog } from 'vant'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/store/user'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import '@/styles/common.less'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.config.globalProperties.$toast = showToast
app.config.globalProperties.$confirm = showConfirmDialog

// 登录态失效（请求层拦截 500 loginOut）：重置 store 并跳转登录页
window.addEventListener('jsh:login-out', () => {
  const userStore = useUserStore()
  userStore.reset()
  const current = router.currentRoute.value
  const redirect = current.path && current.path !== '/login' ? current.fullPath : ''
  router.replace({ path: '/login', query: redirect ? { redirect } : {} })
})

app.mount('#app')
