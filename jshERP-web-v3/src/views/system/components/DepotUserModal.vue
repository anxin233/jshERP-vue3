<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <div v-loading="confirmLoading" style="min-height: 200px;">
      <el-tree
        ref="treeRef"
        :data="depotUserTree"
        :props="treeProps"
        show-checkbox
        node-key="key"
        :default-expanded-keys="iExpandedKeys"
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
import { updateOneValueByKeyIdAndType } from '@/api/system'
import { getAction } from '@/api/http'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const treeRef = ref<InstanceType<typeof ElTree>>()

const depotId = ref<string | number>(0)
const depotUserTree = ref<any[]>([])
const checkedKeys = ref<(string | number)[]>([])
const iExpandedKeys = ref<(string | number)[]>([])

const treeProps = {
  children: 'children',
  label: 'title',
}

function edit(record: any) {
  depotId.value = record.id
  checkedKeys.value = []
  iExpandedKeys.value = []
  depotUserTree.value = []
  visible.value = true
  nextTick(() => {
    loadTree(record.id)
  })
}

function close() {
  visible.value = false
}

/** 加载用户树 */
function loadTree(id: string | number) {
  getAction('/user/getUserWithChecked', { UBType: 'UserDepot', UBValue: id }).then((res: any) => {
    if (res) {
      const treeData: any[] = []
      const expandKeys: (string | number)[] = []
      const checkKeys: (string | number)[] = []

      for (let i = 0; i < res.length; i++) {
        const temp = res[i]
        treeData.push(temp)
        setExpandedAndCheckedKeys(temp, expandKeys, checkKeys)
      }

      depotUserTree.value = treeData
      iExpandedKeys.value = expandKeys
      checkedKeys.value = checkKeys

      // el-tree 需要在数据设置完后手动设置选中
      nextTick(() => {
        treeRef.value?.setCheckedKeys(checkKeys)
      })
    }
  })
}

/** 递归设置展开和选中的 key */
function setExpandedAndCheckedKeys(
  node: any,
  expandKeys: (string | number)[],
  checkKeys: (string | number)[],
) {
  if (node.checked === true) {
    checkKeys.push(node.key)
  }
  if (node.children && node.children.length > 0) {
    expandKeys.push(node.key)
    for (let a = 0; a < node.children.length; a++) {
      setExpandedAndCheckedKeys(node.children[a], expandKeys, checkKeys)
    }
  }
}

function onCheck() {
  // el-tree 会自动管理选中状态，通过 treeRef 获取选中 keys
}

async function handleOk() {
  confirmLoading.value = true
  try {
    const currentCheckedKeys = treeRef.value?.getCheckedKeys(false) || []
    const formData: Record<string, any> = {
      type: 'UserDepot',
      keyIds: currentCheckedKeys,
      oneValue: depotId.value,
    }
    const res: any = await updateOneValueByKeyIdAndType(formData)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      emit('ok')
      close()
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  } finally {
    confirmLoading.value = false
  }
}

function handleCancel() {
  close()
}

defineExpose({ edit, title })
</script>
