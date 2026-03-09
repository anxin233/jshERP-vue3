<template>
  <el-row :gutter="10">
    <!-- 左侧：类别树 -->
    <el-col :md="12" :sm="24">
      <el-card shadow="never">
        <!-- 按钮区域 -->
        <div class="tree-operator">
          <el-button v-if="btnEnableList.indexOf('1') > -1" type="primary" @click="handleAdd">添加类别</el-button>
          <el-button v-if="btnEnableList.indexOf('1') > -1" @click="handleBatchDel">批量删除</el-button>
          <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        </div>

        <div class="tree-container">
          <!-- 当前选择提示 -->
          <el-alert type="info" :closable="false" show-icon>
            <template #title>
              当前选择：<span v-if="currSelected.title">{{ getCurrSelectedTitle() }}</span>
              <el-button v-if="currSelected.title" link type="primary" style="margin-left: 10px" @click="onClearSelected">取消选择</el-button>
            </template>
          </el-alert>

          <!-- 类别树 -->
          <div class="tree-wrapper">
            <el-tree
              ref="treeRef"
              :data="categoryTree"
              :props="treeProps"
              node-key="key"
              show-checkbox
              :check-strictly="checkStrictly"
              :default-expanded-keys="iExpandedKeys"
              highlight-current
              :expand-on-click-node="false"
              @node-click="onSelect"
              @check="onCheck"
            />
          </div>
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

    <!-- 右侧：类别表单 -->
    <el-col :md="12" :sm="24">
      <el-card v-if="selectedKeys.length > 0" shadow="never">
        <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="100px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="formModel.name" placeholder="请输入名称" />
          </el-form-item>
          <el-form-item label="编号" prop="serialNo">
            <el-input v-model="formModel.serialNo" placeholder="请输入编号" />
          </el-form-item>
          <el-form-item label="上级目录" prop="parentId">
            <el-tree-select
              v-model="formModel.parentId"
              :data="treeSelectData"
              :props="{ value: 'value', label: 'label', children: 'children' }"
              clearable
              check-strictly
              :render-after-expand="false"
              placeholder="请选择上级目录"
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
        <div class="form-btn">
          <el-button :icon="Refresh" @click="emptyCurrForm">重置</el-button>
          <el-button type="primary" :icon="Check" @click="submitCurrForm">保存</el-button>
        </div>
      </el-card>
      <el-card v-else shadow="never">
        <el-empty description="请先选择一个类别!" />
      </el-card>
    </el-col>

    <!-- 新增类别弹窗 -->
    <material-category-modal ref="materialCategoryModalRef" @ok="loadTree" />
  </el-row>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Refresh, ArrowUp, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { ElTree } from 'element-plus'
import MaterialCategoryModal from './components/MaterialCategoryModal.vue'
import {
  queryMaterialCategoryTreeList,
  queryMaterialCategoryById,
  checkMaterialCategory,
} from '@/api/material'
import { putAction, deleteAction } from '@/api/http'
import { useList } from '@/composables/useList'

// useList -- 只使用按钮权限功能
const { btnEnableList } = useList({
  url: { list: '' },
  urlPath: '/material/material_category',
  disableCreatedLoad: true,
})

// ==================== 状态 ====================
const treeRef = ref<InstanceType<typeof ElTree>>()
const formRef = ref<FormInstance>()
const materialCategoryModalRef = ref()

const treeLoading = ref(false)
const categoryTree = ref<any[]>([])
const treeSelectData = ref<any[]>([])
const iExpandedKeys = ref<string[]>([])
const allTreeKeys = ref<string[]>([])
const checkedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const currSelected = ref<any>({})
const checkStrictly = ref(true)
const model = ref<any>({})

const treeProps = {
  label: 'title',
  children: 'children',
}

const formModel = reactive<Record<string, any>>({
  name: '',
  serialNo: '',
  parentId: undefined,
  sort: '',
  remark: '',
})

const url = {
  delete: '/materialCategory/delete',
  edit: '/materialCategory/update',
  deleteBatch: '/materialCategory/deleteBatch',
}

// ==================== 表单验证 ====================
const validateName = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入名称!'))
    return
  }
  const params = {
    name: value,
    parentId: formModel.parentId,
    id: model.value.id ? model.value.id : 0,
  }
  checkMaterialCategory(params).then((res: any) => {
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('名称已经存在'))
      }
    } else {
      callback(new Error(res.data))
    }
  })
}

const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { validator: validateName, trigger: 'blur' },
  ],
  serialNo: [{ required: true, message: '请输入编号!', trigger: 'blur' }],
})

// ==================== 树形接口 ====================

interface TreeSelectNode {
  value: string | number
  label: string
  children?: TreeSelectNode[]
}

/** 将树节点转换为 el-tree-select 格式 */
function transformToSelectTree(nodes: any[]): TreeSelectNode[] {
  return nodes.map((node) => ({
    value: node.key || node.id,
    label: node.title || node.text,
    children: node.children?.length ? transformToSelectTree(node.children) : undefined,
  }))
}

// ==================== 方法 ====================

/** 加载类别树 */
function loadTree() {
  treeSelectData.value = []
  categoryTree.value = []
  const params = { id: '' }
  queryMaterialCategoryTreeList(params).then((res: any) => {
    if (res) {
      const data = res.data || res
      allTreeKeys.value = []
      for (let i = 0; i < data.length; i++) {
        const temp = data[i]
        categoryTree.value.push(temp)
        setExpandedKeys(temp)
        getAllKeys(temp)
      }
      treeLoading.value = false
    }
  })
}

/** 设置展开的 key */
function setExpandedKeys(node: any) {
  if (node.children && node.children.length > 0) {
    iExpandedKeys.value.push(node.key)
    for (let a = 0; a < node.children.length; a++) {
      setExpandedKeys(node.children[a])
    }
  }
}

/** 获取所有节点 key */
function getAllKeys(node: any) {
  allTreeKeys.value.push(node.key)
  if (node.children && node.children.length > 0) {
    for (let a = 0; a < node.children.length; a++) {
      getAllKeys(node.children[a])
    }
  }
}

/** 刷新 */
function refresh() {
  treeLoading.value = true
  loadTree()
}

/** 树节点点击 */
function onSelect(nodeData: any) {
  const params = { id: nodeData.id }
  getTreeByParams(params)
  queryMaterialCategoryById(params).then((res: any) => {
    if (res && res.code === 200) {
      if (res.data) {
        nodeData.name = res.data.name
        nodeData.serialNo = res.data.serialNo
        nodeData.parentId = res.data.parentId
        nodeData.sort = res.data.sort
        nodeData.remark = res.data.remark
        currSelected.value = { ...nodeData }
        model.value = currSelected.value
        selectedKeys.value = [nodeData.key]
        nextTick(() => {
          formModel.name = nodeData.name || ''
          formModel.serialNo = nodeData.serialNo || ''
          formModel.parentId = nodeData.parentId
          formModel.sort = nodeData.sort || ''
          formModel.remark = nodeData.remark || ''
          formRef.value?.clearValidate()
        })
      }
    }
  })
}

/** 根据类别 id 加载类别树 (用于右侧上级目录选择) */
function getTreeByParams(params: any) {
  queryMaterialCategoryTreeList(params).then((res: any) => {
    if (res) {
      const data = res.data || res
      treeSelectData.value = transformToSelectTree(data)
    }
  })
}

/** 复选框选中事件 */
function onCheck(_nodeData: any, checkInfo: any) {
  if (checkStrictly.value) {
    checkedKeys.value = checkInfo.checkedKeys
  } else {
    checkedKeys.value = checkInfo.checkedKeys
  }
}

/** 获取当前选择的标题 */
function getCurrSelectedTitle(): string {
  return currSelected.value.title || ''
}

/** 清空选择 */
function onClearSelected() {
  checkedKeys.value = []
  currSelected.value = {}
  selectedKeys.value = []
  formRef.value?.resetFields()
  treeRef.value?.setCheckedKeys([])
  // 清除 current 高亮
  treeRef.value?.setCurrentKey(undefined as any)
}

/** 提交右侧表单 */
function submitCurrForm() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    if (!currSelected.value.id) {
      ElMessage.warning('请点击选择要修改类别!')
      return
    }
    const formData = { ...currSelected.value, ...formModel }
    putAction(url.edit, formData).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success('保存成功!')
        loadTree()
        const params = { id: formData.id }
        getTreeByParams(params)
      } else {
        ElMessage.warning(res.data?.message || '保存失败')
      }
    })
  })
}

/** 重置表单 */
function emptyCurrForm() {
  formRef.value?.resetFields()
}

/** 新增类别 */
function handleAdd() {
  materialCategoryModalRef.value?.add()
  materialCategoryModalRef.value.title = '新增'
}

/** 批量删除 */
function handleBatchDel() {
  const keys = treeRef.value?.getCheckedKeys(false) as string[] || []
  if (keys.length <= 0) {
    ElMessage.warning('请选择一条记录！')
    return
  }
  const ids = keys.join(',')
  ElMessageBox.confirm(
    '确定要删除所选中的 ' + keys.length + ' 条数据吗?',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(async () => {
    const res = await deleteAction(url.deleteBatch, { ids })
    if (res.code === 200) {
      ElMessage.success(res.data?.message || '删除成功')
      loadTree()
      onClearSelected()
    } else {
      ElMessage.warning(res.data?.message || '删除失败')
    }
  }).catch(() => {})
}

// ==================== 树操作 ====================

/** 展开所有 */
function expandAll() {
  // el-tree 没有直接的 expandAll API，通过遍历 key 展开
  iExpandedKeys.value = [...allTreeKeys.value]
  // 强制更新需要重新渲染树
  const tempData = categoryTree.value
  categoryTree.value = []
  nextTick(() => {
    categoryTree.value = tempData
  })
}

/** 折叠所有 */
function closeAll() {
  iExpandedKeys.value = []
  const tempData = categoryTree.value
  categoryTree.value = []
  nextTick(() => {
    categoryTree.value = tempData
  })
}

/** 全部勾选 */
function checkAll() {
  checkStrictly.value = false
  nextTick(() => {
    treeRef.value?.setCheckedKeys(allTreeKeys.value)
  })
}

/** 取消全选 */
function cancelCheckAll() {
  treeRef.value?.setCheckedKeys([])
  checkedKeys.value = []
}

/** 切换父子勾选模式 */
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
.tree-operator {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tree-container {
  background: #fff;
  padding-left: 16px;
  margin-top: 5px;
}

.tree-wrapper {
  margin-top: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.form-btn {
  width: 100%;
  text-align: center;

  .el-button {
    margin: 0 5px;
  }
}

.drawer-bottom-button {
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: left;
  background: #fff;
  border-radius: 0 0 2px 2px;
  margin-top: 8px;
}
</style>
