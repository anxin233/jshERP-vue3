<script setup lang="ts">
/**
 * SvgIcon - SVG 图标组件
 * 支持 Element Plus Icons 和自定义 SVG 图标
 * 使用方式: <SvgIcon name="Edit" /> 或 <SvgIcon name="Search" :size="24" color="red" />
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    color?: string
  }>(),
  {
    size: 16,
    color: ''
  }
)

/** 计算图标尺寸 */
const iconSize = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size}px`
  }
  return props.size
})

/** 计算样式 */
const iconStyle = computed(() => ({
  width: iconSize.value,
  height: iconSize.value,
  fontSize: iconSize.value,
  color: props.color || undefined
}))
</script>

<template>
  <el-icon :style="iconStyle" class="svg-icon">
    <component :is="name" />
  </el-icon>
</template>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
</style>
