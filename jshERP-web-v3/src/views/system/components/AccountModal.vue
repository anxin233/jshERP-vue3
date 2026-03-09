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
        <el-input v-model="formModel.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="编号" prop="serialNo">
        <el-input v-model="formModel.serialNo" placeholder="请输入编号" />
      </el-form-item>
      <el-form-item label="期初金额" prop="initialAmount">
        <el-input v-model="formModel.initialAmount" placeholder="请输入期初金额" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="formModel.sort" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
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
import { addAccount, editAccount, checkAccount } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const formRef = ref<FormInstance>()

const formModel = reactive<Record<string, any>>({
  id: undefined,
  name: '',
  serialNo: '',
  initialAmount: '',
  sort: '',
  remark: '',
})

/** 异步校验名称唯一性 */
const validateAccountName = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const params = {
    name: value,
    id: formModel.id || 0,
  }
  checkAccount(params).then((res: any) => {
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('名称已经存在'))
      }
    } else {
      callback(new Error(res.data))
    }
  })
}

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
    { validator: validateAccountName, trigger: 'blur' },
  ],
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  formModel.name = ''
  formModel.serialNo = ''
  formModel.initialAmount = ''
  formModel.sort = ''
  formModel.remark = ''
}

function add() {
  resetForm()
  isReadOnly.value = false
  title.value = '新增'
  visible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false
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
  isReadOnly.value = false
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
      res = await addAccount(formData)
    } else {
      res = await editAccount(formData)
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

defineExpose({ add, edit, isReadOnly, title })
</script>
