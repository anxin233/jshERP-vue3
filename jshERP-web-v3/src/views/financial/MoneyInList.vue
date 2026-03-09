<template>
  <div class="financial-list-page">
    <el-card shadow="never">
      <!-- ==================== 查询区域 ==================== -->
      <div class="table-page-search-wrapper">
        <el-form :inline="true" @keyup.enter="searchQuery" class="search-form">
          <el-row :gutter="24">
            <el-col :md="6" :sm="24">
              <el-form-item label="单据编号">
                <el-input v-model="queryParam.billNo" placeholder="请输入单据编号" clearable />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="销售单号">
                <el-input v-model="queryParam.number" placeholder="请输入销售单号" clearable />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="单据日期">
                <el-date-picker
                  v-model="queryParam.createTimeRange"
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
                <el-form-item label="财务人员">
                  <el-select v-model="queryParam.handsPersonId" placeholder="请选择财务人员" filterable clearable style="width: 100%">
                    <el-option
                      v-for="item in personList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="收款账户">
                  <el-select v-model="queryParam.accountId" placeholder="请选择收款账户" filterable clearable style="width: 100%">
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
        <el-button v-if="btnEnableList.indexOf(1) > -1" type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button v-if="btnEnableList.indexOf(1) > -1" :icon="Link" @click="handleAddWithOrgan">待收款({{ waitTotal }})</el-button>
        <el-button v-if="btnEnableList.indexOf(1) > -1" :icon="Delete" @click="batchDel">删除</el-button>
        <el-button v-if="checkFlag && btnEnableList.indexOf(2) > -1" :icon="Check" @click="batchSetStatus(1)">审核</el-button>
        <el-button v-if="checkFlag && btnEnableList.indexOf(7) > -1" :icon="Close" @click="batchSetStatus(0)">反审核</el-button>
        <el-button v-if="isShowExcel && btnEnableList.indexOf(3) > -1" :icon="Download" @click="handleExport">导出</el-button>

        <!-- 提示信息 -->
        <el-tooltip
          v-if="btnEnableList.indexOf(1) > -1"
          placement="left"
          effect="light"
        >
          <template #content>
            <div style="max-width: 300px">
              收款单所收金额只对付款单位的应收应付产生影响，可以在回款统计中进行查看。<br />
              收款单的优惠金额会对利润产生影响，但不影响付款单位的应收应付。优惠金额计入收入类的收款优惠中。
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
          <el-button link type="primary" size="small" @click="handleDetail(row)">查看</el-button>
          <template v-if="btnEnableList.indexOf(1) > -1">
            <el-divider direction="vertical" />
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定删除吗?" @confirm="handleDeleteRecord(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </template>

        <!-- 状态 自定义渲染 -->
        <template #customRenderStatus="{ row }">
          <el-tag v-if="row.status == '0'" type="danger" size="small">未审核</el-tag>
          <el-tag v-else-if="row.status == '1'" type="success" size="small">已审核</el-tag>
          <el-tag v-else-if="row.status == '9'" type="warning" size="small">审核中</el-tag>
        </template>
      </ProTable>

      <!-- ==================== 弹窗区域 ==================== -->
      <MoneyInModal ref="modalFormRef" @ok="modalFormOk" @close="modalFormClose" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Delete, Check, Close, Download, Link,
  QuestionFilled, ArrowUp, ArrowDown,
} from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import MoneyInModal from './components/MoneyInModal.vue'
import { useFinancialList } from '@/composables/useFinancialList'
import type { ListColumn } from '@/composables/useList'

defineOptions({ name: 'MoneyInList' })

// ==================== 组件 Ref ====================
const modalFormRef = ref()
const tableRef = ref()

// ==================== 状态 ====================
const toggleSearchStatus = ref(false)

// ==================== 列定义 ====================
const defColumns: ListColumn[] = [
  { title: '操作', dataIndex: 'action', align: 'center', width: 180, fixed: 'left', customRender: 'action' },
  { title: '客户', dataIndex: 'organName', width: 140, ellipsis: true },
  { title: '单据编号', dataIndex: 'billNo', width: 160 },
  { title: '单据日期', dataIndex: 'billTimeStr', width: 160 },
  { title: '操作员', dataIndex: 'userName', width: 100, ellipsis: true },
  { title: '财务人员', dataIndex: 'handsPersonName', width: 100 },
  { title: '收款账户', dataIndex: 'accountName', width: 100, ellipsis: true },
  { title: '合计收款', dataIndex: 'totalPrice', width: 80 },
  { title: '优惠金额', dataIndex: 'discountMoney', width: 80 },
  { title: '实际收款', dataIndex: 'changeAmount', width: 80 },
  { title: '备注', dataIndex: 'remark', width: 200 },
  { title: '状态', dataIndex: 'status', width: 80, align: 'center', customRender: 'customRenderStatus' },
]

// ==================== useFinancialList ====================
const {
  loading,
  dataSource,
  columns,
  selectedRowKeys,
  queryParam,
  ipagination,
  btnEnableList,
  checkFlag,
  isShowExcel,
  waitTotal,
  cusList,
  userList,
  personList,
  accountList,
  loadData,
  searchReset,
  handleTableChange,
  onSelectChange,
  myHandleAdd,
  myHandleAddWithOrgan,
  myHandleEdit,
  myHandleDelete,
  myHandleDetail,
  batchSetStatus,
  onDateChange,
  handleSearchCustomer,
  handleExport,
  initSystemConfig,
  initCustomer,
  initUser,
  initPerson,
  initAccount,
  initGetNeedCount,
} = useFinancialList({
  url: {
    list: '/accountHead/list',
    delete: '/accountHead/delete',
    deleteBatch: '/accountHead/deleteBatch',
    batchSetStatusUrl: '/accountHead/batchSetStatus',
  },
  prefixNo: 'SK',
  defColumns,
  queryParam: {
    type: '收款',
    billNo: '',
    number: '',
    organId: undefined,
    creator: undefined,
    handsPersonId: undefined,
    accountId: undefined,
    status: undefined,
    remark: '',
  },
})

// ==================== 页面初始化 ====================
initSystemConfig()
initCustomer()
initUser()
initPerson()
initAccount()
initGetNeedCount('customer')

// ==================== 页面事件 ====================

function handleAdd() {
  myHandleAdd(modalFormRef.value, () => {
    modalFormRef.value?.add()
    modalFormRef.value.title = '新增'
  })
}

function handleAddWithOrgan() {
  myHandleAddWithOrgan(modalFormRef.value, () => {
    modalFormRef.value?.add()
    modalFormRef.value.title = '新增'
  })
}

function handleEdit(row: any) {
  myHandleEdit(row, modalFormRef.value, (item: any) => {
    modalFormRef.value?.edit(item)
    modalFormRef.value.title = '编辑'
  })
}

function handleDetail(row: any) {
  myHandleDetail(row, '收款', 'SK', null, (record: any) => {
    modalFormRef.value?.edit(record)
    modalFormRef.value.title = '查看'
  })
}

function handleDeleteRecord(row: any) {
  myHandleDelete(row)
}

function batchDel() {
  if (selectedRowKeys.value.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  myHandleDelete({ id: selectedRowKeys.value.join(','), status: '0' })
}

function modalFormOk() {
  loadData()
  initGetNeedCount('customer')
}

function modalFormClose() {
  // 关闭回调
}

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
.financial-list-page {
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
