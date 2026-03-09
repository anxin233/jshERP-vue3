<script setup lang="ts">
/**
 * Register Page
 * Migrated from Vue 2 views/user/Register.vue
 * - Ant Design Vue -> Element Plus
 * - v-decorator / fieldDecoratorId -> v-model + el-form rules
 * - Vuex -> Pinia (not directly needed here)
 * - Vue.ls -> localStorage
 * - md5 -> AES encryption
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { randomImage } from '@/api/auth'
import { checkTenant, addTenant } from '@/api/system'
import { getAction, postAction } from '@/api/http'
import { randomUUID } from '@/utils/index'
import { encryption } from '@/utils/encryption'

const router = useRouter()

// Refs
const formRef = ref<FormInstance>()
const registerBtn = ref(false)
const captchaKey = ref('')
const randCodeImage = ref('')
const requestCodeSuccess = ref(false)
const checkcodeFlag = ref('')
const mainStyle = ref('')
const btnStyle = ref('')

// AES encryption key/iv
const aesKey = ref('1234567890adbcde')
const aesIv = ref('1234567890adbcde')

// Form data
const formData = reactive({
  tenantName: '',
  username: '',
  password: '',
  password2: '',
  inputCode: '',
})

// Password strength state
const passwordState = reactive({
  passwordLevel: 0,
  passwordLevelChecked: false,
  percent: 10,
})

// Computed properties for password level display
const passwordLevelClass = computed(() => {
  const levelClass: Record<number, string> = {
    0: 'error',
    1: 'error',
    2: 'warning',
    3: 'success',
  }
  return levelClass[passwordState.passwordLevel]
})

const passwordLevelName = computed(() => {
  const levelNames: Record<number, string> = {
    0: '低',
    1: '低',
    2: '中',
    3: '强',
  }
  return levelNames[passwordState.passwordLevel]
})

const passwordLevelColor = computed(() => {
  const levelColor: Record<number, string> = {
    0: '#ff0000',
    1: '#ff0000',
    2: '#ff7e05',
    3: '#52c41a',
  }
  return levelColor[passwordState.passwordLevel]
})

/**
 * Username validator: at least 4 lowercase letters
 */
function validateUsername(_rule: any, value: string, callback: any) {
  if (!value) {
    callback(new Error('用户名不能为空'))
    return
  }
  const reg = /^(?=.*[a-z]).{4,}$/
  if (!reg.test(value)) {
    callback(new Error('用户名需要由4位小写字母组成!'))
  } else {
    callback()
  }
}

/**
 * Password level validator: at least 6 chars with letters and numbers
 */
function validatePasswordLevel(_rule: any, value: string, callback: any) {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }
  const reg = /^(?=.*[a-z])(?=.*\d).{6,}$/
  if (!reg.test(value)) {
    callback(new Error('密码由6位数字、小写字母组成!'))
    return
  }

  let level = 0
  if (/[0-9]/.test(value)) level++
  if (/[a-zA-Z]/.test(value)) level++
  if (/[^0-9a-zA-Z_]/.test(value)) level++

  passwordState.passwordLevel = level
  passwordState.percent = level * 30

  if (level >= 2) {
    if (level >= 3) {
      passwordState.percent = 100
    }
    callback()
  } else {
    if (level === 0) {
      passwordState.percent = 10
    }
    callback(new Error('强度不够!'))
  }
}

/**
 * Password confirmation validator
 */
function validatePasswordCheck(_rule: any, value: string, callback: any) {
  if (value === undefined || value === '') {
    callback(new Error('请输入确认密码!'))
  } else if (value && formData.password && value.trim() !== formData.password.trim()) {
    callback(new Error('两次密码不一致!'))
  } else {
    callback()
  }
}

// Validation rules
const formRules = reactive<FormRules>({
  tenantName: [
    { required: true, message: '请输入租户名', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { validator: validateUsername, trigger: ['change', 'blur'] },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePasswordLevel, trigger: ['change', 'blur'] },
  ],
  password2: [
    { required: true, message: '至少6位密码，区分大小写', trigger: 'blur' },
    { validator: validatePasswordCheck, trigger: ['change', 'blur'] },
  ],
  inputCode: [
    { required: true, message: '验证码不能为空', trigger: 'blur' },
  ],
})

/**
 * Password input click handler - show strength indicator on desktop
 */
function handlePasswordInputClick() {
  if (window.innerWidth > 768) {
    passwordState.passwordLevelChecked = true
  } else {
    passwordState.passwordLevelChecked = false
  }
}

/**
 * Refresh captcha image using randomImage from @/api/auth
 */
function handleChangeCheckCode() {
  const key = randomUUID()
  captchaKey.value = key
  randomImage(key)
    .then((res: any) => {
      if (res.code === 200) {
        captchaKey.value = res.data.uuid || key
        randCodeImage.value = res.data.base64
        requestCodeSuccess.value = true
      } else {
        ElMessage.error(res.data)
        requestCodeSuccess.value = false
      }
    })
    .catch(() => {
      requestCodeSuccess.value = false
    })
}

/**
 * Get checkcode flag from platform config
 */
function getCheckcodeFlag() {
  getAction('/platformConfig/getPlatform/checkcodeFlag').then((res: any) => {
    checkcodeFlag.value = res + ''
    if (checkcodeFlag.value === '1') {
      mainStyle.value = ''
      btnStyle.value = ''
    } else {
      mainStyle.value = 'padding-top: 20px'
      btnStyle.value = 'margin-top: 20px'
    }
  })
}

/**
 * Form submit handler
 * Uses AES encryption for password
 */
async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    registerBtn.value = false
    return
  }

  registerBtn.value = true

  // AES encrypt the password
  const encryptedPassword = encryption(formData.password, aesKey.value, aesIv.value)

  const registerData = {
    loginName: formData.username,
    password: encryptedPassword,
    code: formData.inputCode,
    uuid: captchaKey.value,
  }

  try {
    const res = await postAction('/user/registerUser', registerData)
    if (res.code === 200) {
      ElNotification.success({
        title: '提示',
        message: '注册成功，请使用该租户登录！',
        duration: 5000,
      })
      setTimeout(() => {
        router.push({
          name: 'login',
          params: { loginName: registerData.loginName },
        })
      }, 2000)
    } else {
      ElNotification.error({
        title: '提示',
        message: res.data?.message || '注册失败',
        duration: 2000,
      })
      formData.inputCode = ''
      handleChangeCheckCode()
      registerBtn.value = false
    }
  } catch (err: any) {
    requestFailed(err)
  }
}

/**
 * Handle request failure
 */
function requestFailed(err: any) {
  ElNotification.error({
    title: '错误',
    message:
      err?.response?.data?.message ||
      err?.message ||
      '请求出现错误，请稍后再试',
    duration: 4000,
  })
  registerBtn.value = false
}

// Lifecycle
onMounted(() => {
  getCheckcodeFlag()
  handleChangeCheckCode()
})
</script>

<template>
  <div class="main user-layout-register" :style="mainStyle">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      class="register-form"
      size="large"
    >
      <!-- Tenant Name -->
      <el-form-item prop="tenantName">
        <el-input
          v-model="formData.tenantName"
          placeholder="请输入租户名"
          autocomplete="off"
        />
      </el-form-item>

      <!-- Username (Login Name) -->
      <el-form-item prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入登录名"
          autocomplete="off"
        />
      </el-form-item>

      <!-- Password with strength indicator -->
      <el-popover
        placement="right"
        trigger="click"
        :visible="passwordState.passwordLevelChecked"
        :width="240"
      >
        <template #reference>
          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="至少6位密码，区分大小写"
              autocomplete="off"
              show-password
              @click="handlePasswordInputClick"
            />
          </el-form-item>
        </template>
        <div>
          <div :class="['user-register', passwordLevelClass]">
            强度：<span>{{ passwordLevelName }}</span>
          </div>
          <el-progress
            :percentage="passwordState.percent"
            :show-text="false"
            :color="passwordLevelColor"
          />
          <div style="margin-top: 10px">
            <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
          </div>
        </div>
      </el-popover>

      <!-- Confirm password -->
      <el-form-item prop="password2">
        <el-input
          v-model="formData.password2"
          type="password"
          placeholder="确认密码"
          autocomplete="off"
          show-password
        />
      </el-form-item>

      <!-- Captcha -->
      <el-row :gutter="0" v-if="checkcodeFlag === '1'">
        <el-col :span="14">
          <el-form-item prop="inputCode">
            <el-input
              v-model="formData.inputCode"
              placeholder="请输入验证码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <img
            v-if="requestCodeSuccess"
            class="captcha-img"
            :src="randCodeImage"
            @click="handleChangeCheckCode"
            alt="验证码"
          />
          <img
            v-else
            class="captcha-img"
            src="@/assets/checkcode.png"
            @click="handleChangeCheckCode"
            alt="验证码"
          />
        </el-col>
      </el-row>

      <!-- Submit button & login link -->
      <el-form-item :style="btnStyle">
        <el-button
          type="primary"
          class="register-button"
          :loading="registerBtn"
          :disabled="registerBtn"
          @click.prevent="handleSubmit"
        >
          注册租户
        </el-button>
        <router-link class="login-link" :to="{ name: 'login' }">
          使用已有租户登录
        </router-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss">
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
</style>

<style lang="scss" scoped>
.user-layout-register {
  .el-form-item {
    margin-bottom: 16px;
  }

  .register-button {
    width: 50%;
  }

  .login-link {
    float: right;
    line-height: 40px;
    font-weight: bolder;
    color: var(--el-color-primary);
    text-decoration: none;
  }
}

.captcha-img {
  margin-top: 2px;
  cursor: pointer;
  height: 38px;
}
</style>
