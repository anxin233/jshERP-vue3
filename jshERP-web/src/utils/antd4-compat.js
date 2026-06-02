import { defineComponent, h, ref } from 'vue'
import {
  Checkbox,
  DatePicker,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Select,
  Switch,
  Table,
  Tooltip,
  TreeSelect,
  Upload
} from 'ant-design-vue'

function readEventValue(value) {
  return value && value.target ? value.target.value : value
}

function call(fn, ...args) {
  if (Array.isArray(fn)) {
    fn.forEach(item => call(item, ...args))
  } else if (typeof fn === 'function') {
    fn(...args)
  }
}

function normalizeStyleValue(style) {
  if (typeof style === 'string') {
    return style.split(';').reduce((result, item) => {
      const index = item.indexOf(':')
      if (index > -1) {
        const key = item.slice(0, index).trim()
        const value = item.slice(index + 1).trim()
        if (key) {
          result[key] = value
        }
      }
      return result
    }, {})
  }
  if (Array.isArray(style)) {
    return style.map(normalizeStyleValue)
  }
  return style
}

function normalizeAttrs(attrs) {
  const next = { ...attrs }
  if (next.style !== undefined) {
    next.style = normalizeStyleValue(next.style)
  }
  return next
}

function createValueBridge(name, Component, valueProp = 'value', eventValueReader = readEventValue) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      value: undefined,
      modelValue: undefined
    },
    emits: ['update:modelValue', `update:${valueProp}`, 'change', 'input'],
    setup(props, { attrs, slots, emit }) {
      return () => {
        const mergedProps = normalizeAttrs(attrs)
        if (props.modelValue !== undefined) {
          mergedProps[valueProp] = props.modelValue
        } else if (props.value !== undefined) {
          mergedProps[valueProp] = props.value
        }
        const originalChange = mergedProps.onChange
        const originalInput = mergedProps.onInput
        const originalUpdate = mergedProps[`onUpdate:${valueProp}`]
        mergedProps[`onUpdate:${valueProp}`] = value => {
          emit('update:modelValue', value)
          emit(`update:${valueProp}`, value)
          call(originalUpdate, value)
        }
        mergedProps.onChange = (...args) => {
          const value = eventValueReader(args[0], args)
          emit('update:modelValue', value)
          emit(`update:${valueProp}`, value)
          emit('change', ...args)
          call(originalChange, ...args)
        }
        if (originalInput) {
          mergedProps.onInput = (...args) => {
            const value = eventValueReader(args[0], args)
            emit('update:modelValue', value)
            emit(`update:${valueProp}`, value)
            emit('input', ...args)
            call(originalInput, ...args)
          }
        }
        return h(Component, mergedProps, slots)
      }
    }
  })
}

const CompatInput = createValueBridge('CompatAInput', Input)
const CompatInputPassword = createValueBridge('CompatAInputPassword', Input.Password)
const CompatTextarea = createValueBridge('CompatATextarea', Input.TextArea)
const CompatSelect = createValueBridge('CompatASelect', Select, 'value', value => value)
const CompatInputNumber = createValueBridge('CompatAInputNumber', InputNumber, 'value', value => value)
const CompatDatePicker = createValueBridge('CompatADatePicker', DatePicker, 'value', value => value)
const CompatRangePicker = createValueBridge('CompatARangePicker', DatePicker.RangePicker, 'value', value => value)
const CompatTreeSelect = createValueBridge('CompatATreeSelect', TreeSelect, 'value', value => value)
const CompatSwitch = createValueBridge('CompatASwitch', Switch, 'checked', value => value)
const CompatCheckbox = createValueBridge('CompatACheckbox', Checkbox, 'checked', value => value && value.target ? value.target.checked : value)
const CompatRadioGroup = createValueBridge('CompatARadioGroup', Radio.Group, 'value', value => value && value.target ? value.target.value : value)

const CompatModal = defineComponent({
  name: 'CompatAModal',
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: undefined },
    open: { type: Boolean, default: undefined },
    modelValue: { type: Boolean, default: undefined }
  },
  emits: ['update:visible', 'update:open', 'update:modelValue', 'ok', 'cancel'],
  setup(props, { attrs, slots, emit }) {
    return () => {
      const originalOk = attrs.onOk
      const originalCancel = attrs.onCancel
      const open = props.open !== undefined ? props.open : (props.modelValue !== undefined ? props.modelValue : props.visible)
      return h(Modal, {
        ...normalizeAttrs(attrs),
        open,
        onOk: (...args) => {
          emit('ok', ...args)
          call(originalOk, ...args)
        },
        onCancel: (...args) => {
          emit('update:visible', false)
          emit('update:open', false)
          emit('update:modelValue', false)
          emit('cancel', ...args)
          call(originalCancel, ...args)
        }
      }, slots)
    }
  }
})

function createOpenBridge(name, Component) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      visible: { type: Boolean, default: undefined },
      open: { type: Boolean, default: undefined }
    },
    emits: ['update:visible', 'update:open', 'visibleChange', 'openChange'],
    setup(props, { attrs, slots, emit }) {
      return () => {
        const originalOpenChange = attrs.onOpenChange || attrs.onVisibleChange
        const open = props.open !== undefined ? props.open : props.visible
        return h(Component, {
          ...normalizeAttrs(attrs),
          open,
          onOpenChange: value => {
            emit('update:visible', value)
            emit('update:open', value)
            emit('visibleChange', value)
            emit('openChange', value)
            call(originalOpenChange, value)
          }
        }, slots)
      }
    }
  })
}

const CompatTooltip = createOpenBridge('CompatATooltip', Tooltip)
const CompatDropdown = createOpenBridge('CompatADropdown', Dropdown)
const CompatPopover = createOpenBridge('CompatAPopover', Popover)

const CompatForm = defineComponent({
  name: 'CompatAForm',
  inheritAttrs: false,
  setup(props, { attrs, slots }) {
    return () => h(Form, normalizeAttrs(attrs), slots)
  }
})

const CompatFormItem = defineComponent({
  name: 'CompatAFormItem',
  inheritAttrs: false,
  setup(props, { attrs, slots }) {
    return () => h(Form.Item, normalizeAttrs(attrs), slots)
  }
})

function normalizeColumn(column, slots) {
  const next = { ...column }
  const slotName = column && column.scopedSlots && column.scopedSlots.customRender
  const oldCustomRender = column && column.customRender
  if (slotName && slots[slotName]) {
    next.customRender = payload => {
      const text = payload && Object.prototype.hasOwnProperty.call(payload, 'text') ? payload.text : payload
      const record = payload && payload.record
      const index = payload && payload.index
      return slots[slotName]({ text, record, index })
    }
  } else if (typeof oldCustomRender === 'function') {
    next.customRender = payload => {
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'text')) {
        return oldCustomRender(payload.text, payload.record, payload.index, payload.column)
      }
      return oldCustomRender(payload)
    }
  }
  delete next.scopedSlots
  if (Array.isArray(next.children)) {
    next.children = next.children.map(child => normalizeColumn(child, slots))
  }
  return next
}

const CompatTable = defineComponent({
  name: 'CompatATable',
  inheritAttrs: false,
  props: {
    columns: Array
  },
  setup(props, { attrs, slots }) {
    return () => {
      const columns = Array.isArray(props.columns)
        ? props.columns.map(column => normalizeColumn(column, slots))
        : props.columns
      return h(Table, { ...normalizeAttrs(attrs), columns }, slots)
    }
  }
})

const CompatFormModel = defineComponent({
  name: 'CompatAFormModel',
  inheritAttrs: false,
  props: {
    model: Object,
    rules: Object
  },
  setup(props, { attrs, slots, expose }) {
    const formRef = ref()
    expose({
      validate(callback) {
        const form = formRef.value
        if (!form || !form.validate) {
          callback && callback(true)
          return Promise.resolve()
        }
        const promise = form.validate()
        if (callback) {
          promise.then(() => callback(true)).catch(() => callback(false))
        }
        return promise
      },
      resetFields() {
        return formRef.value && formRef.value.resetFields && formRef.value.resetFields()
      },
      clearValidate() {
        return formRef.value && formRef.value.clearValidate && formRef.value.clearValidate()
      }
    })
    return () => h(Form, { ...normalizeAttrs(attrs), ref: formRef, model: props.model, rules: props.rules }, slots)
  }
})

const CompatFormModelItem = defineComponent({
  name: 'CompatAFormModelItem',
  inheritAttrs: false,
  props: {
    prop: [String, Array],
    name: [String, Array]
  },
  setup(props, { attrs, slots }) {
    return () => h(Form.Item, {
      ...normalizeAttrs(attrs),
      name: props.name || props.prop
    }, slots)
  }
})

function createLegacyForm() {
  const values = {}
  return {
    getFieldDecorator(name) {
      return vnode => vnode
    },
    getFieldProps(name) {
      return {
        value: values[name],
        on: {
          change(event) {
            values[name] = readEventValue(event)
          }
        }
      }
    },
    setFieldsValue(nextValues = {}) {
      Object.assign(values, nextValues)
    },
    resetFields() {
      Object.keys(values).forEach(key => {
        delete values[key]
      })
    },
    validateFields(callback) {
      callback && callback(null, { ...values })
    }
  }
}

function replaceComponent(app, name, component) {
  if (app._context && app._context.components) {
    delete app._context.components[name]
  }
  app.component(name, component)
}

export function installAntd4Compat(app) {
  replaceComponent(app, 'AForm', CompatForm)
  replaceComponent(app, 'AFormItem', CompatFormItem)
  replaceComponent(app, 'AModal', CompatModal)
  replaceComponent(app, 'AInput', CompatInput)
  replaceComponent(app, 'AInputPassword', CompatInputPassword)
  replaceComponent(app, 'ATextarea', CompatTextarea)
  replaceComponent(app, 'ASelect', CompatSelect)
  replaceComponent(app, 'AInputNumber', CompatInputNumber)
  replaceComponent(app, 'ADatePicker', CompatDatePicker)
  replaceComponent(app, 'ARangePicker', CompatRangePicker)
  replaceComponent(app, 'ATreeSelect', CompatTreeSelect)
  replaceComponent(app, 'ASwitch', CompatSwitch)
  replaceComponent(app, 'ACheckbox', CompatCheckbox)
  replaceComponent(app, 'ARadioGroup', CompatRadioGroup)
  replaceComponent(app, 'ATable', CompatTable)
  replaceComponent(app, 'ATooltip', CompatTooltip)
  replaceComponent(app, 'ADropdown', CompatDropdown)
  replaceComponent(app, 'APopover', CompatPopover)
  replaceComponent(app, 'AFormModel', CompatFormModel)
  replaceComponent(app, 'AFormModelItem', CompatFormModelItem)
  app.config.globalProperties.$form = {
    createForm: createLegacyForm
  }
  app.directive('decorator', {})
}
