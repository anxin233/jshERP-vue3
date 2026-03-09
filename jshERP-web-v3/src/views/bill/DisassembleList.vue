<template>
  <div class="bill-list-page">
    <el-card shadow="never">
      <!-- ==================== 查询区域 ==================== -->
      <div class="table-page-search-wrapper">
        <el-form :inline="true" @keyup.enter="searchQuery" class="search-form">
          <el-row :gutter="24">
            <el-col :md="6" :sm="24">
              <el-form-item label="单据编号">
                <el-input v-model="queryParam.number" placeholder="请输入单据编号" clearable />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="商品信息">
                <el-input v-model="queryParam.materialParam" placeholder="请输入条码、名称、规格、型号等" clearable />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="单据日期">
                <el-date-picker
                  v-model="createTimeRange"
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
                <el-button @click="searchReset">重置</el-button>
                <el-button link type="primary" @click="toggleSearchStatus = !toggleSearchStatus">
                  {{ toggleSearchStatus ? '收起' : '展开' }}
                  <el-icon><ArrowUp v-if="toggleSearchStatus" /><ArrowDown v-else /></el-icon>
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 展开的高级搜索 -->
          <template v-if="toggleSearchStatus">
            <el-row :gutter="24">
              <el-col :md="6" :sm="24">
                <el-form-item label="仓库名称">
                  <el-select v-model="queryParam.depotId" placeholder="请选择仓库" filterable clearable style="width: 100%">
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
                <el-form-item label="操作员">
                  <el-select v-model="queryParam.creator" placeholder="请选择操作员" filterable clearable style="width: 100%">
                    <el-option
                      v-for="item in userList"
                      :key="item.id"
                      :label="item.userName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="单据状态">
                  <el-select v-model="queryParam.status" placeholder="请选择单据状态" clearable style="width: 100%">
                    <el-option label="未审核" value="0" />
                    <el-option v-if="!checkFlag" label="审核中" value="9" />
                    <el-option label="已审核" value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="单据备注">
                  <el-input v-model="queryParam.remark" placeholder="请输入单据备注" clearable />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </el-form>
      </div>

      <!-- ==================== 操作按钮区域 ==================== -->
      <div class="table-operator" style="margin-top: 5px; margin-bottom: 10px">
        <el-button v-if="btnEnableList.indexOf(1) > -1" type="primary" :icon="Plus" @click="myHandleAdd">新增</el-button>
        <el-button v-if="btnEnableList.indexOf(1) > -1" :icon="Delete" @click="batchDel">删除</el-button>
        <el-button v-if="checkFlag && btnEnableList.indexOf(2) > -1" :icon="Check" @click="handleApprove('1')">审核</el-button>
        <el-button v-if="checkFlag && btnEnableList.indexOf(7) > -1" :icon="Close" @click="handleApprove('0')">反审核</el-button>
        <el-button v-if="isShowExcel && btnEnableList.indexOf(3) > -1" :icon="Download" @click="handleExport">导出</el-button>

        <!-- 列设置 -->
        <el-popover trigger="click" placement="right" :width="520">
          <template #reference>
            <el-button :icon="Setting">列设置</el-button>
          </template>
          <el-checkbox-group v-model="settingDataIndex" @change="onColChange">
            <el-row>
              <el-col v-for="item in defColumns" :key="item.dataIndex" :span="8">
                <el-checkbox :value="item.dataIndex">
                  <el-text truncated style="max-width: 100px">{{ item.title }}</el-text>
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

        <!-- 提示信息 -->
        <el-tooltip
          v-if="btnEnableList.indexOf(1) > -1"
          placement="left"
          effect="light"
        >
          <template #content>
            <div style="max-width: 300px">
              用于将一个商品拆分成多种商品，被拆分的商品库存增加，拆分后的商品库存减少。
            </div>
          </template>
          <el-icon style="font-size: 20px; float: right; cursor: pointer"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>

      <!-- ==================== 表格区域 ==================== -->
      <ProTable
        ref="tableRef"
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        row-key="id"
        :row-selection="true"
        :selected-row-keys="selectedRowKeys"
        :pagination="ipagination"
        :border="true"
        size="default"
        @change="handleTableChange"
        @select-change="onSelectChange"
      >
        <!-- 操作列 -->
        <template #action="{ row }">
          <el-button link type="primary" size="small" @click="myHandleDetail(row, '拆卸单', prefixNo)">查看</el-button>
          <template v-if="btnEnableList.indexOf(1) > -1">
            <el-divider direction="vertical" />
            <el-button link type="primary" size="small" @click="myHandleEdit(row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button link type="primary" size="small" @click="myHandleCopyAdd(row)">复制</el-button>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定删除吗?" @confirm="myHandleDelete(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </template>

        <!-- 状态 自定义渲染 -->
        <template #customRenderStatus="{ row }">
          <el-tag v-if="row?.status == '0'" type="danger" size="small">未审核</el-tag>
          <el-tag v-else-if="row?.status == '1'" type="success" size="small">已审核</el-tag>
          <el-tag v-else-if="row?.status == '9'" type="warning" size="small">审核中</el-tag>
        </template>
      </ProTable>

      <!-- ==================== 弹窗区域 ==================== -->
      <DisassembleModal ref="modalFormRef" @ok="modalFormOk" @close="modalFormClose" />
      <BillDetail ref="modalDetailRef" @ok="modalFormOk" @close="modalFormClose" />
      <BillPrintIframe ref="billExcelIframeRef" @ok="modalFormOk" @close="modalFormClose" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Delete, Check, Close,
  Download, Setting, QuestionFilled, ArrowUp, ArrowDown,
} from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import DisassembleModal from './components/DisassembleModal.vue'
import BillDetail from './components/BillDetail.vue'
import BillPrintIframe from './components/BillPrintIframe.vue'
import { useBillList } from '@/composables/useBillList'
import type { ListColumn } from '@/composables/useList'

defineOptions({ name: 'DisassembleList' })

// ==================== 组件 Ref ====================
const modalFormRef = ref()
const modalDetailRef = ref()
const billExcelIframeRef = ref()
const tableRef = ref()

// ==================== 状态 ====================
const toggleSearchStatus = ref(false)
const prefixNo = 'CXD'

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 180,
    fixed: 'left',
    customRender: 'action',
  },
  { title: '单据编号', dataIndex: 'number', width: 160 },
  { title: '商品信息', dataIndex: 'materialsList', width: 220, ellipsis: true },
  { title: '单据日期', dataIndex: 'operTimeStr', width: 145 },
  { title: '操作员', dataIndex: 'userName', width: 80, ellipsis: true },
  { title: '数量', dataIndex: 'materialCount', width: 60 },
  { title: '金额合计', dataIndex: 'totalPrice', width: 80 },
  { title: '备注', dataIndex: 'remark', width: 200 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    align: 'center',
    customRender: 'customRenderStatus',
  },
]

const defDataIndex = [
  'action', 'number', 'materialsList', 'operTimeStr', 'userName',
  'materialCount', 'totalPrice', 'status',
]

// ==================== useBillList ====================
const {
  // 基础列表状态
  loading,
  dataSource,
  columns,
  selectedRowKeys,
  queryParam,
  ipagination,
  btnEnableList,
  settingDataIndex,
  // 单据特有状态
  checkFlag,
  isShowExcel,
  depotList,
  userList,
  expandedRowKeys,
  detailColumns,
  createTimeRange,
  // 列表操作
  loadData,
  searchReset,
  handleTableChange,
  onSelectChange,
  // CRUD
  myHandleAdd,
  myHandleEdit,
  myHandleDetail,
  myHandleCopyAdd,
  myHandleDelete,
  // 批量操作
  handleApprove,
  // 日期
  onDateChange,
  onDateOk,
  // 初始化
  initSystemConfig,
  getDepotData,
  initUser,
  // 展开
  onExpand,
  // 导出
  handleExport,
  // 列设置
  initColumnsSetting,
  onColChange,
  handleRestDefault,
} = useBillList({
  url: {
    list: '/depotHead/list',
    delete: '/depotHead/delete',
    deleteBatch: '/depotHead/deleteBatch',
    batchSetStatusUrl: '/depotHead/batchSetStatus',
  },
  prefixNo,
  defColumns,
  defDataIndex,
  modalFormRef,
  modalDetailRef,
  billExcelIframeRef,
  queryParam: {
    type: '其它',
    subType: '拆卸单',
  },
})

// ==================== 页面事件 ====================

/** 批量删除 */
function batchDel() {
  if (selectedRowKeys.value.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  myHandleDelete({ id: selectedRowKeys.value.join(',') })
}

/** 弹窗确认回调 */
function modalFormOk() {
  loadData()
}

/** 弹窗关闭回调 */
function modalFormClose() {
  // 关闭时刷新（如需要）
}

/** 搜索查询 */
function searchQuery() {
  loadData(1)
}

// ==================== defineExpose ====================
defineExpose({
  loadData,
  searchQuery,
  searchReset,
})
</script>

<style scoped lang="scss">
.bill-list-page {
  padding: 0;
}

.table-page-search-wrapper {
  margin-bottom: 10px;
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
