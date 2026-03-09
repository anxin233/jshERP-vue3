<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="700px"
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
      <el-form-item label="基本单位" prop="basicUnit">
        <el-input v-model.trim="formModel.basicUnit" placeholder="请输入基本单位(小单位)" />
      </el-form-item>
      <el-form-item label="副单位">
        <div style="display: flex; align-items: center; gap: 8px;">
          <el-input v-model.trim="formModel.otherUnit" placeholder="请输入副单位(大单位)" style="flex: 1;" />
          <span>=</span>
          <el-input v-model.trim="formModel.ratio" placeholder="请输入比例" style="flex: 1;">
            <template #suffix>基本单位</template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item label="副单位2">
        <div style="display: flex; align-items: center; gap: 8px;">
          <el-input v-model.trim="formModel.otherUnitTwo" placeholder="请输入副单位2(大单位)" style="flex: 1;" />
          <span>=</span>
          <el-input v-model.trim="formModel.ratioTwo" placeholder="请输入比例2" style="flex: 1;">
            <template #suffix>基本单位</template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item label="副单位3">
        <div style="display: flex; align-items: center; gap: 8px;">
          <el-input v-model.trim="formModel.otherUnitThree" placeholder="请输入副单位3(大单位)" style="flex: 1;" />
          <span>=</span>
          <el-input v-model.trim="formModel.ratioThree" placeholder="请输入比例3" style="flex: 1;">
            <template #suffix>基本单位</template>
          </el-input>
        </div>
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
import { addUnit, editUnit } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const disableSubmit = ref(false)
const formRef = ref<FormInstance>()

const formModel = reactive<Record<string, any>>({
  id: undefined,
  basicUnit: '',
  otherUnit: '',
  ratio: '',
  otherUnitTwo: '',
  ratioTwo: '',
  otherUnitThree: '',
  ratioThree: '',
})

/** 校验比例是否为最多三位小数的数字 */
function isDecimalThree(val: string | number): boolean {
  const reg = /^[0-9]+(\.?[0-9]{1,3})?$/
  return reg.test(String(val))
}

const rules = reactive<FormRules>({
  basicUnit: [
    { required: true, message: '请输入基本单位!', trigger: 'blur' },
    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' },
  ],
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  formModel.basicUnit = ''
  formModel.otherUnit = ''
  formModel.ratio = ''
  formModel.otherUnitTwo = ''
  formModel.ratioTwo = ''
  formModel.otherUnitThree = ''
  formModel.ratioThree = ''
}

function add() {
  edit({})
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false
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
}

async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const formData = { ...formModel }

  // 副单位校验
  if (!formData.otherUnit) {
    ElMessage.warning('抱歉，副单位不能为空！')
    return
  }
  if (formData.otherUnit) {
    if (!formData.ratio) {
      ElMessage.warning('抱歉，比例不能为空！')
      return
    }
    if (!isDecimalThree(formData.ratio)) {
      ElMessage.warning('抱歉，比例只能为数字，最多三位小数！')
      return
    }
  }
  if (formData.otherUnitTwo) {
    if (!formData.ratioTwo) {
      ElMessage.warning('抱歉，比例2不能为空！')
      return
    }
    if (!isDecimalThree(formData.ratioTwo)) {
      ElMessage.warning('抱歉，比例2只能为数字，最多三位小数！')
      return
    }
  }
  if (formData.otherUnitThree) {
    if (!formData.ratioThree) {
      ElMessage.warning('抱歉，比例3不能为空！')
      return
    }
    if (!isDecimalThree(formData.ratioThree)) {
      ElMessage.warning('抱歉，比例3只能为数字，最多三位小数！')
      return
    }
  }
  if (!formData.otherUnitTwo && formData.otherUnitThree) {
    ElMessage.warning('抱歉，需要先输入副单位2再输入副单位3！')
    return
  }
  if (formData.basicUnit === formData.otherUnit) {
    ElMessage.warning('抱歉，基本单位与副单位不能相同！')
    return
  }
  if (formData.basicUnit === formData.otherUnitTwo) {
    ElMessage.warning('抱歉，基本单位与副单位2不能相同！')
    return
  }
  if (formData.basicUnit === formData.otherUnitThree) {
    ElMessage.warning('抱歉，基本单位与副单位3不能相同！')
    return
  }

  confirmLoading.value = true
  try {
    let res: any
    if (!formModel.id) {
      res = await addUnit(formData)
    } else {
      res = await editUnit(formData)
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
