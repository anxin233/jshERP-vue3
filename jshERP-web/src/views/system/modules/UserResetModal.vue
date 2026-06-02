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
      style="top:25%;height:35%;"
      @ok="handleOk"
      @cancel="handleCancel">
      <a-spin :spinning="confirmLoading">
        <a-form-model ref="formRef" :model="formModel" :rules="formRules">
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="新密码" prop="password" name="password">
            <a-input-password
              placeholder="请输入新密码"
              :value="formModel.password"
              @change="handleFieldChange('password', $event)" />
          </a-form-model-item>
        </a-form-model>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import md5 from 'md5'
  import pick from 'lodash.pick'
  import { resetPwd } from '@/api/api'
  import { mixinDevice } from '@/utils/mixin'

  export default {
    name: 'UserResetModal',
    mixins: [mixinDevice],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        maskStyle: '',
        formModel: {
          password: ''
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
          password: [
            { required: true, message: '请输入新密码!' },
            { pattern: /^(?=.*[a-z])(?=.*\d).{6,}$/, message: '用户密码至少要有数字和小写字母，并且长度至少6位!' }
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
        this.formModel = Object.assign({ password: '' }, pick(this.model, 'password'))
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
          const bodyParam = {
            id: formData.id,
            password: md5(formData.password)
          }
          resetPwd(bodyParam).then((res) => {
            if (res.code === 200) {
              this.$message.success('重置密码成功！')
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
