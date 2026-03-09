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
      <el-form-item label="名称" prop="name">
        <el-input v-model.trim="formModel.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formModel.type" placeholder="请选择类型" :disabled="typeDisabled" style="width: 100%">
          <el-option label="收入" value="收入" />
          <el-option label="支出" value="支出" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序">
        <el-input v-model.trim="formModel.sort" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formModel.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { addInOutItem, editInOutItem } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const disableSubmit = ref(false)
const typeDisabled = ref(false)
const typeParam = ref('')
const formRef = ref<FormInstance>()

const formModel = reactive<Record<string, any>>({
  id: undefined,
  name: '',
  type: '',
  sort: '',
  remark: '',
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择类型!', trigger: 'change' },
  ],
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  formModel.name = ''
  formModel.type = ''
  formModel.sort = ''
  formModel.remark = ''
}

function add(type?: string) {
  typeParam.value = type || ''
  edit({})
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false

  if (typeParam.value) {
    typeDisabled.value = true
    if (typeParam.value === 'in') {
      formModel.type = '收入'
    } else if (typeParam.value === 'out') {
      formModel.type = '支出'
    }
  } else {
    typeDisabled.value = false
  }

  title.value = record.id ? '编辑' : '新增'
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
  isReadOnly.value = false
  typeParam.value = ''
}

async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    let res: any
    if (!formModel.id) {
      res = await addInOutItem(formData)
    } else {
      res = await editInOutItem(formData)
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

defineExpose({ add, edit, title, isReadOnly, disableSubmit })
</script>
