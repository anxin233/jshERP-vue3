<script setup lang="ts">
/**
 * 404 Not Found Page
 */
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="exception-page">
    <el-result icon="info" title="404" sub-title="抱歉，你访问的页面不存在">
      <template #extra>
        <el-button type="primary" @click="router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style lang="scss" scoped>
.exception-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  height: 80vh;
}
</style>
