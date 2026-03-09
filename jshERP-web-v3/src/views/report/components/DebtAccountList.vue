<template>
  <el-dialog
    v-model="visible"
    title="欠款详情"
    width="1200px"
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
              <el-input v-model="queryParam.number" placeholder="请输入单据编号查询" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="商品信息">
              <el-input v-model="queryParam.materialParam" placeholder="请输入名称、规格、型号" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="12" :sm="24">
            <el-button type="primary" @click="searchQuery">查询</el-button>
            <el-button @click="handleHistoryFinancial">
              <el-icon><Clock /></el-icon>{{ historyText }}
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
      <el-table-column type="index" label="#" width="40" align="center">
        <template #default="{ row, $index }">
          {{ row.rowIndex === '合计' ? '合计' : $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="单据编号" prop="number" width="120">
        <template #default="{ row }">
          <a @click="myHandleDetail(row)" style="color: #409eff; cursor: pointer;">{{ row.number }}</a>
        </template>
      </el-table-column>
      <el-table-column :label="organColumnTitle" prop="organName" width="120" />
      <el-table-column label="商品信息" prop="materialsList" width="200" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.materialsList ? row.materialsList.replace(',', '，') : '' }}
        </template>
      </el-table-column>
      <el-table-column label="单据日期" prop="operTimeStr" width="130" />
      <el-table-column label="操作员" prop="userName" width="60" show-overflow-tooltip />
      <el-table-column label="本单欠款" prop="needDebt" width="70" />
      <el-table-column :label="finishDebtLabel" prop="finishDebt" width="70" />
      <el-table-column :label="waitDebtLabel" prop="debt" width="70" />
    </el-table>
    <!-- 子对话框 -->
    <BillDetail ref="billDetailRef" />
    <HistoryFinancialList ref="historyFinancialRef" />
    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Clock } from '@element-plus/icons-vue'
import { getAction } from '@/api/http'
import { findBillDetailByNumber } from '@/api/bill'
import BillDetail from '@/views/bill/components/BillDetail.vue'
import HistoryFinancialList from './HistoryFinancialList.vue'

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const loading = ref(false)
const dataSource = ref<any[]>([])
const billDetailRef = ref<InstanceType<typeof BillDetail> | null>(null)
const historyFinancialRef = ref<InstanceType<typeof HistoryFinancialList> | null>(null)

const historyText = ref('')
const financialType = ref('')
const organColumnTitle = ref('')
const finishDebtLabel = ref('已收欠款')
const waitDebtLabel = ref('待收欠款')

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

function loadData(page?: number) {
  loading.value = true
  const params: Record<string, any> = {
    ...queryParam,
    currentPage: 1,
    pageSize: 10001,
  }
  getAction('/depotHead/debtList', params).then((res: any) => {
    if (res && res.code === 200) {
      dataSource.value = res.data.rows || []
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function show(
  organId: string | number,
  type: string,
  subType: string,
  organType: string,
  status: string,
  beginTime: string,
  endTime: string
) {
  queryParam.organId = organId
  queryParam.type = type
  queryParam.subType = subType
  queryParam.status = status
  queryParam.beginTime = beginTime
  queryParam.endTime = endTime
  organColumnTitle.value = organType
  if (type === '入库') {
    finishDebtLabel.value = '已付欠款'
    waitDebtLabel.value = '待付欠款'
    historyText.value = '历史付款'
    financialType.value = '付款'
  } else if (type === '出库') {
    finishDebtLabel.value = '已收欠款'
    waitDebtLabel.value = '待收欠款'
    historyText.value = '历史收款'
    financialType.value = '收款'
  }
  visible.value = true
  loadData(1)
}

function searchQuery() {
  loadData(1)
}

function myHandleDetail(record: any) {
  findBillDetailByNumber({ number: record.number }).then((res: any) => {
    if (res && res.code === 200) {
      let type = res.data.depotHeadType
      type = type.replace('其它', '')
      if (billDetailRef.value) {
        billDetailRef.value.isCanBackCheck = false
        billDetailRef.value.show(res.data, type)
        billDetailRef.value.title = '详情'
      }
    }
  })
}

function handleHistoryFinancial() {
  if (historyFinancialRef.value) {
    historyFinancialRef.value.show(
      financialType.value,
      queryParam.organId,
      '',
      queryParam.beginTime,
      queryParam.endTime
    )
  }
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
