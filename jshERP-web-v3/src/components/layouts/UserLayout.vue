<script setup lang="ts">
/**
 * UserLayout - Layout wrapper for login/register pages
 * Migrated from Vue 2 layouts/UserLayout.vue
 * Provides centered card layout with brand header and footer
 */
</script>

<template>
  <div class="user-layout-wrapper">
    <div class="user-layout-container">
      <div class="user-layout-header">
        <div class="user-layout-brand">
          <h1 class="user-layout-title">管伊佳ERP</h1>
          <p class="user-layout-subtitle">开源进销存管理系统</p>
        </div>
      </div>
      <div class="user-layout-content">
        <router-view />
      </div>
      <div class="user-layout-footer">
        <div class="user-layout-copyright">
          &copy; 2015-2030 Powered By
          <a style="color: #00458a" href="https://www.gyjerp.com" target="_blank">
            官方网站
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-layout-wrapper {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user-layout-container {
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
}

.user-layout-header {
  text-align: center;
  margin-bottom: 30px;
}

.user-layout-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-layout-title {
  font-size: 30px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 8px;
}

.user-layout-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin: 0;
}

.user-layout-content {
  background: #fff;
  border-radius: 4px;
  padding: 30px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-layout-footer {
  margin-top: 24px;
  text-align: center;
}

.user-layout-copyright {
  font-size: 13px;
  color: #666;
}
</style>
