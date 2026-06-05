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
      style="top:20%;height: 50%;"
      @ok="handleOk"
      @cancel="handleCancel">
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel">
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="机器码" name="platformKey">
            <a-input
              :value="formModel.platformKey"
              :readOnly="true"
              @change="handleFieldChange('platformKey', $event)" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="插件激活码" name="platformValue">
            <a-textarea
              :rows="2"
              placeholder="请输入插件激活码"
              :value="formModel.platformValue"
              @change="handleFieldChange('platformValue', $event)" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import { getPlatformConfigByKey } from '@/api/api'
  import { mixinDevice } from '@/utils/mixin'
  import { getAction, postAction } from '../../../api/manage'

  export default {
    name: 'PluginModal',
    emits: ['ok', 'close'],
    mixins: [mixinDevice],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        machineCode: '',
        activationCode: '',
        formModel: {
          platformKey: '',
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
      edit() {
        this.model = {}
        this.formModel = {
          platformKey: '',
          platformValue: ''
        }
        getAction('/plugin/getMacWithSecret').then((res) => {
          if (res && res.code === 200) {
            this.model.platformKey = res.data
            getPlatformConfigByKey({ platformKey: 'activation_code' }).then((configRes) => {
              if (configRes && configRes.code === 200) {
                this.model.platformValue = configRes.data.platformValue
                this.formModel = {
                  platformKey: this.model.platformKey,
                  platformValue: this.model.platformValue
                }
                this.visible = true
                this.$nextTick(this.clearValidate)
              }
            })
          }
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
          const formData = Object.assign({}, this.model, this.formModel, {
            platformKey: 'activation_code'
          })
          postAction('/platformConfig/updatePlatformConfigByKey', formData).then((res) => {
            if (res.code === 200) {
              this.$message.info('填写成功')
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
