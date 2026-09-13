<template>
  <div class="tabbar-layout">
    <router-view class="tabbar-layout__content" />
    <van-tabbar
      route
      safe-area-inset-bottom
    >
      <van-tabbar-item
        to="/home"
        icon="home-o"
      >
        首页
      </van-tabbar-item>
      <van-tabbar-item
        to="/sale"
        icon="cart-o"
      >
        开单
      </van-tabbar-item>
      <van-tabbar-item
        to="/stock"
        icon="apps-o"
      >
        库存
      </van-tabbar-item>
      <van-tabbar-item
        to="/bills"
        icon="orders-o"
      >
        单据
      </van-tabbar-item>
      <van-tabbar-item
        to="/mine"
        icon="user-o"
      >
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
</script>

<style lang="less" scoped>
.tabbar-layout {
  height: 100%;

  &__content {
    height: 100%;
    padding-bottom: calc(50px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
