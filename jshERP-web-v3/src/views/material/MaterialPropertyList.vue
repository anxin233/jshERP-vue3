<template>
  <el-card shadow="never">
    <!-- 表格 -->
    <pro-table
      ref="tableRef"
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

    <!-- 弹窗组件 -->
    <material-property-modal ref="modalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ProTable from '@/components/table/ProTable.vue'
import MaterialPropertyModal from './components/MaterialPropertyModal.vue'
import { useList } from '@/composables/useList'
import { getAction } from '@/api/http'
import { setStore } from '@/utils/storage'

const modalFormRef = ref()

const {
  loading,
  dataSource,
  columns,
  ipagination,
  queryParam,
  btnEnableList,
  getQueryParams,
  handleTableChange,
  onClearSelected,
  modalFormOk: baseModalFormOk,
} = useList({
  url: {
    list: '/materialProperty/list',
    delete: '/materialProperty/delete',
    deleteBatch: '/materialProperty/deleteBatch',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', width: 100, align: 'center', customRender: 'action' },
    { title: '名称', dataIndex: 'nativeName', width: 100 },
    { title: '别名', dataIndex: 'anotherName', width: 100 },
  ],
  queryParam: {
    name: '',
    type: '',
  },
  urlPath: '/material/materialProperty',
  disableCreatedLoad: true,
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

/** 7 天过期时间（秒） */
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60

/** 自定义加载数据，将属性列表存入 localStorage */
async function loadData(arg?: number) {
  if (arg === 1) {
    ipagination.current = 1
  }
  const params = getQueryParams()
  loading.value = true
  try {
    const res = await getAction('/materialProperty/list', params)
    if (res.code === 200) {
      dataSource.value = res.data.rows
      ipagination.total = res.data.total
      // 存储属性列表到 localStorage，7 天过期
      setStore('materialPropertyList', res.data.rows, SEVEN_DAYS_SECONDS)
    } else if (res.code === 510) {
      ElMessage.warning(res.data)
    } else {
      ElMessage.warning(res.data?.message || '数据加载失败')
    }
  } catch (err) {
    console.error('[MaterialPropertyList] loadData error:', err)
  } finally {
    loading.value = false
    onClearSelected()
  }
}

/** 弹窗保存成功后刷新列表 */
function modalFormOk() {
  loadData()
}

function handleEdit(record: any) {
  modalFormRef.value?.edit(record)
  modalFormRef.value.title = '编辑'
  modalFormRef.value.disableSubmit = false
  if (btnEnableList.value.indexOf('1') === -1) {
    modalFormRef.value.isReadOnly = true
  }
}

// 初始加载
loadData()
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
