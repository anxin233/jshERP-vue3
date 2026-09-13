<template>
  <div class="page-placeholder">
    <p class="page-placeholder__title">
      登录
    </p>
    <p class="page-placeholder__desc">
      P1 实现：账号密码 + 图形验证码
    </p>
  </div>
</template>

<script setup>
</script>

<style lang="less" scoped>
.page-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  &__title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
  }

  &__desc {
    margin: 0;
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
