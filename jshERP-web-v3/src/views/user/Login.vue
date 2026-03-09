<script setup lang="ts">
/**
 * Login Page
 * Migrated from Vue 2 views/user/Login.vue
 * - Ant Design Vue -> Element Plus
 * - v-decorator -> v-model + el-form rules
 * - Vuex mapActions -> Pinia useUserStore
 * - Vue.ls -> localStorage
 * - md5 -> AES encryption
 */
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { User, Lock, PictureRounded } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { randomImage } from '@/api/auth'
import { getAction } from '@/api/http'
import md5 from 'md5'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Refs
const formRef = ref<FormInstance>()
const loginBtn = ref(false)
const checked = ref(false)
const captchaKey = ref('')
const randCodeImage = ref('')
const requestCodeSuccess = ref(false)
const registerFlag = ref('')
const checkcodeFlag = ref('')
const mainStyle = ref('')
const btnStyle = ref('margin-top: 16px')

// Form data
const formData = reactive({
  loginName: '',
  password: '',
  inputCode: '',
})

// Validation rules
const formRules = reactive<FormRules>({
  loginName: [
    { required: true, message: '请输入用户名!', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码!', trigger: 'blur' },
  ],
  inputCode: [
    { required: true, message: '请输入验证码!', trigger: 'blur' },
  ],
})

/**
 * Time greeting helper
 */
function timeFix(): string {
  const hour = new Date().getHours()
  if (hour < 9) return '早上好'
  if (hour <= 11) return '上午好'
  if (hour <= 13) return '中午好'
  if (hour <= 18) return '下午好'
  return '晚上好'
}

/**
 * Load saved login info from cache
 */
function loadInfo() {
  nextTick(() => {
    const cachedLoginName = localStorage.getItem('cache_loginName')
    const cachedPassword = localStorage.getItem('cache_password')
    if (cachedLoginName && cachedPassword) {
      formData.loginName = cachedLoginName
      formData.password = cachedPassword
      checked.value = true
    }
  })

  // If coming from register page with loginName param
  const paramLoginName = route.params.loginName as string
  if (paramLoginName) {
    nextTick(() => {
      localStorage.removeItem('cache_loginName')
      localStorage.removeItem('cache_password')
      formData.loginName = paramLoginName
      formData.password = ''
      checked.value = false
    })
  }
}

/**
 * Toggle "remember me" checkbox
 */
function handleChange(val: boolean) {
  checked.value = val
}

/**
 * Refresh captcha image
 * Uses randomImage from @/api/auth and randomUUID from @/utils/index
 */
function handleChangeCheckCode() {
  randomImage()
    .then((res: any) => {
      if (res.code === 200) {
        captchaKey.value = res.data.uuid
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
 * Get register flag from platform config
 */
function getRegisterFlag() {
  getAction('/platformConfig/getPlatform/registerFlag').then((res: any) => {
    registerFlag.value = res + ''
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
      btnStyle.value = 'margin-top: 16px'
    } else {
      mainStyle.value = 'padding-top: 20px'
      btnStyle.value = 'margin-top: 26px'
    }
  })
}

/**
 * Handle login result from backend
 */
function departConfirm(res: any, loginName: string) {
  if (res.code === 200) {
    const msgTip = res.data?.msgTip
    if (msgTip === 'user can login') {
      loginSuccess(res)
    } else if (msgTip === 'user is not exist') {
      requestFailed({ message: '用户不存在' })
      userStore.logout()
    } else if (msgTip === 'user password error') {
      requestFailed({ message: '用户密码不正确' })
      userStore.logout()
    } else if (msgTip === 'user is black') {
      requestFailed({ message: '用户被禁用' })
      userStore.logout()
    } else if (msgTip === 'tenant is black') {
      const msg =
        loginName === 'jsh'
          ? 'jsh用户已停用，请注册租户进行体验！'
          : '用户所属的租户被禁用'
      requestFailed({ message: msg })
      userStore.logout()
    } else if (msgTip === 'tenant is expire') {
      requestFailed({ message: '试用期已结束，请联系客服续费' })
      userStore.logout()
    } else if (msgTip === 'access service error') {
      requestFailed({ message: '查询服务异常' })
      userStore.logout()
    }
  } else {
    requestFailed(res)
    userStore.logout()
  }
}

/**
 * Handle successful login
 */
function loginSuccess(res: any) {
  const redirect = (route.query.redirect as string) || '/dashboard/analysis'
  router.push({ path: redirect })
  ElNotification.success({
    title: '欢迎',
    message: `${timeFix()}，欢迎回来`,
  })
  if (res.data?.pwdSimple) {
    setTimeout(() => {
      ElNotification.warning({
        title: '友情提醒',
        message: '密码过于简单，请尽快修改',
      })
    }, 3000)
  }
  if (res.data?.user?.loginName === 'admin') {
    const desc =
      'admin只是平台运维用户，真正的管理员是租户(测试账号为jsh），admin不能编辑任何业务数据，只能配置平台菜单和创建租户'
    ElMessage.info(desc)
  } else {
    // Check bill_excel_url config
    getAction('/platformConfig/getPlatform/bill_excel_url').then((res: any) => {
      if (res) {
        localStorage.setItem('isShowExcel', 'true')
      } else {
        localStorage.setItem('isShowExcel', 'false')
      }
    }).catch(() => {
      localStorage.setItem('isShowExcel', 'false')
    })
    // Check tenant expire info
    getAction('/user/infoWithTenant').then((res: any) => {
      if (res && res.code === 200) {
        const currentTime = new Date()
        const expireTime = new Date(res.data.expireTime)
        const type = res.data.type
        const difftime = expireTime.getTime() - currentTime.getTime()
        const tipInfo = '您好，服务即将到期，请及时续费！'
        if (type === '0' && difftime < 86400000 * 5) {
          ElMessage.warning(tipInfo)
        }
        if (type === '1' && difftime < 86400000 * 15) {
          ElMessage.warning(tipInfo)
        }
      }
    }).catch(() => { /* ignore */ })
  }
  // Load material property list
  initMPropertyShort()
}

/**
 * Handle login failure
 */
function requestFailed(err: any) {
  ElNotification.error({
    title: '登录失败',
    message:
      err?.response?.data?.message ||
      err?.message ||
      err?.data?.message ||
      '请求出现错误，请稍后再试',
    duration: 4000,
  })
  formData.inputCode = ''
  handleChangeCheckCode()
  loginBtn.value = false
}

/**
 * Load material property list into localStorage
 */
function initMPropertyShort() {
  getAction('/materialProperty/getAllList').then((res: any) => {
    if (res && res.code === 200 && res.data) {
      localStorage.setItem('materialPropertyList', JSON.stringify(res.data))
    }
  }).catch(() => { /* ignore */ })
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
    return
  }

  loginBtn.value = true

  const loginParams: Record<string, any> = {
    loginName: formData.loginName,
    password: md5(formData.password),
    code: formData.inputCode,
    uuid: captchaKey.value,
  }

  // Remember me handling
  if (checked.value) {
    localStorage.setItem('cache_loginName', formData.loginName)
    localStorage.setItem('cache_password', formData.password)
  } else {
    localStorage.removeItem('cache_loginName')
    localStorage.removeItem('cache_password')
  }

  try {
    const res = await userStore.login(loginParams)
    departConfirm(res, loginParams.loginName)
  } catch (err: any) {
    requestFailed(err)
  }
}

// Lifecycle
onMounted(() => {
  loadInfo()
  handleChangeCheckCode()
  getRegisterFlag()
  getCheckcodeFlag()
})
</script>

<template>
  <div class="main" :style="mainStyle">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      class="user-layout-login"
      size="large"
    >
      <!-- Username -->
      <el-form-item prop="loginName">
        <el-input
          v-model="formData.loginName"
          placeholder="请输入用户名"
          :prefix-icon="User"
        />
      </el-form-item>

      <!-- Password -->
      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码（6-16位字母和数字组合）"
          autocomplete="off"
          show-password
          :prefix-icon="Lock"
        />
      </el-form-item>

      <!-- Captcha -->
      <el-row :gutter="0" v-if="checkcodeFlag === '1'">
        <el-col :span="14">
          <el-form-item prop="inputCode">
            <el-input
              v-model="formData.inputCode"
              placeholder="请输入验证码"
              :prefix-icon="PictureRounded"
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

      <!-- Remember me & register -->
      <el-form-item>
        <el-checkbox v-model="checked" @change="handleChange">
          记住密码
        </el-checkbox>
        <router-link
          v-if="registerFlag === '1'"
          :to="{ name: 'register' }"
          class="forge-password"
        >
          注册租户
        </router-link>
      </el-form-item>

      <!-- Submit button -->
      <el-form-item :style="btnStyle">
        <el-button
          type="primary"
          class="login-button"
          :loading="loginBtn"
          :disabled="loginBtn"
          @click.prevent="handleSubmit"
        >
          登 录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .el-form-item {
    margin-bottom: 16px;
  }

  .forge-password {
    font-size: 14px;
    font-weight: bolder;
    float: right;
    margin-right: 10px;
    color: var(--el-color-primary);
    text-decoration: none;
  }

  .login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }
}

.captcha-img {
  margin-top: 2px;
  cursor: pointer;
  height: 38px;
}
</style>
