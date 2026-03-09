<script setup lang="ts">
/**
 * GlobalFooter - 底部版权信息组件
 * 简洁的 footer，显示版权信息
 */
</script>

<template>
  <div class="global-footer">
    <div class="global-footer-links">
      <a href="https://gitee.com/jishenghua/JSH_ERP" target="_blank" rel="noopener noreferrer">
        管伊佳ERP 开源项目
      </a>
    </div>
    <div class="global-footer-copyright">
      Copyright &copy; {{ new Date().getFullYear() }} 管伊佳ERP
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-footer {
  padding: 16px 0;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;

  .global-footer-links {
    margin-bottom: 4px;

    a {
      color: rgba(0, 0, 0, 0.45);
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .global-footer-copyright {
    font-size: 12px;
  }
}
</style>
