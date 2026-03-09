<template>
  <el-card shadow="never">
    <!-- 表格 -->
    <pro-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="tablePagination"
      row-key="id"
      :scroll="{ y: 540 }"
      @change="handleTableChange"
    >
      <!-- 序号列 -->
      <template #rowIndex="{ index }">{{ index + 1 }}</template>
      <!-- 操作列 -->
      <template #action="{ record }">
        <el-button link type="primary" @click="handleEdit(record)">编辑</el-button>
      </template>
    </pro-table>

    <!-- 表单弹窗 -->
    <platform-config-modal ref="modalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ProTable from '@/components/table/ProTable.vue'
import PlatformConfigModal from './components/PlatformConfigModal.vue'
import { useList } from '@/composables/useList'

const modalFormRef = ref()

const {
  loading,
  dataSource,
  columns,
  ipagination,
  btnEnableList,
  handleTableChange,
  modalFormOk,
} = useList({
  url: {
    list: '/platformConfig/list',
    delete: '/platformConfig/delete',
    deleteBatch: '/platformConfig/deleteBatch',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 100, customRender: 'action' },
    { title: '配置名称', dataIndex: 'platformKeyInfo', width: 100 },
    { title: '配置值', dataIndex: 'platformValue', width: 500 },
  ],
  urlPath: '/system/platformConfig',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

function handleEdit(record: any) {
  modalFormRef.value?.edit(record)
  modalFormRef.value.title = '编辑'
  if (btnEnableList.value.indexOf('1') === -1) {
    modalFormRef.value.isReadOnly = true
  }
}
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 16px;
}
</style>
