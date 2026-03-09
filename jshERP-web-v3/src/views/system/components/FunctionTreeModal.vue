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
        :data="roleFunctionTree"
        :props="treeProps"
        :default-expanded-keys="expandedKeys"
        :highlight-current="true"
        node-key="key"
        @node-click="onNodeClick"
      />
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAction } from '@/api/http'

const emit = defineEmits<{ ok: [number: string | number, name: string] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const roleId = ref<string | number>(0)
const roleFunctionTree = ref<any[]>([])
const expandedKeys = ref<(string | number)[]>([])

/** el-tree 属性映射 */
const treeProps = {
  label: 'title',
  children: 'children',
}

function edit(id?: string | number) {
  visible.value = true
  roleId.value = id || 0
  roleFunctionTree.value = []
  expandedKeys.value = []
  loadTree(id)
}

function close() {
  visible.value = false
}

function handleCancel() {
  close()
}

/** 加载功能树数据 */
function loadTree(id?: string | number) {
  confirmLoading.value = true
  roleFunctionTree.value = []
  expandedKeys.value = []

  getAction('/function/findRoleFunction?UBType=RoleFunctions&UBKeyId=' + (id || ''))
    .then((res: any) => {
      if (res) {
        const keys: (string | number)[] = []
        for (let i = 0; i < res.length; i++) {
          const temp = res[i]
          roleFunctionTree.value.push(temp)
          collectExpandedKeys(temp, keys)
        }
        expandedKeys.value = keys
      }
    })
    .finally(() => {
      confirmLoading.value = false
    })
}

/** 递归收集需要展开的节点 key */
function collectExpandedKeys(node: any, keys: (string | number)[]) {
  if (node.children && node.children.length > 0) {
    keys.push(node.key)
    for (let i = 0; i < node.children.length; i++) {
      collectExpandedKeys(node.children[i], keys)
    }
  }
}

/** 节点点击事件 */
function onNodeClick(data: any) {
  const funId = data.value ?? data.key
  if (funId && funId !== 0) {
    getAction('/function/info', { id: funId }).then((res: any) => {
      if (res && res.code === 200) {
        if (res.data && res.data.info) {
          emit('ok', res.data.info.number, res.data.info.name)
        }
      }
    })
  } else {
    emit('ok', 0, '')
  }
  close()
}

defineExpose({ edit, title })
</script>
