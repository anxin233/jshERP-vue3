<script setup lang="ts">
/**
 * PageView - 页面视图容器
 * 从 Vue 2 components/layouts/PageView.vue 迁移
 * 简化版本：作为 router-view 容器，用于布局组件中的子路由渲染
 *
 * 原 Vue 2 版本使用了 PageLayout + RouteView 的组合
 * Vue 3 版本简化为直接使用 router-view，保留 keep-alive 支持
 */
import { useTabStore } from '@/stores/tab'

const tabStore = useTabStore()
</script>

<template>
  <div class="page-view">
    <router-view v-slot="{ Component }">
      <keep-alive :include="tabStore.cachedComponents">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<style lang="scss" scoped>
.page-view {
  width: 100%;
  height: 100%;
}
</style>
