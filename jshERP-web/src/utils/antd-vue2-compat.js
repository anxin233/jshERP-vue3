import { cloneVNode as cloneVueVNode } from 'vue'
import FormItem from 'ant-design-vue/es/form/FormItem'
import { FIELD_DATA_PROP, FIELD_META_PROP } from 'ant-design-vue/es/form/constants'
import { filterEmpty, getAllChildren, getEvents, getSlotOptions } from 'ant-design-vue/es/_util/props-util'
import ClearableLabeledInput from 'ant-design-vue/es/input/ClearableLabeledInput'
import Trigger from 'ant-design-vue/es/vc-trigger/Trigger'
import ContainerRender from 'ant-design-vue/es/_util/ContainerRender'
import contains from 'ant-design-vue/es/vc-util/Dom/contains'
import classNames from 'classnames'

function isEmptyTextNode(child) {
  if (!child) {
    return true
  }
  if (!child.tag && typeof child.text === 'string') {
    return child.text.trim() === ''
  }
  if (!child.tag && typeof child.children === 'string') {
    return child.children.trim() === ''
  }
  return false
}

function getVNodeAttrs(child) {
  const data = child && child.data ? child.data : {}
  return data.attrs || child.props || {}
}

function toVue3Props(data = {}) {
  const props = {
    ...(data.attrs || {}),
    ...(data.props || {}),
    ...(data.domProps || {})
  }
  if ('class' in data) {
    props.class = data.class
  }
  if ('style' in data) {
    props.style = data.style
  }
  if ('ref' in data) {
    props.ref = data.ref
  }
  if ('key' in data) {
    props.key = data.key
  }
  Object.keys(data.on || {}).forEach(eventName => {
    const name = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`
    props[name] = data.on[eventName]
  })
  return props
}

function getVue3VNodeOptions(vnode) {
  const type = vnode && vnode.type
  if (!type || typeof type === 'string') {
    return {}
  }
  const options = type.options || type
  return {
    ...options,
    name: options.name || type.name || type.__name || vnode.tag || 'Anonymous'
  }
}

function getVue3VNodeListeners(props = {}) {
  return Object.keys(props).reduce((listeners, key) => {
    if (/^on[A-Z]/.test(key) && typeof props[key] === 'function') {
      const eventName = key.slice(2)
      listeners[eventName.charAt(0).toLowerCase() + eventName.slice(1)] = props[key]
    }
    return listeners
  }, {})
}

function setCompatVNodeProperty(vnode, key, value) {
  const descriptor = Object.getOwnPropertyDescriptor(vnode, key)
  if (descriptor && !descriptor.configurable && !descriptor.writable && !descriptor.set) {
    return
  }
  try {
    vnode[key] = value
  } catch (error) {
    Object.defineProperty(vnode, key, {
      value,
      writable: true,
      configurable: true
    })
  }
}

function withLegacyComponentOptions(vnode) {
  if (!vnode || !vnode.__v_isVNode || typeof vnode.type === 'string') {
    return vnode
  }

  const current = vnode.componentOptions || {}
  const options = current.Ctor && current.Ctor.options
    ? current.Ctor.options
    : getVue3VNodeOptions(vnode)
  const propsData = {
    ...(vnode.props || {}),
    ...(current.propsData || {})
  }

  setCompatVNodeProperty(vnode, 'componentOptions', {
    ...current,
    Ctor: current.Ctor || { options },
    propsData,
    listeners: {
      ...getVue3VNodeListeners(vnode.props || {}),
      ...(current.listeners || {})
    },
    children: current.children || (Array.isArray(vnode.children) ? vnode.children : undefined)
  })

  return vnode
}

function decorateCompatField(form, fieldDecoratorId, fieldDecoratorOptions, vnode) {
  if (form && typeof form.getFieldProps === 'function') {
    return cloneCompatVNode(vnode, form.getFieldProps(fieldDecoratorId, fieldDecoratorOptions))
  }
  return form.getFieldDecorator(fieldDecoratorId, fieldDecoratorOptions)(vnode)
}

function cloneCompatVNode(vnode, data) {
  if (!vnode) {
    return vnode
  }
  if (vnode.__v_isVNode) {
    return withLegacyComponentOptions(cloneVueVNode(vnode, toVue3Props(data)))
  }
  return withLegacyComponentOptions({ ...vnode })
}

function cloneCompatVNodes(vnodes = []) {
  if (!Array.isArray(vnodes)) {
    return []
  }
  return vnodes.map(vnode => cloneCompatVNode(vnode))
}

function hasInputPrefixSuffix(props) {
  return !!(props.prefix || props.suffix || props.allowClear)
}

function patchClearableLabeledInputForVue3Compat() {
  const methods = ClearableLabeledInput && ClearableLabeledInput.methods
  if (!methods || ClearableLabeledInput.__jshVue3CompatPatched) {
    return
  }

  methods.renderLabeledIcon = function renderLabeledIcon(prefixCls, element) {
    const h = this.$createElement
    const props = this.$props
    const suffix = this.renderSuffix(prefixCls)

    if (!hasInputPrefixSuffix(props)) {
      return cloneCompatVNode(element, {
        props: { value: props.value }
      })
    }

    const prefix = props.prefix
      ? h('span', { class: `${prefixCls}-prefix` }, [props.prefix])
      : null
    const affixWrapperCls = classNames(
      props.className,
      `${prefixCls}-affix-wrapper`,
      {
        [`${prefixCls}-affix-wrapper-sm`]: props.size === 'small',
        [`${prefixCls}-affix-wrapper-lg`]: props.size === 'large',
        [`${prefixCls}-affix-wrapper-input-with-clear-btn`]: props.suffix && props.allowClear && this.$props.value
      }
    )

    return h(
      'span',
      { class: affixWrapperCls, style: props.style },
      [prefix, cloneCompatVNode(element, { style: null }), suffix]
    )
  }

  methods.renderInputWithLabel = function renderInputWithLabel(prefixCls, labeledElement) {
    const h = this.$createElement
    const {
      addonBefore,
      addonAfter,
      style,
      size,
      className
    } = this.$props

    if (!addonBefore && !addonAfter) {
      return labeledElement
    }

    const wrapperClassName = `${prefixCls}-group`
    const addonClassName = `${wrapperClassName}-addon`
    const addonBeforeNode = addonBefore
      ? h('span', { class: addonClassName }, [addonBefore])
      : null
    const addonAfterNode = addonAfter
      ? h('span', { class: addonClassName }, [addonAfter])
      : null
    const mergedWrapperClassName = classNames(prefixCls + '-wrapper', {
      [wrapperClassName]: addonBefore || addonAfter
    })
    const mergedGroupClassName = classNames(className, `${prefixCls}-group-wrapper`, {
      [`${prefixCls}-group-wrapper-sm`]: size === 'small',
      [`${prefixCls}-group-wrapper-lg`]: size === 'large'
    })

    return h(
      'span',
      { class: mergedGroupClassName, style },
      [
        h(
          'span',
          { class: mergedWrapperClassName },
          [addonBeforeNode, cloneCompatVNode(labeledElement, { style: null }), addonAfterNode]
        )
      ]
    )
  }

  methods.renderTextAreaWithClearIcon = function renderTextAreaWithClearIcon(prefixCls, element) {
    const h = this.$createElement
    const {
      value,
      allowClear,
      className,
      style
    } = this.$props

    if (!allowClear) {
      return cloneCompatVNode(element, {
        props: { value }
      })
    }

    const affixWrapperCls = classNames(className, `${prefixCls}-affix-wrapper`, `${prefixCls}-affix-wrapper-textarea-with-clear-btn`)
    return h(
      'span',
      { class: affixWrapperCls, style },
      [
        cloneCompatVNode(element, {
          style: null,
          props: { value }
        }),
        this.renderClearIcon(prefixCls)
      ]
    )
  }

  Object.defineProperty(ClearableLabeledInput, '__jshVue3CompatPatched', {
    value: true,
    configurable: true
  })
}

function patchTriggerForVue3Compat() {
  if (!Trigger || Trigger.__jshVue3CompatPatched) {
    return
  }

  Trigger.render = function render() {
    const h = this.$createElement
    const sPopupVisible = this.sPopupVisible
    const {
      forceRender,
      alignPoint
    } = this.$props
    const children = filterEmpty(this.$slots.default || [])

    if (!children.length) {
      return null
    }

    const child = children[0]
    this.childOriginEvents = getEvents(child)
    const newChildProps = {
      props: {},
      on: {},
      key: 'trigger'
    }

    if (this.isContextmenuToShow()) {
      newChildProps.on.contextmenu = this.onContextmenu
    } else {
      newChildProps.on.contextmenu = this.createTwoChains('contextmenu')
    }

    if (this.isClickToHide() || this.isClickToShow()) {
      newChildProps.on.click = this.onClick
      newChildProps.on.mousedown = this.onMousedown
      newChildProps.on.touchstart = this.onTouchstart
    } else {
      newChildProps.on.click = this.createTwoChains('click')
      newChildProps.on.mousedown = this.createTwoChains('mousedown')
      newChildProps.on.touchstart = this.createTwoChains('onTouchstart')
    }

    if (this.isMouseEnterToShow()) {
      newChildProps.on.mouseenter = this.onMouseenter
      if (alignPoint) {
        newChildProps.on.mousemove = this.onMouseMove
      }
    } else {
      newChildProps.on.mouseenter = this.createTwoChains('mouseenter')
    }

    if (this.isMouseLeaveToHide()) {
      newChildProps.on.mouseleave = this.onMouseleave
    } else {
      newChildProps.on.mouseleave = this.createTwoChains('mouseleave')
    }

    if (this.isFocusToShow() || this.isBlurToHide()) {
      newChildProps.on.focus = this.onFocus
      newChildProps.on.blur = this.onBlur
    } else {
      newChildProps.on.focus = this.createTwoChains('focus')
      newChildProps.on.blur = e => {
        if (e && (!e.relatedTarget || !contains(e.target, e.relatedTarget))) {
          this.createTwoChains('blur')(e)
        }
      }
    }

    this.trigger = cloneCompatVNode(child, newChildProps)

    return h(ContainerRender, {
      attrs: {
        parent: this,
        visible: sPopupVisible,
        autoMount: false,
        forceRender,
        getComponent: this.getComponent,
        getContainer: this.getContainer,
        children: ({ renderComponent }) => {
          this.renderComponent = renderComponent
          return this.trigger
        }
      }
    })
  }

  Object.defineProperty(Trigger, '__jshVue3CompatPatched', {
    value: true,
    configurable: true
  })
}

export function patchAntdVue2ForVue3Compat() {
  patchClearableLabeledInputForVue3Compat()
  patchTriggerForVue3Compat()

  const methods = FormItem && FormItem.methods
  if (!methods || FormItem.__jshVue3CompatPatched) {
    return
  }

  methods.getControls = function getControls(childrenArray = [], recursively) {
    let controls = []
    for (let i = 0; i < childrenArray.length; i++) {
      if (!recursively && controls.length > 0) {
        break
      }

      const child = childrenArray[i]
      if (isEmptyTextNode(child)) {
        continue
      }

      if (getSlotOptions(child).__ANT_FORM_ITEM) {
        continue
      }

      const children = getAllChildren(child)
      const attrs = getVNodeAttrs(child)
      if (FIELD_META_PROP in attrs) {
        controls.push(child)
      } else if (children) {
        controls = controls.concat(this.getControls(children, recursively))
      }
    }
    return controls
  }

  methods.getChildAttr = function getChildAttr(prop) {
    const child = this.getOnlyControl()
    if (!child) {
      return undefined
    }
    const data = child.data || (child.$vnode && child.$vnode.data) || {}
    const attrs = data.attrs || child.props || {}
    return data[prop] || attrs[prop]
  }

  methods.decoratorChildren = function decoratorChildren(vnodes = []) {
    const FormContext = this.FormContext
    const children = cloneCompatVNodes(vnodes)

    for (let i = 0, len = children.length; i < len; i++) {
      const vnode = children[i]
      if (!vnode || isEmptyTextNode(vnode)) {
        continue
      }
      if (getSlotOptions(vnode).__ANT_FORM_ITEM) {
        break
      }
      if (Array.isArray(vnode.children)) {
        vnode.children = this.decoratorChildren(vnode.children)
      } else if (vnode.componentOptions && Array.isArray(vnode.componentOptions.children)) {
        vnode.componentOptions.children = this.decoratorChildren(vnode.componentOptions.children)
      }
      const option = this.decoratorOption(vnode)
      if (option && option[0]) {
        children[i] = decorateCompatField(FormContext.form, option[0], option[1], vnode)
      }
    }
    return children
  }

  FormItem.render = function render() {
    const $slots = this.$slots
    const decoratorFormProps = this.decoratorFormProps
    const fieldDecoratorId = this.fieldDecoratorId
    const fieldDecoratorOptions = this.fieldDecoratorOptions === undefined ? {} : this.fieldDecoratorOptions
    const FormContext = this.FormContext

    let child = filterEmpty($slots.default || [])
    if (decoratorFormProps.form && fieldDecoratorId && child.length) {
      child = cloneCompatVNodes(child)
      child[0] = decorateCompatField(decoratorFormProps.form, fieldDecoratorId, fieldDecoratorOptions, child[0])
      this.slotDefault = child
    } else if (FormContext.form) {
      child = cloneCompatVNodes(child)
      this.slotDefault = this.decoratorChildren(child)
    } else {
      this.slotDefault = child
    }
    return this.renderFormItem()
  }

  Object.defineProperty(FormItem, '__jshVue3CompatPatched', {
    value: true,
    configurable: true
  })
}
