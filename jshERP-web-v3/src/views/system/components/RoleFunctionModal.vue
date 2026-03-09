<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleCancel"
  >
    <div v-loading="confirmLoading">
      <!-- 树操作按钮 -->
      <div class="tree-operation-bar">
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
      <!-- 功能树 -->
      <el-tree
        ref="treeRef"
        :data="roleFunctionTree"
        :props="treeProps"
        show-checkbox
        node-key="key"
        :default-expanded-keys="iExpandedKeys"
        :check-strictly="checkStrictly"
        @check="onCheck"
      />
    </div>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOk">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowUp } from '@element-plus/icons-vue'
import type { ElTree } from 'element-plus'
import { addUserBusiness, editUserBusiness, checkUserBusiness } from '@/api/system'
import { getAction } from '@/api/http'

const emit = defineEmits<{ ok: [id: string] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const treeRef = ref<InstanceType<typeof ElTree>>()

const roleId = ref<string | number>(0)
const roleFunctionTree = ref<any[]>([])
const iExpandedKeys = ref<(string | number)[]>([])
const checkedKeys = ref<(string | number)[]>([])
const allTreeKeys = ref<(string | number)[]>([])
const checkStrictly = ref(false)

/** el-tree 的 props 配置 */
const treeProps = {
  label: 'title',
  children: 'children',
}

function edit(record: any) {
  visible.value = true
  roleId.value = record.id
  checkedKeys.value = []
  iExpandedKeys.value = []
  allTreeKeys.value = []
  roleFunctionTree.value = []
  loadTree(record.id)
}

function close() {
  visible.value = false
}

function handleCancel() {
  close()
}

async function handleOk() {
  confirmLoading.value = true
  try {
    const currentCheckedKeys = treeRef.value?.getCheckedKeys(false) || []
    const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
    const allChecked = [...currentCheckedKeys, ...halfCheckedKeys]

    const formData: Record<string, any> = {
      type: 'RoleFunctions',
      keyId: roleId.value,
      value: allChecked.join(','),
    }

    const checkRes: any = await checkUserBusiness({ type: 'RoleFunctions', keyId: roleId.value })
    let res: any
    if (checkRes.data && checkRes.data.id) {
      formData.id = checkRes.data.id
      res = await editUserBusiness(formData)
    } else {
      res = await addUserBusiness(formData)
    }
    if (res.code === 200) {
      emit('ok', String(roleId.value))
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  } finally {
    confirmLoading.value = false
    close()
  }
}

function loadTree(id: string | number) {
  roleFunctionTree.value = []
  allTreeKeys.value = []
  iExpandedKeys.value = []
  const initCheckedKeys: (string | number)[] = []

  getAction('/function/findRoleFunction', { UBType: 'RoleFunctions', UBKeyId: id }).then((res: any) => {
    if (res) {
      for (let i = 0; i < res.length; i++) {
        const temp = res[i]
        roleFunctionTree.value.push(temp)
        collectExpandedKeys(temp)
        collectAllKeys(temp)
        collectCheckedLeafKeys(temp, initCheckedKeys)
      }
      // 设置选中状态（延迟执行，等树渲染完）
      nextTick(() => {
        initCheckedKeys.forEach((key) => {
          treeRef.value?.setChecked(key, true, false)
        })
      })
    }
  })
}

/** 收集需要展开的节点 key */
function collectExpandedKeys(node: any) {
  if (node.children && node.children.length > 0) {
    iExpandedKeys.value.push(node.key)
    for (const child of node.children) {
      collectExpandedKeys(child)
    }
  }
}

/** 收集所有节点 key */
function collectAllKeys(node: any) {
  allTreeKeys.value.push(node.key)
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      collectAllKeys(child)
    }
  }
}

/**
 * 收集已选中的叶子节点 key
 * el-tree 在非 check-strictly 模式下，只需勾选叶子节点，父节点会自动被选中
 */
function collectCheckedLeafKeys(node: any, keys: (string | number)[]) {
  if (node.checked === true) {
    if (!node.children || node.children.length === 0) {
      keys.push(node.key)
    }
  }
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      collectCheckedLeafKeys(child, keys)
    }
  }
}

function onCheck() {
  // el-tree 自动管理选中状态，无需额外操作
}

function expandAll() {
  // 通过重新设置展开 key 列表实现
  iExpandedKeys.value = [...allTreeKeys.value]
  // el-tree 需要手动展开所有节点
  const allNodes = treeRef.value?.store?.nodesMap
  if (allNodes) {
    Object.values(allNodes).forEach((node: any) => {
      node.expanded = true
    })
  }
}

function closeAll() {
  iExpandedKeys.value = []
  const allNodes = treeRef.value?.store?.nodesMap
  if (allNodes) {
    Object.values(allNodes).forEach((node: any) => {
      node.expanded = false
    })
  }
}

function checkAll() {
  checkStrictly.value = false
  nextTick(() => {
    allTreeKeys.value.forEach((key) => {
      treeRef.value?.setChecked(key, true, false)
    })
  })
}

function cancelCheckAll() {
  allTreeKeys.value.forEach((key) => {
    treeRef.value?.setChecked(key, false, false)
  })
}

function switchCheckStrictly(v: number) {
  if (v === 1) {
    // 收集当前选中的 key
    const currentChecked = treeRef.value?.getCheckedKeys(false) || []
    checkStrictly.value = false
    nextTick(() => {
      // 先取消全选，再重新设置
      allTreeKeys.value.forEach((key) => {
        treeRef.value?.setChecked(key, false, false)
      })
      currentChecked.forEach((key: any) => {
        treeRef.value?.setChecked(key, true, false)
      })
    })
  } else if (v === 2) {
    // 收集当前选中的 key（含半选）
    const currentChecked = treeRef.value?.getCheckedKeys(false) || []
    const halfChecked = treeRef.value?.getHalfCheckedKeys() || []
    const allChecked = [...currentChecked, ...halfChecked]
    checkStrictly.value = true
    nextTick(() => {
      allChecked.forEach((key: any) => {
        treeRef.value?.setChecked(key, true, false)
      })
    })
  }
}

defineExpose({ edit, title })
</script>

<style scoped lang="scss">
.tree-operation-bar {
  margin-bottom: 12px;
}
</style>
