<template>
  <el-dialog
    v-model="visible"
    title="库存详情-各仓库分布"
    width="800px"
    :close-on-click-modal="false"
    @close="handleCancel"
    top="100px"
  >
    <!-- table区域 -->
    <el-table
      :data="dataSource"
      border
      size="default"
      row-key="id"
      v-loading="loading"
      style="width: 100%"
    >
      <el-table-column type="index" label="#" width="40" align="center" />
      <el-table-column label="仓库名称" prop="depotName" width="200" />
      <el-table-column label="库存数量" prop="currentNumber" width="100" />
      <el-table-column label="成本价" prop="unitPrice" width="100" />
      <el-table-column label="库存金额" prop="allPrice" width="100" />
    </el-table>
    <!-- 分页 -->
    <div style="text-align: right; margin-top: 10px;">
      <el-pagination
        v-model:current-page="ipagination.current"
        v-model:page-size="ipagination.pageSize"
        :total="ipagination.total"
        :page-sizes="[10, 20, 30, 100, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <template #footer>
      <el-button @click="handleCancel">取消(ESC)</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getAction } from '@/api/http'

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const loading = ref(false)
const dataSource = ref<any[]>([])

const currentMaterialId = ref('')

const queryParam = reactive<Record<string, any>>({
  depotIds: '',
  materialId: '',
})

const ipagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

function loadData(page?: number) {
  if (page) ipagination.current = page
  loading.value = true
  const params: Record<string, any> = {
    ...queryParam,
    materialId: currentMaterialId.value,
    currentPage: ipagination.current,
    pageSize: ipagination.pageSize,
  }
  getAction('/material/getMaterialDepotStock', params).then((res: any) => {
    if (res && res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function show(materialId: string | number, depotIds: string) {
  currentMaterialId.value = String(materialId)
  queryParam.depotIds = depotIds
  queryParam.materialId = String(materialId)
  visible.value = true
  loadData(1)
}

function handleSizeChange(val: number) {
  ipagination.pageSize = val
  loadData(1)
}

function handleCurrentChange(val: number) {
  ipagination.current = val
  loadData()
}

function close() {
  emit('close')
  visible.value = false
}

function handleCancel() {
  close()
}

defineExpose({ show })
</script>
