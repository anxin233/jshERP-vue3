<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="单位名称">
          <el-input v-model="queryParam.name" placeholder="请输入单位名称查询" clearable />
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
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="CircleCheck" @click="batchSetStatus(true)">启用</el-button>
      <el-button v-if="btnEnableList.indexOf('1') > -1" :icon="CircleClose" @click="batchSetStatus(false)">禁用</el-button>
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
        <el-popconfirm v-if="btnEnableList.indexOf('1') > -1" title="确定删除吗?" @confirm="handleDelete(record.id)">
          <template #reference>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <!-- 副单位列 -->
      <template #otherUnitRender="{ record }">
        <span v-if="record.otherUnit">{{ record.otherUnit }}={{ record.ratio }}{{ record.basicUnit }}</span>
      </template>
      <!-- 副单位2列 -->
      <template #otherUnitTwoRender="{ record }">
        <span v-if="record.otherUnitTwo">{{ record.otherUnitTwo }}={{ record.ratioTwo }}{{ record.basicUnit }}</span>
      </template>
      <!-- 副单位3列 -->
      <template #otherUnitThreeRender="{ record }">
        <span v-if="record.otherUnitThree">{{ record.otherUnitThree }}={{ record.ratioThree }}{{ record.basicUnit }}</span>
      </template>
      <!-- 状态列 -->
      <template #customRenderFlag="{ text }">
        <el-tag v-if="text" type="success">启用</el-tag>
        <el-tag v-else type="warning">禁用</el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <unit-modal ref="modalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import UnitModal from './components/UnitModal.vue'
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
  batchSetStatus,
  modalFormOk,
} = useList({
  url: {
    list: '/unit/list',
    delete: '/unit/delete',
    deleteBatch: '/unit/deleteBatch',
    batchSetStatusUrl: '/unit/batchSetStatus',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', width: 100, align: 'center', customRender: 'action' },
    { title: '单位名称', dataIndex: 'name', width: 200, align: 'left' },
    { title: '基本单位', dataIndex: 'basicUnit', width: 80, align: 'left' },
    { title: '副单位', dataIndex: 'otherUnit', width: 100, align: 'left', customRender: 'otherUnitRender' },
    { title: '副单位2', dataIndex: 'otherUnitTwo', width: 100, align: 'left', customRender: 'otherUnitTwoRender' },
    { title: '副单位3', dataIndex: 'otherUnitThree', width: 100, align: 'left', customRender: 'otherUnitThreeRender' },
    { title: '状态', dataIndex: 'enabled', width: 60, align: 'center', customRender: 'customRenderFlag' },
  ],
  queryParam: {
    name: '',
    type: '',
  },
  urlPath: '/system/unit',
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
  modalFormRef.value.disableSubmit = false
  if (btnEnableList.value.indexOf('1') === -1) {
    modalFormRef.value.isReadOnly = true
  }
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
