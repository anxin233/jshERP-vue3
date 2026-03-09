import { computed } from 'vue'
import { useBreakpoints } from '@vueuse/core'

/**
 * 设备检测 composable
 * 对应原 Vue 2 项目 utils/mixin.js 中的 mixinDevice
 *
 * 使用 @vueuse/core 的 useBreakpoints 替代 Vuex state 中的 device 状态
 * 原项目中 device 状态是在 store/modules/app.js 中通过
 * TOGGLE_DEVICE mutation 手动设置的，这里改为自动检测
 *
 * 使用方式:
 * ```ts
 * const { device, isMobile, isDesktop } = useDevice()
 *
 * // 在模板中
 * <div v-if="isMobile">移动端内容</div>
 * <div :class="wrapClassName">弹窗</div>
 * ```
 */
export function useDevice() {
  // 使用与 Ant Design 一致的断点值 (原项目基于 Ant Design Vue)
  // 768px 以下为移动端
  const breakpoints = useBreakpoints({
    mobile: 768,
  })

  const isMobileBreakpoint = breakpoints.smaller('mobile')

  /**
   * 设备类型
   */
  const device = computed<'desktop' | 'mobile'>(() => {
    return isMobileBreakpoint.value ? 'mobile' : 'desktop'
  })

  /**
   * 是否为移动端
   */
  const isMobile = computed<boolean>(() => {
    return device.value === 'mobile'
  })

  /**
   * 是否为桌面端
   */
  const isDesktop = computed<boolean>(() => {
    return device.value === 'desktop'
  })

  /**
   * 获取弹窗容器的 CSS 类名
   * 对应原 mixinDevice 中的 wrapClassNameInfo 方法
   */
  const wrapClassName = computed<string>(() => {
    if (device.value === 'desktop') {
      return 'modal-cust-warp depot-mask'
    } else {
      return 'modal-cust-warp'
    }
  })

  return {
    device,
    isMobile,
    isDesktop,
    wrapClassName,
  }
}
