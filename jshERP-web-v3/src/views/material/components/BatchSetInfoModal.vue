<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="1000px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      label-width="90px"
      v-loading="confirmLoading"
    >
      <el-row :gutter="24">
        <el-col :md="8" :sm="24">
          <el-form-item label="颜色" prop="color">
            <el-input v-model.trim="formModel.color" placeholder="请输入颜色" />
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="24">
          <el-form-item label="基础重量" prop="weight">
            <el-input-number
              v-model="formModel.weight"
              :controls="false"
              placeholder="请输入基础重量(kg)"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="24">
          <el-form-item label="保质期" prop="expiryNum">
            <el-input-number
              v-model="formModel.expiryNum"
              :controls="false"
              placeholder="请输入保质期(天)"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="24">
          <el-form-item label="类别" prop="categoryId">
            <el-tree-select
              v-model="formModel.categoryId"
              :data="categoryTree"
              :props="{ label: 'title', value: 'value', children: 'children' }"
              clearable
              check-strictly
              :render-after-expand="false"
              placeholder="请选择类别"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="24">
          <el-form-item label="序列号" prop="enableSerialNumber">
            <el-select v-model="formModel.enableSerialNumber" placeholder="有无序列号" clearable style="width: 100%">
              <el-option label="有" value="1" />
              <el-option label="无" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="24">
          <el-form-item label="批号" prop="enableBatchNumber">
            <el-select v-model="formModel.enableBatchNumber" placeholder="有无批号" clearable style="width: 100%">
              <el-option label="有" value="1" />
              <el-option label="无" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formModel.remark"
              type="textarea"
              :rows="1"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOk">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { queryMaterialCategoryTreeList, batchUpdateMaterial } from '@/api/material'

interface CategoryTreeNode {
  title: string
  value: string | number
  key: string | number
  children?: CategoryTreeNode[]
}

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('批量编辑')
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()
const materialIds = ref('')
const categoryTree = ref<CategoryTreeNode[]>([])

const formModel = reactive<Record<string, any>>({
  color: undefined,
  weight: undefined,
  expiryNum: undefined,
  categoryId: undefined,
  enableSerialNumber: undefined,
  enableBatchNumber: undefined,
  remark: undefined,
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

async function loadTreeData() {
  try {
    const res = await queryMaterialCategoryTreeList({ id: '' })
    if (res) {
      categoryTree.value = res
    }
  } catch {
    categoryTree.value = []
  }
}

function edit(ids: string) {
  materialIds.value = ids
  resetForm()
  loadTreeData()
  visible.value = true
}

function close() {
  visible.value = false
}

async function handleOk() {
  // Collect non-empty fields
  const formData: Record<string, any> = {}
  Object.keys(formModel).forEach((key) => {
    if (formModel[key] !== undefined && formModel[key] !== null && formModel[key] !== '') {
      formData[key] = formModel[key]
    }
  })

  if (Object.keys(formData).length === 0) {
    ElMessage.warning('抱歉，请输入要批量编辑的内容！')
    return
  }

  if (formData.enableSerialNumber === '1' && formData.enableBatchNumber === '1') {
    ElMessage.warning('抱歉，序列号和批号只能选择一项！')
    return
  }

  const idList = materialIds.value ? materialIds.value.split(',') : []

  try {
    await ElMessageBox.confirm(
      `是否操作选中的${idList.length}条数据?`,
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    // User cancelled
    return
  }

  confirmLoading.value = true
  try {
    const paramObj = {
      ids: materialIds.value,
      material: JSON.stringify(formData),
    }
    const res = await batchUpdateMaterial(paramObj)
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

defineExpose({ edit, title })
</script>
