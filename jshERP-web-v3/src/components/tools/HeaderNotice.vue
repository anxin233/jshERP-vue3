<script setup lang="ts">
/**
 * HeaderNotice - Notification bell placeholder
 * Migrated from Vue 2 components/tools/HeaderNotice.vue
 * Phase 2: simple placeholder, full implementation in later phase
 */
import { Bell } from '@element-plus/icons-vue'
</script>

<template>
  <el-badge :value="0" :hidden="true" class="header-notice">
    <el-icon :size="18"><Bell /></el-icon>
  </el-badge>
</template>

<style scoped>
.header-notice {
  cursor: pointer;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
}
</style>
