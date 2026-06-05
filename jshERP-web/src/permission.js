import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { USER_ID,INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types'
import { generateIndexRouter } from "@/utils/util"
import storage from '@/utils/storage'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/user/login', '/user/register', '/user/register-result'] // no redirect whitelist
const ROOT_ROUTE_NAME = 'RootLayout'

function addDynamicRoutes(routes = []) {
  if (router.hasRoute(ROOT_ROUTE_NAME)) {
    router.removeRoute(ROOT_ROUTE_NAME)
  }
  routes.forEach(route => {
    if (route.path === '/') {
      router.addRoute({ ...route, name: ROOT_ROUTE_NAME })
      return
    }
    if (route.name && router.hasRoute(route.name)) {
      router.removeRoute(route.name)
    }
    router.addRoute(route)
  })
}

/** 登录态下在 router.install 之前预加载菜单路由，避免 No match found 警告 */
export async function preloadDynamicRoutes() {
  if (!storage.get(USER_ID)) {
    return
  }
  if (store.getters.permissionList && store.getters.permissionList.length > 0) {
    addDynamicRoutes(store.getters.addRouters)
    return
  }
  const menuData = await store.dispatch('GetPermissionList')
  if (menuData === null || menuData === '' || menuData === undefined) {
    return
  }
  try {
    const btnRes = await store.dispatch('GetUserBtnList')
    storage.set('winBtnStrList', btnRes.data.userBtn, 7 * 24 * 60 * 60 * 1000)
  } catch (e) {
    // 按钮权限失败不阻塞路由
  }
  const constRoutes = generateIndexRouter(menuData)
  await store.dispatch('UpdateAppRouter', { constRoutes })
  addDynamicRoutes(store.getters.addRouters)
}

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  if (storage.get(USER_ID)) {
    /* has token */
    if (to.path === '/' || to.path === '/user/login') {
      next({ path: INDEX_MAIN_PAGE_PATH })
      NProgress.done()
    } else {
      if (store.getters.permissionList.length === 0) {
        store.dispatch('GetPermissionList').then(res => {
          const menuData = res;
          if (menuData === null || menuData === "" || menuData === undefined) {
            return;
          }
          // 缓存用户的按钮权限
          store.dispatch('GetUserBtnList').then(res => {
            storage.set('winBtnStrList', res.data.userBtn, 7 * 24 * 60 * 60 * 1000)
          })
          let constRoutes = [];
          constRoutes = generateIndexRouter(menuData);
          // 添加主界面路由
          store.dispatch('UpdateAppRouter',  { constRoutes }).then(() => {
            // 根据roles权限生成可访问的路由表
            // 动态添加可访问路由表
            addDynamicRoutes(store.getters.addRouters)
            const redirect = decodeURIComponent(from.query.redirect || to.path)
            next({ path: redirect })
          })
        })
        .catch(() => {
          store.dispatch('Logout').then(() => {
            next({ path: '/user/login' })
          })
        })
      } else {
        if (to.path) {
          _hmt.push(['_trackPageview', '/#' + to.fullPath]);
        }
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next({ path: '/user/login' })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

export default router
