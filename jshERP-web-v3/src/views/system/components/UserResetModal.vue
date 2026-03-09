<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-width="100px"
      v-loading="confirmLoading"
    >
      <el-form-item label="新密码" prop="password">
        <el-input
          v-model.trim="formModel.password"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOk">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import CryptoJS from 'crypto-js'
import { resetPwd } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()
const recordId = ref<number | string>()

const formModel = reactive({
  password: '',
})

const rules = reactive<FormRules>({
  password: [
    { required: true, message: '请输入新密码!', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*\d).{6,}$/,
      message: '用户密码至少要有数字和小写字母，并且长度至少6位!',
      trigger: 'blur',
    },
  ],
})

function add() {
  edit({})
}

function edit(record: any) {
  formModel.password = ''
  recordId.value = record.id
  title.value = '重置密码'
  visible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function close() {
  visible.value = false
}

async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  confirmLoading.value = true
  try {
    const bodyParam = {
      id: recordId.value,
      password: CryptoJS.MD5(formModel.password).toString(),
    }
    const res = await resetPwd(bodyParam)
    if (res.code === 200) {
      ElMessage.success('重置密码成功！')
      emit('ok')
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  } finally {
    confirmLoading.value = false
    close()
  }
}

function handleCancel() {
  close()
}

defineExpose({ add, edit, title })
</script>
