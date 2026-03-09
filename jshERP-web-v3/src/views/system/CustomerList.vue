<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="名称">
          <el-input v-model="queryParam.supplier" placeholder="请输入名称查询" clearable />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="queryParam.contacts" placeholder="请输入联系人查询" clearable />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="queryParam.telephone" placeholder="请输入手机号码查询" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchQuery">查询</el-button>
          <el-button @click="searchReset">重置</el-button>
          <el-button link type="primary" @click="handleToggleSearch">
            {{ toggleSearchStatus ? '收起' : '展开' }}
            <el-icon><ArrowUp v-if="toggleSearchStatus" /><ArrowDown v-else /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
      <el-form v-if="toggleSearchStatus" :inline="true">
        <el-form-item label="联系电话">
          <el-input v-model="queryParam.phonenum" placeholder="请输入联系电话查询" clearable />
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
      <el-button v-if="btnEnableList.indexOf('3') > -1" :icon="Download" @click="handleExportXls('客户信息')">导出</el-button>
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
      @change="handleTableChange"
      @select-change="onSelectChange"
    >
      <!-- 序号列 -->
      <template #rowIndex="{ index }">{{ index + 1 }}</template>
      <!-- 操作列 -->
      <template #action="{ record }">
        <el-button
          v-if="btnEnableList.indexOf('1') > -1 && customerFlag === '1' && quickBtnUser.indexOf('1') > -1"
          link type="primary" @click="btnSetUser(record)"
        >分配用户</el-button>
        <el-button link type="primary" @click="handleEdit(record)">编辑</el-button>
        <el-popconfirm v-if="btnEnableList.indexOf('1') > -1" title="确定删除吗?" @confirm="handleDelete(record.id)">
          <template #reference>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <!-- 状态列 -->
      <template #customRenderFlag="{ text }">
        <el-tag v-if="text" type="success">启用</el-tag>
        <el-tag v-else type="warning">禁用</el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <customer-modal ref="modalFormRef" @ok="modalFormOk" />
    <customer-user-modal ref="customerUserModalRef" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Delete, CircleCheck, CircleClose, Upload, Download, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import CustomerModal from './components/CustomerModal.vue'
import CustomerUserModal from './components/CustomerUserModal.vue'
import { useList } from '@/composables/useList'
import { getCurrentSystemConfig } from '@/api/system'
import { getStore } from '@/utils/storage'

const modalFormRef = ref()
const customerUserModalRef = ref()

const customerFlag = ref('0')
const quickBtnUser = ref('')

const {
  loading,
  dataSource,
  columns,
  selectedRowKeys,
  queryParam,
  ipagination,
  btnEnableList,
  toggleSearchStatus,
  loadData,
  searchQuery: baseSearchQuery,
  handleToggleSearch,
  handleTableChange,
  onSelectChange,
  batchDel,
  handleDelete,
  batchSetStatus,
  handleExportXls,
  modalFormOk,
} = useList({
  url: {
    list: '/supplier/list',
    delete: '/supplier/delete',
    deleteBatch: '/supplier/deleteBatch',
    importExcelUrl: '/supplier/importCustomer',
    exportXlsUrl: '/supplier/exportExcel',
    batchSetStatusUrl: '/supplier/batchSetStatus',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 60, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', width: 130, align: 'center', customRender: 'action' },
    { title: '名称', dataIndex: 'supplier', width: 150, align: 'left' },
    { title: '联系人', dataIndex: 'contacts', width: 70, align: 'left' },
    { title: '手机号码', dataIndex: 'telephone', width: 100, align: 'left' },
    { title: '联系电话', dataIndex: 'phoneNum', width: 100, align: 'left' },
    { title: '电子邮箱', dataIndex: 'email', width: 150, align: 'left' },
    { title: '期初应收', dataIndex: 'beginNeedGet', width: 80, align: 'left' },
    { title: '期末应收', dataIndex: 'allNeedGet', width: 80, align: 'left' },
    { title: '税率(%)', dataIndex: 'taxRate', width: 80, align: 'left' },
    { title: '排序', dataIndex: 'sort', width: 60, align: 'left' },
    { title: '状态', dataIndex: 'enabled', width: 60, align: 'center', customRender: 'customRenderFlag' },
  ],
  queryParam: {
    supplier: '',
    type: '客户',
    contacts: '',
    telephone: '',
    phonenum: '',
  },
  urlPath: '/system/customer',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

function getSystemConfig() {
  getCurrentSystemConfig().then((res: any) => {
    if (res.code === 200 && res.data) {
      customerFlag.value = res.data.customerFlag
    }
  })
}

function initQuickBtn() {
  const btnStrList = getStore('winBtnStrList') as any[] | null
  if (btnStrList) {
    for (let i = 0; i < btnStrList.length; i++) {
      if (btnStrList[i].btnStr) {
        if (btnStrList[i].url === '/system/user') {
          quickBtnUser.value = btnStrList[i].btnStr
        }
      }
    }
  }
}

function searchQuery() {
  baseSearchQuery()
  getSystemConfig()
}

function searchReset() {
  queryParam.supplier = ''
  queryParam.contacts = ''
  queryParam.telephone = ''
  queryParam.phonenum = ''
  queryParam.type = '客户'
  loadData(1)
  getSystemConfig()
}

function handleAdd() {
  modalFormRef.value?.add()
}

function handleEdit(record: any) {
  modalFormRef.value?.edit(record)
  modalFormRef.value.title = '编辑'
  modalFormRef.value.disableSubmit = false
  if (btnEnableList.value.indexOf('1') === -1) {
    modalFormRef.value.isReadOnly = true
  }
}

function handleImportXls() {
  // TODO: 导入逻辑，需要 ImportFileModal 组件迁移后完善
}

function btnSetUser(record: any) {
  customerUserModalRef.value?.edit(record)
  customerUserModalRef.value.title = '分配用户给：' + record.supplier
  customerUserModalRef.value.disableSubmit = false
}

onMounted(() => {
  getSystemConfig()
  initQuickBtn()
})
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 16px;
}
.table-operator {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}
</style>
