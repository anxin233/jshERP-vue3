<script setup lang="ts">
/**
 * Ellipsis - 文本省略组件
 * 超过指定长度用 el-tooltip 显示全文，不超过则直接显示
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    content?: string
    length?: number
  }>(),
  {
    content: '',
    length: 25
  }
)

/** 是否需要省略 */
const isEllipsis = computed(() => {
  return props.content.length > props.length
})

/** 显示的文本 */
const displayText = computed(() => {
  if (isEllipsis.value) {
    return props.content.substring(0, props.length) + '...'
  }
  return props.content
})
</script>

<template>
  <el-tooltip
    v-if="isEllipsis"
    :content="content"
    placement="top"
    :show-after="300"
  >
    <span class="ellipsis-text">{{ displayText }}</span>
  </el-tooltip>
  <span v-else class="ellipsis-text">{{ content }}</span>
</template>

<style scoped>
.ellipsis-text {
  cursor: default;
  word-break: break-all;
}
</style>
