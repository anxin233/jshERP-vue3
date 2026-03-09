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
      <el-form-item label="名称" prop="orgAbr">
        <el-input v-model="formModel.orgAbr" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="编号" prop="orgNo">
        <el-input v-model="formModel.orgNo" placeholder="请输入编号" />
      </el-form-item>
      <el-form-item label="上级机构" prop="parentId">
        <el-tree-select
          v-model="formModel.parentId"
          :data="departTree"
          :render-after-expand="false"
          placeholder="请选择上级机构"
          clearable
          check-strictly
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="formModel.sort" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formModel.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import type { FormInstance, FormRules } from 'element-plus'
import { httpAction } from '@/api/http'
import { queryOrganizationTreeList, checkOrganization } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

// ==================== State ====================
const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()
const departTree = ref<any[]>([])
const model = ref<Record<string, any>>({})

const url = {
  add: '/organization/add',
}

// ==================== 表单 ====================
const formModel = reactive<Record<string, any>>({
  orgAbr: '',
  orgNo: '',
  parentId: undefined,
  sort: '',
  remark: '',
})

const validateName = async (_rule: any, value: string, callback: any) => {
  if (!value) return callback()
  const params = {
    name: value,
    id: model.value.id ? model.value.id : 0,
  }
  try {
    const res = await checkOrganization(params)
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
  orgAbr: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { validator: validateName, trigger: 'blur' },
  ],
  orgNo: [{ required: true, message: '请输入编码!', trigger: 'blur' }],
})

// ==================== 方法 ====================

/** 转换后端树结构为 el-tree-select 格式 */
function transformTreeData(data: any[]): any[] {
  if (!data) return []
  return data.map((item) => ({
    value: item.id || item.key || item.value,
    label: item.title || item.label || item.name,
    children: item.children ? transformTreeData(item.children) : undefined,
  }))
}

function loadTreeData() {
  const params = { id: '' }
  queryOrganizationTreeList(params).then((res: any) => {
    if (res) {
      departTree.value = transformTreeData(res)
    }
  })
}

function resetForm() {
  formModel.orgAbr = ''
  formModel.orgNo = ''
  formModel.parentId = undefined
  formModel.sort = ''
  formModel.remark = ''
}

function add() {
  edit()
}

function edit(record?: any) {
  resetForm()
  model.value = {}
  visible.value = true
  title.value = record ? '编辑' : '新增'
  loadTreeData()
  nextTick(() => {
    if (record) {
      formModel.orgAbr = record.orgAbr || ''
      formModel.orgNo = record.orgNo || ''
      formModel.parentId = record.parentId || undefined
      formModel.sort = record.sort || ''
      formModel.remark = record.remark || ''
      model.value = { ...record }
    }
    formRef.value?.clearValidate()
  })
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

  confirmLoading.value = true
  try {
    const formData = { ...model.value, ...formModel }
    const res: any = await httpAction(url.add, formData, 'post')
    if (res.code === 200) {
      ElMessage.success(res.data.message)
      emit('ok')
      close()
    } else {
      ElMessage.warning(res.data.message)
    }
  } finally {
    confirmLoading.value = false
  }
}

function handleCancel() {
  close()
}

defineExpose({ add, edit, title })
</script>
