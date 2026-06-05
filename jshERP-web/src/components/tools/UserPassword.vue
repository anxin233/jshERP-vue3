<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="modalWidth"
      :open="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskStyle="{'top':'93px','left':'154px'}"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="关闭"
      style="top:20%;height: 50%;"
    >
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules">
          <a-form-item label="旧密码" name="oldpassword" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-input-password type="password" placeholder="请输入旧密码" :value="formModel.oldpassword" @change="handleFieldChange('oldpassword', $event)" />
          </a-form-item>
          <a-form-item label="新密码" name="password" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-input-password type="password" placeholder="新密码至少6位，区分大小写" :value="formModel.password" @change="handleFieldChange('password', $event)" />
          </a-form-item>
          <a-form-item label="确认新密码" name="confirmPassword" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-input-password type="password" placeholder="请确认新密码" :value="formModel.confirmPassword" @change="handleFieldChange('confirmPassword', $event)" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import { putAction } from '@/api/manage'
  import { mixinDevice } from '@/utils/mixin'
  import md5 from 'md5'

  export default {
    name: 'UserPassword',
    mixins: [mixinDevice],
    data() {
      return {
        title: '修改密码',
        modalWidth: 800,
        visible: false,
        confirmLoading: false,
        formModel: {
          oldpassword: '',
          password: '',
          confirmPassword: ''
        },
        formRules: {
          oldpassword: [
            { required: true, message: '请输入旧密码!' }
          ],
          password: [
            { required: true, message: '请输入新密码!' },
            { validator: this.handlePassword }
          ],
          confirmPassword: [
            { required: true, message: '请确认新密码!' },
            { validator: this.handleConfirmPassword }
          ]
        },
        confirmDirty: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        url: '/user/updatePwd',
        userId: ''
      }
    },
    methods: {
      show(userId) {
        if (!userId) {
          this.$message.warning('当前系统无登录用户')
          return
        }
        this.userId = userId
        this.formModel = {
          oldpassword: '',
          password: '',
          confirmPassword: ''
        }
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            this.$refs.formRef.resetFields()
          }
        })
        this.visible = true
      },
      handleFieldChange(field, event) {
        this.formModel[field] = event && event.target ? event.target.value : event
      },
      handleCancel() {
        this.close()
      },
      close() {
        this.$emit('close')
        this.visible = false
        this.disableSubmit = false
      },
      handleOk() {
        const formRef = this.$refs.formRef
        if (!formRef) {
          return
        }
        formRef.validate((valid) => {
          if (!valid) {
            return
          }
          this.confirmLoading = true
          const values = { ...this.formModel }
          values.oldpassword = md5(values.oldpassword)
          values.password = md5(values.password)
          const params = Object.assign({ userId: this.userId }, values)
          putAction(this.url, params).then((res) => {
            if (res.code === 200) {
              if (res.data.status === 2 || res.data.status === 3) {
                this.$message.warning(res.data.message)
              } else {
                this.$message.success(res.data.message)
                this.close()
              }
            } else {
              this.$message.warning(res.data.message)
            }
          }).finally(() => {
            this.confirmLoading = false
          })
        })
      },
      handlePassword(rule, value, callback) {
        const oldpassword = this.formModel.oldpassword
        if (oldpassword && oldpassword === value) {
          callback(new Error('新密码和旧密码不能相同'))
          return
        }
        const reg = /^(?=.*[a-z])(?=.*\d).{6,}$/
        if (!reg.test(value || '')) {
          callback(new Error('用户密码至少要有数字和小写字母，并且长度至少6位'))
          return
        }
        callback()
      },
      handleConfirmPassword(rule, value, callback) {
        const password = this.formModel.password
        if (value === undefined || value === '') {
          callback(new Error('请输入密码'))
          return
        }
        if (value && password && value.trim() !== password.trim()) {
          callback(new Error('两次密码不一致'))
          return
        }
        callback()
      }
    }
  }
</script>

<style scoped>
</style>
