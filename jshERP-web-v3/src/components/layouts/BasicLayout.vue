<script setup lang="ts">
/**
 * BasicLayout - 主应用布局
 * 从 Vue 2 BasicLayout + GlobalLayout 合并迁移
 * 包裹 GlobalLayout（侧边栏+头部），通过 slot 传递内容区
 *
 * 架构：TabLayout(根路由组件) → BasicLayout → GlobalLayout(侧边栏+头部)
 * TabLayout 的页签和 keep-alive 内容通过 slot 传入 GlobalLayout 的内容区
 */
import GlobalLayout from '@/components/page/GlobalLayout.vue'
</script>

<template>
  <GlobalLayout>
    <slot />
  </GlobalLayout>
</template>
