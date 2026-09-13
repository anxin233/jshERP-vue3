<template>
  <div class="mine">
    <div class="mine__header">
      <div class="mine__avatar">
        {{ avatarText }}
      </div>
      <div class="mine__info">
        <p class="mine__name">
          {{ userStore.displayName || '未登录' }}
        </p>
        <p class="mine__account">
          {{ userStore.loginName }}
        </p>
      </div>
    </div>

    <van-cell-group
      inset
      class="mine__group"
    >
      <van-cell
        title="修改密码"
        is-link
        @click="pwdVisible = true"
      />
      <van-cell
        title="版本"
        :value="version || '-'"
      />
    </van-cell-group>

    <div class="mine__logout">
      <van-button
        round
        block
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>

    <van-popup
      v-model:show="pwdVisible"
      round
      position="bottom"
      :style="{ padding: '16px 0 24px' }"
    >
      <p class="mine__pwd-title">
        修改密码
      </p>
      <van-form @submit="submitPwd">
        <van-field
          v-model="pwdForm.oldpassword"
          type="password"
          label="旧密码"
          placeholder="请输入旧密码"
          :rules="[{ required: true, message: '请输入旧密码' }]"
        />
        <van-field
          v-model="pwdForm.password"
          type="password"
          label="新密码"
          placeholder="新密码至少6位"
          :rules="[
            { required: true, message: '请输入新密码' },
            { validator: (val) => val.length >= 6, message: '新密码至少6位' }
          ]"
        />
        <van-field
          v-model="pwdForm.confirmPassword"
          type="password"
          label="确认新密码"
          placeholder="请再次输入新密码"
          :rules="[
            { required: true, message: '请确认新密码' },
            { validator: (val) => val === pwdForm.password, message: '两次输入的密码不一致' }
          ]"
        />
        <div class="mine__pwd-submit">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="pwdSubmitting"
          >
            确认修改
          </van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import md5 from 'md5'
import { getAppVersion, updatePwd } from '@/api/auth'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const version = ref('')
const pwdVisible = ref(false)
const pwdSubmitting = ref(false)
const pwdForm = reactive({
  oldpassword: '',
  password: '',
  confirmPassword: ''
})

const avatarText = computed(() => {
  const name = userStore.displayName
  return name ? name.slice(0, 1) : '管'
})

async function submitPwd () {
  if (pwdSubmitting.value) return
  pwdSubmitting.value = true
  try {
    const res = await updatePwd({
      userId: Number(userStore.userId),
      oldpassword: md5(pwdForm.oldpassword),
      password: md5(pwdForm.password)
    })
    if (res && res.code === 200 && res.data && res.data.status === 1) {
      showToast('修改成功')
      pwdVisible.value = false
      pwdForm.oldpassword = ''
      pwdForm.password = ''
      pwdForm.confirmPassword = ''
    } else {
      showToast((res && res.data && res.data.message) || '修改失败')
    }
  } catch {
    // 请求层已提示
  } finally {
    pwdSubmitting.value = false
  }
}

function handleLogout () {
  showConfirmDialog({
    title: '提示',
    message: '确认退出登录吗？'
  })
    .then(async () => {
      await userStore.logout()
      router.replace('/login')
    })
    .catch(() => {})
}

onMounted(async () => {
  try {
    const res = await getAppVersion()
    if (res && typeof res === 'string') {
      version.value = res.trim()
    }
  } catch {
    // 忽略版本获取失败
  }
})
</script>

<style lang="less" scoped>
.mine {
  min-height: 100%;
  padding-bottom: 24px;
  background: var(--jsh-page-bg, #f7f8fa);

  &__header {
    display: flex;
    align-items: center;
    padding: 24px 20px;
    background: var(--jsh-primary, #1890ff);
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-right: 12px;
    font-size: 24px;
    font-weight: 600;
    color: var(--jsh-primary, #1890ff);
    background: #fff;
    border-radius: 50%;
  }

  &__name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
  }

  &__account {
    margin: 4px 0 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  &__group {
    margin-top: 12px;
  }

  &__logout {
    margin: 24px 16px 0;
  }

  &__pwd-title {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
  }

  &__pwd-submit {
    margin: 16px 16px 0;
  }
}
</style>
