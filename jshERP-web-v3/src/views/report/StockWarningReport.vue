<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery" class="search-form">
        <el-row :gutter="24">
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
                  v-for="depot in depotList"
                  :key="depot.id"
                  :label="depot.depotName"
                  :value="depot.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
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
            <el-form-item label="商品类别">
              <CategorySelect v-model="queryParam.categoryId" placeholder="请选择商品类别" />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item>
              <el-button type="primary" @click="searchQuery">查询</el-button>
              <el-button @click="exportExcel" :icon="Download">导出</el-button>
            </el-form-item>
          </el-col>
        </el-row>
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
    </ProTable>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Setting } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import CategorySelect from '@/components/form/CategorySelect.vue'
import { useList } from '@/composables/useList'
import type { ListColumn } from '@/composables/useList'
import { getAction } from '@/api/http'
import { getMpListShort } from '@/utils/index'
import { getStore } from '@/utils/storage'

defineOptions({ name: 'StockWarningReport' })

// ==================== 状态 ====================
const tableRef = ref()
const depotList = ref<any[]>([])

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '#', dataIndex: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
  { title: '仓库', dataIndex: 'depotName', width: 100, ellipsis: true },
  { title: '条码', dataIndex: 'barCode', width: 100, sorter: true },
  { title: '名称', dataIndex: 'mname', width: 100, ellipsis: true },
  { title: '规格', dataIndex: 'mstandard', width: 80, ellipsis: true },
  { title: '型号', dataIndex: 'mmodel', width: 80, ellipsis: true },
  { title: '颜色', dataIndex: 'mcolor', width: 50, ellipsis: true },
  { title: '品牌', dataIndex: 'brand', width: 80, ellipsis: true },
  { title: '制造商', dataIndex: 'mmfrs', width: 80, ellipsis: true },
  { title: '扩展1', dataIndex: 'motherField1', width: 80, ellipsis: true },
  { title: '扩展2', dataIndex: 'motherField2', width: 80, ellipsis: true },
  { title: '扩展3', dataIndex: 'motherField3', width: 80, ellipsis: true },
  { title: '单位', dataIndex: 'materialUnit', width: 60, ellipsis: true },
  { title: '库存', dataIndex: 'currentNumber', width: 80, sorter: true },
  { title: '最低安全库存', dataIndex: 'lowSafeStock', width: 100, sorter: true },
  { title: '最高安全库存', dataIndex: 'highSafeStock', width: 100, sorter: true },
  { title: '建议入库量', dataIndex: 'lowCritical', width: 80, sorter: true },
  { title: '建议出库量', dataIndex: 'highCritical', width: 80, sorter: true },
]

const defDataIndex = [
  'rowIndex', 'depotName', 'barCode', 'mname', 'mstandard', 'mmodel',
  'materialUnit', 'currentNumber', 'lowSafeStock', 'highSafeStock',
  'lowCritical', 'highCritical',
]

// ==================== useList ====================
const {
  loading,
  dataSource,
  columns,
  queryParam,
  ipagination,
  settingDataIndex,
  handleTableChange,
  handleExportXlsPost,
  handleChangeOtherField,
  initColumnsSetting,
  onColChange,
  handleRestDefault,
  tableAddTotalRow,
} = useList({
  url: { list: '/depotItem/findStockWarningCount' },
  defColumns,
  defDataIndex,
  pageName: 'stockWarningReport',
  urlPath: '/report/stock_warning',
  pageSize: 11,
  disableCreatedLoad: true,
  queryParam: {
    materialParam: '',
    depotId: undefined,
    categoryId: undefined,
    mpList: getMpListShort(getStore('materialPropertyList') || []),
  },
})

// ==================== 自定义数据加载 ====================
async function loadReportData(arg?: number) {
  if (arg === 1) {
    ipagination.current = 1
  }
  loading.value = true
  try {
    const params: Record<string, any> = {
      ...queryParam,
      currentPage: ipagination.current,
      pageSize: ipagination.pageSize - 1,
    }
    params.field = getQueryField()

    const res = await getAction('/depotItem/findStockWarningCount', params)
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
    console.error('[StockWarningReport] loadData error:', err)
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
  loadReportData(1)
}

// ==================== 仓库数据 ====================
function getDepotData() {
  getAction('/depot/findDepotByCurrentUser').then((res: any) => {
    if (res.code === 200) {
      depotList.value = res.data || []
    } else {
      ElMessage.info(res.data)
    }
  })
}

// ==================== 动态替换扩展字段 ====================
function updateOtherFieldTitles() {
  const mpList = getStore('materialPropertyList') as any[] | null
  if (!mpList) return
  const mpStr = getMpListShort(mpList)
  if (!mpStr) return
  const mpArr = mpStr.split(',')
  if (mpArr.length !== 3) return

  for (const col of defColumns) {
    if (col.dataIndex === 'motherField1') col.title = mpArr[0]
    if (col.dataIndex === 'motherField2') col.title = mpArr[1]
    if (col.dataIndex === 'motherField3') col.title = mpArr[2]
  }
}

// ==================== 导出 ====================
function exportExcel() {
  const list: any[][] = []
  const mpStr = getMpListShort(getStore('materialPropertyList') || [])
  const head = '仓库,条码,名称,规格,型号,颜色,品牌,制造商,' + mpStr + ',单位,库存,最低安全库存,最高安全库存,建议入库量,建议出库量'
  for (let i = 0; i < dataSource.value.length; i++) {
    const ds = dataSource.value[i]
    list.push([
      ds.depotName, ds.barCode, ds.mname, ds.mstandard, ds.mmodel, ds.mcolor,
      ds.brand, ds.mmfrs, ds.motherField1, ds.motherField2, ds.motherField3,
      ds.materialUnit, ds.currentNumber, ds.lowSafeStock, ds.highSafeStock,
      ds.lowCritical, ds.highCritical,
    ])
  }
  handleExportXlsPost('库存预警', '库存预警', head, '库存预警查询', list)
}

// ==================== 初始化 ====================
onMounted(() => {
  getDepotData()
  initColumnsSetting()
  updateOtherFieldTitles()
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
.table-operator {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
