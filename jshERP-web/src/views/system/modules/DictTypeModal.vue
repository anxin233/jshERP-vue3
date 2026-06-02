<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="600"
      :visible="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskStyle="{ top: '93px', left: '154px' }"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      cancelText="取消"
      okText="保存"
      style="top:15%;height: 60%;"
      @ok="handleOk"
      @cancel="handleCancel">
      <a-spin :spinning="confirmLoading">
        <a-form-model ref="formRef" :model="formModel" :rules="formRules">
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="字典名称" prop="dictName" name="dictName">
            <a-input
              placeholder="请输入字典名称"
              :value="formModel.dictName"
              @change="handleFieldChange('dictName', $event)" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="字典类型" prop="dictType" name="dictType">
            <a-input
              placeholder="请输入字典类型"
              :value="formModel.dictType"
              @change="handleFieldChange('dictType', $event)" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态" prop="status" name="status">
            <a-select
              style="width:100%"
              placeholder="请选择状态"
              :value="formModel.status"
              @change="handleFieldChange('status', $event)">
              <a-select-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </a-select-option>
            </a-select>
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
  import { addDictType, editDictType } from '@/api/api'
  import { mixinDevice } from '@/utils/mixin'

  export default {
    name: 'DictModal',
    dicts: ['sys_normal_disable'],
    mixins: [mixinDevice],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        formModel: {
          dictName: '',
          dictType: '',
          status: undefined,
          remark: ''
        },
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
          dictName: [
            { required: true, message: '请输入字典名称!' }
          ],
          dictType: [
            { required: true, message: '请输入字典类型!' }
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
          dictName: '',
          dictType: '',
          status: undefined,
          remark: ''
        }, pick(this.model, 'dictName', 'dictType', 'status', 'remark'))
        this.visible = true
        this.$nextTick(this.clearValidate)
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
          const request = this.model.dictId ? editDictType(formData) : addDictType(formData)
          request.then((res) => {
            if (res.code === 200) {
              this.$emit('ok')
              this.close()
            } else {
              this.$message.warning(res.data.message)
            }
          }).finally(() => {
            this.confirmLoading = false
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
