<script setup lang="ts">
/**
 * TabLayout - 多页签布局组件（最外层布局）
 * 从 Vue 2 TabLayout.vue 迁移，使用 Vue 3 Composition API + Element Plus 重写
 *
 * 架构与原 Vue 2 一致：
 *   TabLayout = BasicLayout/GlobalLayout (侧边栏 + 头部) 包裹 (多页签 tabs + keep-alive content)
 *
 * 原 Vue 2: <global-layout> ... <a-tabs> + <keep-alive><router-view/></keep-alive> ... </global-layout>
 * Vue 3:    <BasicLayout> ... <el-tabs> + <keep-alive><router-view/></keep-alive> ... </BasicLayout>
 *
 * 功能特性:
 * - BasicLayout 提供侧边栏菜单 + 头部（GlobalLayout 等价物）
 * - el-tabs 多页签导航
 * - keep-alive 页面缓存
 * - 右键菜单（关闭左侧/右侧/其它）
 * - 路由变化自动添加页签
 * - 移动端自动切换为单页模式
 */
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '@/stores/tab'
import { useAppStore } from '@/stores/app'
import BasicLayout from '@/components/layouts/BasicLayout.vue'

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()
const appStore = useAppStore()

// 是否启用多页签模式（移动端自动禁用）
const multipage = computed(() => {
  if (appStore.device === 'mobile') {
    return false
  }
  return appStore.multipage
})

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({ left: '0px', top: '0px' })
const contextMenuTargetPath = ref('')

// 监听路由变化，自动添加页签
watch(
  () => route.path,
  (newPath) => {
    if (newPath && route.meta?.title) {
      tabStore.addTab({
        path: route.path,
        fullPath: route.fullPath,
        name: route.name as string,
        meta: route.meta as any,
      })
    }
  },
  { immediate: true }
)

// 页签点击处理
function handleTabClick(tab: any) {
  const page = tabStore.pageList.find((p) => p.path === tab.paneName)
  if (page) {
    router.push(page.fullPath || page.path)
  }
}

// 页签关闭处理
function handleTabRemove(path: string) {
  // 防止关闭最后一个页签
  if (tabStore.pageList.length <= 1) {
    return
  }
  const newPath = tabStore.removeTab(path)
  if (newPath && newPath !== route.path) {
    router.push(newPath)
  }
}

// 右键菜单相关处理
function onContextMenu(e: MouseEvent) {
  // 从点击元素中查找页签的 path
  const tabEl = (e.target as HTMLElement).closest('.el-tabs__item')
  if (!tabEl) return

  const tabId = tabEl.getAttribute('id')
  if (!tabId) return

  // 从 tab id 中提取 pane name（格式: tab-{paneName}）
  const paneName = tabId.replace(/^tab-/, '')
  if (!paneName) return

  e.preventDefault()
  contextMenuTargetPath.value = paneName
  contextMenuStyle.value = {
    left: `${e.clientX}px`,
    top: `${e.clientY}px`,
  }
  contextMenuVisible.value = true

  // 点击其他区域关闭右键菜单
  document.addEventListener('click', closeContextMenu, { once: true })
}

function closeContextMenu() {
  contextMenuVisible.value = false
}

function closeLeft() {
  tabStore.closeLeft(contextMenuTargetPath.value)
  if (!tabStore.pageList.find((p) => p.path === route.path)) {
    router.push(tabStore.activePage)
  }
  closeContextMenu()
}

function closeRight() {
  tabStore.closeRight(contextMenuTargetPath.value)
  if (!tabStore.pageList.find((p) => p.path === route.path)) {
    router.push(tabStore.activePage)
  }
  closeContextMenu()
}

function closeOthers() {
  tabStore.closeOthers(contextMenuTargetPath.value)
  if (route.path !== contextMenuTargetPath.value) {
    router.push(contextMenuTargetPath.value)
  }
  closeContextMenu()
}
</script>

<template>
  <!-- BasicLayout 提供侧边栏 + 头部（等价于原 Vue 2 的 GlobalLayout） -->
  <BasicLayout>
    <!-- 多页签模式 -->
    <template v-if="multipage">
      <!-- 页签栏 -->
      <div class="tab-layout-tabs" @contextmenu="onContextMenu">
        <el-tabs
          v-model="tabStore.activePage"
          type="card"
          closable
          @tab-click="handleTabClick"
          @tab-remove="handleTabRemove"
        >
          <el-tab-pane
            v-for="page in tabStore.pageList"
            :key="page.path"
            :label="page.meta?.title || page.name"
            :name="page.path"
            :closable="tabStore.pageList.length > 1"
          />
        </el-tabs>
      </div>

      <!-- 右键菜单 -->
      <teleport to="body">
        <div
          v-show="contextMenuVisible"
          class="tab-context-menu"
          :style="contextMenuStyle"
        >
          <ul>
            <li @click="closeLeft">关闭左侧</li>
            <li @click="closeRight">关闭右侧</li>
            <li @click="closeOthers">关闭其它</li>
          </ul>
        </div>
      </teleport>

      <!-- 页面内容区（keep-alive 缓存） -->
      <div class="tab-layout-content">
        <router-view v-slot="{ Component }">
          <keep-alive :include="tabStore.cachedComponents">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </template>

    <!-- 单页模式（移动端或关闭多页签） -->
    <template v-else>
      <div class="tab-layout-content single-page">
        <router-view />
      </div>
    </template>
  </BasicLayout>
</template>

<style lang="scss" scoped>
.tab-layout-tabs {
  background-color: #fff;
  border-bottom: 1px solid #d9d9d9;
  padding: 0 16px;
  flex-shrink: 0;

  :deep(.el-tabs) {
    .el-tabs__header {
      margin: 0;
      border-bottom: none;
    }

    .el-tabs__item {
      height: 36px;
      line-height: 36px;
      font-size: 13px;
      padding: 0 16px !important;
      border: none !important;
      border-bottom: 2px solid transparent !important;

      &.is-active {
        border-bottom-color: var(--el-color-primary) !important;
      }

      .el-icon-close {
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .el-icon-close {
        opacity: 1;
      }
    }

    .el-tabs__nav-next,
    .el-tabs__nav-prev {
      line-height: 36px;
    }
  }
}

.tab-layout-content {
  flex: 1;
  overflow: auto;
  margin: 4px 4px 0;

  &.single-page {
    margin: 0;
  }
}
</style>

<style lang="scss">
.tab-context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  padding: 4px 0;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      padding: 6px 16px;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      color: #333;

      &:hover {
        background-color: #ecf5ff;
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
