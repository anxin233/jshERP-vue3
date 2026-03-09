<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="仓库名称">
          <el-input v-model="queryParam.name" placeholder="请输入仓库名称查询" clearable />
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
        <el-button
          v-if="btnEnableList.indexOf('1') > -1 && depotFlag === '1' && quickBtnUser.indexOf('1') > -1"
          link type="primary"
          @click="btnSetUser(record)"
        >
          分配用户
        </el-button>
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
    <depot-modal ref="modalFormRef" @ok="modalFormOk" />
    <depot-user-modal ref="depotUserModalRef" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import DepotModal from './components/DepotModal.vue'
import DepotUserModal from './components/DepotUserModal.vue'
import { useList } from '@/composables/useList'
import { getCurrentSystemConfig } from '@/api/system'
import { postAction } from '@/api/http'
import { getStore } from '@/utils/storage'

const modalFormRef = ref()
const depotUserModalRef = ref()

const depotFlag = ref('0')
const quickBtnUser = ref('')

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
    list: '/depot/list',
    delete: '/depot/delete',
    deleteBatch: '/depot/deleteBatch',
    batchSetStatusUrl: '/depot/batchSetStatus',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 200, customRender: 'action' },
    { title: '仓库名称', dataIndex: 'name', width: 200 },
    { title: '仓库地址', dataIndex: 'address', width: 200 },
    { title: '仓储费', dataIndex: 'warehousing', width: 80 },
    { title: '搬运费', dataIndex: 'truckage', width: 80 },
    { title: '负责人', dataIndex: 'principalName', width: 80 },
    { title: '备注', dataIndex: 'remark', width: 120 },
    { title: '排序', dataIndex: 'sort', width: 60 },
    { title: '状态', dataIndex: 'enabled', width: 60, align: 'center', customRender: 'customRenderEnabledFlag' },
    { title: '是否默认', dataIndex: 'isDefault', width: 80, align: 'center', customRender: 'customRenderFlag' },
  ],
  urlPath: '/system/depot',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

/** 获取系统配置 */
function getSystemConfig() {
  getCurrentSystemConfig().then((res: any) => {
    if (res.code === 200 && res.data) {
      depotFlag.value = res.data.depotFlag
    }
  })
}

/** 加载快捷按钮：分配用户 */
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

/** 设为默认 */
function handleSetDefault(id: string | number) {
  postAction('/depot/updateIsDefault', { id }).then((res: any) => {
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

function btnSetUser(record: any) {
  depotUserModalRef.value?.edit(record)
  depotUserModalRef.value.title = '分配用户给：' + record.name
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
