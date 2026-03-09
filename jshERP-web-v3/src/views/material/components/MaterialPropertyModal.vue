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
      :rules="rules"
      label-width="100px"
      v-loading="confirmLoading"
    >
      <el-form-item label="名称">
        {{ formModel.nativeName }}
      </el-form-item>
      <el-form-item label="别名" prop="anotherName">
        <el-input v-model.trim="formModel.anotherName" placeholder="请输入别名" />
      </el-form-item>
    </el-form>
    <template #footer>
      <template v-if="isReadOnly">
        <el-button @click="handleCancel">取消</el-button>
      </template>
      <template v-else>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="handleOk">保存</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { addOrUpdateMaterialProperty } from '@/api/material'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const disableSubmit = ref(false)
const formRef = ref<FormInstance>()

const formModel = reactive<Record<string, any>>({
  id: undefined,
  nativeName: '',
  anotherName: '',
})

const rules = reactive<FormRules>({
  anotherName: [
    { required: true, message: '请输入别名!', trigger: 'blur' },
    { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' },
  ],
})

function resetForm() {
  formModel.id = undefined
  formModel.nativeName = ''
  formModel.anotherName = ''
}

function add() {
  edit({})
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false
  visible.value = true
  nextTick(() => {
    if (record.id) formModel.id = record.id
    if (record.nativeName) formModel.nativeName = record.nativeName
    if (record.anotherName) formModel.anotherName = record.anotherName
    formRef.value?.clearValidate()
  })
}

function close() {
  visible.value = false
  isReadOnly.value = false
}

async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (!formModel.id) {
    return
  }

  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    const res = await addOrUpdateMaterialProperty(formData)
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

defineExpose({ add, edit, title, isReadOnly, disableSubmit })
</script>
