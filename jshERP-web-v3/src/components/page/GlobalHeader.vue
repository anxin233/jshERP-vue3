<script setup lang="ts">
/**
 * GlobalHeader - Top navigation bar
 * Migrated from Vue 2 components/page/GlobalHeader.vue
 * Uses Element Plus + Composition API
 */
import { Fold, Expand } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import UserMenu from '@/components/tools/UserMenu.vue'
import HeaderNotice from '@/components/tools/HeaderNotice.vue'

const appStore = useAppStore()

function toggleSidebar() {
  appStore.setSidebar(!appStore.sidebar.opened)
}
</script>

<template>
  <div class="global-header">
    <div class="global-header-left">
      <el-icon class="trigger" @click="toggleSidebar">
        <Fold v-if="appStore.sidebar.opened" />
        <Expand v-else />
      </el-icon>
    </div>
    <div class="global-header-right">
      <HeaderNotice />
      <UserMenu />
    </div>
  </div>
</template>

<style scoped>
.global-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;
}

.global-header-left {
  display: flex;
  align-items: center;
}

.global-header-right {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.3s;
  color: #333;
}

.trigger:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
