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
              <span style="font-weight: bold">
                总数量：{{ operNumberTotalStr }}，总金额：{{ allPriceTotalStr }}
              </span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 展开的高级搜索 -->
        <template v-if="toggleSearchStatus">
          <el-row :gutter="24">
            <el-col :md="6" :sm="24">
              <el-form-item label="单据编号">
                <el-input
                  v-model="queryParam.number"
                  placeholder="请输入单据编号"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="调出仓库">
                <el-select
                  v-model="queryParam.depotIdF"
                  placeholder="请选择仓库"
                  filterable
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="depot in depotList"
                    :key="depot.id"
                    :label="depot.depotName"
                    :value="depot.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="调入仓库">
                <el-select
                  v-model="queryParam.depotId"
                  placeholder="请选择仓库"
                  filterable
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="depot in depotList"
                    :key="depot.id"
                    :label="depot.depotName"
                    :value="depot.id"
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
                <CategorySelect v-model="queryParam.categoryId" placeholder="请选择商品类别" />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="备注">
                <el-input
                  v-model="queryParam.remark"
                  placeholder="请输入备注"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator" style="margin-bottom: 10px">
      <!-- 列设置 -->
      <el-popover trigger="click" placement="right" :width="520">
        <template #reference>
          <el-button :icon="Setting">列设置</el-button>
        </template>
        <el-checkbox-group v-model="settingDataIndex" @change="onColChange">
          <el-row>
            <el-col v-for="item in defColumns" :key="item.dataIndex" :span="6">
              <el-checkbox
                :value="item.dataIndex"
                :disabled="item.dataIndex === 'rowIndex'"
              >
                <el-text truncated style="max-width: 100px">{{ item.title || '#' }}</el-text>
              </el-checkbox>
            </el-col>
          </el-row>
          <el-row style="padding-top: 10px">
            <el-col>
              恢复默认列配置：
              <el-button link type="primary" size="small" @click="handleRestDefault">恢复默认</el-button>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </el-popover>
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
      <!-- 序号列 -->
      <template #rowIndex="{ text, index }">
        {{ text !== '合计' ? index + 1 : text }}
      </template>

      <!-- 单据编号链接 -->
      <template #numberCustomRender="{ record }">
        <el-button link type="primary" size="small" @click="myHandleDetail(record)">
          {{ record.number }}
        </el-button>
      </template>
    </ProTable>

    <!-- 单据详情弹窗 -->
    <BillDetail ref="billDetailRef" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Setting, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import CategorySelect from '@/components/form/CategorySelect.vue'
import { useList } from '@/composables/useList'
import type { ListColumn } from '@/composables/useList'
import { getAction } from '@/api/http'
import { findBillDetailByNumber } from '@/api/bill'
import { getAllOrganizationTreeByUser } from '@/api/system'
import { getPrevMonthFormatDate } from '@/utils/date'
import dayjs from 'dayjs'

defineOptions({ name: 'AllocationDetail' })

// ==================== 子组件 ====================
const BillDetail = defineAsyncComponent(() =>
  import('../bill/components/BillDetail.vue')
)

// ==================== 状态 ====================
const tableRef = ref()
const billDetailRef = ref()
const depotList = ref<any[]>([])
const orgaTree = ref<any[]>([])
const operNumberTotalStr = ref('0')
const allPriceTotalStr = ref('0')

const defaultBeginTime = getPrevMonthFormatDate(3)
const defaultEndTime = dayjs().format('YYYY-MM-DD')
const dateRange = ref<[string, string]>([defaultBeginTime, defaultEndTime])

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '#', dataIndex: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
  { title: '单据编号', dataIndex: 'number', width: 100, customRender: 'numberCustomRender' },
  { title: '条码', dataIndex: 'barCode', width: 80, sorter: true },
  { title: '名称', dataIndex: 'mname', width: 120, ellipsis: true },
  { title: '规格', dataIndex: 'standard', width: 60, ellipsis: true },
  { title: '型号', dataIndex: 'model', width: 60, ellipsis: true },
  { title: '颜色', dataIndex: 'color', width: 40, ellipsis: true },
  { title: '品牌', dataIndex: 'brand', width: 60, ellipsis: true },
  { title: '制造商', dataIndex: 'mfrs', width: 60, ellipsis: true },
  { title: '单位', dataIndex: 'mUnit', width: 60, ellipsis: true },
  { title: '数量', dataIndex: 'operNumber', width: 60, sorter: true },
  { title: '单价', dataIndex: 'unitPrice', width: 60, sorter: true },
  { title: '金额', dataIndex: 'allPrice', width: 60, sorter: true },
  { title: '调出仓库', dataIndex: 'dname', width: 80 },
  { title: '调入仓库', dataIndex: 'sname', width: 80 },
  { title: '调拨日期', dataIndex: 'operTime', width: 80 },
  { title: '备注', dataIndex: 'newRemark', width: 100, ellipsis: true },
]

const defDataIndex = [
  'rowIndex', 'number', 'barCode', 'mname', 'standard', 'model',
  'mUnit', 'operNumber', 'unitPrice', 'allPrice', 'dname', 'sname',
  'operTime', 'newRemark',
]

// ==================== useList ====================
const {
  loading,
  dataSource,
  columns,
  queryParam,
  ipagination,
  toggleSearchStatus,
  settingDataIndex,
  handleToggleSearch,
  handleTableChange,
  handleExportXlsPost,
  initColumnsSetting,
  onColChange,
  handleRestDefault,
  tableAddTotalRow,
} = useList({
  url: { list: '/depotHead/findAllocationDetail' },
  defColumns,
  defDataIndex,
  pageName: 'allocationDetail',
  urlPath: '/report/allocation_detail',
  pageSize: 11,
  disableCreatedLoad: true,
  queryParam: {
    materialParam: '',
    number: '',
    depotId: undefined,
    depotIdF: undefined,
    organizationId: undefined,
    categoryId: undefined,
    beginTime: defaultBeginTime,
    endTime: defaultEndTime,
    subType: '调拨',
    remark: '',
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
    params.field = getQueryField()

    const res = await getAction('/depotHead/findAllocationDetail', params)
    if (res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
      operNumberTotalStr.value = (res.data.operNumberTotal || 0).toFixed(2)
      allPriceTotalStr.value = (res.data.allPriceTotal || 0).toFixed(2)
      tableAddTotalRow(columns.value, dataSource.value)
    } else if (res.code === 510) {
      ElMessage.warning(res.data)
    } else {
      ElMessage.warning(res.data?.message || '数据加载失败')
    }
  } catch (err) {
    console.error('[AllocationDetail] loadData error:', err)
  } finally {
    loading.value = false
  }
}

/** 获取查询字段 */
function getQueryField(): string {
  let str = 'id,'
  columns.value.forEach((col) => {
    if (col.dataIndex) {
      str += ',' + col.dataIndex
    }
  })
  return str
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

// ==================== 仓库/机构数据 ====================
function getDepotData() {
  getAction('/depot/findDepotByCurrentUser').then((res: any) => {
    if (res.code === 200) {
      depotList.value = res.data || []
    } else {
      ElMessage.info(res.data)
    }
  })
}

function loadAllOrgaData() {
  getAllOrganizationTreeByUser().then((res: any) => {
    if (res) orgaTree.value = res
  })
}

// ==================== 单据详情 ====================
function myHandleDetail(record: any) {
  findBillDetailByNumber({ number: record.number }).then((res: any) => {
    if (res && res.code === 200) {
      billDetailRef.value?.show(res.data, record.newType)
    }
  })
}

// ==================== 导出 ====================
function exportExcel() {
  const list: any[][] = []
  const head = '单据编号,条码,名称,规格,型号,颜色,品牌,制造商,单位,数量,单价,金额,调出仓库,调入仓库,调拨日期,备注'
  for (let i = 0; i < dataSource.value.length; i++) {
    const ds = dataSource.value[i]
    list.push([
      ds.number, ds.barCode, ds.mname, ds.standard, ds.model, ds.color,
      ds.brand, ds.mfrs, ds.mUnit, ds.operNumber, ds.unitPrice, ds.allPrice,
      ds.dname, ds.sname, ds.operTime, ds.newRemark,
    ])
  }
  const tip = '单据日期：' + queryParam.beginTime + '~' + queryParam.endTime
  handleExportXlsPost('调拨明细', '调拨明细', head, tip, list)
}

// ==================== 初始化 ====================
onMounted(() => {
  getDepotData()
  loadAllOrgaData()
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
.table-operator {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
