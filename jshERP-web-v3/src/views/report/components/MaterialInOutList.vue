<template>
  <el-dialog
    v-model="visible"
    title="库存详情-流水"
    width="1400px"
    :close-on-click-modal="false"
    @close="handleCancel"
    top="20px"
  >
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-row :gutter="24">
          <el-col :md="8" :sm="24">
            <el-form-item label="单据编号">
              <el-input v-model="queryParam.number" placeholder="请输入单据编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="8" :sm="24">
            <el-form-item label="单据日期">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                @change="onDateChange"
              />
            </el-form-item>
          </el-col>
          <el-col :md="8" :sm="24">
            <el-button type="primary" @click="searchQuery">查询</el-button>
            <el-button @click="searchReset">重置</el-button>
            <el-button @click="exportExcel">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
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
      <el-table-column label="单据编号" prop="number" width="120">
        <template #default="{ row }">
          <a @click="myHandleDetail(row)" style="color: #409eff; cursor: pointer;">{{ row.number }}</a>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" width="80" />
      <el-table-column label="条码" prop="barCode" width="100" />
      <el-table-column label="名称" prop="materialName" width="200" />
      <el-table-column label="仓库名称" prop="depotName" width="80" />
      <el-table-column label="数量" prop="basicNumber" width="70" />
      <el-table-column label="单价" prop="unitPrice" width="70" />
      <el-table-column label="金额" prop="allPrice" width="70" />
      <el-table-column label="日期" prop="operTime" width="110" />
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
    <!-- 子对话框 -->
    <BillDetail ref="billDetailRef" />
    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { getAction, downFilePost } from '@/api/http'
import { findBillDetailByNumber } from '@/api/bill'
import BillDetail from '@/views/bill/components/BillDetail.vue'

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const loading = ref(false)
const dataSource = ref<any[]>([])
const dateRange = ref<string[]>([])
const billDetailRef = ref<InstanceType<typeof BillDetail> | null>(null)

const currentMaterialId = ref('')

const queryParam = reactive<Record<string, any>>({
  depotIds: '',
  materialId: '',
  number: '',
  beginTime: '',
  endTime: '',
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
  getAction('/depotItem/findDetailByDepotIdsAndMaterialId', params).then((res: any) => {
    if (res && res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function show(
  materialId: string | number,
  depotIds: string,
  barCode?: string,
  materialName?: string
) {
  currentMaterialId.value = String(materialId)
  queryParam.depotIds = depotIds
  queryParam.materialId = String(materialId)
  visible.value = true
  loadData(1)
}

function onDateChange(val: string[] | null) {
  if (val && val.length === 2) {
    queryParam.beginTime = val[0]
    queryParam.endTime = val[1]
  } else {
    queryParam.beginTime = ''
    queryParam.endTime = ''
  }
}

function searchQuery() {
  loadData(1)
}

function searchReset() {
  queryParam.number = ''
  queryParam.beginTime = ''
  queryParam.endTime = ''
  dateRange.value = []
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

function myHandleDetail(record: any) {
  findBillDetailByNumber({ number: record.number }).then((res: any) => {
    if (res && res.code === 200) {
      if (billDetailRef.value) {
        billDetailRef.value.isCanBackCheck = false
        billDetailRef.value.show(res.data, record.type)
        billDetailRef.value.title = '详情'
      }
    }
  })
}

function exportExcel() {
  const list: any[] = []
  const head = '单据编号,类型,条码,名称,仓库名称,数量,单价,金额,日期'
  for (let i = 0; i < dataSource.value.length; i++) {
    const ds = dataSource.value[i]
    const item = [ds.number, ds.type, ds.barCode, ds.materialName, ds.depotName, ds.basicNumber, ds.unitPrice, ds.allPrice, ds.operTime]
    list.push(item)
  }
  const tip = '商品库存流水查询'
  const paramObj = { title: '商品库存流水', head, tip, list }
  downFilePost(paramObj).then((data: any) => {
    if (!data) return
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '商品库存流水.xls')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
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
