<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery" class="search-form">
        <el-row :gutter="24">
          <el-col :md="5" :sm="24">
            <el-form-item label="仓库">
              <el-select
                v-model="depotSelected"
                placeholder="请选择仓库"
                multiple
                :max-collapse-tags="1"
                collapse-tags
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
            <el-form-item>
              <el-button type="primary" @click="searchQuery">查询</el-button>
              <el-button @click="exportExcel" :icon="Download">导出</el-button>
              <el-button link type="primary" @click="handleToggleSearch">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <el-icon><ArrowUp v-if="toggleSearchStatus" /><ArrowDown v-else /></el-icon>
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :md="7" :sm="24">
            <el-form-item>
              <span style="font-weight: bold">
                总库存：{{ currentStock }}，总库存金额：{{ currentStockPrice }}，总重量：{{ currentWeight }}
              </span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 展开的高级搜索 -->
        <template v-if="toggleSearchStatus">
          <el-row :gutter="24">
            <el-col :md="5" :sm="24">
              <el-form-item label="类别">
                <CategorySelect v-model="queryParam.categoryId" placeholder="请选择类别" />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="仓位货架">
                <el-input
                  v-model="queryParam.position"
                  placeholder="请输入仓位货架查询"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="零库存">
                <el-select v-model="queryParam.zeroStock" style="width: 100%">
                  <el-option label="隐藏" value="0" />
                  <el-option label="显示" value="1" />
                </el-select>
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

      <!-- 库存详情操作列 -->
      <template #action="{ record }">
        <template v-if="record.id">
          <el-button link type="primary" size="small" @click="showMaterialInOutList(record)">流水</el-button>
          <el-divider direction="vertical" />
          <el-button link type="primary" size="small" @click="showMaterialDepotStockList(record)">分布</el-button>
        </template>
      </template>

      <!-- 图片列 -->
      <template #customPic="{ record }">
        <el-popover v-if="record.imgName" placement="right" trigger="click" :width="520">
          <template #reference>
            <div class="item-info">
              <img :src="getImgUrl(record.imgName, record.imgSmall)" class="item-img" title="查看大图" />
            </div>
          </template>
          <img :src="getImgUrl(record.imgName, record.imgLarge)" style="width: 500px" />
        </el-popover>
      </template>

      <!-- 库存列 tooltip -->
      <template #customRenderStock="{ text, record }">
        <el-tooltip v-if="record.bigUnitStock" :content="record.bigUnitStock" placement="top">
          <span>{{ text }}</span>
        </el-tooltip>
        <span v-else>{{ text }}</span>
      </template>
    </ProTable>

    <!-- 流水弹窗 -->
    <MaterialInOutList ref="materialInOutListRef" @ok="modalFormOk" />
    <!-- 分布弹窗 -->
    <MaterialDepotStockList ref="materialDepotStockListRef" @ok="modalFormOk" />
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
import { getAction, getFileAccessHttpUrl } from '@/api/http'
import { getMpListShort } from '@/utils/index'
import { getStore } from '@/utils/storage'

defineOptions({ name: 'MaterialStock' })

// ==================== 子组件 ====================
const MaterialInOutList = defineAsyncComponent(() =>
  import('./components/MaterialInOutList.vue')
)
const MaterialDepotStockList = defineAsyncComponent(() =>
  import('./components/MaterialDepotStockList.vue')
)

// ==================== 状态 ====================
const tableRef = ref()
const materialInOutListRef = ref()
const materialDepotStockListRef = ref()
const depotList = ref<any[]>([])
const depotSelected = ref<number[]>([])
const currentStock = ref('')
const currentStockPrice = ref('')
const currentWeight = ref('')

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '#', dataIndex: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
  { title: '库存详情', dataIndex: 'action', align: 'center', width: 100, customRender: 'action' },
  { title: '图片', dataIndex: 'pic', width: 50, customRender: 'customPic' },
  { title: '条码', dataIndex: 'mBarCode', width: 100, sorter: true },
  { title: '名称', dataIndex: 'name', width: 140, ellipsis: true },
  { title: '规格', dataIndex: 'standard', width: 100, ellipsis: true },
  { title: '型号', dataIndex: 'model', width: 100, ellipsis: true },
  { title: '颜色', dataIndex: 'color', width: 60, ellipsis: true },
  { title: '品牌', dataIndex: 'brand', width: 100, ellipsis: true },
  { title: '制造商', dataIndex: 'mfrs', width: 100, ellipsis: true },
  { title: '类别', dataIndex: 'categoryName', width: 60, ellipsis: true },
  { title: '仓位货架', dataIndex: 'position', width: 60, ellipsis: true },
  { title: '单位', dataIndex: 'unitName', width: 60, ellipsis: true },
  { title: '成本价', dataIndex: 'purchaseDecimal', width: 60, sorter: true },
  { title: '初始库存', dataIndex: 'initialStock', width: 60 },
  { title: '库存', dataIndex: 'currentStock', width: 60, sorter: true, customRender: 'customRenderStock' },
  { title: '库存金额', dataIndex: 'currentStockPrice', width: 80, sorter: true },
  { title: '重量', dataIndex: 'currentWeight', width: 60, sorter: true },
]

const defDataIndex = [
  'rowIndex', 'action', 'mBarCode', 'name', 'standard', 'model', 'color',
  'categoryName', 'position', 'unitName', 'purchaseDecimal', 'initialStock',
  'currentStock', 'currentStockPrice', 'currentWeight',
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
  modalFormOk,
} = useList({
  url: { list: '/material/getListWithStock' },
  defColumns,
  defDataIndex,
  pageName: 'materialStock',
  urlPath: '/report/material_stock',
  pageSize: 11,
  disableCreatedLoad: true,
  queryParam: {
    materialParam: '',
    categoryId: undefined,
    position: '',
    zeroStock: '0',
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
    // 仓库多选
    if (depotSelected.value && depotSelected.value.length > 0) {
      params.depotIds = depotSelected.value.join(',')
    }
    // 查询字段
    params.field = getQueryField()

    const res = await getAction('/material/getListWithStock', params)
    if (res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
      tableAddTotalRow(columns.value, dataSource.value)
      currentStock.value = (res.data.currentStock || 0).toFixed(2)
      currentStockPrice.value = (res.data.currentStockPrice || 0).toFixed(2)
      currentWeight.value = (res.data.currentWeight || 0).toFixed(2)
    } else if (res.code === 510) {
      ElMessage.warning(res.data)
    } else {
      ElMessage.warning(res.data?.message || '数据加载失败')
    }
  } catch (err) {
    console.error('[MaterialStock] loadData error:', err)
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

// ==================== 图片处理 ====================
function getImgUrl(imgName: string, type?: string): string {
  if (imgName && imgName.split(',')) {
    type = type ? type + '/' : ''
    return getFileAccessHttpUrl('systemConfig/static/' + type + imgName.split(',')[0])
  }
  return ''
}

// ==================== 子弹窗 ====================
function showMaterialInOutList(record: any) {
  const depotIds = depotSelected.value.length > 0 ? depotSelected.value.join(',') : ''
  materialInOutListRef.value?.show(record, depotIds)
}

function showMaterialDepotStockList(record: any) {
  const depotIds = depotSelected.value.length > 0 ? depotSelected.value.join(',') : ''
  materialDepotStockListRef.value?.show(record, depotIds)
}

// ==================== 导出 ====================
function exportExcel() {
  const list: any[][] = []
  const head = '条码,名称,规格,型号,颜色,品牌,制造商,类别,仓位货架,单位,成本价,初始库存,库存,库存金额,重量'
  for (let i = 0; i < dataSource.value.length; i++) {
    const ds = dataSource.value[i]
    list.push([
      ds.mBarCode, ds.name, ds.standard, ds.model, ds.color, ds.brand, ds.mfrs,
      ds.categoryName, ds.position, ds.unitName, ds.purchaseDecimal,
      ds.initialStock, ds.currentStock, ds.currentStockPrice, ds.currentWeight,
    ])
  }
  handleExportXlsPost('商品库存', '商品库存', head, '商品库存查询', list)
}

// ==================== 初始化 ====================
onMounted(() => {
  getDepotData()
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
.item-info {
  float: left;
  width: 38px;
  height: 38px;
  margin-left: 6px;
}
.item-img {
  cursor: pointer;
  position: static;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
