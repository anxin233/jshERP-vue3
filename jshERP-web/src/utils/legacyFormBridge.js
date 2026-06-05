import { VALIDATE_NO_PASSED } from '@/utils/JEditableTableUtil'

/**
 * 兼容旧版 form.getFieldValue / setFieldsValue / validateFields API，
 * 供 JEditableTableMixin、MaterialModal 等仍依赖 JEditableTableUtil 的页面使用。
 */
function pickFormValues(formModel, fieldNames) {
  const model = formModel || {}
  if (!fieldNames || !fieldNames.length) {
    return { ...model }
  }
  const result = {}
  fieldNames.forEach(name => {
    result[name] = model[name]
  })
  return result
}

export function createLegacyFormBridge(vm, formRefKey = 'formRef', formModelKey = 'formModel') {
  return {
    validateFields(arg1, arg2) {
      let fieldNames = null
      let callback = null
      if (typeof arg1 === 'function') {
        callback = arg1
      } else if (Array.isArray(arg1)) {
        fieldNames = arg1
        callback = arg2
      } else if (typeof arg1 === 'string') {
        fieldNames = [arg1]
        callback = arg2
      }

      const formRef = vm.$refs[formRefKey]
      if (!formRef || !formRef.validate) {
        const values = pickFormValues(vm[formModelKey], fieldNames)
        callback && callback(null, values)
        return Promise.resolve(values)
      }

      const validatePromise = fieldNames && fieldNames.length
        ? formRef.validate(fieldNames)
        : formRef.validate()

      return validatePromise.then(() => {
        const values = pickFormValues(vm[formModelKey], fieldNames)
        callback && callback(null, values)
        return values
      }).catch(() => {
        callback && callback({})
        return Promise.reject({ error: VALIDATE_NO_PASSED })
      })
    },
    getFieldValue(name) {
      return vm[formModelKey] ? vm[formModelKey][name] : undefined
    },
    setFieldsValue(values = {}) {
      if (!vm[formModelKey]) {
        vm[formModelKey] = {}
      }
      Object.assign(vm[formModelKey], values)
    },
    resetFields() {
      if (!vm[formModelKey]) {
        vm[formModelKey] = {}
      } else {
        Object.keys(vm[formModelKey]).forEach(key => {
          vm[formModelKey][key] = undefined
        })
      }
      const formRef = vm.$refs[formRefKey]
      if (formRef && formRef.resetFields) {
        formRef.resetFields()
      }
    }
  }
}
