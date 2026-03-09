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
      label-width="100px"
      v-loading="confirmLoading"
    >
      <el-form-item label="配置名称" prop="platformKeyInfo">
        <el-input v-model="formModel.platformKeyInfo" placeholder="请输入配置名称" readonly />
      </el-form-item>
      <el-form-item label="配置值" prop="platformValue">
        <el-input v-model="formModel.platformValue" placeholder="请输入配置值" />
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
import type { FormInstance } from 'element-plus'
import { addPlatformConfig, editPlatformConfig } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const formRef = ref<FormInstance>()

const formModel = reactive<Record<string, any>>({
  id: undefined,
  platformKeyInfo: '',
  platformValue: '',
})

function resetForm() {
  formModel.id = undefined
  formModel.platformKeyInfo = ''
  formModel.platformValue = ''
}

function add() {
  resetForm()
  title.value = '新增'
  visible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function edit(record: any) {
  resetForm()
  title.value = '编辑'
  visible.value = true
  nextTick(() => {
    Object.keys(record).forEach((key) => {
      if (key in formModel) {
        formModel[key] = record[key]
      }
    })
    formRef.value?.clearValidate()
  })
}

function close() {
  visible.value = false
}

async function handleOk() {
  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    let res: any
    if (!formModel.id) {
      res = await addPlatformConfig(formData)
    } else {
      res = await editPlatformConfig(formData)
    }
    if (res.code === 200) {
      emit('ok')
      close()
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  } finally {
    confirmLoading.value = false
  }
}

function handleCancel() {
  close()
}

defineExpose({ add, edit, title, isReadOnly })
</script>
