import mitt from 'mitt'

/**
 * 事件总线
 * 对应原 Vue 2 项目中 Vue.prototype.$bus 的事件总线功能
 *
 * Vue 3 移除了 $on、$off、$emit 实例方法，官方推荐使用 mitt 库替代
 *
 * 使用方式:
 * ```ts
 * // 组件 A - 发送事件
 * const { emit } = useEventBus()
 * emit('some-event', { data: 'hello' })
 *
 * // 组件 B - 监听事件
 * const { on, off } = useEventBus()
 * onMounted(() => {
 *   on('some-event', handler)
 * })
 * onUnmounted(() => {
 *   off('some-event', handler)
 * })
 *
 * // 或者直接使用 emitter 单例
 * import emitter from '@/composables/useEventBus'
 * emitter.emit('event', payload)
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Events = Record<string, any>

// 全局唯一的事件总线实例
const emitter = mitt<Events>()

/**
 * 事件总线 composable
 * 返回 mitt 的 emit、on、off 方法
 */
export function useEventBus() {
  return {
    /** 触发事件 */
    emit: emitter.emit,
    /** 监听事件 */
    on: emitter.on,
    /** 取消监听事件 */
    off: emitter.off,
    /** 清除所有事件监听 */
    all: emitter.all,
  }
}

export default emitter
