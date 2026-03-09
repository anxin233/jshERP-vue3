<script setup lang="ts">
/**
 * UserPassword - Change password dialog
 * Migrated from Vue 2 components/tools/UserPassword.vue
 * Uses Element Plus + Composition API
 *
 * Original API endpoint: PUT /user/updatePwd
 * Params: { userId, oldpassword (md5), password (md5) }
 */
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { putAction } from '@/api/http'
import md5 from 'md5'

const props = defineProps<{
  visible: boolean
  userId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const formRef = ref<FormInstance>()
const confirmLoading = ref(false)

interface PasswordForm {
  oldpassword: string
  password: string
  confirmPassword: string
}

const form = reactive<PasswordForm>({
  oldpassword: '',
  password: '',
  confirmPassword: ''
})

/** Custom validator: password must have lowercase letter + digit, min 6 chars */
function validatePassword(_rule: any, value: string, callback: (error?: Error) => void) {
  if (!value) {
    callback(new Error('请输入新密码!'))
    return
  }
  if (form.oldpassword && form.oldpassword === value) {
    callback(new Error('新密码和旧密码不能相同!'))
    return
  }
  const reg = /^(?=.*[a-z])(?=.*\d).{6,}$/
  if (!reg.test(value)) {
    callback(new Error('用户密码至少要有数字和小写字母，并且长度至少6位!'))
    return
  }
  callback()
}

/** Custom validator: confirm password must match */
function validateConfirmPassword(_rule: any, value: string, callback: (error?: Error) => void) {
  if (!value) {
    callback(new Error('请确认新密码!'))
    return
  }
  if (value.trim() !== form.password.trim()) {
    callback(new Error('两次密码不一致!'))
    return
  }
  callback()
}

const rules = reactive<FormRules<PasswordForm>>({
  oldpassword: [{ required: true, message: '请输入旧密码!', trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: ['change', 'blur'] }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: ['change', 'blur'] }]
})

/** Reset form when dialog opens/closes */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.oldpassword = ''
      form.password = ''
      form.confirmPassword = ''
      formRef.value?.clearValidate()
    }
  }
)

/** Submit password change */
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (!props.userId) {
      ElMessage.warning('当前系统无登陆用户!')
      return
    }

    confirmLoading.value = true
    try {
      const params = {
        userId: props.userId,
        oldpassword: md5(form.oldpassword),
        password: md5(form.password)
      }
      const res = await putAction('/user/updatePwd', params)
      if (res.code === 200) {
        if (res.data.status === 2 || res.data.status === 3) {
          ElMessage.warning(res.data.message)
        } else {
          ElMessage.success(res.data.message)
          handleClose()
        }
      } else {
        ElMessage.warning(res.data?.message || '修改密码失败')
      }
    } catch {
      ElMessage.error('修改密码请求失败')
    } finally {
      confirmLoading.value = false
    }
  })
}

/** Close dialog */
function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    title="修改密码"
    :model-value="visible"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="(val: boolean) => emit('update:visible', val)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      v-loading="confirmLoading"
    >
      <el-form-item label="旧密码" prop="oldpassword">
        <el-input
          v-model="form.oldpassword"
          type="password"
          placeholder="请输入旧密码"
          show-password
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="新密码至少6位，区分大小写"
          show-password
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请确认新密码"
          show-password
          autocomplete="off"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* Dialog form styling handled by Element Plus defaults */
</style>
