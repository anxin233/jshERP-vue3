import JEditableTable from '@/components/jeecg/JEditableTable'
import { VALIDATE_NO_PASSED, getRefPromise, validateFormAndTables } from '@/utils/JEditableTableUtil'
import { createLegacyFormBridge } from '@/utils/legacyFormBridge'
import { httpAction, getAction } from '@/api/manage'

export const JEditableTableMixin = {
  components: {
    JEditableTable
  },
  data() {
    return {
      title: '操作',
      visible: false,
      formModel: {},
      form: null,
      confirmLoading: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    }
  },
  created() {
    this.initLegacyFormBridge()
  },
  methods: {
    /** 初始化旧版 form API 桥接（AntD4 formRef + formModel） */
    initLegacyFormBridge() {
      if (!this.form || typeof this.form.validateFields !== 'function') {
        this.form = createLegacyFormBridge(this)
      }
    },

    /** 获取所有的editableTable实例 */
    getAllTable() {
      if (!(this.refKeys instanceof Array)) {
        throw this.throwNotArray('refKeys')
      }
      let values = this.refKeys.map(key => getRefPromise(this, key))
      return Promise.all(values)
    },

    /** 遍历所有的JEditableTable实例 */
    eachAllTable(callback) {
      this.getAllTable().then(tables => {
        tables.forEach((item, index) => {
          if (typeof callback === 'function') {
            callback(item, index)
          }
        })
      })
    },

    /** 弹窗打开后 DOM 才渲染时，重新绑定可编辑表格滚动事件 */
    initEditableTableScroll() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.eachAllTable((table) => {
            if (table && typeof table.initScrollListeners === 'function') {
              table.initScrollListeners()
            }
          })
        }, 80)
      })
    },

    /** 当点击新增按钮时调用此方法 */
    add() {
      if (typeof this.addBefore === 'function') this.addBefore()
      let rowNum = this.addDefaultRowNum
      if (typeof rowNum !== 'number') {
        rowNum = 1
        console.warn('由于你没有在 data 中定义 addDefaultRowNum 或 addDefaultRowNum 不是数字，所以默认添加一条空数据，如果不想默认添加空数据，请将定义 addDefaultRowNum 为 0')
      }
      this.eachAllTable((item) => {
        item.add(rowNum)
      })
      if (typeof this.addAfter === 'function') this.addAfter(this.model)
      this.edit({})
    },
    /** 当点击了编辑（修改）按钮时调用此方法 */
    edit(record) {
      if (typeof this.editBefore === 'function') this.editBefore(record)
      this.visible = true
      this.activeKey = this.refKeys[0]
      this.initLegacyFormBridge()
      this.form.resetFields()
      this.model = Object.assign({}, record)
      if (typeof this.editAfter === 'function') this.editAfter(this.model)
      this.initEditableTableScroll()
    },
    /** 关闭弹窗，并将所有JEditableTable实例回归到初始状态 */
    close() {
      this.visible = false
      this.eachAllTable((item) => {
        item.initialize()
      })
      this.$emit('close')
    },

    /** 查询某个tab的数据 */
    requestSubTableData(url, params, tab, success) {
      tab.loading = true
      getAction(url, params).then(res => {
        if(res && res.code === 200){
          tab.dataSource = res.data.rows
          typeof success === 'function' ? success(res) : ''
        }
      }).finally(() => {
        tab.loading = false
      })
    },
    /** 发起请求，自动判断是执行新增还是修改操作 */
    request(formData) {
      let url = this.url.add, method = 'post'
      if (this.model.id) {
        url = this.url.edit
        method = 'put'
      }
      this.confirmLoading = true
      httpAction(url, formData, method).then((res) => {
        if(res.code === 200){
          this.$emit('ok')
          this.confirmLoading = false
          this.close()
        } else {
          this.$message.warning(res.data.message);
          this.confirmLoading = false
        }
      }).finally(() => {
      })
    },

    handleChangeTabs(key) {
      getRefPromise(this, key).then(editableTable => {
        editableTable.resetScrollTop()
      })
    },
    handleCancel() {
      this.close()
    },
    handleOk() {
      this.initLegacyFormBridge()
      this.getAllTable().then(tables => {
        return validateFormAndTables(this.form, tables)
      }).then(allValues => {
        if (typeof this.classifyIntoFormData !== 'function') {
          throw this.throwNotFunction('classifyIntoFormData')
        }
        let formData = this.classifyIntoFormData(allValues)
        return this.request(formData)
      }).catch(e => {
        if (e.error === VALIDATE_NO_PASSED) {
          this.activeKey = e.index == null ? this.activeKey : this.refKeys[e.index]
        } else {
          console.error(e)
        }
      })
    },

    throwNotFunction(name) {
      return `${name} 未定义或不是一个函数`
    },

    throwNotArray(name) {
      return `${name} 未定义或不是一个数组`
    }

  }
}
