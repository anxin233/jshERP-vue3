<template>
  <div class="login">
    <div class="login__brand">
      <div class="login__logo">
        管
      </div>
      <h1 class="login__title">
        管伊佳ERP
      </h1>
      <p class="login__subtitle">
        移动端
      </p>
    </div>

    <van-form
      class="login__form"
      @submit="handleSubmit"
    >
      <van-cell-group inset>
        <van-field
          v-model="form.loginName"
          name="loginName"
          label="账号"
          placeholder="请输入登录名称"
          clearable
          :rules="[{ required: true, message: '请输入登录名称' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          clearable
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <van-field
          v-if="captchaEnabled"
          v-model="form.code"
          name="code"
          label="验证码"
          placeholder="请输入验证码"
          clearable
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <img
              v-if="captchaImage"
              class="login__captcha"
              :src="captchaImage"
              alt="验证码"
              @click="loadCaptcha"
            >
          </template>
        </van-field>
      </van-cell-group>

      <div class="login__actions">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="submitting"
          loading-text="登录中..."
        >
          登 录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import md5 from 'md5'
import { getCaptcha, getCheckcodeFlag } from '@/api/auth'
import { useUserStore } from '@/store/user'
import { get, set } from '@/utils/storage'
import { LAST_LOGIN_NAME_KEY } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  loginName: '',
  password: '',
  code: ''
})
const captchaEnabled = ref(false)
const captchaImage = ref('')
const uuid = ref('')
const submitting = ref(false)

async function loadCaptcha () {
  try {
    const res = await getCaptcha()
    if (res && res.code === 200 && res.data) {
      uuid.value = res.data.uuid
      captchaImage.value = res.data.base64
    }
  } catch {
    // 请求层已提示
  }
}

async function initCaptcha () {
  try {
    const res = await getCheckcodeFlag()
    captchaEnabled.value = String(res).trim() === '1'
  } catch {
    captchaEnabled.value = false
  }
  if (captchaEnabled.value) {
    await loadCaptcha()
  }
}

async function handleSubmit () {
  if (submitting.value) return
  submitting.value = true
  try {
    await userStore.login({
      loginName: form.loginName.trim(),
      password: md5(form.password),
      code: form.code,
      uuid: uuid.value
    })
    set(LAST_LOGIN_NAME_KEY, form.loginName.trim())
    await userStore.loadBtnPermissions().catch(() => {})
    const redirect = route.query.redirect
    const target = typeof redirect === 'string' && redirect ? redirect : '/home'
    router.replace(target)
  } catch (e) {
    showToast(e && e.message ? e.message : '登录失败')
    if (captchaEnabled.value) {
      form.code = ''
      loadCaptcha()
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  form.loginName = get(LAST_LOGIN_NAME_KEY) || ''
  initCaptcha()
})
</script>

<style lang="less" scoped>
.login {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 0 16px;
  background: #fff;

  &__brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 0 32px;
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-bottom: 12px;
    font-size: 32px;
    font-weight: 600;
    color: #fff;
    background: var(--jsh-primary, #1890ff);
    border-radius: 16px;
  }

  &__title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }

  &__subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.45);
  }

  &__form {
    flex: 1;
  }

  &__captcha {
    width: 96px;
    height: 34px;
    object-fit: contain;
    vertical-align: middle;
  }

  &__actions {
    margin: 24px 16px 0;
  }
}
</style>
