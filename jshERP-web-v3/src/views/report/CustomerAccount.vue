<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery" class="search-form">
        <el-row :gutter="24">
          <el-col :md="6" :sm="24">
            <el-form-item label="客户">
              <el-select
                v-model="queryParam.organId"
                placeholder="请选择客户"
                filterable
                clearable
                remote
                :remote-method="handleSearchCustomer"
                style="width: 100%"
              >
                <el-option
                  v-for="item in cusList"
                  :key="item.id"
                  :label="item.supplier"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="账单周期">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                @change="onDateChange"
              />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item>
              <el-button type="primary" @click="searchQuery">查询</el-button>
              <el-button @click="exportExcel" :icon="Download">导出</el-button>
              <el-button link type="primary" @click="handleToggleSearch">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <el-icon><ArrowUp v-if="toggleSearchStatus" /><ArrowDown v-else /></el-icon>
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item>
              <span style="font-weight: bold">{{ firstTotal }} {{ lastTotal }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 展开的高级搜索 -->
        <template v-if="toggleSearchStatus">
          <el-row :gutter="24">
            <el-col :md="6" :sm="24">
              <el-form-item label="欠款情况">
                <el-select v-model="queryParam.hasDebt" style="width: 100%">
                  <el-option label="有欠款" value="1" />
                  <el-option label="无欠款" value="0" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <ProTable
      ref="tableRef"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      row-key="id"
      :pagination="ipagination"
      :border="true"
      size="default"
      @change="handleTableChange"
    >
      <template #rowIndex="{ text, index }">
        {{ text !== '合计' ? index + 1 : text }}
      </template>
      <template #action="{ record }">
        <el-button v-if="record.id" link type="primary" @click="showDebtAccountList(record)">详情</el-button>
      </template>
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'allNeed'">
          期末应收
          <el-tooltip content="期末应收=期初应收+本期欠款-本期收款" placement="top">
            <el-icon style="cursor: pointer; margin-left: 4px"><QuestionFilled /></el-icon>
          </el-tooltip>
        </template>
        <template v-else>{{ column.title }}</template>
      </template>
    </ProTable>

    <!-- 子弹窗: 欠款详情 -->
    <DebtAccountList ref="debtAccountListRef" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, ArrowUp, ArrowDown, QuestionFilled } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import DebtAccountList from './components/DebtAccountList.vue'
import { useList } from '@/composables/useList'
import type { ListColumn } from '@/composables/useList'
import { getAction } from '@/api/http'
import { getPrevMonthFormatDate } from '@/utils/date'
import dayjs from 'dayjs'

defineOptions({ name: 'CustomerAccount' })

// ==================== 状态 ====================
const tableRef = ref()
const debtAccountListRef = ref()
const cusList = ref<any[]>([])
const firstTotal = ref('')
const lastTotal = ref('')
const setTimeFlag = ref<ReturnType<typeof setTimeout> | null>(null)

const defaultBeginTime = getPrevMonthFormatDate(3)
const defaultEndTime = dayjs().format('YYYY-MM-DD')
const dateRange = ref<[string, string]>([defaultBeginTime, defaultEndTime])

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '#', dataIndex: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
  { title: '欠款详情', dataIndex: 'action', width: 80, align: 'center', customRender: 'action' },
  { title: '客户', dataIndex: 'supplier', width: 150, ellipsis: true },
  { title: '联系人', dataIndex: 'contacts', width: 100, ellipsis: true },
  { title: '手机号码', dataIndex: 'telephone', width: 100 },
  { title: '联系电话', dataIndex: 'phoneNum', width: 100 },
  { title: '电子邮箱', dataIndex: 'email', width: 100 },
  { title: '期初应收', dataIndex: 'preNeed', width: 80, sorter: true },
  { title: '本期欠款', dataIndex: 'debtMoney', width: 80, sorter: true },
  { title: '本期收款', dataIndex: 'backMoney', width: 80, sorter: true },
  { title: '期末应收', dataIndex: 'allNeed', width: 80, sorter: true },
]

const defDataIndex = [
  'rowIndex', 'action', 'supplier', 'contacts', 'telephone', 'phoneNum',
  'email', 'preNeed', 'debtMoney', 'backMoney', 'allNeed',
]

// ==================== useList ====================
const {
  loading,
  dataSource,
  columns,
  queryParam,
  ipagination,
  toggleSearchStatus,
  handleToggleSearch,
  handleTableChange,
  handleExportXlsPost,
  initColumnsSetting,
} = useList({
  url: { list: '/depotHead/getStatementAccount' },
  defColumns,
  defDataIndex,
  pageName: 'customerAccount',
  urlPath: '/report/customer_account',
  pageSize: 11,
  disableCreatedLoad: true,
  queryParam: {
    supplierType: '客户',
    organId: undefined,
    hasDebt: '1',
    beginTime: defaultBeginTime,
    endTime: defaultEndTime,
  },
})

// ==================== 自定义数据加载 ====================
async function loadReportData(arg?: number) {
  if (arg === 1) {
    ipagination.current = 1
  }
  if (!queryParam.beginTime || !queryParam.endTime) {
    ElMessage.warning('请选择单据日期！')
    return
  }
  loading.value = true
  try {
    const params: Record<string, any> = {
      ...queryParam,
      currentPage: ipagination.current,
      pageSize: ipagination.pageSize - 1,
    }
    const res = await getAction('/depotHead/getStatementAccount', params)
    if (res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
      firstTotal.value = '期初应收：' + (res.data.firstMoney || 0) + '，'
      lastTotal.value = '期末应收：' + (res.data.lastMoney || 0)
    } else if (res.code === 510) {
      ElMessage.warning(res.data)
    } else {
      ElMessage.warning(res.data?.message || '数据加载失败')
    }
  } catch (err) {
    console.error('[CustomerAccount] loadData error:', err)
  } finally {
    loading.value = false
  }
}

function searchQuery() {
  if (!queryParam.beginTime || !queryParam.endTime) {
    ElMessage.warning('请选择单据日期！')
    return
  }
  loadReportData(1)
}

function onDateChange(val: [string, string] | null) {
  if (val && val[0] && val[1]) {
    queryParam.beginTime = val[0]
    queryParam.endTime = val[1]
  } else {
    queryParam.beginTime = ''
    queryParam.endTime = ''
  }
}

// ==================== 客户搜索 ====================
function initCustomer() {
  getAction('/supplier/findBySelect_cus', { limit: 1 }).then((res: any) => {
    if (res) cusList.value = res
  })
}

function handleSearchCustomer(value: string) {
  if (setTimeFlag.value) clearTimeout(setTimeFlag.value)
  setTimeFlag.value = setTimeout(() => {
    getAction('/supplier/findBySelect_cus', { key: value, limit: 1 }).then((res: any) => {
      if (res) cusList.value = res
    })
  }, 500)
}

// ==================== 欠款详情 ====================
function showDebtAccountList(record: any) {
  debtAccountListRef.value?.show(
    record.id,
    '出库',
    '销售',
    '客户',
    '',
    queryParam.beginTime,
    queryParam.endTime,
  )
}

// ==================== 导出 ====================
function exportExcel() {
  const list: any[][] = []
  const head = '客户,联系人,手机号码,联系电话,电子邮箱,期初应收,本期欠款,本期收款,期末应收'
  for (let i = 0; i < dataSource.value.length; i++) {
    const ds = dataSource.value[i]
    list.push([
      ds.supplier, ds.contacts, ds.telephone, ds.phoneNum,
      ds.email, ds.preNeed, ds.debtMoney, ds.backMoney, ds.allNeed,
    ])
  }
  const tip = '单据日期：' + queryParam.beginTime + '~' + queryParam.endTime
  handleExportXlsPost('客户对账', '客户对账', head, tip, list)
}

// ==================== 初始化 ====================
onMounted(() => {
  initCustomer()
  initColumnsSetting()
  loadReportData(1)
})
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 16px;
}
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 10px;
  }
}
</style>
