import { cloneVNode as cloneVueVNode } from 'vue'
import FormItem from 'ant-design-vue/es/form/FormItem'
import { FIELD_DATA_PROP, FIELD_META_PROP } from 'ant-design-vue/es/form/constants'
import { filterEmpty, getAllChildren, getSlotOptions } from 'ant-design-vue/es/_util/props-util'

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

function cloneCompatVNode(vnode) {
  if (!vnode) {
    return vnode
  }
  if (vnode.__v_isVNode) {
    return cloneVueVNode(vnode)
  }
  return { ...vnode }
}

function cloneCompatVNodes(vnodes = []) {
  if (!Array.isArray(vnodes)) {
    return []
  }
  return vnodes.map(cloneCompatVNode)
}

export function patchAntdVue2ForVue3Compat() {
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
    const getFieldDecorator = FormContext.form.getFieldDecorator
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
        children[i] = getFieldDecorator(option[0], option[1], this)(vnode)
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
      const getFieldDecorator = decoratorFormProps.form.getFieldDecorator
      child = cloneCompatVNodes(child)
      child[0] = getFieldDecorator(fieldDecoratorId, fieldDecoratorOptions, this)(child[0])
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
