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
      <el-form-item label="名称" prop="name">
        <el-input v-model="formModel.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="编号" prop="serialNo">
        <el-input v-model="formModel.serialNo" placeholder="请输入编号" />
      </el-form-item>
      <el-form-item label="上级目录" prop="parentId">
        <el-tree-select
          v-model="formModel.parentId"
          :data="treeSelectData"
          :props="{ value: 'value', label: 'label', children: 'children' }"
          clearable
          check-strictly
          :render-after-expand="false"
          placeholder="请选择上级目录"
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
      <el-button type="primary" :loading="confirmLoading" :disabled="disableSubmit" @click="handleOk">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { queryMaterialCategoryTreeList, checkMaterialCategory } from '@/api/material'
import { postAction } from '@/api/http'

const emit = defineEmits<{ ok: [] }>()

// ==================== 状态 ====================
const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const disableSubmit = ref(false)
const formRef = ref<FormInstance>()
const model = ref<any>({})
const treeSelectData = ref<any[]>([])

const formModel = reactive<Record<string, any>>({
  name: '',
  serialNo: '',
  parentId: undefined,
  sort: '',
  remark: '',
})

const url = {
  add: '/materialCategory/add',
}

// ==================== 树节点转换 ====================

interface TreeSelectNode {
  value: string | number
  label: string
  children?: TreeSelectNode[]
}

/** 将后端树节点转换为 el-tree-select 格式 */
function transformToSelectTree(nodes: any[]): TreeSelectNode[] {
  return nodes.map((node) => ({
    value: node.key || node.id,
    label: node.title || node.text,
    children: node.children?.length ? transformToSelectTree(node.children) : undefined,
  }))
}

// ==================== 表单验证 ====================

const validateName = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入名称!'))
    return
  }
  const params = {
    name: value,
    parentId: formModel.parentId,
    id: model.value.id ? model.value.id : 0,
  }
  checkMaterialCategory(params).then((res: any) => {
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

const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { validator: validateName, trigger: 'blur' },
  ],
  serialNo: [{ required: true, message: '请输入编号!', trigger: 'blur' }],
})

// ==================== 方法 ====================

/** 加载类别树数据 */
function loadTreeData() {
  const params = { id: '' }
  queryMaterialCategoryTreeList(params).then((res: any) => {
    if (res) {
      const data = res.data || res
      treeSelectData.value = transformToSelectTree(data)
    }
  })
}

/** 重置表单 */
function resetForm() {
  formModel.name = ''
  formModel.serialNo = ''
  formModel.parentId = undefined
  formModel.sort = ''
  formModel.remark = ''
}

/** 新增 */
function add() {
  edit()
}

/** 编辑（新增时 record 为空） */
function edit(record?: any) {
  resetForm()
  model.value = {}
  visible.value = true
  loadTreeData()
  nextTick(() => {
    if (record) {
      formModel.name = record.name || ''
      formModel.serialNo = record.serialNo || ''
      formModel.parentId = record.parentId
      formModel.sort = record.sort || ''
      formModel.remark = record.remark || ''
      model.value = { ...record }
    }
    formRef.value?.clearValidate()
  })
}

/** 关闭弹窗 */
function close() {
  visible.value = false
  disableSubmit.value = false
}

/** 保存 */
async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  confirmLoading.value = true
  try {
    const formData = { ...model.value, ...formModel }
    const res = await postAction(url.add, formData) as any
    if (res.code === 200) {
      ElMessage.success(res.data?.message || '操作成功')
      loadTreeData()
      emit('ok')
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  } finally {
    confirmLoading.value = false
    close()
  }
}

/** 取消 */
function handleCancel() {
  close()
}

defineExpose({ add, edit, title, disableSubmit })
</script>

<style scoped>
/* 使用 Element Plus 默认样式 */
</style>
