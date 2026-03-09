<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <div v-loading="confirmLoading">
      <el-tree
        ref="treeRef"
        :data="depotTreeData"
        :props="treeProps"
        show-checkbox
        node-key="key"
        :default-expanded-keys="expandedKeys"
        :default-checked-keys="checkedKeys"
        check-strictly
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
import type { ElTree } from 'element-plus'
import { addUserBusiness, editUserBusiness, checkUserBusiness, findUserDepot } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const roleId = ref(0)

const treeRef = ref<InstanceType<typeof ElTree>>()
const depotTreeData = ref<any[]>([])
const checkedKeys = ref<(string | number)[]>([])
const expandedKeys = ref<(string | number)[]>([])

const treeProps = {
  children: 'children',
  label: 'title',
}

/** 打开弹窗并加载仓库树 */
function edit(record: any) {
  visible.value = true
  roleId.value = record.id
  checkedKeys.value = []
  expandedKeys.value = []
  depotTreeData.value = []
  nextTick(() => {
    treeRef.value?.setCheckedKeys([])
    loadTree(record.id)
  })
}

/** 加载仓库树数据 */
function loadTree(id: number | string) {
  findUserDepot({ UBType: 'UserDepot', UBKeyId: id }).then((res: any) => {
    if (res) {
      const keys: (string | number)[] = []
      const expanded: (string | number)[] = []
      for (let i = 0; i < res.length; i++) {
        const temp = res[i]
        collectCheckedKeys(temp, keys)
        collectExpandedKeys(temp, expanded)
      }
      depotTreeData.value = res
      expandedKeys.value = expanded
      nextTick(() => {
        treeRef.value?.setCheckedKeys(keys)
        checkedKeys.value = keys
      })
    }
  })
}

/** 递归收集已勾选节点的 key */
function collectCheckedKeys(node: any, keys: (string | number)[]) {
  if (node.checked === true) {
    keys.push(node.key)
  }
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      collectCheckedKeys(child, keys)
    }
  }
}

/** 递归收集需展开节点的 key */
function collectExpandedKeys(node: any, keys: (string | number)[]) {
  if (node.children && node.children.length > 0) {
    keys.push(node.key)
    for (const child of node.children) {
      collectExpandedKeys(child, keys)
    }
  }
}

/** 勾选回调 */
function onCheck() {
  checkedKeys.value = treeRef.value?.getCheckedKeys(false) as (string | number)[] || []
}

/** 保存 */
async function handleOk() {
  confirmLoading.value = true
  try {
    const formData: Record<string, any> = {
      type: 'UserDepot',
      keyId: roleId.value,
      value: checkedKeys.value,
    }
    const checkRes = await checkUserBusiness({ type: 'UserDepot', keyId: roleId.value })
    let res: any
    if (checkRes.data && checkRes.data.id) {
      formData.id = checkRes.data.id
      res = await editUserBusiness(formData)
    } else {
      res = await addUserBusiness(formData)
    }
    if (res.code === 200) {
      emit('ok')
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  } finally {
    confirmLoading.value = false
    close()
  }
}

function handleCancel() {
  close()
}

function close() {
  visible.value = false
}

defineExpose({ edit, title })
</script>
