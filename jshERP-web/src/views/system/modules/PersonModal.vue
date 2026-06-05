<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="800"
      :open="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskStyle="{ top: '93px', left: '154px' }"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      cancelText="取消"
      okText="保存"
      style="top:20%;height: 45%;"
      @ok="handleOk"
      @cancel="handleCancel">
      <template v-if="isReadOnly" #footer>
        <a-button key="back" @click="handleCancel">
          取消
        </a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" id="personModal" :model="formModel" :rules="formRules">
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="姓名" name="name">
            <a-input
              placeholder="请输入姓名"
              :value="formModel.name"
              @change="handleFieldChange('name', $event)" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="类型" name="type">
            <a-select
              placeholder="请选择类型"
              :value="formModel.type"
              @change="handleFieldChange('type', $event)">
              <a-select-option value="销售员">销售员</a-select-option>
              <a-select-option value="财务员">财务员</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序" name="sort">
            <a-input
              placeholder="请输入排序"
              :value="formModel.sort"
              @change="handleFieldChange('sort', $event)" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import { addPerson, editPerson, checkPerson } from '@/api/api'
  import { autoJumpNextInput } from '@/utils/util'
  import { mixinDevice } from '@/utils/mixin'

  export default {
    name: 'PersonModal',
    mixins: [mixinDevice],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        formModel: {
          name: '',
          type: undefined,
          sort: ''
        },
        isReadOnly: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        confirmLoading: false,
        formRules: {
          name: [
            { required: true, message: '请输入姓名!' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
            { validator: this.validatePersonName, trigger: 'blur' }
          ],
          type: [
            { required: true, message: '请选择类型!' }
          ]
        }
      }
    },
    methods: {
      add() {
        this.edit({})
      },
      edit(record) {
        this.model = Object.assign({}, record)
        this.formModel = Object.assign({
          name: '',
          type: undefined,
          sort: ''
        }, pick(this.model, 'name', 'type', 'sort'))
        this.visible = true
        this.$nextTick(() => {
          this.clearValidate()
          autoJumpNextInput('personModal')
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        this.validateForm((valid) => {
          if (!valid) {
            return
          }
          this.confirmLoading = true
          const formData = Object.assign({}, this.model, this.formModel)
          const request = this.model.id ? editPerson(formData) : addPerson(formData)
          request.then((res) => {
            if (res.code === 200) {
              this.$emit('ok')
            } else {
              this.$message.warning(res.data.message)
            }
          }).finally(() => {
            this.confirmLoading = false
            this.close()
          })
        })
      },
      handleCancel() {
        this.close()
      },
      handleFieldChange(field, event) {
        this.formModel[field] = event && event.target ? event.target.value : event
      },
      validateForm(callback) {
        const formRef = this.$refs.formRef
        if (!formRef || !formRef.validate) {
          callback(true)
          return
        }
        formRef.validate(callback)
      },
      clearValidate() {
        const formRef = this.$refs.formRef
        if (formRef && formRef.clearValidate) {
          formRef.clearValidate()
        }
      },
      validatePersonName(rule, value, callback) {
        if (!value) {
          callback()
          return
        }
        const params = {
          name: value,
          id: this.model.id ? this.model.id : 0
        }
        checkPerson(params).then((res) => {
          if (res && res.code === 200) {
            if (!res.data.status) {
              callback()
            } else {
              callback('名称已经存在')
            }
          } else {
            callback(res.data)
          }
        })
      }
    }
  }
</script>

<style scoped>
</style>
