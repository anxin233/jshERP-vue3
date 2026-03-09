<template>
  <el-dialog
    v-model="visible"
    title="账户流水"
    width="1200px"
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
      <el-table-column label="类型" prop="type" width="100" />
      <el-table-column label="单位信息" prop="supplierName" width="180" show-overflow-tooltip />
      <el-table-column label="金额" prop="changeAmount" width="100" show-overflow-tooltip>
        <template #default="{ row }">
          {{ getRealChangeAmount(row) }}
        </template>
      </el-table-column>
      <el-table-column label="余额" prop="balance" width="80" />
      <el-table-column label="单据日期" prop="operTime" width="120" />
      <el-table-column label="备注" prop="remark" width="150" />
    </el-table>
    <!-- 分页 -->
    <div style="text-align: right; margin-top: 10px;">
      <el-pagination
        v-model:current-page="ipagination.current"
        v-model:page-size="ipagination.pageSize"
        :total="ipagination.total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 子对话框 -->
    <BillDetail ref="billDetailRef" />
    <FinancialDetail ref="financialDetailRef" />
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
import { findFinancialDetailByNumber } from '@/api/financial'
import BillDetail from '@/views/bill/components/BillDetail.vue'
import FinancialDetail from '@/views/financial/components/FinancialDetail.vue'

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const loading = ref(false)
const dataSource = ref<any[]>([])
const dateRange = ref<string[]>([])
const billDetailRef = ref<InstanceType<typeof BillDetail> | null>(null)
const financialDetailRef = ref<InstanceType<typeof FinancialDetail> | null>(null)

const currentAccountId = ref('')
const currentInitialAmount = ref('')
const currentName = ref('')

const queryParam = reactive<Record<string, any>>({
  accountId: '',
  initialAmount: '',
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
    accountId: currentAccountId.value,
    initialAmount: currentInitialAmount.value,
    currentPage: ipagination.current,
    pageSize: ipagination.pageSize,
  }
  getAction('/account/findAccountInOutList', params).then((res: any) => {
    if (res && res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function show(accountId: string | number, initialAmount: string | number, name?: string) {
  currentAccountId.value = String(accountId)
  currentInitialAmount.value = String(initialAmount)
  currentName.value = name || ''
  queryParam.accountId = String(accountId)
  queryParam.initialAmount = String(initialAmount)
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

function getRealChangeAmount(r: any): string {
  if (r.aList && r.amList) {
    const aListArr = r.aList.toString().split(',')
    const amListArr = r.amList.toString().split(',')
    let res: any = 0
    for (let i = 0; i < aListArr.length; i++) {
      if (aListArr[i] == currentAccountId.value) {
        res = amListArr[i]
      }
    }
    if (res > 0) {
      res = '+' + res
    }
    return res + '[多账户]'
  } else {
    if (r.changeAmount > 0) {
      return '+' + r.changeAmount
    } else {
      return r.changeAmount
    }
  }
}

function myHandleDetail(record: any) {
  if (record.fromType === 'bill') {
    findBillDetailByNumber({ number: record.number }).then((res: any) => {
      if (res && res.code === 200) {
        if (billDetailRef.value) {
          billDetailRef.value.isCanBackCheck = false
          billDetailRef.value.show(res.data, record.type)
          billDetailRef.value.title = '详情'
        }
      }
    })
  } else if (record.fromType === 'financial') {
    findFinancialDetailByNumber({ billNo: record.number }).then((res: any) => {
      if (res && res.code === 200) {
        if (financialDetailRef.value) {
          financialDetailRef.value.isCanBackCheck = false
          financialDetailRef.value.show(res.data, record.type)
          financialDetailRef.value.title = '详情'
        }
      }
    })
  }
}

function exportExcel() {
  const list: any[] = []
  const head = '单据编号,类型,单位信息,金额,余额,单据日期,备注'
  for (let i = 0; i < dataSource.value.length; i++) {
    const ds = dataSource.value[i]
    const item = [ds.number, ds.type, ds.supplierName, getRealChangeAmount(ds), ds.balance, ds.operTime, ds.remark]
    list.push(item)
  }
  const tip = '账户流水'
  const paramObj = { title: '账户流水', head, tip, list }
  downFilePost(paramObj).then((data: any) => {
    if (!data) return
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '账户流水.xls')
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
