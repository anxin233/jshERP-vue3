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
            <el-form-item label="库存周期">
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
                本期总结存：{{ totalStockStr }}，总结存金额：{{ totalCountMoneyStr }}
              </span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 展开的高级搜索 -->
        <template v-if="toggleSearchStatus">
          <el-row :gutter="24">
            <el-col :md="6" :sm="24">
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
              <el-form-item label="类别">
                <CategorySelect v-model="queryParam.categoryId" placeholder="请选择类别" />
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
        <el-button
          v-if="record.id"
          link
          type="primary"
          size="small"
          @click="showMaterialDepotStockList(record)"
        >
          分布
        </el-button>
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

    <!-- 分布弹窗 (带时间) -->
    <MaterialDepotStockListWithTime ref="materialDepotStockListWithTimeRef" @ok="modalFormOk" />
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
import { getPrevMonthFormatDate } from '@/utils/date'
import dayjs from 'dayjs'

defineOptions({ name: 'InOutStockReport' })

// ==================== 子组件 ====================
const MaterialDepotStockListWithTime = defineAsyncComponent(() =>
  import('./components/MaterialDepotStockListWithTime.vue')
)

// ==================== 状态 ====================
const tableRef = ref()
const materialDepotStockListWithTimeRef = ref()
const depotList = ref<any[]>([])
const depotSelected = ref<number[]>([])
const totalStockStr = ref('0')
const totalCountMoneyStr = ref('0')

const defaultBeginTime = getPrevMonthFormatDate(1)
const defaultEndTime = dayjs().format('YYYY-MM-DD')
const dateRange = ref<[string, string]>([defaultBeginTime, defaultEndTime])

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '#', dataIndex: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
  { title: '库存详情', dataIndex: 'action', align: 'center', width: 60, customRender: 'action' },
  { title: '图片', dataIndex: 'pic', width: 45, customRender: 'customPic' },
  { title: '条码', dataIndex: 'barCode', width: 100, sorter: true },
  { title: '名称', dataIndex: 'materialName', width: 120, ellipsis: true },
  { title: '规格', dataIndex: 'materialStandard', width: 80, ellipsis: true },
  { title: '型号', dataIndex: 'materialModel', width: 80, ellipsis: true },
  { title: '颜色', dataIndex: 'materialColor', width: 50, ellipsis: true },
  { title: '品牌', dataIndex: 'materialBrand', width: 80, ellipsis: true },
  { title: '制造商', dataIndex: 'materialMfrs', width: 80, ellipsis: true },
  { title: '扩展1', dataIndex: 'otherField1', width: 50, ellipsis: true },
  { title: '扩展2', dataIndex: 'otherField2', width: 50, ellipsis: true },
  { title: '扩展3', dataIndex: 'otherField3', width: 50, ellipsis: true },
  { title: '单位', dataIndex: 'unitName', width: 60, ellipsis: true },
  { title: '成本价', dataIndex: 'unitPrice', width: 60, sorter: true },
  { title: '上期结存数量', dataIndex: 'prevSum', width: 80, sorter: true },
  { title: '入库数量', dataIndex: 'inSum', width: 60, sorter: true },
  { title: '出库数量', dataIndex: 'outSum', width: 60, sorter: true },
  { title: '本期结存数量', dataIndex: 'thisSum', width: 80, sorter: true, customRender: 'customRenderStock' },
  { title: '结存金额', dataIndex: 'thisAllPrice', width: 60, sorter: true },
]

const defDataIndex = [
  'rowIndex', 'action', 'barCode', 'materialName', 'materialStandard', 'materialModel',
  'unitName', 'unitPrice', 'prevSum', 'inSum', 'outSum', 'thisSum', 'thisAllPrice',
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
  handleChangeOtherField,
  initColumnsSetting,
  onColChange,
  handleRestDefault,
  tableAddTotalRow,
  modalFormOk,
} = useList({
  url: { list: '/depotItem/getInOutStock' },
  defColumns,
  defDataIndex,
  pageName: 'inOutStockReport',
  urlPath: '/report/in_out_stock',
  pageSize: 11,
  disableCreatedLoad: true,
  queryParam: {
    materialParam: '',
    beginTime: defaultBeginTime,
    endTime: defaultEndTime,
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
    ElMessage.warning('请选择库存周期！')
    return
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
    params.field = getQueryField()

    const res = await getAction('/depotItem/getInOutStock', params)
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
    console.error('[InOutStockReport] loadData error:', err)
  } finally {
    loading.value = false
  }
}

/** 获取总结存和总结存金额 */
async function getTotalCountMoney() {
  try {
    const params: Record<string, any> = { ...queryParam }
    if (depotSelected.value && depotSelected.value.length > 0) {
      params.depotIds = depotSelected.value.join(',')
    }
    const res = await getAction('/depotItem/getInOutStockCountMoney', params)
    if (res && res.code === 200) {
      totalStockStr.value = (res.data.totalStock || 0).toFixed(2)
      totalCountMoneyStr.value = (res.data.totalCount || 0).toFixed(2)
    }
  } catch (err) {
    console.error('[InOutStockReport] getTotalCountMoney error:', err)
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
    ElMessage.warning('请选择库存周期！')
    return
  }
  loadReportData(1)
  getTotalCountMoney()
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
function showMaterialDepotStockList(record: any) {
  const depotIds = depotSelected.value.length > 0 ? depotSelected.value.join(',') : ''
  materialDepotStockListWithTimeRef.value?.show(
    record,
    depotIds,
    queryParam.beginTime,
    queryParam.endTime,
  )
}

// ==================== 导出 ====================
function exportExcel() {
  const list: any[][] = []
  const mpStr = getMpListShort(getStore('materialPropertyList') || [])
  const head = '条码,名称,规格,型号,颜色,品牌,制造商,' + mpStr + ',单位,成本价,上期结存数量,入库数量,出库数量,本期结存数量,结存金额'
  for (let i = 0; i < dataSource.value.length; i++) {
    const ds = dataSource.value[i]
    list.push([
      ds.barCode, ds.materialName, ds.materialStandard, ds.materialModel,
      ds.materialColor, ds.materialBrand, ds.materialMfrs,
      ds.otherField1, ds.otherField2, ds.otherField3,
      ds.unitName, ds.unitPrice, ds.prevSum, ds.inSum, ds.outSum,
      ds.thisSum, ds.thisAllPrice,
    ])
  }
  const tip = '库存周期：' + queryParam.beginTime + '~' + queryParam.endTime
  handleExportXlsPost('进销存统计', '进销存统计', head, tip, list)
}

// ==================== 初始化 ====================
onMounted(() => {
  getDepotData()
  initColumnsSetting()
  handleChangeOtherField()
  loadReportData(1)
  getTotalCountMoney()
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
