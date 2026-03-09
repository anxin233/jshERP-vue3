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
      :rules="formRules"
      label-width="100px"
      v-loading="confirmLoading"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model.trim="formModel.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formModel.type" placeholder="请选择类型" style="width: 100%">
          <el-option label="销售员" value="销售员" />
          <el-option label="财务员" value="财务员" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model.trim="formModel.sort" placeholder="请输入排序" />
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
import { addPerson, editPerson, checkPerson } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

// ==================== State ====================
const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const disableSubmit = ref(false)
const formRef = ref<FormInstance>()
const model = ref<Record<string, any>>({})

// ==================== 表单 ====================
const formModel = reactive<Record<string, any>>({
  name: '',
  type: undefined,
  sort: '',
})

const validatePersonName = async (_rule: any, value: string, callback: any) => {
  if (!value) return callback()
  const params = {
    name: value,
    id: model.value.id ? model.value.id : 0,
  }
  try {
    const res = await checkPerson(params)
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('名称已经存在'))
      }
    } else {
      callback(new Error(res.data))
    }
  } catch {
    callback()
  }
}

const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入姓名!', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
    { validator: validatePersonName, trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择类型!', trigger: 'change' }],
})

// ==================== 方法 ====================
function resetForm() {
  formModel.name = ''
  formModel.type = undefined
  formModel.sort = ''
}

function add() {
  edit({})
}

function edit(record: any) {
  resetForm()
  model.value = { ...record }
  isReadOnly.value = false
  visible.value = true
  nextTick(() => {
    if (record && Object.keys(record).length > 0) {
      formModel.name = record.name || ''
      formModel.type = record.type || undefined
      formModel.sort = record.sort || ''
    }
    formRef.value?.clearValidate()
  })
}

function close() {
  visible.value = false
  isReadOnly.value = false
}

async function handleOk() {
  if (disableSubmit.value) return

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  confirmLoading.value = true
  try {
    const formData = { ...model.value, ...formModel }
    let res: any
    if (!model.value.id) {
      res = await addPerson(formData)
    } else {
      res = await editPerson(formData)
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
