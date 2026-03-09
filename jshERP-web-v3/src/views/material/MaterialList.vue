<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="类别">
          <category-select v-model="queryParam.categoryId" placeholder="请选择类别" style="width: 200px" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="queryParam.materialParam" placeholder="请输入条码、名称、助记码等查询" clearable />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="queryParam.standard" placeholder="请输入规格查询" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchQuery">查询</el-button>
          <el-button @click="handleSearchReset">重置</el-button>
          <el-button link type="primary" @click="handleToggleSearch">
            {{ toggleSearchStatus ? '收起' : '展开' }}
            <el-icon><ArrowUp v-if="toggleSearchStatus" /><ArrowDown v-else /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
      <!-- 展开搜索 -->
      <el-form v-if="toggleSearchStatus" :inline="true">
        <el-form-item label="型号">
          <el-input v-model="queryParam.model" placeholder="请输入型号查询" clearable />
        </el-form-item>
        <el-form-item label="颜色">
          <el-input v-model="queryParam.color" placeholder="请输入颜色查询" clearable />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="queryParam.brand" placeholder="请输入品牌查询" clearable />
        </el-form-item>
        <el-form-item label="制造商">
          <el-input v-model="queryParam.mfrs" placeholder="请输入制造商查询" clearable />
        </el-form-item>
        <el-form-item :label="queryTitle.mp1">
          <el-input v-model="queryParam.otherField1" :placeholder="'请输入' + queryTitle.mp1 + '查询'" clearable />
        </el-form-item>
        <el-form-item :label="queryTitle.mp2">
          <el-input v-model="queryParam.otherField2" :placeholder="'请输入' + queryTitle.mp2 + '查询'" clearable />
        </el-form-item>
        <el-form-item :label="queryTitle.mp3">
          <el-input v-model="queryParam.otherField3" :placeholder="'请输入' + queryTitle.mp3 + '查询'" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParam.enabled" placeholder="请选择状态" clearable style="width: 140px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="序列号">
          <el-select v-model="queryParam.enableSerialNumber" placeholder="有无序列号" clearable style="width: 140px">
            <el-option label="有" value="1" />
            <el-option label="无" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="批号">
          <el-select v-model="queryParam.enableBatchNumber" placeholder="有无批号" clearable style="width: 140px">
            <el-option label="有" value="1" />
            <el-option label="无" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓位货架">
          <el-input v-model="queryParam.position" placeholder="请输入仓位货架查询" clearable />
        </el-form-item>
        <el-form-item label="基础重量">
          <el-input-number v-model="queryParam.weight" placeholder="请输入基础重量查询" :controls="false" style="width: 160px" />
        </el-form-item>
        <el-form-item label="保质期">
          <el-input-number v-model="queryParam.expiryNum" placeholder="请输入保质期查询" :controls="false" style="width: 160px" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="queryParam.remark" placeholder="请输入备注查询" clearable />
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <el-button v-if="btnEnableList.indexOf('1') > -1" type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="Delete" @click="batchDel">删除</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="CircleCheck" @click="batchSetStatus(true)">启用</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="CircleClose" @click="batchSetStatus(false)">禁用</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="Upload" @click="handleImportXls">导入</el-button>
      <el-button v-if="btnEnableList.indexOf('3') > -1" :icon="Download" @click="handleExportXls('商品信息')">导出</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="EditPen" @click="batchEdit">批量编辑</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" @click="batchSetMaterialCurrentStock">修正库存</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" @click="batchSetMaterialCurrentUnitPrice">修正成本</el-button>
      <!-- 列设置 -->
      <el-popover trigger="click" placement="right" :width="540">
        <template #reference>
          <el-button :icon="Setting">列设置</el-button>
        </template>
        <el-checkbox-group :model-value="settingDataIndex" @change="onColChange">
          <el-row :gutter="8">
            <el-col v-for="item in defColumns" :key="item.dataIndex" :span="8">
              <el-checkbox :value="item.dataIndex">
                <ellipsis :content="item.title" :length="10" />
              </el-checkbox>
            </el-col>
          </el-row>
          <el-row style="padding-top: 10px">
            <el-col>
              恢复默认列配置：<el-button link type="primary" size="small" @click="handleRestDefault">恢复默认</el-button>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </el-popover>
    </div>

    <!-- 表格 -->
    <pro-table
      ref="tableRef"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="tablePagination"
      :row-selection="true"
      :selected-row-keys="selectedRowKeys"
      row-key="id"
      :scroll="{ y: 540 }"
      border
      @change="handleTableChange"
      @select-change="onSelectChange"
    >
      <!-- 操作列 -->
      <template #action="{ record }">
        <el-button link type="primary" @click="handleEdit(record)">编辑</el-button>
        <el-button v-if="btnEnableList.indexOf('1') > -1" link type="primary" @click="handleCopyAdd(record)">复制</el-button>
      </template>
      <!-- 图片列 -->
      <template #customPic="{ record }">
        <el-popover v-if="record.imgName" trigger="click" placement="right" :width="520">
          <template #reference>
            <div class="item-info">
              <img :src="getImgUrl(record.imgName, record.imgSmall)" class="item-img" title="查看大图" />
            </div>
          </template>
          <img :src="getImgUrl(record.imgName, record.imgLarge)" style="width: 500px" />
        </el-popover>
      </template>
      <!-- 条码列 -->
      <template #customBarCode="{ record }">
        {{ record.mBarCode }}
      </template>
      <!-- 名称列 -->
      <template #customName="{ record }">
        {{ record.name }}
        <el-tag v-if="record.enableSerialNumber == 1" type="warning" size="small">序</el-tag>
        <el-tag v-if="record.enableBatchNumber == 1" type="warning" size="small">批</el-tag>
      </template>
      <!-- 初始库存列 -->
      <template #customRenderInitialStock="{ text, record }">
        <el-tooltip :content="record.bigUnitInitialStock" placement="top">
          <span>{{ text }}</span>
        </el-tooltip>
      </template>
      <!-- 库存列 -->
      <template #customRenderStock="{ text, record }">
        <el-tooltip :content="record.bigUnitStock" placement="top">
          <span>{{ text }}</span>
        </el-tooltip>
      </template>
      <!-- 状态列 -->
      <template #customRenderEnabled="{ text }">
        <el-tag v-if="text" type="success">启用</el-tag>
        <el-tag v-else type="warning">禁用</el-tag>
      </template>
      <!-- 单位列 -->
      <template #customUnit="{ text, record }">
        {{ getUnitDisplay(text, record) }}
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <material-modal ref="modalFormRef" @ok="modalFormOk" />
    <!-- <import-file-modal ref="modalImportFormRef" @ok="modalFormOk" /> -->
    <!-- <batch-set-info-modal ref="batchSetInfoModalFormRef" @ok="modalFormOk" /> -->
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Plus, Delete, CircleCheck, CircleClose, Upload, Download,
  ArrowUp, ArrowDown, Setting, EditPen
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProTable from '@/components/table/ProTable.vue'
import CategorySelect from '@/components/form/CategorySelect.vue'
import Ellipsis from '@/components/common/Ellipsis.vue'
import MaterialModal from './components/MaterialModal.vue'
import { queryMaterialCategoryTreeList } from '@/api/material'
import { postAction, getFileAccessHttpUrl } from '@/api/http'
import { getMpListShort } from '@/utils/index'
import { getStore } from '@/utils/storage'
import { useList, type ListColumn } from '@/composables/useList'

const modalFormRef = ref()
// const modalImportFormRef = ref()
// const batchSetInfoModalFormRef = ref()
const tableRef = ref()

const queryTitle = reactive({
  mp1: '扩展1',
  mp2: '扩展2',
  mp3: '扩展3',
})

// 默认列定义
const defColumns: ListColumn[] = [
  { title: '操作', dataIndex: 'action', align: 'center', width: 100, customRender: 'action' },
  { title: '图片', dataIndex: 'pic', width: 60, customRender: 'customPic' },
  { title: '条码', dataIndex: 'mBarCode', width: 120, customRender: 'customBarCode' },
  { title: '名称', dataIndex: 'name', width: 160, customRender: 'customName' },
  { title: '规格', dataIndex: 'standard', width: 120 },
  { title: '型号', dataIndex: 'model', width: 120 },
  { title: '颜色', dataIndex: 'color', width: 70, ellipsis: true },
  { title: '品牌', dataIndex: 'brand', width: 100, ellipsis: true },
  { title: '助记码', dataIndex: 'mnemonic', width: 80, ellipsis: true },
  { title: '类别', dataIndex: 'categoryName', width: 100, ellipsis: true },
  { title: '扩展1', dataIndex: 'otherField1', width: 100, ellipsis: true },
  { title: '扩展2', dataIndex: 'otherField2', width: 100, ellipsis: true },
  { title: '扩展3', dataIndex: 'otherField3', width: 100, ellipsis: true },
  { title: '单位', dataIndex: 'unit', width: 100, ellipsis: true, customRender: 'customUnit' },
  { title: '基础重量', dataIndex: 'weight', width: 80 },
  { title: '保质期', dataIndex: 'expiryNum', width: 60 },
  { title: '制造商', dataIndex: 'mfrs', width: 120, ellipsis: true },
  { title: '初始库存', dataIndex: 'initialStock', width: 80, customRender: 'customRenderInitialStock' },
  { title: '库存', dataIndex: 'stock', width: 80, customRender: 'customRenderStock' },
  { title: '采购价', dataIndex: 'purchaseDecimal', width: 80 },
  { title: '零售价', dataIndex: 'commodityDecimal', width: 80 },
  { title: '销售价', dataIndex: 'wholesaleDecimal', width: 80 },
  { title: '最低售价', dataIndex: 'lowDecimal', width: 80 },
  { title: '仓位货架', dataIndex: 'position', width: 80 },
  { title: '备注', dataIndex: 'remark', width: 80 },
  { title: '状态', dataIndex: 'enabled', align: 'center', width: 60, customRender: 'customRenderEnabled' },
]

const defDataIndex = [
  'action', 'mBarCode', 'name', 'standard', 'model', 'color', 'categoryName', 'unit', 'stock',
  'purchaseDecimal', 'commodityDecimal', 'wholesaleDecimal', 'lowDecimal', 'enabled',
]

const mpListStr = getMpListShort(getStore('materialPropertyList') || [])

const {
  loading,
  dataSource,
  columns,
  selectedRowKeys,
  queryParam,
  ipagination,
  btnEnableList,
  toggleSearchStatus,
  settingDataIndex,
  loadData,
  searchQuery,
  handleToggleSearch,
  handleTableChange,
  onSelectChange,
  batchDel,
  batchSetStatus,
  handleExportXls,
  modalFormOk,
  initColumnsSetting,
  onColChange,
  handleRestDefault,
  handleChangeOtherField,
} = useList({
  url: {
    list: '/material/list',
    delete: '/material/delete',
    deleteBatch: '/material/deleteBatch',
    exportXlsUrl: '/material/exportExcel',
    importExcelUrl: '/material/importExcel',
    batchSetStatusUrl: '/material/batchSetStatus',
  },
  defColumns,
  defDataIndex,
  queryParam: {
    categoryId: undefined,
    materialParam: '',
    standard: '',
    model: '',
    color: '',
    brand: '',
    mfrs: '',
    otherField1: '',
    otherField2: '',
    otherField3: '',
    weight: undefined,
    expiryNum: undefined,
    enabled: undefined,
    enableSerialNumber: undefined,
    enableBatchNumber: undefined,
    position: '',
    remark: '',
    mpList: mpListStr,
  },
  pageName: 'materialColumns',
  urlPath: '/material/material',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

/** 批量操作 URL */
const batchUrls = {
  batchSetMaterialCurrentStockUrl: '/material/batchSetMaterialCurrentStock',
  batchSetMaterialCurrentUnitPriceUrl: '/material/batchSetMaterialCurrentUnitPrice',
}

onMounted(() => {
  initColumnsSetting()
  handleChangeOtherField(queryTitle)
})

/** 搜索重置 */
function handleSearchReset() {
  queryParam.categoryId = undefined
  queryParam.materialParam = ''
  queryParam.standard = ''
  queryParam.model = ''
  queryParam.color = ''
  queryParam.brand = ''
  queryParam.mfrs = ''
  queryParam.otherField1 = ''
  queryParam.otherField2 = ''
  queryParam.otherField3 = ''
  queryParam.weight = undefined
  queryParam.expiryNum = undefined
  queryParam.enabled = undefined
  queryParam.enableSerialNumber = undefined
  queryParam.enableBatchNumber = undefined
  queryParam.position = ''
  queryParam.remark = ''
  queryParam.mpList = getMpListShort(getStore('materialPropertyList') || [])
  loadData(1)
}

/** 新增 */
function handleAdd() {
  modalFormRef.value?.add()
  modalFormRef.value.action = 'add'
  modalFormRef.value.title = '新增'
  modalFormRef.value.disableSubmit = false
}

/** 编辑 */
function handleEdit(record: any) {
  modalFormRef.value?.edit(record)
  modalFormRef.value.action = 'edit'
  modalFormRef.value.title = '编辑'
  modalFormRef.value.disableSubmit = false
  if (btnEnableList.value.indexOf('1') === -1) {
    modalFormRef.value.showOkFlag = false
  }
}

/** 复制新增 */
function handleCopyAdd(record: any) {
  modalFormRef.value?.edit(record)
  modalFormRef.value.action = 'copyAdd'
  modalFormRef.value.title = '复制新增'
  modalFormRef.value.disableSubmit = false
}

/** 获取图片 URL */
function getImgUrl(imgName: string, type?: string): string {
  if (imgName && imgName.split(',')) {
    type = type ? type + '/' : ''
    return getFileAccessHttpUrl('systemConfig/static/' + type + imgName.split(',')[0])
  }
  return ''
}

/** 单位显示 */
function getUnitDisplay(text: any, record: any): string {
  if (record) {
    const name = text ? text : record.unitName
    if (record.sku) {
      return name + '[SKU]'
    }
    return name || ''
  }
  return ''
}

/** 导入 */
function handleImportXls() {
  // TODO: 导入逻辑，需要 ImportFileModal 组件迁移后完善
}

/** 批量编辑 */
function batchEdit() {
  if (selectedRowKeys.value.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  const ids = selectedRowKeys.value.join(',')
  // TODO: batchSetInfoModalFormRef 需要 BatchSetInfoModal 组件迁移后完善
  // batchSetInfoModalFormRef.value?.edit(ids)
  // batchSetInfoModalFormRef.value.title = '批量编辑'
}

/** 修正库存 */
function batchSetMaterialCurrentStock() {
  if (selectedRowKeys.value.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  const ids = selectedRowKeys.value.join(',')
  ElMessageBox.confirm('是否操作选中数据?', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true
    try {
      const res = await postAction(batchUrls.batchSetMaterialCurrentStockUrl, { ids })
      if (res.code === 200) {
        ElMessage.success('修正库存成功！')
        loadData()
      } else {
        ElMessage.warning(res.data?.message || '操作失败')
      }
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

/** 修正成本 */
function batchSetMaterialCurrentUnitPrice() {
  if (selectedRowKeys.value.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  const ids = selectedRowKeys.value.join(',')
  ElMessageBox.confirm('是否操作选中数据?', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true
    try {
      const res = await postAction(batchUrls.batchSetMaterialCurrentUnitPriceUrl, { ids })
      if (res.code === 200) {
        ElMessage.success('修正成本成功！')
        loadData()
      } else {
        ElMessage.warning(res.data?.message || '操作失败')
      }
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 16px;
}
.table-operator {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
