<template>
  <a-modal
    centered
    :open="visible"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <template #title>
      <div :style="{ textAlign: 'center' }">两步验证</div>
    </template>
    <template #footer>
      <div :style="{ textAlign: 'center' }">
        <a-button key="back" @click="handleCancel">返回</a-button>
        <a-button key="submit" type="primary" :loading="stepLoading" @click="handleStepOk">
          继续
        </a-button>
      </div>
    </template>

    <a-spin :spinning="stepLoading">
      <a-form ref="formRef" layout="vertical" :model="formModel" :rules="formRules">
        <div class="step-form-wrapper">
          <p v-if="!stepLoading" style="text-align: center">
            请在手机中打开 Google Authenticator 或两步验证 APP<br />输入 6 位动态码
          </p>
          <p v-else style="text-align: center">
            正在验证..<br />请稍后
          </p>
          <a-form-item
            :style="{ textAlign: 'center' }"
            hasFeedback
           
            name="stepCode"
          >
            <a-input
              :style="{ textAlign: 'center' }"
              :value="formModel.stepCode"
              @change="handleStepCodeChange"
              @keyup.enter="handleStepOk"
              placeholder="000000"
            />
          </a-form-item>
          <p style="text-align: center">
            <a @click="onForgeStepCode">遗失手机?</a>
          </p>
        </div>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      stepLoading: false,
      formModel: {
        stepCode: ''
      },
      formRules: {
        stepCode: [
          { required: true, message: '请输入 6 位动态码!', pattern: /^\d{6}$/, len: 6 }
        ]
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.formModel.stepCode = ''
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            this.$refs.formRef.resetFields()
          }
        })
      }
    }
  },
  methods: {
    handleStepCodeChange(event) {
      this.formModel.stepCode = event && event.target ? event.target.value : event
    },
    handleStepOk() {
      const formRef = this.$refs.formRef
      if (!formRef) {
        return
      }
      this.stepLoading = true
      formRef.validate((valid) => {
        if (valid) {
          const values = { ...this.formModel }
          setTimeout(() => {
            this.stepLoading = false
            this.$emit('success', { values })
          }, 2000)
          return
        }
        this.stepLoading = false
        this.$emit('error', { err: this.formModel })
      })
    },
    handleCancel() {
      this.$emit('cancel')
    },
    onForgeStepCode() {
    }
  }
}
</script>

<style lang="less" scoped>
  .step-form-wrapper {
    margin: 0 auto;
    width: 80%;
    max-width: 400px;
  }
</style>
