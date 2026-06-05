<template>
  <a-cascader
    class="j-area-linkage"
    :value="innerValue"
    :options="areaOptions"
    :placeholder="placeholder"
    :style="{ width }"
    :field-names="{ label: 'label', value: 'value', children: 'children' }"
    :change-on-select="changeOnSelect"
    allow-clear
    v-bind="attrs"
    @change="handleChange"
  />
</template>

<script>
  import { pcaa } from 'area-data'

  function buildAreaOptions() {
    const provinces = pcaa['86'] || {}
    return Object.keys(provinces).map(provinceCode => ({
      value: provinceCode,
      label: provinces[provinceCode],
      children: buildChildren(provinceCode)
    }))
  }

  function buildChildren(code) {
    const children = pcaa[code] || {}
    return Object.keys(children).map(childCode => {
      const child = {
        value: childCode,
        label: children[childCode]
      }
      const next = buildChildren(childCode)
      if (next.length) {
        child.children = next
      }
      return child
    })
  }

  function findPathByValue(options, value, path = []) {
    for (const option of options) {
      const nextPath = [...path, option.value]
      if (option.value === value) {
        return nextPath
      }
      if (option.children) {
        const result = findPathByValue(option.children, value, nextPath)
        if (result.length) {
          return result
        }
      }
    }
    return []
  }

  export default {
    name: 'JAreaLinkage',
    props: {
      value: {
        type: String,
        default: ''
      },
      modelValue: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: 'cascader'
      },
      width: {
        type: String,
        default: '100%'
      },
      placeholder: {
        type: String,
        default: '请选择地区'
      },
      changeOnSelect: {
        type: Boolean,
        default: true
      }
    },
    emits: ['change', 'input', 'update:value', 'update:modelValue'],
    data() {
      return {
        areaOptions: buildAreaOptions(),
        innerValue: []
      }
    },
    computed: {
      currentValue() {
        return this.modelValue || this.value
      },
      attrs() {
        const attrs = {}
        Object.keys(this.$attrs).forEach(key => {
          if (!/^on[A-Z]|^onUpdate:/.test(key)) {
            attrs[key] = this.$attrs[key]
          }
        })
        return attrs
      }
    },
    watch: {
      currentValue: {
        immediate: true,
        handler(value) {
          this.innerValue = value ? findPathByValue(this.areaOptions, value) : []
        }
      }
    },
    methods: {
      handleChange(values) {
        this.innerValue = values || []
        const value = this.innerValue.length ? this.innerValue[this.innerValue.length - 1] : ''
        this.$emit('change', value)
        this.$emit('input', value)
        this.$emit('update:value', value)
        this.$emit('update:modelValue', value)
      }
    }
  }
</script>

<style lang="less" scoped>
  .j-area-linkage {
    width: 100%;
  }
</style>
