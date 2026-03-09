<script setup lang="ts">
/**
 * GlobalLayout - 主框架布局组件
 * 从 Vue 2 components/page/GlobalLayout.vue 迁移
 * 使用 Element Plus 容器布局，支持侧边栏折叠和移动端 drawer 模式
 */
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'
import { useDevice } from '@/composables/useDevice'
import Logo from '@/components/page/Logo.vue'
import GlobalHeader from '@/components/page/GlobalHeader.vue'
import SideMenu from '@/components/menu/SideMenu.vue'

const appStore = useAppStore()
const permissionStore = usePermissionStore()
const { isMobile } = useDevice()

/** 侧边栏状态 */
const sidebar = computed(() => appStore.sidebar)

/** 侧边栏宽度 */
const sidebarWidth = computed(() => {
  return sidebar.value.opened ? '208px' : '48px'
})

/** 菜单数据：从根路由的 children 中获取（排除首页） */
const menus = computed(() => {
  const routes = permissionStore.addRouters
  // 新的路由结构：只有一个根路由 '/'，所有业务路由都在它的 children 里
  // 找到根路由，获取它的 children（排除首页路由）
  const rootRoute = routes.find((r: any) => r.path === '/')
  if (rootRoute && rootRoute.children) {
    // 过滤掉首页路由，只保留菜单路由
    return rootRoute.children.filter((r: any) => r.path !== '/dashboard/analysis') as any[]
  }
  return []
})

/** 移动端 drawer 关闭回调 */
function handleDrawerClose() {
  appStore.setSidebar(false)
}
</script>

<template>
  <el-container class="layout-container" :class="{ mobile: isMobile }">
    <!-- 移动端：侧边栏使用 drawer 模式 -->
    <el-drawer
      v-if="isMobile"
      :model-value="sidebar.opened"
      direction="ltr"
      :with-header="false"
      :size="208"
      :show-close="false"
      :z-index="999"
      class="layout-drawer"
      @close="handleDrawerClose"
    >
      <div class="layout-aside-inner">
        <Logo :collapsed="false" />
        <SideMenu :collapsed="false" :menus="menus" />
      </div>
    </el-drawer>

    <!-- 桌面端：固定侧边栏 -->
    <el-aside
      v-else
      :width="sidebarWidth"
      class="layout-aside"
      :class="{ 'is-collapsed': !sidebar.opened }"
    >
      <Logo :collapsed="!sidebar.opened" />
      <SideMenu :collapsed="!sidebar.opened" :menus="menus" />
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="layout-main-container">
      <!-- 顶部 Header -->
      <el-header class="layout-header" height="48px">
        <GlobalHeader />
      </el-header>

      <!-- 主内容区：默认显示 router-view，TabLayout 通过 slot 替换为 tabs + keep-alive -->
      <el-main class="layout-main">
        <slot>
          <router-view />
        </slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  min-height: 100vh;
  overflow: hidden;
}

// 侧边栏
.layout-aside {
  background-color: #001529;
  overflow: hidden;
  transition: width 0.2s ease;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;

  &.is-collapsed {
    :deep(.el-menu) {
      width: 48px;
    }
  }
}

// drawer 模式的侧边栏内容
.layout-aside-inner {
  height: 100%;
  background-color: #001529;
  display: flex;
  flex-direction: column;
}

// 主内容容器
.layout-main-container {
  flex-direction: column;
  overflow: hidden;
}

// 头部
.layout-header {
  padding: 0;
  position: relative;
  z-index: 9;
}

// 主内容区
.layout-main {
  background-color: #f0f2f5;
  overflow: auto;
  padding: 0;
}

// 移动端适配
.layout-container.mobile {
  .layout-header {
    padding: 0 12px;
  }

  .layout-main {
    margin: 0;
  }
}
</style>

<!-- drawer 全局样式 -->
<style lang="scss">
.layout-drawer {
  .el-drawer__body {
    padding: 0;
  }
}
</style>
