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
      style="top:25%;height: 40%;"
      @ok="handleOk"
      @cancel="handleCancel">
      <a-spin :spinning="confirmLoading">
        <a-form-model ref="formRef" id="platformConfigModal" :model="formModel">
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="配置名称" prop="platformKeyInfo" name="platformKeyInfo">
            <a-input
              placeholder="请输入配置名称"
              :value="formModel.platformKeyInfo"
              :readOnly="true"
              @change="handleFieldChange('platformKeyInfo', $event)" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="配置值" prop="platformValue" name="platformValue">
            <a-input
              placeholder="请输入配置值"
              :value="formModel.platformValue"
              @change="handleFieldChange('platformValue', $event)" />
          </a-form-model-item>
        </a-form-model>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import { addPlatformConfig, editPlatformConfig } from '@/api/api'
  import { autoJumpNextInput } from '@/utils/util'
  import { mixinDevice } from '@/utils/mixin'

  export default {
    name: 'PlatformConfigModal',
    mixins: [mixinDevice],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        formModel: {
          platformKeyInfo: '',
          platformValue: ''
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        confirmLoading: false
      }
    },
    methods: {
      add() {
        this.edit({})
      },
      edit(record) {
        this.model = Object.assign({}, record)
        this.formModel = Object.assign({
          platformKeyInfo: '',
          platformValue: ''
        }, pick(this.model, 'platformKeyInfo', 'platformValue'))
        this.visible = true
        this.$nextTick(() => {
          this.clearValidate()
          autoJumpNextInput('platformConfigModal')
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
          const request = this.model.id ? editPlatformConfig(formData) : addPlatformConfig(formData)
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
      }
    }
  }
</script>

<style scoped>
</style>
