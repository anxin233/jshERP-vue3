<template>
  <div>
    <a-select
      v-bind="$attrs"
      show-search
      :filter-option="false"
      :value="normalizedValue"
      :loading="loading || adding"
      @search="onSearch"
      @change="handleChange"
      @blur="onBlur"
      @dropdownVisibleChange="onDropdownVisibleChange">

      <!-- 已有选项：按搜索词过滤显示 -->
      <a-select-option
        v-for="opt in filteredOptions"
        :key="opt.value"
        :value="opt.value">
        {{ opt.label }}
      </a-select-option>

      <!-- 下拉展开时始终显示“添加”入口，便于在选择时直接新增 -->
      <a-select-option
        v-if="showAddEntry"
        key="__add_new__"
        value="__add_new__"
        class="dynamic-option-add-entry">
        <legacy-icon type="plus-circle" style="color:#1890ff;margin-right:6px" />
        <span style="color:#1890ff">{{ addEntryLabel }}</span>
      </a-select-option>
    </a-select>

    <!-- 未输入搜索词时点击“添加”则弹出输入框 -->
    <a-modal
      :visible="addModalVisible"
      title="添加新选项"
      okText="确定"
      cancelText="取消"
      @ok="onAddModalOk"
      @cancel="addModalVisible = false">
      <a-form-item label="显示名称" :label-col="{span:6}" :wrapper-col="{span:16}">
        <a-input v-model="addModalLabel" placeholder="请输入新选项的显示名称" @pressEnter="onAddModalOk"/>
      </a-form-item>
    </a-modal>
  </div>
</template>

<script>
import { getAction, postAction } from '@/api/manage'

export default {
  name: 'DynamicOptionSelect',
  inheritAttrs: false,
  props: {
    code: {
      type: String,
      required: true
    },
    value: {
      default: undefined
    }
  },
  data () {
    return {
      options: [],
      loading: false,
      adding: false,
      searchText: '',
      dropdownVisible: false,
      addModalVisible: false,
      addModalLabel: ''
    }
  },
  computed: {
    normalizedValue () {
      if (this.value === undefined || this.value === null) return undefined
      return String(this.value)
    },
    filteredOptions () {
      if (!this.searchText) return this.options
      const kw = this.searchText.trim().toLowerCase()
      return this.options.filter(o =>
        o.label.toLowerCase().includes(kw) || o.value.toLowerCase().includes(kw)
      )
    },
    // 下拉展开时始终显示“添加”入口
    showAddEntry () {
      return this.dropdownVisible
    },
    // 有搜索词且无精确匹配时显示“添加'xxx'”，否则显示“＋ 添加新选项”
    addEntryLabel () {
      const kw = (this.searchText || '').trim()
      if (kw && !this.options.some(o =>
        o.label.toLowerCase() === kw.toLowerCase() || String(o.value).toLowerCase() === kw.toLowerCase()
      )) {
        return `添加"${kw}"`
      }
      return '＋ 添加新选项'
    }
  },
  watch: {
    code (val) {
      if (val) this.loadOptions()
    }
  },
  created () {
    this.loadOptions()
  },
  methods: {
    loadOptions () {
      if (!this.code) return
      this.loading = true
      getAction('/option/list', { code: this.code }).then(res => {
        if (res.code === 200) {
          const rows = (res.data && res.data.rows) || []
          this.options = rows.map(r => ({
            value: String(r.value),
            label: r.label
          }))
          // 没有当前值时，自动填入默认选项
          const hasValue = this.value !== undefined && this.value !== null && this.value !== ''
          if (!hasValue && rows.length > 0) {
            const def = rows.find(r => r.isDefault) || rows[0]
            const val = String(def.value)
            this.$nextTick(() => {
              this.$emit('change', val)
              this.$emit('input', val)
            })
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },

    onSearch (text) {
      this.searchText = text || ''
    },

    onBlur () {
      this.searchText = ''
    },

    onDropdownVisibleChange (open) {
      this.dropdownVisible = open
    },

    handleChange (val) {
      if (val === '__add_new__') {
        const kw = (this.searchText || '').trim()
        if (kw && !this.options.some(o =>
          o.label.toLowerCase() === kw.toLowerCase() || String(o.value).toLowerCase() === kw.toLowerCase()
        )) {
          this.addNewOption(kw)
        } else {
          this.addModalLabel = ''
          this.addModalVisible = true
        }
        return
      }
      this.searchText = ''
      this.$emit('change', val)
      this.$emit('input', val)
    },

    onAddModalOk () {
      const label = (this.addModalLabel || '').trim()
      if (!label) {
        this.$message.warning('请输入显示名称')
        return
      }
      this.addModalVisible = false
      this.addModalLabel = ''
      this.addNewOption(label)
    },

    addNewOption (label) {
      if (!label) return
      this.adding = true
      postAction('/option/add', {
        groupCode: this.code,
        value: label,
        label: label,
        sort: this.options.length,
        enabled: true,
        isDefault: false,
        hidden: false,
        deleteFlag: '0'
      }).then(res => {
        if (res.code === 200) {
          this.$message.success(`"${label}" 已添加到选项`)
          // 重新加载选项列表，然后自动选中新项
          this.loading = true
          getAction('/option/list', { code: this.code }).then(res2 => {
            if (res2.code === 200) {
              const rows = (res2.data && res2.data.rows) || []
              this.options = rows.map(r => ({
                value: String(r.value),
                label: r.label
              }))
              // 选中刚才新增的项
              const newOpt = this.options.find(o => o.label === label)
              if (newOpt) {
                this.searchText = ''
                this.$emit('change', newOpt.value)
                this.$emit('input', newOpt.value)
              }
            }
          }).finally(() => {
            this.loading = false
          })
        } else {
          this.$message.warning('添加失败：' + (res.data || ''))
        }
      }).finally(() => {
        this.adding = false
      })
    }
  }
}
</script>

<style>
/* 让"添加"条目更突出 */
.dynamic-option-add-entry {
  border-top: 1px dashed #d9d9d9 !important;
  margin-top: 4px !important;
  padding-top: 6px !important;
}
</style>
