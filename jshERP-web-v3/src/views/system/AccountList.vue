<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="名称">
          <el-input v-model="queryParam.name" placeholder="请输入名称查询" clearable />
        </el-form-item>
        <el-form-item label="编号">
          <el-input v-model="queryParam.serialNo" placeholder="请输入编号查询" clearable />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="queryParam.remark" placeholder="请输入备注查询" clearable />
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
        <el-popconfirm v-if="btnEnableList.indexOf('1') > -1" title="确定设为默认吗?" @confirm="handleSetDefault(record.id)">
          <template #reference>
            <el-button link type="primary">设为默认</el-button>
          </template>
        </el-popconfirm>
        <el-button link type="primary" @click="handleEdit(record)">编辑</el-button>
        <el-popconfirm v-if="btnEnableList.indexOf('1') > -1" title="确定删除吗?" @confirm="handleDelete(record.id)">
          <template #reference>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <!-- 状态列 -->
      <template #customRenderEnabledFlag="{ text }">
        <el-tag v-if="text" type="success">启用</el-tag>
        <el-tag v-else type="warning">禁用</el-tag>
      </template>
      <!-- 是否默认列 -->
      <template #customRenderFlag="{ text }">
        <el-tag v-if="text" type="success">是</el-tag>
        <el-tag v-else type="warning">否</el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <account-modal ref="modalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import AccountModal from './components/AccountModal.vue'
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
    list: '/account/list',
    delete: '/account/delete',
    deleteBatch: '/account/deleteBatch',
    batchSetStatusUrl: '/account/batchSetStatus',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 150, customRender: 'action' },
    { title: '名称', dataIndex: 'name', width: 100, align: 'left' },
    { title: '编号', dataIndex: 'serialNo', width: 150, align: 'left' },
    { title: '期初金额', dataIndex: 'initialAmount', width: 100, align: 'left' },
    { title: '备注', dataIndex: 'remark', width: 200, align: 'left' },
    { title: '排序', dataIndex: 'sort', width: 60, align: 'left' },
    { title: '状态', dataIndex: 'enabled', width: 60, align: 'center', customRender: 'customRenderEnabledFlag' },
    { title: '是否默认', dataIndex: 'isDefault', width: 80, align: 'center', customRender: 'customRenderFlag' },
  ],
  urlPath: '/system/account',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

/** 设为默认 */
function handleSetDefault(id: string | number) {
  postAction('/account/updateIsDefault', { id }).then((res: any) => {
    if (res.code === 200) {
      loadData()
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  })
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
