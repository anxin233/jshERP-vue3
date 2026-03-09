<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      label-width="120px"
      v-loading="confirmLoading"
    >
      <el-form-item label="机器码">
        <el-input v-model="formModel.platformKey" readonly />
      </el-form-item>
      <el-form-item label="插件激活码">
        <el-input
          v-model="formModel.platformValue"
          type="textarea"
          :rows="2"
          placeholder="请输入插件激活码"
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getPlatformConfigByKey } from '@/api/system'
import { getAction, postAction } from '@/api/http'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()

const formModel = reactive<Record<string, any>>({
  platformKey: '',
  platformValue: '',
})

function edit() {
  formModel.platformKey = ''
  formModel.platformValue = ''
  getAction('/plugin/getMacWithSecret').then((res: any) => {
    if (res && res.code === 200) {
      formModel.platformKey = res.data
      getPlatformConfigByKey({ platformKey: 'activation_code' }).then((res2: any) => {
        if (res2 && res2.code === 200) {
          formModel.platformValue = res2.data?.platformValue || ''
          visible.value = true
        }
      })
    }
  })
}

function close() {
  visible.value = false
}

async function handleOk() {
  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    formData.platformKey = 'activation_code'
    const res = await postAction('/platformConfig/updatePlatformConfigByKey', formData)
    if (res.code === 200) {
      ElMessage.success('填写成功！')
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

defineExpose({ edit, title })
</script>
