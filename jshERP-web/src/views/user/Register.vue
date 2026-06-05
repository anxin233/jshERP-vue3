<!-- b y 7 5 2 7  1 8 9 2 0 -->
<template>
  <div class="main user-layout-register" :style="mainStyle">
    <a-form ref="formRegister" :model="formModel" :rules="formRules" id="formRegister">
      <a-form-item name="username">
        <a-input
          size="large"
          type="text"
          autocomplete="false"
          placeholder="请输入用户名"
          :value="formModel.username"
          @change="handleFieldChange('username', $event)"
        />
      </a-form-item>

      <a-popover placement="rightTop" trigger="click" :open="state.passwordLevelChecked">
        <template #content>
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">强度：<span>{{ passwordLevelName }}</span></div>
            <a-progress :percent="state.percent" :showInfo="false" :strokeColor="passwordLevelColor"/>
            <div style="margin-top: 10px;">
              <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
            </div>
          </div>
        </template>
        <a-form-item name="password">
          <a-input-password
            size="large"
            type="password"
            autocomplete="false"
            placeholder="至少6位密码，区分大小写"
            :value="formModel.password"
            @click="handlePasswordInputClick"
            @change="handleFieldChange('password', $event)"
          />
        </a-form-item>
      </a-popover>

      <a-form-item name="password2">
        <a-input-password
          size="large"
          type="password"
          autocomplete="false"
          placeholder="确认密码"
          :value="formModel.password2"
          @change="handleFieldChange('password2', $event)"
        />
      </a-form-item>

      <a-row :gutter="0" v-if="checkcodeFlag==='1'">
        <a-col :span="14">
          <a-form-item name="inputCode">
            <a-input
              size="large"
              type="text"
              default-value=""
              placeholder="请输入验证码"
              :value="formModel.inputCode"
              @change="handleFieldChange('inputCode', $event)"
            >
              <template #prefix>
                <legacy-icon type="smile" :style="{ color: 'rgba(0,0,0,.25)' }"/>
              </template>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col :span="10" style="text-align: right">
          <img v-if="requestCodeSuccess" style="margin-top: 2px;" :src="randCodeImage" @click="handleChangeCheckCode"/>
          <img v-else style="margin-top: 2px;" src="../../assets/checkcode.png" @click="handleChangeCheckCode"/>
        </a-col>
      </a-row>

      <a-form-item :style="btnStyle">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="register-button"
          :loading="registerBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="registerBtn"
        >
          注册租户
        </a-button>
        <router-link class="login" :to="{ name: 'login' }">使用已有租户登录</router-link>
      </a-form-item>

      <div class="login-copyright" v-if="device === 'mobile'">
        <a-row>
          <a-col>
            © 2015-2030 Powered By
            <a style="color:#00458a;" :href="systemUrl" target="_blank">官方网站</a>
          </a-col>
        </a-row>
      </div>
    </a-form>
  </div>
</template>

<script>
  import { mixinDevice } from '@/utils/mixin.js'
  import { getAction, postAction } from '@/api/manage'
  import md5 from 'md5'

  const levelNames = {
    0: '低',
    1: '低',
    2: '中',
    3: '强'
  }
  const levelClass = {
    0: 'error',
    1: 'error',
    2: 'warning',
    3: 'success'
  }
  const levelColor = {
    0: '#ff0000',
    1: '#ff0000',
    2: '#ff7e05',
    3: '#52c41a'
  }

  export default {
    name: 'Register',
    mixins: [mixinDevice],
    data() {
      return {
        systemTitle: window.SYS_TITLE,
        systemUrl: window.SYS_URL,
        uuid: '',
        randCodeImage: '',
        checkcodeFlag: '',
        mainStyle: {},
        btnStyle: {},
        requestCodeSuccess: false,
        formModel: {
          username: '',
          password: '',
          password2: '',
          inputCode: ''
        },
        formRules: {
          username: [
            { required: true, message: '用户名不能为空' },
            { validator: this.handleUserName }
          ],
          password: [
            { required: false },
            { validator: this.handlePasswordLevel }
          ],
          password2: [
            { required: true, message: '至少6位密码，区分大小写' },
            { validator: this.handlePasswordCheck }
          ],
          inputCode: [
            { required: true, message: '验证码不能为空' },
            { validator: this.handleInputCode }
          ]
        },
        state: {
          time: 60,
          smsSendBtn: false,
          passwordLevel: 0,
          passwordLevelChecked: false,
          percent: 10,
          progressColor: '#FF0000'
        },
        registerBtn: false
      }
    },
    computed: {
      passwordLevelClass() {
        return levelClass[this.state.passwordLevel]
      },
      passwordLevelName() {
        return levelNames[this.state.passwordLevel]
      },
      passwordLevelColor() {
        return levelColor[this.state.passwordLevel]
      }
    },
    created() {
      this.getCheckcodeFlag()
      this.handleChangeCheckCode()
    },
    methods: {
      handleFieldChange(field, event) {
        this.formModel[field] = event && event.target ? event.target.value : event
      },
      getCheckcodeFlag() {
        getAction('/platformConfig/getPlatform/checkcodeFlag').then((res) => {
          this.checkcodeFlag = res + ''
          if (this.checkcodeFlag === '1') {
            this.mainStyle = {}
            this.btnStyle = {}
          } else {
            this.mainStyle = { paddingTop: '20px' }
            this.btnStyle = { marginTop: '20px' }
          }
        })
      },
      handleChangeCheckCode() {
        this.currdatetime = new Date().getTime()
        getAction('/user/randomImage').then(res => {
          if (res.code === 200) {
            this.uuid = res.data.uuid
            this.randCodeImage = res.data.base64
            this.requestCodeSuccess = true
          } else {
            this.$message.error(res.data)
            this.requestCodeSuccess = false
          }
        }).catch(() => {
          this.requestCodeSuccess = false
        })
      },
      handleUserName(rule, value, callback) {
        const reg = /^(?=.*[a-z]).{4,}$/
        if (!reg.test(value || '')) {
          callback(new Error('用户名需要由4位小写字母组成'))
          return
        }
        callback()
      },
      handlePasswordLevel(rule, value, callback) {
        let level = 0
        const reg = /^(?=.*[a-z])(?=.*\d).{6,}$/
        if (!reg.test(value || '')) {
          callback(new Error('密码由6位数字、小写字母组成'))
          return
        }
        if (/[0-9]/.test(value)) {
          level++
        }
        if (/[a-zA-Z]/.test(value)) {
          level++
        }
        if (/[^0-9a-zA-Z_]/.test(value)) {
          level++
        }
        this.state.passwordLevel = level
        this.state.percent = level * 30
        if (level >= 2) {
          if (level >= 3) {
            this.state.percent = 100
          }
          callback()
        } else {
          if (level === 0) {
            this.state.percent = 10
          }
          callback(new Error('强度不够!'))
        }
      },
      handlePasswordCheck(rule, value, callback) {
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
      },
      handlePasswordInputClick() {
        this.state.passwordLevelChecked = !this.isMobile()
      },
      handleInputCode(rule, value, callback) {
        callback()
      },
      handleSubmit() {
        this.registerBtn = true
        const formRef = this.$refs.formRegister
        if (!formRef) {
          this.registerBtn = false
          return
        }
        formRef.validate((valid) => {
          if (!valid) {
            this.registerBtn = false
            return
          }
          const values = { ...this.formModel }
          const register = {
            loginName: values.username,
            password: md5(values.password),
            code: values.inputCode,
            uuid: this.uuid
          }
          postAction('/user/registerUser', register).then((res) => {
            if (res.code === 200) {
              this.$notification.success({
                message: '提示',
                description: '注册成功，请使用该租户登录！',
                duration: 5
              })
              setTimeout(() => {
                this.$router.push({
                  name: 'login',
                  params: {
                    loginName: register.loginName
                  }
                })
              }, 2000)
            } else {
              this.$notification.error({
                message: '提示',
                description: res.data.message || '注册失败',
                duration: 2
              })
              this.formModel.inputCode = ''
              this.handleChangeCheckCode()
              this.registerBtn = false
            }
          }).catch((err) => {
            this.requestFailed(err)
          })
        })
      },
      requestFailed(err) {
        this.$notification.error({
          message: '错误',
          description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
          duration: 4
        })
        this.registerBtn = false
      }
    }
  }
</script>

<style lang="less">
  .user-register {

    &.error {
      color: #ff0000;
    }

    &.warning {
      color: #ff7e05;
    }

    &.success {
      color: #52c41a;
    }

  }

  .user-layout-register {
    .ant-input-group-addon:first-child {
      background-color: #fff;
    }
  }
</style>
<style lang="less" scoped>
  .user-layout-register {

    .ant-form-item {
      margin-bottom: 16px;
    }

    & > h3 {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .getCaptcha {
      display: block;
      width: 100%;
      height: 40px;
    }

    .register-button {
      width: 50%;
    }

    .login {
      float: right;
      line-height: 40px;
      font-weight: bolder;
    }
  }
  .login-copyright {
    text-align: center;
    margin-top: 20px
  }
  .login-copyright, .login-copyright a {
    color: #666
  }

  .login-copyright .weixin {
    padding-left:10px;
    color: red
  }
</style>
