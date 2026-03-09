<template>
  <el-row :gutter="10">
    <!-- 左侧：机构树 -->
    <el-col :md="12" :sm="24">
      <el-card shadow="never">
        <!-- 按钮操作区域 -->
        <div class="tree-toolbar">
          <el-button v-if="btnEnableList.indexOf('1') > -1" type="primary" @click="handleAdd">添加机构</el-button>
          <el-button v-if="btnEnableList.indexOf('1') > -1" @click="batchDel">批量删除</el-button>
          <el-button :icon="Refresh" @click="refresh">刷新</el-button>
          <el-button type="info" plain disabled>提示：机构可录入公司部门或门店</el-button>
        </div>

        <div class="tree-content">
          <el-alert type="info" :closable="false" show-icon>
            <template #default>
              当前选择：<span v-if="currSelected.title">{{ getCurrSelectedTitle() }}</span>
              <el-link v-if="currSelected.title" :underline="false" type="primary" style="margin-left: 10px" @click="onClearSelected">取消选择</el-link>
            </template>
          </el-alert>

          <!-- 机构树 -->
          <el-tree
            ref="treeRef"
            :data="departTree"
            :props="treeProps"
            node-key="id"
            show-checkbox
            :check-strictly="checkStrictly"
            :default-expanded-keys="iExpandedKeys"
            highlight-current
            @node-click="onSelect"
            @check="onCheck"
          />
        </div>
      </el-card>

      <!-- 树操作按钮 -->
      <div class="drawer-bottom-button">
        <el-dropdown trigger="click" placement="top">
          <el-button>
            树操作 <el-icon><ArrowUp /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="switchCheckStrictly(1)">父子关联</el-dropdown-item>
              <el-dropdown-item @click="switchCheckStrictly(2)">取消关联</el-dropdown-item>
              <el-dropdown-item @click="checkAll">全部勾选</el-dropdown-item>
              <el-dropdown-item @click="cancelCheckAll">取消全选</el-dropdown-item>
              <el-dropdown-item @click="expandAll">展开所有</el-dropdown-item>
              <el-dropdown-item @click="closeAll">合并所有</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-col>

    <!-- 右侧：编辑表单 -->
    <el-col :md="12" :sm="24">
      <el-card v-if="selectedKeys.length > 0" shadow="never">
        <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="100px">
          <el-form-item label="名称" prop="orgAbr">
            <el-input v-model="formModel.orgAbr" placeholder="请输入名称" />
          </el-form-item>
          <el-form-item label="编号" prop="orgNo">
            <el-input v-model="formModel.orgNo" placeholder="请输入编号" />
          </el-form-item>
          <el-form-item label="上级机构" prop="parentId">
            <el-tree-select
              v-model="formModel.parentId"
              :data="treeSelectData"
              :render-after-expand="false"
              placeholder="请选择上级机构"
              clearable
              check-strictly
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input v-model="formModel.sort" placeholder="请输入排序" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formModel.remark" type="textarea" :rows="2" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <div class="form-btn-area">
          <el-button :icon="RefreshRight" @click="emptyCurrForm">重置</el-button>
          <el-button type="primary" :icon="EditPen" @click="submitCurrForm">保存</el-button>
        </div>
      </el-card>
      <el-card v-else shadow="never">
        <el-empty description="请先选择一个机构!" />
      </el-card>
    </el-col>

    <!-- 新增机构弹窗 -->
    <organization-modal ref="organizationModalRef" @ok="loadTree" />
  </el-row>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Refresh, RefreshRight, EditPen, ArrowUp } from '@element-plus/icons-vue'
import OrganizationModal from './components/OrganizationModal.vue'
import {
  queryOrganizationTreeList,
  queryOrganizationById,
  checkOrganization,
} from '@/api/system'
import { httpAction, deleteAction } from '@/api/http'
import { useList } from '@/composables/useList'

// ==================== useList（仅用于按钮权限） ====================
const { btnEnableList } = useList({
  url: { list: '/organization/list' },
  urlPath: '/system/organization',
  disableCreatedLoad: true,
})

// ==================== State ====================
const treeRef = ref<InstanceType<typeof import('element-plus')['ElTree']>>()
const formRef = ref<FormInstance>()
const organizationModalRef = ref()

const loading = ref(false)
const departTree = ref<any[]>([])
const treeSelectData = ref<any[]>([])
const iExpandedKeys = ref<string[]>([])
const allTreeKeys = ref<string[]>([])
const checkedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const checkStrictly = ref(true)
const currSelected = ref<Record<string, any>>({})
const model = ref<Record<string, any>>({})

const treeProps = {
  children: 'children',
  label: 'title',
}

const url = {
  delete: '/organization/delete',
  edit: '/organization/update',
  deleteBatch: '/organization/deleteBatch',
}

// ==================== 表单 ====================
const formModel = reactive<Record<string, any>>({
  orgAbr: '',
  orgNo: '',
  parentId: undefined,
  sort: '',
  remark: '',
})

const validateName = async (_rule: any, value: string, callback: any) => {
  if (!value) return callback()
  const params = {
    name: value,
    id: model.value.id ? model.value.id : 0,
  }
  try {
    const res = await checkOrganization(params)
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('名称已经存在'))
      }
    } else {
      callback(new Error(res.data))
    }
  } catch {
    callback()
  }
}

const formRules = reactive<FormRules>({
  orgAbr: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { validator: validateName, trigger: 'blur' },
  ],
  orgNo: [{ required: true, message: '请输入编码!', trigger: 'blur' }],
})

// ==================== 树数据加载 ====================
function loadTree() {
  treeSelectData.value = []
  departTree.value = []
  const params = { id: '' }
  queryOrganizationTreeList(params).then((res: any) => {
    if (res) {
      allTreeKeys.value = []
      iExpandedKeys.value = []
      for (let i = 0; i < res.length; i++) {
        const temp = res[i]
        departTree.value.push(temp)
        setExpandedKeys(temp)
        getAllKeys(temp)
      }
      loading.value = false
    }
  })
}

function setExpandedKeys(node: any) {
  if (node.children && node.children.length > 0) {
    iExpandedKeys.value.push(node.id || node.key)
    for (let a = 0; a < node.children.length; a++) {
      setExpandedKeys(node.children[a])
    }
  }
}

function getAllKeys(node: any) {
  allTreeKeys.value.push(node.id || node.key)
  if (node.children && node.children.length > 0) {
    for (let a = 0; a < node.children.length; a++) {
      getAllKeys(node.children[a])
    }
  }
}

function refresh() {
  loading.value = true
  loadTree()
}

// ==================== 根据机构id加载机构树 ====================
function getTreeByParams(params: any) {
  queryOrganizationTreeList(params).then((res: any) => {
    if (res) {
      treeSelectData.value = transformTreeData(res)
    }
  })
}

/** 转换后端树结构为 el-tree-select 格式 */
function transformTreeData(data: any[]): any[] {
  if (!data) return []
  return data.map((item) => ({
    value: item.id || item.key || item.value,
    label: item.title || item.label || item.name,
    children: item.children ? transformTreeData(item.children) : undefined,
  }))
}

// ==================== 树操作 ====================
function onSelect(data: any) {
  const record = { ...data }
  const params = { id: record.id }
  getTreeByParams(params)
  queryOrganizationById(params).then((res: any) => {
    if (res && res.code === 200) {
      if (res.data) {
        record.orgAbr = res.data.orgAbr
        record.orgNo = res.data.orgNo
        record.parentId = res.data.parentId
        record.sort = res.data.sort
        record.remark = res.data.remark
        currSelected.value = { ...record }
        model.value = currSelected.value
        selectedKeys.value = [record.id || record.key]
        setValuesToForm(record)
      }
    }
  })
}

function onCheck(data: any, checkState: any) {
  if (checkStrictly.value) {
    checkedKeys.value = checkState.checkedKeys
  } else {
    checkedKeys.value = checkState.checkedKeys
  }
}

function setValuesToForm(record: any) {
  nextTick(() => {
    formModel.orgAbr = record.orgAbr || ''
    formModel.orgNo = record.orgNo || ''
    formModel.parentId = record.parentId || undefined
    formModel.sort = record.sort || ''
    formModel.remark = record.remark || ''
  })
}

function getCurrSelectedTitle(): string {
  return currSelected.value.title || ''
}

function onClearSelected() {
  checkedKeys.value = []
  currSelected.value = {}
  selectedKeys.value = []
  formRef.value?.resetFields()
  treeRef.value?.setCheckedKeys([])
}

// ==================== 表单操作 ====================
function submitCurrForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (!currSelected.value.id) {
        ElMessage.warning('请点击选择要修改机构!')
        return
      }
      const formData = { ...currSelected.value, ...formModel }
      httpAction(url.edit, formData, 'put').then((res: any) => {
        if (res.code === 200) {
          ElMessage.success('保存成功!')
          loadTree()
          getTreeByParams({ id: formData.id })
        } else {
          ElMessage.error(res.message)
        }
      })
    }
  })
}

function emptyCurrForm() {
  formRef.value?.resetFields()
}

// ==================== 批量删除 ====================
function batchDel() {
  const checked = treeRef.value?.getCheckedKeys(false) as string[]
  if (!checked || checked.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  const ids = checked.join(',')
  ElMessageBox.confirm(
    `确定要删除所选中的 ${checked.length} 条数据?`,
    '确认删除',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(() => {
      deleteAction(url.deleteBatch, { ids }).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success(res.data.message)
          loadTree()
          onClearSelected()
        } else {
          ElMessage.warning(res.data.message)
        }
      })
    })
    .catch(() => {})
}

// ==================== 新增 ====================
function handleAdd() {
  organizationModalRef.value?.add()
}

// ==================== 树操作按钮 ====================
function expandAll() {
  iExpandedKeys.value = [...allTreeKeys.value]
  // el-tree 需要通过重建数据来展开所有节点
  const data = [...departTree.value]
  departTree.value = []
  nextTick(() => {
    departTree.value = data
  })
}

function closeAll() {
  iExpandedKeys.value = []
  const data = [...departTree.value]
  departTree.value = []
  nextTick(() => {
    departTree.value = data
  })
}

function checkAll() {
  checkStrictly.value = false
  nextTick(() => {
    treeRef.value?.setCheckedKeys(allTreeKeys.value)
  })
}

function cancelCheckAll() {
  treeRef.value?.setCheckedKeys([])
  checkedKeys.value = []
}

function switchCheckStrictly(v: number) {
  if (v === 1) {
    checkStrictly.value = false
  } else if (v === 2) {
    checkStrictly.value = true
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadTree()
})
</script>

<style scoped lang="scss">
.tree-toolbar {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tree-content {
  padding-left: 8px;
  margin-top: 5px;

  .el-alert {
    margin-bottom: 12px;
  }
}

.form-btn-area {
  width: 100%;
  text-align: center;

  .el-button {
    margin: 0 5px;
  }
}

.drawer-bottom-button {
  width: 100%;
  border-top: 1px solid var(--el-border-color);
  padding: 10px 16px;
  text-align: left;
  background: var(--el-bg-color);
  border-radius: 0 0 2px 2px;
  margin-top: 8px;
}
</style>
