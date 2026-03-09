<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="登录名称">
          <el-input v-model="queryParam.loginName" placeholder="输入登录名称模糊查询" clearable />
        </el-form-item>
        <el-form-item label="租户类型">
          <el-select v-model="queryParam.type" placeholder="请选择租户类型" clearable>
            <el-option label="试用租户" value="0" />
            <el-option label="付费租户" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="租户状态">
          <el-select v-model="queryParam.enabled" placeholder="请选择操作状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
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
      <!-- 展开区域 -->
      <el-form v-if="toggleSearchStatus" :inline="true">
        <el-form-item label="备注">
          <el-input v-model="queryParam.remark" placeholder="请输入备注" clearable />
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      <el-button :icon="CircleCheck" @click="batchSetStatus(1)">启用</el-button>
      <el-button :icon="CircleClose" @click="batchSetStatus(0)">禁用</el-button>
    </div>

    <!-- 表格 -->
    <pro-table
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
      </template>
      <!-- 租户类型列 -->
      <template #customRenderType="{ text }">
        <el-tag v-if="text == 0">试用租户</el-tag>
        <el-tag v-if="text == 1" type="success">付费租户</el-tag>
      </template>
      <!-- 租户状态列 -->
      <template #customRenderEnabled="{ text }">
        <el-tag v-if="text" type="success">启用</el-tag>
        <el-tag v-if="!text" type="warning">禁用</el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <tenant-modal ref="modalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, CircleCheck, CircleClose, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import TenantModal from './components/TenantModal.vue'
import { useList } from '@/composables/useList'

const modalFormRef = ref()

const {
  loading,
  dataSource,
  columns,
  selectedRowKeys,
  queryParam,
  ipagination,
  toggleSearchStatus,
  btnEnableList,
  searchQuery,
  searchReset,
  handleTableChange,
  handleToggleSearch,
  onSelectChange,
  batchSetStatus,
  modalFormOk,
} = useList({
  url: {
    list: '/tenant/list',
    batchSetStatusUrl: '/tenant/batchSetStatus',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 100, customRender: 'action' },
    { title: '登录名称', dataIndex: 'loginName', width: 100, align: 'center' },
    { title: '用户数量', dataIndex: 'userCount', width: 60, align: 'center' },
    { title: '用户数量限制', dataIndex: 'userNumLimit', width: 80, align: 'center' },
    { title: '租户角色', dataIndex: 'roleName', width: 80, align: 'center' },
    { title: '租户类型', dataIndex: 'type', width: 60, align: 'center', customRender: 'customRenderType' },
    { title: '租户状态', dataIndex: 'enabled', width: 60, align: 'center', customRender: 'customRenderEnabled' },
    { title: '创建时间', dataIndex: 'createTimeStr', width: 100, align: 'center' },
    { title: '到期时间', dataIndex: 'expireTimeStr', width: 100, align: 'center' },
    { title: '备注', dataIndex: 'remark', width: 200, align: 'center', ellipsis: true },
  ],
  urlPath: '/system/tenant',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

function handleAdd() {
  modalFormRef.value?.add()
}

function handleEdit(record: any) {
  modalFormRef.value?.edit(record)
  modalFormRef.value.title = '编辑'
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
}
</style>
