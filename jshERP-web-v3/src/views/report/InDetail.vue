<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="handleSearchQuery">
        <el-row :gutter="16">
          <el-col :md="6" :sm="24">
            <el-form-item label="商品信息">
              <el-input v-model="queryParam.materialParam" placeholder="条码、名称、助记码、规格、型号" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="单据日期">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="~"
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
              <el-button type="primary" @click="handleSearchQuery">查询</el-button>
              <el-button @click="exportExcel" :icon="Download">导出</el-button>
              <el-button link type="primary" @click="handleToggleSearch">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <el-icon><ArrowUp v-if="toggleSearchStatus" /><ArrowDown v-else /></el-icon>
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item>
              <span>总数量：{{ operNumberTotalStr }}，总金额：{{ allPriceTotalStr }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="toggleSearchStatus" :gutter="16">
          <el-col :md="6" :sm="24">
            <el-form-item label="单据编号">
              <el-input v-model="queryParam.number" placeholder="请输入单据编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="往来单位">
              <el-select
                v-model="queryParam.organId"
                placeholder="请选择往来单位"
                filterable
                remote
                clearable
                :remote-method="handleSearchOrgan"
                @visible-change="(v: boolean) => { if (v && organList.length === 0) initOrgan() }"
              >
                <el-option v-for="item in organList" :key="item.id" :label="item.supplier" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="仓库">
              <el-select v-model="queryParam.depotId" placeholder="请选择仓库" filterable clearable>
                <el-option v-for="item in depotList" :key="item.id" :label="item.depotName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="操作员">
              <el-select v-model="queryParam.creator" placeholder="请选择操作员" filterable clearable>
                <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="orgaTree.length" :md="6" :sm="24">
            <el-form-item label="机构">
              <el-tree-select
                v-model="queryParam.organizationId"
                :data="orgaTree"
                :props="{ label: 'title', value: 'key', children: 'children' }"
                placeholder="请选择机构"
                clearable
                check-strictly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="商品类别">
              <el-tree-select
                v-model="queryParam.categoryId"
                :data="categoryTree"
                :props="{ label: 'title', value: 'key', children: 'children' }"
                placeholder="请选择商品类别"
                clearable
                check-strictly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="备注">
              <el-input v-model="queryParam.remark" placeholder="请输入备注" clearable />
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
      <template #numberCustomRender="{ record }">
        <a style="color: #409eff; cursor: pointer" @click="myHandleDetail(record)">{{ record.number }}</a>
      </template>
    </pro-table>

    <!-- 单据详情弹窗 -->
    <bill-detail ref="modalDetailRef" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Setting, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import ProTable from '@/components/table/ProTable.vue'
import BillDetail from '@/views/bill/components/BillDetail.vue'
import { useList, type ListColumn } from '@/composables/useList'
import { getAction } from '@/api/http'
import { findBySelectOrgan, getUserList, getAllOrganizationTreeByUser } from '@/api/system'
import { queryMaterialCategoryTreeList } from '@/api/material'

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '#', dataIndex: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
  { title: '单据编号', dataIndex: 'number', width: 100, customRender: 'numberCustomRender' },
  { title: '条码', dataIndex: 'barCode', sorter: true, width: 80 },
  { title: '名称', dataIndex: 'mname', width: 120, ellipsis: true },
  { title: '规格', dataIndex: 'standard', width: 60, ellipsis: true },
  { title: '型号', dataIndex: 'model', width: 60, ellipsis: true },
  { title: '颜色', dataIndex: 'color', width: 40, ellipsis: true },
  { title: '品牌', dataIndex: 'brand', width: 60, ellipsis: true },
  { title: '制造商', dataIndex: 'mfrs', width: 60, ellipsis: true },
  { title: '单位', dataIndex: 'mUnit', width: 50, ellipsis: true },
  { title: '多属性', dataIndex: 'sku', width: 100, ellipsis: true },
  { title: '数量', dataIndex: 'operNumber', sorter: true, width: 60 },
  { title: '单价', dataIndex: 'unitPrice', sorter: true, width: 60 },
  { title: '金额', dataIndex: 'allPrice', sorter: true, width: 60 },
  { title: '税率(%)', dataIndex: 'taxRate', width: 60 },
  { title: '税额', dataIndex: 'taxMoney', sorter: true, width: 60 },
  { title: '往来单位', dataIndex: 'sname', width: 80, ellipsis: true },
  { title: '仓库', dataIndex: 'dname', width: 80, ellipsis: true },
  { title: '入库日期', dataIndex: 'operTime', width: 70 },
  { title: '备注', dataIndex: 'newRemark', width: 100, ellipsis: true },
]

const defDataIndex = [
  'rowIndex', 'number', 'barCode', 'mname', 'standard', 'model', 'mUnit',
  'operNumber', 'unitPrice', 'allPrice', 'taxRate', 'taxMoney', 'sname', 'dname', 'operTime', 'newRemark',
]

// ==================== useList ====================
const {
  loading,
  dataSource,
  columns,
  settingDataIndex,
  queryParam,
  ipagination,
  toggleSearchStatus,
  loadData,
  handleToggleSearch,
  handleTableChange,
  onColChange,
  handleRestDefault,
  handleExportXlsPost,
  tableAddTotalRow,
} = useList({
  url: { list: '/depotHead/findInOutDetail' },
  defColumns,
  defDataIndex,
  queryParam: {
    organId: undefined,
    number: '',
    materialParam: '',
    depotId: undefined,
    beginTime: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
    endTime: dayjs().format('YYYY-MM-DD'),
    type: '入库',
    creator: undefined,
    organizationId: undefined,
    categoryId: undefined,
    remark: '',
  },
  pageName: 'inDetail',
  pageSize: 11,
  urlPath: '/report/in_detail',
  disableCreatedLoad: true,
})

// ==================== 汇总 ====================
const operNumberTotalStr = ref('0')
const allPriceTotalStr = ref('0')

// ==================== 日期 ====================
const dateRange = ref<[string, string]>([
  dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD'),
])

function onDateChange(val: [string, string] | null) {
  if (val) {
    queryParam.beginTime = val[0]
    queryParam.endTime = val[1]
  } else {
    queryParam.beginTime = ''
    queryParam.endTime = ''
  }
}

// ==================== 下拉数据 ====================
const organList = ref<any[]>([])
const depotList = ref<any[]>([])
const userList = ref<any[]>([])
const orgaTree = ref<any[]>([])
const categoryTree = ref<any[]>([])
let searchOrganTimer: ReturnType<typeof setTimeout> | null = null

function initOrgan() {
  findBySelectOrgan({ limit: 1 }).then((res: any) => {
    if (res) organList.value = res
  })
}

function handleSearchOrgan(value: string) {
  if (searchOrganTimer) clearTimeout(searchOrganTimer)
  searchOrganTimer = setTimeout(() => {
    findBySelectOrgan({ key: value, limit: 1 }).then((res: any) => {
      if (res) organList.value = res
    })
  }, 500)
}

function getDepotData() {
  getAction('/depot/findDepotByCurrentUser').then((res: any) => {
    if (res.code === 200) {
      depotList.value = res.data
    }
  })
}

function initUser() {
  getUserList({}).then((res: any) => {
    if (res) userList.value = res
  })
}

function loadAllOrgaData() {
  getAllOrganizationTreeByUser({}).then((res: any) => {
    if (res) orgaTree.value = res
  })
}

function loadCategoryTreeData() {
  queryMaterialCategoryTreeList({ id: '' }).then((res: any) => {
    if (res) categoryTree.value = [...res]
  })
}

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
    const res = await getAction('/depotHead/findInOutDetail', params)
    if (res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
      operNumberTotalStr.value = (res.data.operNumberTotal ?? 0).toFixed(2)
      allPriceTotalStr.value = (res.data.allPriceTotal ?? 0).toFixed(2)
      tableAddTotalRow(columns.value, dataSource.value)
    } else if (res.code === 510) {
      ElMessage.warning(res.data)
    } else {
      ElMessage.warning(res.data?.message || '数据加载失败')
    }
  } catch (err) {
    console.error('[InDetail] loadData error:', err)
  } finally {
    loading.value = false
  }
}

// ==================== 搜索 ====================
function handleSearchQuery() {
  if (!queryParam.beginTime || !queryParam.endTime) {
    ElMessage.warning('请选择单据日期！')
    return
  }
  customLoadData(1)
}

// ==================== 分页 ====================
const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
  pageSizeOptions: [11, 21, 31, 101, 201, 301, 1001, 2001, 3001],
}))

// ==================== 单据详情 ====================
const modalDetailRef = ref<InstanceType<typeof BillDetail> | null>(null)

function myHandleDetail(record: any) {
  if (modalDetailRef.value) {
    modalDetailRef.value.show({ number: record.number }, record.newType)
  }
}

// ==================== 导出 ====================
function exportExcel() {
  const list: any[] = []
  const head = '单据编号,条码,名称,规格,型号,颜色,品牌,制造商,单位,多属性,数量,单价,金额,税率(%),税额,往来单位,仓库,入库日期,备注'
  for (const ds of dataSource.value) {
    list.push([
      ds.number, ds.barCode, ds.mname, ds.standard, ds.model, ds.color, ds.brand, ds.mfrs,
      ds.mUnit, ds.sku, ds.operNumber, ds.unitPrice, ds.allPrice, ds.taxRate, ds.taxMoney,
      ds.sname, ds.dname, ds.operTime, ds.newRemark,
    ])
  }
  const tip = '单据日期：' + queryParam.beginTime + '~' + queryParam.endTime
  handleExportXlsPost('入库明细', '入库明细', head, tip, list)
}

// ==================== 生命周期 ====================
onMounted(() => {
  getDepotData()
  initOrgan()
  initUser()
  loadAllOrgaData()
  loadCategoryTreeData()
  customLoadData(1)
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
