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
      <el-form-item label="请输入价格" prop="price">
        <el-input v-model.trim="formModel.price" placeholder="请输入价格" />
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

type BatchPriceType = 'purchase' | 'commodity' | 'wholesale' | 'low'

const emit = defineEmits<{ ok: [price: string, batchType: BatchPriceType] }>()

const visible = ref(false)
const title = ref('批量设置')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const batchType = ref<BatchPriceType>('purchase')
const formRef = ref<FormInstance>()

const formModel = reactive({
  price: '',
})

const rules = reactive<FormRules>({
  price: [{ required: true, message: '请输入价格!', trigger: 'blur' }],
})

function resetForm() {
  formModel.price = ''
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const titleMap: Record<BatchPriceType, string> = {
  purchase: '采购价-批量设置',
  commodity: '零售价-批量设置',
  wholesale: '销售价-批量设置',
  low: '最低售价-批量设置',
}

function add(type: BatchPriceType) {
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

  emit('ok', formModel.price, batchType.value)
  close()
}

function handleCancel() {
  close()
}

defineExpose({ add, edit, title, isReadOnly })
</script>
