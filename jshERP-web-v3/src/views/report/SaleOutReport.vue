<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery" class="search-form">
        <el-row :gutter="24">
          <el-col :md="6" :sm="24">
            <el-form-item label="商品信息">
              <el-input
                v-model="queryParam.materialParam"
                placeholder="请输入条码、名称、助记码、规格、型号等信息"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="单据日期">
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
              <span style="font-weight: bold">实际销售金额：{{ realityPriceTotal }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 展开的高级搜索 -->
        <template v-if="toggleSearchStatus">
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
              <el-form-item label="仓库">
                <el-select
                  v-model="queryParam.depotId"
                  placeholder="请选择仓库"
                  filterable
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in depotList"
                    :key="item.id"
                    :label="item.depotName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="orgaTree.length" :md="6" :sm="24">
              <el-form-item label="机构">
                <el-tree-select
                  v-model="queryParam.organizationId"
                  :data="orgaTree"
                  :props="{ label: 'title', children: 'children', value: 'key' }"
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
                  :props="{ label: 'title', children: 'children', value: 'key' }"
                  placeholder="请选择商品类别"
                  clearable
                  check-strictly
                  style="width: 100%"
                />
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
    </ProTable>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import { useList } from '@/composables/useList'
import type { ListColumn } from '@/composables/useList'
import { getAction } from '@/api/http'
import { getPrevMonthFormatDate } from '@/utils/date'
import { getMpListShort } from '@/utils/index'
import { getStore } from '@/utils/storage'
import dayjs from 'dayjs'

defineOptions({ name: 'SaleOutReport' })

// ==================== 状态 ====================
const tableRef = ref()
const cusList = ref<any[]>([])
const depotList = ref<any[]>([])
const orgaTree = ref<any[]>([])
const categoryTree = ref<any[]>([])
const realityPriceTotal = ref('')
const setTimeFlag = ref<ReturnType<typeof setTimeout> | null>(null)

const defaultBeginTime = getPrevMonthFormatDate(3)
const defaultEndTime = dayjs().format('YYYY-MM-DD')
const dateRange = ref<[string, string]>([defaultBeginTime, defaultEndTime])

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '#', dataIndex: 'rowIndex', width: 60, align: 'center', customRender: 'rowIndex' },
  { title: '条码', dataIndex: 'barCode', width: 160, sorter: true },
  { title: '名称', dataIndex: 'materialName', width: 160, ellipsis: true },
  { title: '规格', dataIndex: 'materialStandard', width: 80, ellipsis: true },
  { title: '型号', dataIndex: 'materialModel', width: 80, ellipsis: true },
  { title: '颜色', dataIndex: 'materialColor', width: 60, ellipsis: true },
  { title: '品牌', dataIndex: 'materialBrand', width: 80, ellipsis: true },
  { title: '制造商', dataIndex: 'materialMfrs', width: 80, ellipsis: true },
  { title: '扩展1', dataIndex: 'otherField1', width: 80, ellipsis: true },
  { title: '扩展2', dataIndex: 'otherField2', width: 80, ellipsis: true },
  { title: '扩展3', dataIndex: 'otherField3', width: 80, ellipsis: true },
  { title: '单位', dataIndex: 'materialUnit', width: 80, ellipsis: true },
  { title: '销售数量', dataIndex: 'outSum', width: 80, sorter: true },
  { title: '销售金额', dataIndex: 'outSumPrice', width: 80, sorter: true },
  { title: '退货数量', dataIndex: 'inSum', width: 80, sorter: true },
  { title: '退货金额', dataIndex: 'inSumPrice', width: 80, sorter: true },
  { title: '实际销售金额', dataIndex: 'outInSumPrice', width: 100, sorter: true },
]

const defDataIndex = [
  'rowIndex', 'barCode', 'materialName', 'materialStandard', 'materialModel',
  'materialUnit', 'outSum', 'outSumPrice', 'inSum', 'inSumPrice', 'outInSumPrice',
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
  handleChangeOtherField,
  initColumnsSetting,
} = useList({
  url: { list: '/depotItem/saleOut' },
  defColumns,
  defDataIndex,
  pageName: 'saleOutReport',
  urlPath: '/report/sale_out',
  pageSize: 11,
  disableCreatedLoad: true,
  queryParam: {
    materialParam: '',
    beginTime: defaultBeginTime,
    endTime: defaultEndTime,
    organId: undefined,
    depotId: undefined,
    organizationId: undefined,
    categoryId: undefined,
    mpList: getMpListShort(getStore('materialPropertyList') || []),
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
    const res = await getAction('/depotItem/saleOut', params)
    if (res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
      realityPriceTotal.value = res.data.realityPriceTotal || ''
    } else if (res.code === 510) {
      ElMessage.warning(res.data)
    } else {
      ElMessage.warning(res.data?.message || '数据加载失败')
    }
  } catch (err) {
    console.error('[SaleOutReport] loadData error:', err)
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

// ==================== 客户/仓库/机构/类别 ====================
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

function getDepotData() {
  getAction('/depot/findDepotByCurrentUser').then((res: any) => {
    if (res.code === 200) {
      depotList.value = res.data || []
    }
  })
}

function loadAllOrgaData() {
  getAction('/organization/getOrganizationTree').then((res: any) => {
    if (res) orgaTree.value = res
  })
}

function loadCategoryTreeData() {
  getAction('/materialCategory/getMaterialCategoryTree', { id: '' }).then((res: any) => {
    if (res) categoryTree.value = res
  })
}

// ==================== 导出 ====================
function exportExcel() {
  const list: any[][] = []
  const mpStr = getMpListShort(getStore('materialPropertyList') || [])
  const head = '条码,名称,规格,型号,颜色,品牌,制造商,' + mpStr + ',单位,销售数量,销售金额,退货数量,退货金额,实际销售金额'
  for (let i = 0; i < dataSource.value.length; i++) {
    const ds = dataSource.value[i]
    list.push([
      ds.barCode, ds.materialName, ds.materialStandard, ds.materialModel,
      ds.materialColor, ds.materialBrand, ds.materialMfrs,
      ds.otherField1, ds.otherField2, ds.otherField3,
      ds.materialUnit, ds.outSum, ds.outSumPrice, ds.inSum, ds.inSumPrice, ds.outInSumPrice,
    ])
  }
  const tip = '单据日期：' + queryParam.beginTime + '~' + queryParam.endTime
  handleExportXlsPost('销售统计', '销售统计', head, tip, list)
}

// ==================== 初始化 ====================
onMounted(() => {
  initCustomer()
  getDepotData()
  loadAllOrgaData()
  loadCategoryTreeData()
  initColumnsSetting()
  handleChangeOtherField()
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
