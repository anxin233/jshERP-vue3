<template>
  <a-input-group compact style="width: 100%; display: flex;">
    <a-input
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :read-only="readOnly"
      style="flex: 1; min-width: 0;"
      @update:value="handleValueChange"
    />
    <a-button :disabled="disabled" @click="handleSearch">
      <template #icon><legacy-icon type="search" /></template>
    </a-button>
  </a-input-group>
</template>

<script>
  /**
   * Jeecg Online 报表弹窗选择的轻量兼容实现。
   * 本 ERP 未接入 cgreport/Online 报表，保留 props/事件签名供 JEditableTable、JSuperQuery 使用。
   */
  export default {
    name: 'JPopup',
    props: {
      value: {
        type: [String, Number],
        default: ''
      },
      modelValue: {
        type: [String, Number],
        default: undefined
      },
      placeholder: {
        type: String,
        default: '请选择'
      },
      code: {
        type: String,
        default: ''
      },
      field: {
        type: String,
        default: ''
      },
      orgFields: {
        type: String,
        default: ''
      },
      destFields: {
        type: String,
        default: ''
      },
      groupId: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      },
      readOnly: {
        type: Boolean,
        default: false
      },
      triggerChange: {
        type: Boolean,
        default: false
      }
    },
    emits: ['input', 'update:value', 'update:modelValue', 'callback'],
    computed: {
      displayValue () {
        if (this.modelValue !== undefined && this.modelValue !== null) {
          return this.modelValue
        }
        return this.value != null ? this.value : ''
      }
    },
    methods: {
      buildOthers (val) {
        const others = {}
        const destList = this.destFields
          ? String(this.destFields).split(',').map(s => s.trim()).filter(Boolean)
          : []
        if (destList.length > 0) {
          destList.forEach(destKey => {
            others[destKey] = val
          })
          return others
        }
        const key = this.field || (this.code ? String(this.code) : '')
        if (key) {
          others[key] = val
        }
        return others
      },
      emitChange (val) {
        const others = this.buildOthers(val)
        this.$emit('input', val, others)
        this.$emit('update:value', val)
        this.$emit('update:modelValue', val)
        if (this.triggerChange) {
          this.$emit('callback', others)
        }
      },
      handleValueChange (val) {
        this.emitChange(val)
      },
      handleSearch () {
        if (this.code) {
          this.$message.info('当前系统未接入 Online 报表弹窗（j-popup），请使用条码选择或字典字段')
        } else {
          this.$message.info('未配置报表编码（code）')
        }
      }
    }
  }
</script>
