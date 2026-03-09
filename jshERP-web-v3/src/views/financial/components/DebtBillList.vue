<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="1300px"
    :close-on-click-modal="false"
    @close="handleCancel"
    top="20px"
  >
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-row :gutter="24">
          <el-col :md="6" :sm="24">
            <el-form-item label="单据编号">
              <el-input v-model="queryParam.number" placeholder="请输入单据编号查询" />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="商品信息">
              <el-input v-model="queryParam.materialParam" placeholder="请输入名称、规格、型号" />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
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
          <el-col :md="6" :sm="24">
            <el-button type="primary" @click="searchQuery">查询</el-button>
            <el-button @click="searchReset">重置</el-button>
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
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
      style="width: 100%"
    >
      <el-table-column type="selection" width="40" />
      <el-table-column :label="organLabel" prop="organName" width="120" show-overflow-tooltip />
      <el-table-column label="单据编号" prop="number" width="150">
        <template #default="{ row }">
          <a @click="myHandleDetail(row)" style="color: #409eff; cursor: pointer;">{{ row.number }}</a>
        </template>
      </el-table-column>
      <el-table-column label="商品信息" prop="materialsList" width="200" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.materialsList ? row.materialsList.replace(',', '，') : '' }}
        </template>
      </el-table-column>
      <el-table-column label="单据日期" prop="operTimeStr" width="130" />
      <el-table-column label="操作员" prop="userName" width="70" show-overflow-tooltip />
      <el-table-column label="本单欠款" prop="needDebt" width="90" />
      <el-table-column :label="finishDebtLabel" prop="finishDebt" width="90" />
      <el-table-column :label="waitDebtLabel" prop="debt" width="90" />
    </el-table>

    <!-- 分页 -->
    <div style="text-align: right; margin-top: 10px;">
      <el-pagination
        v-model:current-page="ipagination.current"
        v-model:page-size="ipagination.pageSize"
        :total="ipagination.total"
        :page-sizes="[100, 200, 300]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 子对话框 - 单据详情 -->
    <BillDetail ref="billDetailRef" />

    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
      <el-button type="primary" @click="handleOk">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getAction } from '@/api/http'
import { findBillDetailByNumber } from '@/api/bill'
import BillDetail from '@/views/bill/components/BillDetail.vue'

const emit = defineEmits<{
  ok: [rows: any[]]
  close: []
}>()

const visible = ref(false)
const title = ref('操作')
const loading = ref(false)
const dataSource = ref<any[]>([])
const dateRange = ref<string[]>([])
const organLabel = ref('')
const finishDebtLabel = ref('已收欠款')
const waitDebtLabel = ref('待收欠款')
const billDetailRef = ref<InstanceType<typeof BillDetail> | null>(null)

// 选中行相关
const selectedRows = ref<any[]>([])

const queryParam = reactive<Record<string, any>>({
  organId: '',
  materialParam: '',
  number: '',
  type: '',
  subType: '',
  status: '',
  beginTime: '',
  endTime: '',
})

const ipagination = reactive({
  current: 1,
  pageSize: 100,
  total: 0,
})

function loadData(page?: number) {
  if (page) ipagination.current = page
  loading.value = true
  const params = {
    ...queryParam,
    currentPage: ipagination.current,
    pageSize: ipagination.pageSize,
  }
  getAction('/depotHead/debtList', params)
    .then((res: any) => {
      if (res && res.code === 200) {
        dataSource.value = res.data.rows || []
        ipagination.total = res.data.total || 0
      }
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}

/**
 * 显示欠款单据列表弹窗
 * @param organId 机构ID
 * @param type 类型（入库/出库）
 * @param subType 子类型（采购/销售等）
 * @param organType 机构类型标签（供应商/客户）
 * @param status 状态
 */
function show(
  organId: string | number,
  type: string,
  subType: string,
  organType: string,
  status?: string,
) {
  queryParam.organId = organId
  queryParam.type = type
  queryParam.subType = subType
  queryParam.status = status || ''
  organLabel.value = organType

  if (type === '入库') {
    finishDebtLabel.value = '已付欠款'
    waitDebtLabel.value = '待付欠款'
  } else if (type === '出库') {
    finishDebtLabel.value = '已收欠款'
    waitDebtLabel.value = '待收欠款'
  }

  visible.value = true
  loadData(1)
}

function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

function handleRowClick(row: any) {
  // 行单击选中（兼容复选框行为）
  selectedRows.value = [row]
}

function handleRowDblClick(row: any) {
  selectedRows.value = [row]
  handleOk()
}

function handleOk() {
  emit('ok', selectedRows.value)
  selectedRows.value = []
  close()
}

function myHandleDetail(record: any) {
  findBillDetailByNumber({ number: record.number }).then((res: any) => {
    if (res && res.code === 200) {
      let type = res.data.depotHeadType
      type = type.replace('其它', '')
      billDetailRef.value?.show(res.data, type)
      if (billDetailRef.value) {
        billDetailRef.value.title = '详情'
      }
    }
  })
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
  queryParam.materialParam = ''
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

function close() {
  emit('close')
  visible.value = false
}

function handleCancel() {
  close()
}

defineExpose({ show })
</script>
