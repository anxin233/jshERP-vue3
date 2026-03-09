import type { App } from 'vue'
import { permissionDirective } from './permission'

/**
 * 注册所有自定义指令
 * 在 main.ts 中调用 setupDirectives(app) 即可注册
 */
export function setupDirectives(app: App): void {
  // v-has 权限控制指令
  app.directive('has', permissionDirective)
}
