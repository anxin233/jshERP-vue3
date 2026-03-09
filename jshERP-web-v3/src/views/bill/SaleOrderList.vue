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
                <el-form-item label="结算账户">
                  <el-select v-model="queryParam.accountId" placeholder="请选择结算账户" filterable clearable style="width: 100%">
                    <el-option
                      v-for="item in accountList"
                      :key="item.id"
                      :label="item.name"
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
                    <el-option label="部分销售" value="3" />
                    <el-option label="完成销售" value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="销售人员">
                  <el-select v-model="queryParam.salesMan" placeholder="请选择销售人员" filterable clearable style="width: 100%">
                    <el-option
                      v-for="item in salesManList"
                      :key="item.value"
                      :label="item.text"
                      :value="item.value"
                    />
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
        <el-button
          v-if="quickBtn.saleOut && quickBtn.saleOut.indexOf('1') > -1 && btnEnableList.indexOf(1) > -1"
          :icon="Share"
          @click="transferBill('转销售出库', quickBtn.saleOut)"
        >
          转销售出库
        </el-button>
        <el-button
          v-if="quickBtn.purchaseOrder && quickBtn.purchaseOrder.indexOf('1') > -1 && purchaseBySaleFlag && btnEnableList.indexOf(1) > -1"
          :icon="Share"
          @click="transferBill('转采购订单', quickBtn.purchaseOrder)"
        >
          转采购订单-以销定购
        </el-button>
        <el-tooltip content="可将状态是部分销售的单据强制完成" placement="top">
          <el-button
            v-if="inOutManageFlag && btnEnableList.indexOf(1) > -1"
            :icon="CircleClose"
            @click="batchForceClose"
          >
            强制结单
          </el-button>
        </el-tooltip>
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
              销售订单不涉及收款金额，销售订单可以转销售出库单，但需要先对销售订单进行审核。<br />
              勾选单据之后可以进行批量操作（删除、审核、反审核）。
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
          <el-button link type="primary" size="small" @click="myHandleDetail(row, '销售订单', prefixNo)">查看</el-button>
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

        <!-- 含税合计 自定义渲染 -->
        <template #totalTaxLastMoney="{ row }">
          {{ row.totalTaxLastMoney != null ? row.totalTaxLastMoney : (row.totalPrice || 0) }}
        </template>

        <!-- 优惠率 自定义渲染 -->
        <template #discount="{ row }">
          {{ row.discount != null ? row.discount + '%' : '' }}
        </template>

        <!-- 采购进度 自定义渲染 -->
        <template #customRenderPurchaseStatus="{ row }">
          <el-tag v-if="row.purchaseStatus == '0'" type="danger" size="small">未采购</el-tag>
          <el-tag v-else-if="row.purchaseStatus == '1'" type="warning" size="small">部分采购</el-tag>
          <el-tag v-else-if="row.purchaseStatus == '2'" type="success" size="small">完成采购</el-tag>
          <span v-else>-</span>
        </template>

        <!-- 状态 自定义渲染 -->
        <template #customRenderStatus="{ row }">
          <el-tag v-if="row?.status == '0'" type="danger" size="small">未审核</el-tag>
          <el-tag v-else-if="row?.status == '1'" type="success" size="small">已审核</el-tag>
          <el-tag v-else-if="row?.status == '2'" size="small">完成销售</el-tag>
          <el-tag v-else-if="row?.status == '3'" type="primary" size="small">部分销售</el-tag>
          <el-tag v-else-if="row?.status == '9'" type="warning" size="small">审核中</el-tag>
        </template>
      </ProTable>

      <!-- ==================== 弹窗区域 ==================== -->
      <SaleOrderModal ref="modalFormRef" @ok="modalFormOk" @close="modalFormClose" />
      <BillDetail ref="modalDetailRef" @ok="modalFormOk" @close="modalFormClose" />
      <BillPrintIframe ref="billExcelIframeRef" @ok="modalFormOk" @close="modalFormClose" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Delete, Share, CircleClose, Check, Close,
  Download, Setting, QuestionFilled, ArrowUp, ArrowDown,
} from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import SaleOrderModal from './components/SaleOrderModal.vue'
import BillDetail from './components/BillDetail.vue'
import BillPrintIframe from './components/BillPrintIframe.vue'
import { useBillList } from '@/composables/useBillList'
import type { ListColumn } from '@/composables/useList'

defineOptions({ name: 'SaleOrderList' })

const modalFormRef = ref()
const modalDetailRef = ref()
const transferModalFormRef = ref()
const billExcelIframeRef = ref()
const tableRef = ref()

const toggleSearchStatus = ref(false)
const prefixNo = 'XSDD'

const defColumns: ListColumn[] = [
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 180,
    fixed: 'left',
    customRender: 'action',
  },
  { title: '客户', dataIndex: 'organName', width: 120, ellipsis: true },
  { title: '单据编号', dataIndex: 'number', width: 140 },
  { title: '商品信息', dataIndex: 'materialsList', width: 220, ellipsis: true },
  { title: '单据日期', dataIndex: 'operTimeStr', width: 145 },
  { title: '销售人员', dataIndex: 'salesManStr', width: 120 },
  { title: '操作员', dataIndex: 'userName', width: 80, ellipsis: true },
  { title: '数量', dataIndex: 'materialCount', width: 60 },
  { title: '金额合计', dataIndex: 'totalPrice', width: 80 },
  {
    title: '含税合计',
    dataIndex: 'totalTaxLastMoney',
    width: 80,
    customRender: 'totalTaxLastMoney',
  },
  {
    title: '优惠率',
    dataIndex: 'discount',
    width: 60,
    customRender: 'discount',
  },
  { title: '收款优惠', dataIndex: 'discountMoney', width: 80 },
  { title: '优惠后金额', dataIndex: 'discountLastMoney', width: 100 },
  { title: '结算账户', dataIndex: 'accountName', width: 80 },
  { title: '收取订金', dataIndex: 'changeAmount', width: 80 },
  { title: '备注', dataIndex: 'remark', width: 200 },
  {
    title: '采购进度',
    dataIndex: 'purchaseStatus',
    width: 80,
    align: 'center',
    customRender: 'customRenderPurchaseStatus',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 70,
    align: 'center',
    customRender: 'customRenderStatus',
  },
]

const defDataIndex = [
  'action', 'organName', 'number', 'materialsList', 'operTimeStr',
  'userName', 'materialCount', 'totalPrice', 'totalTaxLastMoney',
  'changeAmount', 'status', 'purchaseStatus',
]

const {
  loading,
  dataSource,
  columns,
  selectedRowKeys,
  queryParam,
  ipagination,
  btnEnableList,
  settingDataIndex,
  checkFlag,
  isShowExcel,
  inOutManageFlag,
  purchaseBySaleFlag,
  cusList,
  depotList,
  userList,
  accountList,
  salesManList,
  expandedRowKeys,
  detailColumns,
  createTimeRange,
  quickBtn,
  loadData,
  searchReset,
  handleTableChange,
  onSelectChange,
  myHandleAdd,
  myHandleEdit,
  myHandleDetail,
  myHandleCopyAdd,
  myHandleDelete,
  handleApprove,
  batchForceClose,
  onDateChange,
  onDateOk,
  initSystemConfig,
  initCustomer,
  initSalesman,
  getDepotData,
  initUser,
  initAccount,
  initQuickBtn,
  getDepotByCurrentUser,
  handleSearchCustomer,
  transferBill,
  handleExport,
  onExpand,
  initColumnsSetting,
  onColChange,
  handleRestDefault,
} = useBillList({
  url: {
    list: '/depotHead/list',
    delete: '/depotHead/delete',
    deleteBatch: '/depotHead/deleteBatch',
    forceCloseBatch: '/depotHead/forceCloseBatch',
    batchSetStatusUrl: '/depotHead/batchSetStatus',
  },
  prefixNo,
  defColumns,
  defDataIndex,
  modalFormRef,
  modalDetailRef,
  transferModalFormRef,
  billExcelIframeRef,
  queryParam: {
    type: '其它',
    subType: '销售订单',
  },
})

function batchDel() {
  if (selectedRowKeys.value.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  myHandleDelete({ id: selectedRowKeys.value.join(',') })
}

function modalFormOk() {
  loadData()
}

function modalFormClose() {}

function searchQuery() {
  loadData(1)
}

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
