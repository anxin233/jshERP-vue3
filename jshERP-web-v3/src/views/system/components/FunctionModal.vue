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
      label-width="120px"
      v-loading="confirmLoading"
    >
      <el-form-item label="编号" prop="number">
        <el-input v-model.trim="formModel.number" placeholder="请输入编号" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model.trim="formModel.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="上级编号" prop="parentNumber">
        <el-input
          v-model.trim="formModel.parentNumber"
          placeholder="请选择上级编号"
          readonly
        >
          <template #append>
            <el-button :icon="Search" @click="onSearchParentNumber" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="上级名称">
        <el-input v-model="formModel.parentName" readonly />
      </el-form-item>
      <el-form-item label="链接" prop="url">
        <el-input v-model.trim="formModel.url" placeholder="请输入链接" />
      </el-form-item>
      <el-form-item label="组件" prop="component">
        <el-input v-model.trim="formModel.component" placeholder="请输入组件" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model.trim="formModel.sort" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="功能按钮">
        <el-select
          v-model="formModel.pushBtn"
          multiple
          placeholder="请选择功能按钮"
          style="width: 100%"
        >
          <el-option
            v-for="item in pushBtnOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model.trim="formModel.icon" placeholder="请输入图标" />
      </el-form-item>
      <el-form-item label="是否启用">
        <el-switch
          v-model="formModel.enabled"
          active-text="启用"
          inactive-text="禁用"
        />
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

    <!-- 上级编号树选择弹窗 -->
    <function-tree-modal ref="functionTreeModalRef" @ok="functionTreeModalOk" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import FunctionTreeModal from './FunctionTreeModal.vue'
import { addFunction, editFunction, checkFunction, checkNumber } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const formRef = ref<FormInstance>()
const functionTreeModalRef = ref()

/** 功能按钮选项 */
const pushBtnOptions = [
  { label: '编辑', value: '1' },
  { label: '审核', value: '2' },
  { label: '反审核', value: '7' },
  { label: '导出', value: '3' },
  { label: '启用禁用', value: '4' },
  { label: '打印', value: '5' },
  { label: '作废', value: '6' },
]

const formModel = reactive<Record<string, any>>({
  id: undefined,
  number: '',
  name: '',
  parentNumber: '',
  parentName: '',
  url: '',
  component: '',
  sort: '',
  pushBtn: [] as string[],
  icon: '',
  enabled: true,
})

/** 编号唯一性校验 */
const validateNumber = async (_rule: any, value: string, callback: any) => {
  if (!value) return callback()
  try {
    const res = await checkNumber({ number: value, id: formModel.id || 0 })
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('编号已经存在！'))
      }
    } else {
      callback(new Error(res.data))
    }
  } catch {
    callback()
  }
}

/** 名称唯一性校验 */
const validateName = async (_rule: any, value: string, callback: any) => {
  if (!value) return callback()
  try {
    const res = await checkFunction({ name: value, id: formModel.id || 0 })
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('名称已经存在！'))
      }
    } else {
      callback(new Error(res.data))
    }
  } catch {
    callback()
  }
}

const rules = reactive<FormRules>({
  number: [
    { required: true, message: '请输入编号!', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
    { validator: validateNumber, trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
    { validator: validateName, trigger: 'blur' },
  ],
  parentNumber: [
    { required: true, message: '请输入上级编号!', trigger: 'change' },
  ],
  url: [
    { required: true, message: '请输入链接!', trigger: 'blur' },
  ],
  component: [
    { required: true, message: '请输入组件!', trigger: 'blur' },
  ],
  sort: [
    { required: true, message: '请输入排序!', trigger: 'blur' },
  ],
  icon: [
    { required: true, message: '请输入图标!', trigger: 'blur' },
  ],
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  formModel.number = ''
  formModel.name = ''
  formModel.parentNumber = ''
  formModel.parentName = ''
  formModel.url = ''
  formModel.component = ''
  formModel.sort = ''
  formModel.pushBtn = []
  formModel.icon = ''
  formModel.enabled = true
}

function add() {
  resetForm()
  isReadOnly.value = false
  title.value = '新增'
  formModel.enabled = true
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
    // 处理 enabled 布尔值
    if (record.enabled != null) {
      formModel.enabled = !!record.enabled
    }
    // 处理 pushBtn：后端返回逗号分隔字符串，转为数组
    if (record.pushBtn) {
      formModel.pushBtn = typeof record.pushBtn === 'string'
        ? record.pushBtn.split(',').filter(Boolean)
        : record.pushBtn
    } else {
      formModel.pushBtn = []
    }
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
    // 将 pushBtn 数组转为逗号分隔字符串提交
    if (Array.isArray(formData.pushBtn)) {
      formData.pushBtn = formData.pushBtn.join(',')
    }
    let res: any
    if (!formModel.id) {
      res = await addFunction(formData)
    } else {
      res = await editFunction(formData)
    }
    if (res.code === 200) {
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

/** 打开上级编号选择弹窗 */
function onSearchParentNumber() {
  functionTreeModalRef.value?.edit(formModel.id)
  functionTreeModalRef.value.title = '选择上级编号'
}

/** 上级编号选择回调 */
function functionTreeModalOk(number: string | number, name: string) {
  formModel.parentNumber = number
  formModel.parentName = name
}

defineExpose({ add, edit, title })
</script>
