<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="角色名称">
          <el-input v-model="queryParam.name" placeholder="请输入角色名称查询" clearable />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="queryParam.description" placeholder="请输入备注查询" clearable />
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
        <el-button link type="primary" @click="handleSetFunction(record)">分配功能</el-button>
        <el-button link type="primary" @click="handleSetPushBtn(record.id, record.name)">分配按钮</el-button>
        <el-button link type="primary" @click="handleEdit(record)">编辑</el-button>
        <el-popconfirm v-if="btnEnableList.indexOf('1') > -1" title="确定删除吗?" @confirm="handleDelete(record.id)">
          <template #reference>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
      <!-- 数据类型 表头带 tooltip -->
      <template #typeTitle="{ text }">
        {{ text }}
      </template>
      <!-- 价格屏蔽 表头带 tooltip -->
      <template #priceLimitTitle="{ text }">
        {{ text }}
      </template>
      <!-- 状态列 -->
      <template #customRenderFlag="{ text }">
        <el-tag v-if="text" type="success">启用</el-tag>
        <el-tag v-if="!text" type="warning">禁用</el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <role-modal ref="modalFormRef" @ok="roleModalFormOk" />
    <role-function-modal ref="roleFunctionModalRef" @ok="roleFunctionModalFormOk" />
    <role-push-btn-modal ref="rolePushBtnModalRef" @ok="modalFormOk" />

    <!-- 角色保存后提示：继续分配功能？ -->
    <el-dialog v-model="roleModalVisible" title="操作提示" width="400px" @close="roleModalVisible = false">
      <p>保存角色已经操作成功！现在继续<b>分配功能</b>吗？</p>
      <template #footer>
        <el-button @click="roleModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleTip">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配功能后提示：继续分配按钮？ -->
    <el-dialog v-model="roleFunctionModalVisible" title="操作提示" width="400px" @close="roleFunctionModalVisible = false">
      <p>分配功能已经操作成功！现在继续<b>分配按钮</b>吗？</p>
      <template #footer>
        <el-button @click="roleFunctionModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleFunctionTip">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import RoleModal from './components/RoleModal.vue'
import RoleFunctionModal from './components/RoleFunctionModal.vue'
import RolePushBtnModal from './components/RolePushBtnModal.vue'
import { useList } from '@/composables/useList'

const modalFormRef = ref()
const roleFunctionModalRef = ref()
const rolePushBtnModalRef = ref()

const roleModalVisible = ref(false)
const roleFunctionModalVisible = ref(false)
const currentRoleId = ref('')
/** 最近一次保存成功的角色记录（用于提示弹窗的后续操作） */
const lastSavedRecord = ref<any>(null)

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
    list: '/role/list',
    delete: '/role/delete',
    deleteBatch: '/role/deleteBatch',
    batchSetStatusUrl: '/role/batchSetStatus',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 220, customRender: 'action' },
    { title: '角色名称', dataIndex: 'name', width: 120 },
    { title: '数据类型', dataIndex: 'type', width: 100 },
    { title: '价格屏蔽', dataIndex: 'priceLimitStr', width: 300 },
    { title: '备注', dataIndex: 'description', width: 150 },
    { title: '排序', dataIndex: 'sort', width: 50 },
    { title: '状态', dataIndex: 'enabled', width: 60, align: 'center', customRender: 'customRenderFlag' },
  ],
  urlPath: '/system/role',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

function handleAdd() {
  modalFormRef.value?.add()
  modalFormRef.value.title = '新增【保存之后请继续分配功能】'
}

function handleEdit(record: any) {
  modalFormRef.value?.edit(record)
  modalFormRef.value.title = '编辑【保存之后请继续分配功能】'
  if (btnEnableList.value.indexOf('1') === -1) {
    modalFormRef.value.isReadOnly = true
  }
}

function handleSetFunction(record: any) {
  roleFunctionModalRef.value?.edit(record)
  roleFunctionModalRef.value.title = '分配功能给：' + record.name + '【分配之后请继续分配按钮】'
}

function handleSetPushBtn(roleId: string, roleName: string) {
  rolePushBtnModalRef.value?.edit(roleId)
  rolePushBtnModalRef.value.title = '分配按钮给：' + roleName
}

/** 角色 Modal 保存成功后 */
function roleModalFormOk(record?: any) {
  loadData()
  lastSavedRecord.value = record
  roleModalVisible.value = true
}

/** 分配功能 Modal 保存成功后 */
function roleFunctionModalFormOk(id: string) {
  loadData()
  roleFunctionModalVisible.value = true
  currentRoleId.value = id
}

/** 角色保存提示弹窗确认：继续分配功能 */
function handleRoleTip() {
  roleModalVisible.value = false
  if (lastSavedRecord.value) {
    handleSetFunction(lastSavedRecord.value)
  }
}

/** 分配功能提示弹窗确认：继续分配按钮 */
function handleRoleFunctionTip() {
  if (currentRoleId.value) {
    roleFunctionModalVisible.value = false
    let roleName = ''
    for (let i = 0; i < dataSource.value.length; i++) {
      if (dataSource.value[i].id === currentRoleId.value) {
        roleName = dataSource.value[i].name
      }
    }
    handleSetPushBtn(currentRoleId.value, roleName)
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
