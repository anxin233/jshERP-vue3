import { Comment, Text, Fragment, cloneVNode as cloneVueVNode } from 'vue'
import { cloneElement } from 'ant-design-vue/es/_util/vnode'
import { withLegacyComponentOptions, setCompatVNodeProperty } from '@/utils/antd-vue2-compat'

export { Fragment }

export function resolveParentMenu(ctx, props) {
  if (props && props.parentMenu) {
    return props.parentMenu
  }
  if (ctx && ctx.parentMenu) {
    return ctx.parentMenu
  }
  if (ctx && ctx.$props && ctx.$props.parentMenu) {
    return ctx.$props.parentMenu
  }
  var p = ctx && ctx.$parent
  while (p) {
    var name = p.$options && p.$options.name
    if (name === 'Menu' || name === 'AMenu') {
      return p
    }
    p = p.$parent
  }
  return null
}

export function shouldPassThroughMenuChild(child) {
  if (!child) {
    return true
  }
  if (child.__v_isVNode) {
    const t = child.type
    if (t == null) {
      return true
    }
    if (t === Comment || t === Text) {
      return true
    }
    if (typeof t === 'object' || typeof t === 'function') {
      return false
    }
    if (typeof t === 'symbol') {
      return true
    }
    return typeof t === 'string'
  }
  return child.tag === undefined
}

function mergeOnIntoProps(props, on) {
  const merged = { ...props }
  if (!on) {
    return merged
  }
  Object.keys(on).forEach(function (ev) {
    const propKey = 'on' + ev.charAt(0).toUpperCase() + ev.slice(1)
    const existing = merged[propKey]
    const handler = on[ev]
    if (existing && typeof existing === 'function' && typeof handler === 'function') {
      merged[propKey] = function (e) {
        existing(e)
        handler(e)
      }
    } else {
      merged[propKey] = handler
    }
  })
  return merged
}

export function cloneMenuItemVnode(child, nodeProps) {
  if (!child) {
    return null
  }
  const injectedProps = (nodeProps && nodeProps.props) || {}
  const on = (nodeProps && nodeProps.on) || {}
  const key = nodeProps && nodeProps.key

  if (child.__v_isVNode && typeof child.type !== 'string') {
    const mergedProps = mergeOnIntoProps(
      { ...(child.props || {}), ...injectedProps },
      on
    )
    let cloned = cloneVueVNode(child, mergedProps)
    if (key !== undefined) {
      cloned.key = key
    }
    cloned = withLegacyComponentOptions(cloned)
    if (injectedProps.parentMenu) {
      setCompatVNodeProperty(cloned, 'props', {
        ...(cloned.props || {}),
        parentMenu: injectedProps.parentMenu
      })
      if (cloned.componentOptions) {
        cloned.componentOptions.propsData = {
          ...(cloned.componentOptions.propsData || {}),
          parentMenu: injectedProps.parentMenu
        }
      }
    }
    return cloned
  }
  return cloneElement(child, nodeProps)
}

export function isMenuFragmentVnode(vnode) {
  return !!(vnode && vnode.__v_isVNode && vnode.type === Fragment && Array.isArray(vnode.children))
}
