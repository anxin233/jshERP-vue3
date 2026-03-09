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
  unitPrice: '',
  beginTime: '',
  endTime: '',
})

function loadData() {
  loading.value = true
  const params: Record<string, any> = {
    ...queryParam,
    materialId: currentMaterialId.value,
  }
  getAction('/depotItem/getMaterialDepotStockByParam', params).then((res: any) => {
    if (res && res.code === 200) {
      dataSource.value = res.data.rows || res.data || []
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function show(
  materialId: string | number,
  depotIds: string,
  unitPrice: string | number,
  beginTime: string,
  endTime: string
) {
  currentMaterialId.value = String(materialId)
  queryParam.depotIds = depotIds
  queryParam.materialId = String(materialId)
  queryParam.unitPrice = String(unitPrice)
  queryParam.beginTime = beginTime
  queryParam.endTime = endTime
  visible.value = true
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
