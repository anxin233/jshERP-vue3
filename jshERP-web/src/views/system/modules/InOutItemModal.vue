<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="800"
      :visible="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskStyle="{ top: '93px', left: '154px' }"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      cancelText="取消"
      okText="保存"
      style="top:20%;height: 50%;"
      @ok="handleOk"
      @cancel="handleCancel">
      <template v-if="isReadOnly" #footer>
        <a-button key="back" @click="handleCancel">
          取消
        </a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form-model ref="formRef" id="inOutItemModal" :model="formModel" :rules="formRules">
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称" prop="name" name="name">
            <a-input
              placeholder="请输入名称"
              :value="formModel.name"
              @change="handleFieldChange('name', $event)" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="类型" prop="type" name="type">
            <a-select
              placeholder="请选择类型"
              :disabled="typeDisabled"
              :value="formModel.type"
              @change="handleFieldChange('type', $event)">
              <a-select-option value="收入">收入</a-select-option>
              <a-select-option value="支出">支出</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序" prop="sort" name="sort">
            <a-input
              placeholder="请输入排序"
              :value="formModel.sort"
              @change="handleFieldChange('sort', $event)" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注" prop="remark" name="remark">
            <a-textarea
              :rows="2"
              placeholder="请输入备注"
              :value="formModel.remark"
              @change="handleFieldChange('remark', $event)" />
          </a-form-model-item>
        </a-form-model>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import { addInOutItem, editInOutItem } from '@/api/api'
  import { autoJumpNextInput } from '@/utils/util'
  import { mixinDevice } from '@/utils/mixin'

  export default {
    name: 'InOutItemModal',
    mixins: [mixinDevice],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        formModel: this.createEmptyFormModel(),
        typeParam: '',
        isReadOnly: false,
        typeDisabled: false,
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
            { required: true, message: '请输入名称' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
          ],
          type: [
            { required: true, message: '请选择类型!' }
          ]
        }
      }
    },
    methods: {
      createEmptyFormModel() {
        return {
          name: '',
          type: undefined,
          sort: '',
          remark: ''
        }
      },
      add(type) {
        this.typeParam = type
        this.edit({})
      },
      edit(record) {
        this.model = Object.assign({}, record)
        if (this.typeParam) {
          this.typeDisabled = true
          if (this.typeParam === 'in') {
            this.model.type = '收入'
          } else if (this.typeParam === 'out') {
            this.model.type = '支出'
          }
        } else {
          this.typeDisabled = false
        }
        this.formModel = Object.assign(this.createEmptyFormModel(), pick(this.model, 'name', 'type', 'sort', 'remark'))
        this.visible = true
        this.$nextTick(() => {
          this.clearValidate()
          autoJumpNextInput('inOutItemModal')
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
          const request = this.model.id ? editInOutItem(formData) : addInOutItem(formData)
          request.then((res) => {
            if (res.code === 200) {
              this.$emit('ok')
              this.confirmLoading = false
              this.close()
            } else {
              this.$message.warning(res.data.message)
              this.confirmLoading = false
            }
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
      }
    }
  }
</script>

<style scoped>
</style>
