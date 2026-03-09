<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="登录名称">
          <el-input v-model="queryParam.loginName" placeholder="输入登录名称模糊查询" clearable />
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="queryParam.userName" placeholder="输入用户姓名模糊查询" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchQuery">查询</el-button>
          <el-button @click="searchReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <el-button v-if="btnEnableList.indexOf('1') > -1" type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="Delete" @click="batchDel">删除</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="CircleCheck" @click="batchSetStatus(0)">启用</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="CircleClose" @click="batchSetStatus(2)">禁用</el-button>
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
        <el-button v-if="btnEnableList.indexOf('1') > -1 && depotFlag === '1'" link type="primary" @click="btnSetDepot(record)">分配仓库</el-button>
        <el-button v-if="btnEnableList.indexOf('1') > -1 && customerFlag === '1'" link type="primary" @click="btnSetCustomer(record)">分配客户</el-button>
        <el-button link type="primary" @click="handleEdit(record)">编辑</el-button>
        <el-popconfirm v-if="btnEnableList.indexOf('1') > -1" title="确定删除吗?" @confirm="handleDelete(record.id)">
          <template #reference>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-popconfirm>
        <el-button link type="primary" @click="handleResetModal(record)">重置密码</el-button>
      </template>
      <!-- 状态列 -->
      <template #customRenderFlag="{ text }">
        <el-tag v-if="text === 0" type="success">启用</el-tag>
        <el-tag v-if="text === 2" type="warning">禁用</el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <user-modal ref="modalFormRef" @ok="modalFormOk" />
    <user-depot-modal ref="userDepotModalRef" @ok="modalFormOk" />
    <user-customer-modal ref="userCustomerModalRef" @ok="modalFormOk" />
    <user-reset-modal ref="userResetModalRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import UserModal from './components/UserModal.vue'
import UserDepotModal from './components/UserDepotModal.vue'
import UserCustomerModal from './components/UserCustomerModal.vue'
import UserResetModal from './components/UserResetModal.vue'
import { useList } from '@/composables/useList'
import { getCurrentSystemConfig } from '@/api/system'

const modalFormRef = ref()
const userDepotModalRef = ref()
const userCustomerModalRef = ref()
const userResetModalRef = ref()

const depotFlag = ref('0')
const customerFlag = ref('0')

const {
  loading,
  dataSource,
  columns,
  selectedRowKeys,
  queryParam,
  ipagination,
  btnEnableList,
  loadData,
  searchQuery: baseSearchQuery,
  searchReset: baseSearchReset,
  handleTableChange,
  onSelectChange,
  batchDel,
  handleDelete,
  batchSetStatus,
  modalFormOk,
} = useList({
  url: {
    list: '/user/list',
    delete: '/user/delete',
    deleteBatch: '/user/deleteBatch',
    batchSetStatusUrl: '/user/batchSetStatus',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 200, customRender: 'action' },
    { title: '登录名称', dataIndex: 'loginName', width: 100 },
    { title: '用户姓名', dataIndex: 'username', width: 100 },
    { title: '用户类型', dataIndex: 'userType', width: 80 },
    { title: '角色', dataIndex: 'roleName', width: 100 },
    { title: '机构', dataIndex: 'orgAbr', width: 100 },
    { title: '是否经理', dataIndex: 'leaderFlagStr', width: 60 },
    { title: '电话号码', dataIndex: 'phonenum', width: 80 },
    { title: '排序', dataIndex: 'userBlngOrgaDsplSeq', width: 40 },
    { title: '状态', dataIndex: 'status', width: 60, align: 'center', customRender: 'customRenderFlag' },
  ],
  urlPath: '/system/user',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

function getSystemConfig() {
  getCurrentSystemConfig().then((res: any) => {
    if (res.code === 200 && res.data) {
      depotFlag.value = res.data.depotFlag
      customerFlag.value = res.data.customerFlag
    }
  })
}

function searchQuery() {
  baseSearchQuery()
  getSystemConfig()
}

function searchReset() {
  queryParam.loginName = undefined
  queryParam.userName = undefined
  loadData(1)
  getSystemConfig()
}

function handleAdd() {
  modalFormRef.value?.add()
}

function handleEdit(record: any) {
  modalFormRef.value?.edit(record)
  if (btnEnableList.value.indexOf('1') === -1) {
    modalFormRef.value.isReadOnly = true
  }
}

function handleResetModal(record: any) {
  userResetModalRef.value?.edit(record)
  userResetModalRef.value.title = '请输入' + record.loginName + '的新密码'
}

function btnSetDepot(record: any) {
  userDepotModalRef.value?.edit(record)
  userDepotModalRef.value.title = '分配仓库给：' + record.username
}

function btnSetCustomer(record: any) {
  userCustomerModalRef.value?.edit(record)
  userCustomerModalRef.value.title = '分配客户给：' + record.username
}

onMounted(() => {
  getSystemConfig()
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
