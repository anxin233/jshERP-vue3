<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
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
      <el-form-item label="请输入数量" prop="number">
        <el-input v-model.trim="formModel.number" placeholder="请输入数量" />
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
import type { FormInstance, FormRules } from 'element-plus'

type BatchStockType = 'initStock' | 'lowSafeStock' | 'highSafeStock'

const emit = defineEmits<{ ok: [number: string, batchType: BatchStockType] }>()

const visible = ref(false)
const title = ref('批量设置')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const batchType = ref<BatchStockType>('initStock')
const formRef = ref<FormInstance>()

const formModel = reactive({
  number: '',
})

const rules = reactive<FormRules>({
  number: [{ required: true, message: '请输入数量!', trigger: 'blur' }],
})

function resetForm() {
  formModel.number = ''
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const titleMap: Record<BatchStockType, string> = {
  initStock: '期初库存-批量设置',
  lowSafeStock: '最低安全库存-批量设置',
  highSafeStock: '最高安全库存-批量设置',
}

function add(type: BatchStockType) {
  batchType.value = type
  title.value = titleMap[type] || '批量设置'
  edit()
}

function edit() {
  resetForm()
  visible.value = true
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

  emit('ok', formModel.number, batchType.value)
  close()
}

function handleCancel() {
  close()
}

defineExpose({ add, edit, title, isReadOnly })
</script>
