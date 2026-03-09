<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="handleSearchQuery">
        <el-row :gutter="16">
          <el-col :md="6" :sm="24">
            <el-form-item label="名称">
              <el-input v-model="queryParam.name" placeholder="请输入名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="编号">
              <el-input v-model="queryParam.serialNo" placeholder="请输入编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="5" :sm="24">
            <el-form-item>
              <el-button type="primary" @click="handleSearchQuery">查询</el-button>
              <el-button @click="exportExcel" :icon="Download">导出</el-button>
            </el-form-item>
          </el-col>
          <el-col :md="7" :sm="24">
            <el-form-item>
              <span>本月发生总额：{{ allMonthAmount }}，当前总余额：{{ allCurrentAmount }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 列设置 -->
    <div class="table-operator">
      <el-popover trigger="click" placement="bottom-start" :width="600">
        <template #reference>
          <el-button :icon="Setting" circle />
        </template>
        <el-checkbox-group v-model="settingDataIndex" @change="onColChange">
          <el-row>
            <el-col v-for="item in defColumns" :key="item.dataIndex" :span="6">
              <el-checkbox :value="item.dataIndex" :disabled="item.dataIndex === 'rowIndex'">
                {{ item.title || '#' }}
              </el-checkbox>
            </el-col>
          </el-row>
          <el-row style="padding-top: 10px">
            <el-col>
              恢复默认列配置：<el-button link type="primary" @click="handleRestDefault">恢复默认</el-button>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </el-popover>
    </div>

    <!-- 表格 -->
    <pro-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="tablePagination"
      row-key="id"
      border
      :scroll="{ y: 540 }"
      @change="handleTableChange"
    >
      <template #rowIndex="{ index }">
        {{ dataSource[index]?.rowIndex === '合计' ? '合计' : index + 1 }}
      </template>
      <template #action="{ record }">
        <a v-if="record.id" style="color: #409eff; cursor: pointer" @click="showAccountInOutList(record)">流水</a>
      </template>
    </pro-table>

    <!-- 账户流水子对话框 -->
    <account-in-out-list ref="accountInOutListRef" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Setting } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import AccountInOutList from './components/AccountInOutList.vue'
import { useList, type ListColumn } from '@/composables/useList'
import { getAction } from '@/api/http'

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '#', dataIndex: 'rowIndex', width: 60, align: 'center', customRender: 'rowIndex' },
  { title: '账户流水', dataIndex: 'action', align: 'center', width: 120, customRender: 'action' },
  { title: '名称', dataIndex: 'name', width: 150 },
  { title: '编号', dataIndex: 'serialNo', width: 150 },
  { title: '期初金额', dataIndex: 'initialAmount', sorter: true, width: 100 },
  { title: '本月发生额', dataIndex: 'thisMonthAmount', sorter: true, width: 100 },
  { title: '当前余额', dataIndex: 'currentAmount', sorter: true, width: 100 },
]

const defDataIndex = [
  'rowIndex', 'action', 'name', 'serialNo', 'initialAmount', 'thisMonthAmount', 'currentAmount',
]

// ==================== useList ====================
const {
  loading,
  dataSource,
  columns,
  settingDataIndex,
  queryParam,
  ipagination,
  handleTableChange,
  onColChange,
  handleRestDefault,
  handleExportXlsPost,
  tableAddTotalRow,
} = useList({
  url: { list: '/account/listWithBalance' },
  defColumns,
  defDataIndex,
  queryParam: {
    name: '',
    serialNo: '',
  },
  pageName: 'accountReport',
  pageSize: 11,
  urlPath: '/report/account',
  disableCreatedLoad: true,
})

// ==================== 汇总 ====================
const allMonthAmount = ref('')
const allCurrentAmount = ref('')

// ==================== 自定义加载 ====================
async function customLoadData(arg?: number) {
  if (arg === 1) {
    ipagination.current = 1
  }
  const params: Record<string, any> = { ...queryParam }
  params.field = columns.value.map((c) => c.dataIndex).filter(Boolean).join(',')
  params.currentPage = ipagination.current
  params.pageSize = ipagination.pageSize - 1

  loading.value = true
  try {
    const res = await getAction('/account/listWithBalance', params)
    if (res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
      tableAddTotalRow(columns.value, dataSource.value)
    } else if (res.code === 510) {
      ElMessage.warning(res.data)
    } else {
      ElMessage.warning(res.data?.message || '数据加载失败')
    }
  } catch (err) {
    console.error('[AccountReport] loadData error:', err)
  } finally {
    loading.value = false
  }
}

async function getAccountStatistics() {
  try {
    const res = await getAction('/account/getStatistics', { ...queryParam })
    if (res && res.code === 200 && res.data) {
      allMonthAmount.value = res.data.allMonthAmount ?? ''
      allCurrentAmount.value = res.data.allCurrentAmount ?? ''
    }
  } catch (err) {
    console.error('[AccountReport] getStatistics error:', err)
  }
}

// ==================== 搜索 ====================
function handleSearchQuery() {
  customLoadData(1)
  getAccountStatistics()
}

// ==================== 分页 ====================
const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
  pageSizeOptions: [11, 21, 31, 101, 201],
}))

// ==================== 账户流水 ====================
const accountInOutListRef = ref<InstanceType<typeof AccountInOutList> | null>(null)

function showAccountInOutList(record: any) {
  if (accountInOutListRef.value) {
    accountInOutListRef.value.show(record.id, record.initialAmount, record.name)
  }
}

// ==================== 导出 ====================
function exportExcel() {
  const list: any[] = []
  const head = '名称,编号,期初金额,本月发生额,当前余额'
  for (const ds of dataSource.value) {
    list.push([ds.name, ds.serialNo, ds.initialAmount, ds.thisMonthAmount, ds.currentAmount])
  }
  const tip = '账户统计查询'
  handleExportXlsPost('账户统计', '账户统计', head, tip, list)
}

// ==================== 生命周期 ====================
onMounted(() => {
  customLoadData(1)
  getAccountStatistics()
})
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 16px;
}
.table-operator {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}
</style>
