<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="名称">
          <el-input v-model="queryParam.name" placeholder="请输入名称查询" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchQuery">查询</el-button>
          <el-button @click="searchReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      <el-button :icon="Delete" @click="batchDel">删除</el-button>
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
        <el-tag v-if="text === 1 || text === true" type="success">启用</el-tag>
        <el-tag v-if="text === 0 || text === false" type="warning">禁用</el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <function-modal ref="modalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import FunctionModal from './components/FunctionModal.vue'
import { useList } from '@/composables/useList'

const modalFormRef = ref()

const {
  loading,
  dataSource,
  columns,
  selectedRowKeys,
  queryParam,
  ipagination,
  btnEnableList,
  loadData,
  searchQuery,
  searchReset,
  handleTableChange,
  onSelectChange,
  batchDel,
  handleDelete,
  modalFormOk,
} = useList({
  url: {
    list: '/function/list',
    delete: '/function/delete',
    deleteBatch: '/function/deleteBatch',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 150, customRender: 'action' },
    { title: '编号', dataIndex: 'number', width: 80 },
    { title: '名称', dataIndex: 'name', width: 120, ellipsis: true },
    { title: '上级编号', dataIndex: 'parentNumber', width: 80 },
    { title: '上级名称', dataIndex: 'parentName', width: 120, ellipsis: true },
    { title: '链接', dataIndex: 'url', width: 250, ellipsis: true },
    { title: '组件', dataIndex: 'component', width: 250, ellipsis: true },
    { title: '排序', dataIndex: 'sort', width: 60 },
    { title: '是否启用', dataIndex: 'enabled', width: 80, align: 'center', customRender: 'customRenderFlag' },
    { title: '图标', dataIndex: 'icon', width: 120 },
  ],
  urlPath: '/system/function',
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
