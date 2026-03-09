<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="属性名">
          <el-input v-model="queryParam.attributeName" placeholder="请输入属性名查询" clearable />
        </el-form-item>
        <el-form-item label="属性值">
          <el-input v-model="queryParam.attributeValue" placeholder="请输入属性值查询" clearable />
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
      <!-- 属性值列 -->
      <template #customRenderAttributeValue="{ text }">
        <el-tag v-for="(item, index) in getTagArr(text)" :key="index" type="primary" style="margin: 2px;">
          {{ item }}
        </el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <material-attribute-modal ref="modalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import MaterialAttributeModal from './components/MaterialAttributeModal.vue'
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
  searchQuery,
  searchReset,
  handleTableChange,
  onSelectChange,
  batchDel,
  handleDelete,
  modalFormOk,
} = useList({
  url: {
    list: '/materialAttribute/list',
    delete: '/materialAttribute/delete',
    deleteBatch: '/materialAttribute/deleteBatch',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', width: 100, align: 'center', customRender: 'action' },
    { title: '属性名', dataIndex: 'attributeName', width: 150 },
    { title: '属性值', dataIndex: 'attributeValue', width: 750, customRender: 'customRenderAttributeValue' },
  ],
  queryParam: {
    attributeName: '',
    attributeValue: '',
  },
  urlPath: '/material/materialAttribute',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

/** 将属性值字符串按竖线分隔为数组 */
function getTagArr(attributeValue: string): string[] {
  if (!attributeValue) return []
  return attributeValue.split('|')
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
