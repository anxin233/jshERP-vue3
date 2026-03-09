<script setup lang="ts">
/**
 * CategorySelect - 分类树选择组件
 * 用于商品分类的树形选择，基于 el-tree-select
 * API: GET /materialCategory/getMaterialCategoryTree
 */
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { queryMaterialCategoryTreeList } from '@/api/material'

interface TreeNode {
  id: string | number
  text: string
  children?: TreeNode[]
}

interface TreeSelectNode {
  value: string | number
  label: string
  children?: TreeSelectNode[]
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: '请选择分类',
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const treeData = ref<TreeSelectNode[]>([])
const loading = ref(false)

/** 将后端树结构转换为 el-tree-select 所需格式 */
function transformTree(nodes: TreeNode[]): TreeSelectNode[] {
  return nodes.map((node) => ({
    value: node.id,
    label: node.text,
    children: node.children?.length ? transformTree(node.children) : undefined
  }))
}

/** 加载分类树数据 */
async function loadTreeData() {
  loading.value = true
  try {
    const res = await queryMaterialCategoryTreeList()
    if (res && res.code === 200) {
      treeData.value = transformTree(res.data || [])
    }
  } catch {
    ElMessage.error('获取分类树失败')
  } finally {
    loading.value = false
  }
}

function handleChange(val: string | number | null) {
  emit('update:modelValue', val)
}

onMounted(() => {
  loadTreeData()
})
</script>

<template>
  <el-tree-select
    :model-value="modelValue"
    :data="treeData"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    filterable
    clearable
    check-strictly
    :render-after-expand="false"
    :props="{ value: 'value', label: 'label', children: 'children' }"
    @update:model-value="handleChange"
  />
</template>

<style scoped>
/* 使用 Element Plus 默认样式 */
</style>
