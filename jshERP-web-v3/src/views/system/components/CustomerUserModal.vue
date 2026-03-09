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
        :data="customerUserTree"
        :props="treeProps"
        show-checkbox
        check-strictly
        node-key="key"
        :default-expanded-keys="iExpandedKeys"
        :default-checked-keys="checkedKeys"
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
const disableSubmit = ref(false)
const treeRef = ref<InstanceType<typeof ElTree>>()

const customerId = ref<number | string>(0)
const customerUserTree = ref<any[]>([])
const checkedKeys = ref<any[]>([])
const iExpandedKeys = ref<any[]>([])
const allTreeKeys = ref<any[]>([])

const treeProps = {
  children: 'children',
  label: 'title',
}

function edit(record: any) {
  visible.value = true
  customerId.value = record.id
  checkedKeys.value = []
  iExpandedKeys.value = []
  customerUserTree.value = []
  nextTick(() => {
    loadTree(record.id)
  })
}

function close() {
  visible.value = false
}

async function handleOk() {
  confirmLoading.value = true
  try {
    const currentCheckedKeys = treeRef.value?.getCheckedKeys(false) || []
    const formData: Record<string, any> = {
      type: 'UserCustomer',
      keyIds: currentCheckedKeys,
      oneValue: customerId.value,
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

function loadTree(id: number | string) {
  confirmLoading.value = true
  getAction('/user/getUserWithChecked?UBType=UserCustomer&UBValue=' + id, {}).then((res: any) => {
    if (res) {
      customerUserTree.value = res
      allTreeKeys.value = []
      const expandKeys: any[] = []
      const checkKeys: any[] = []
      for (let i = 0; i < res.length; i++) {
        setExpandedAndCheckedKeys(res[i], expandKeys, checkKeys)
        getAllKeys(res[i])
      }
      iExpandedKeys.value = expandKeys
      checkedKeys.value = checkKeys
      // 使用 el-tree 设置已选中项
      nextTick(() => {
        treeRef.value?.setCheckedKeys(checkKeys, false)
      })
    }
  }).finally(() => {
    confirmLoading.value = false
  })
}

function setExpandedAndCheckedKeys(node: any, expandKeys: any[], checkKeys: any[]) {
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

function getAllKeys(node: any) {
  allTreeKeys.value.push(node.key)
  if (node.children && node.children.length > 0) {
    for (let a = 0; a < node.children.length; a++) {
      getAllKeys(node.children[a])
    }
  }
}

function onCheck() {
  // el-tree 的选中状态由组件内部管理
}

defineExpose({ edit, title, disableSubmit })
</script>
