<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="会员卡号">
          <el-input v-model="queryParam.supplier" placeholder="请输入会员卡号查询" clearable />
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
      <el-button v-if="btnEnableList.indexOf('3') > -1" :icon="Download" @click="handleExportXls('会员信息')">导出</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="TrendCharts" @click="batchSetAdvanceIn">修正预付款</el-button>
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
        <el-button link type="primary" @click="handleEdit(record)">编辑</el-button>
        <el-popconfirm title="确定删除吗?" @confirm="handleDelete(record.id)">
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
    <member-modal ref="modalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, CircleCheck, CircleClose, Upload, Download, TrendCharts, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import MemberModal from './components/MemberModal.vue'
import { useList } from '@/composables/useList'
import { postAction } from '@/api/http'

const modalFormRef = ref()

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
  searchQuery,
  handleToggleSearch,
  handleTableChange,
  onSelectChange,
  onClearSelected,
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
    importExcelUrl: '/supplier/importMember',
    exportXlsUrl: '/supplier/exportExcel',
    batchSetStatusUrl: '/supplier/batchSetStatus',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 60, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', width: 130, align: 'center', customRender: 'action' },
    { title: '会员卡号', dataIndex: 'supplier', width: 150, align: 'left' },
    { title: '联系人', dataIndex: 'contacts', width: 70, align: 'left' },
    { title: '手机号码', dataIndex: 'telephone', width: 100, align: 'left' },
    { title: '联系电话', dataIndex: 'phoneNum', width: 100, align: 'left' },
    { title: '电子邮箱', dataIndex: 'email', width: 150, align: 'left' },
    { title: '预付款', dataIndex: 'advanceIn', width: 70, align: 'left' },
    { title: '排序', dataIndex: 'sort', width: 60, align: 'left' },
    { title: '状态', dataIndex: 'enabled', width: 60, align: 'center', customRender: 'customRenderFlag' },
  ],
  queryParam: {
    supplier: '',
    type: '会员',
    contacts: '',
    telephone: '',
    phonenum: '',
  },
  urlPath: '/system/member',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

function searchReset() {
  queryParam.supplier = ''
  queryParam.contacts = ''
  queryParam.telephone = ''
  queryParam.phonenum = ''
  queryParam.type = '会员'
  loadData(1)
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

function batchSetAdvanceIn() {
  if (selectedRowKeys.value.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  const ids = selectedRowKeys.value.join(',')
  ElMessageBox.confirm('是否操作选中数据?', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      loading.value = true
      try {
        const res: any = await postAction('/supplier/batchSetAdvanceIn', { ids })
        if (res.code === 200) {
          ElMessage.success('修正预付款成功！')
          loadData()
          onClearSelected()
        } else {
          ElMessage.warning(res.data?.message || '操作失败')
        }
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      // 取消
    })
}
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 16px;
}
.table-operator {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
