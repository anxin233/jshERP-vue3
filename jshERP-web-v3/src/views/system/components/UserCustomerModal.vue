<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="dataSource"
      size="small"
      row-key="id"
      max-height="500"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="55" reserve-selection />
      <el-table-column prop="supplier" label="客户名称" width="200" />
    </el-table>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOk">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { ElTable } from 'element-plus'
import {
  addUserBusiness,
  editUserBusiness,
  checkUserBusiness,
  getAllCustomer,
  getUserCustomerValue,
} from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const loading = ref(false)
const roleId = ref(0)

const tableRef = ref<InstanceType<typeof ElTable>>()
const dataSource = ref<any[]>([])
const selectedRowKeys = ref<(string | number)[]>([])

/** 打开弹窗并加载数据 */
function edit(record: any) {
  visible.value = true
  roleId.value = record.id
  selectedRowKeys.value = []
  nextTick(() => {
    tableRef.value?.clearSelection()
    loadData()
    loadSelected(record.id)
  })
}

/** 加载全部客户列表 */
function loadData() {
  loading.value = true
  getAllCustomer()
    .then((res: any) => {
      if (res.code === 200) {
        dataSource.value = res.data.rows || []
      } else if (res.code === 510) {
        ElMessage.warning(res.data)
      } else {
        ElMessage.warning(res.data?.message || '获取客户列表失败')
      }
    })
    .finally(() => {
      loading.value = false
    })
}

/** 加载已选中的客户 */
function loadSelected(id: number | string) {
  getUserCustomerValue({ UBType: 'UserCustomer', UBKeyId: id }).then((res: any) => {
    if (res.code === 200) {
      const keys: (string | number)[] = res.data ? res.data : []
      selectedRowKeys.value = keys
      // 等数据加载完后设置表格勾选
      nextTick(() => {
        setTableSelection(keys)
      })
    } else {
      ElMessage.warning(res.data)
    }
  })
}

/** 根据 id 列表设置表格行勾选 */
function setTableSelection(keys: (string | number)[]) {
  if (!tableRef.value) return
  dataSource.value.forEach((row) => {
    if (keys.includes(row.id)) {
      tableRef.value!.toggleRowSelection(row, true)
    }
  })
}

/** 表格选择变化回调 */
function onSelectionChange(selection: any[]) {
  selectedRowKeys.value = selection.map((row) => row.id)
}

/** 保存 */
async function handleOk() {
  confirmLoading.value = true
  try {
    const formData: Record<string, any> = {
      type: 'UserCustomer',
      keyId: roleId.value,
      value: selectedRowKeys.value,
    }
    const checkRes = await checkUserBusiness({ type: 'UserCustomer', keyId: roleId.value })
    let res: any
    if (checkRes.data && checkRes.data.id) {
      formData.id = checkRes.data.id
      res = await editUserBusiness(formData)
    } else {
      res = await addUserBusiness(formData)
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

function close() {
  visible.value = false
}

defineExpose({ edit, title })
</script>

<style scoped>
:deep(.el-table) {
  max-height: 500px;
}
</style>
