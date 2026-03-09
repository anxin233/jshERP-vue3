<script setup lang="ts">
/**
 * Logo - 侧边栏 Logo 组件
 * 从 Vue 2 components/tools/Logo.vue 迁移
 * 显示系统 Logo 图标和标题文字
 */

defineProps<{
  /** 是否折叠（折叠时仅显示图标） */
  collapsed: boolean
}>()

const title = '管伊佳ERP'
</script>

<template>
  <div class="sider-logo">
    <router-link to="/">
      <svg
        class="logo-icon"
        viewBox="0 0 1024 1024"
        width="28"
        height="28"
        fill="currentColor"
      >
        <path
          d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
        />
        <path
          d="M464 336a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z"
        />
      </svg>
      <h1 v-show="!collapsed" class="logo-title">{{ title }}</h1>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.sider-logo {
  height: 48px;
  line-height: 48px;
  background: #002140;
  overflow: hidden;
  padding: 0 12px;
  display: flex;
  align-items: center;

  a {
    display: flex;
    align-items: center;
    text-decoration: none;
    width: 100%;
    overflow: hidden;
  }

  .logo-icon {
    flex-shrink: 0;
    color: #fff;
  }

  .logo-title {
    color: #fff;
    font-size: 16px;
    margin: 0 0 0 10px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Chinese Quote', -apple-system, BlinkMacSystemFont, 'Segoe UI',
      'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue',
      Helvetica, Arial, sans-serif;
  }
}
</style>
