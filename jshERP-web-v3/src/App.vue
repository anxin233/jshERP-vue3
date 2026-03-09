<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const handleResize = () => {
  const width = window.innerWidth
  if (width < 768) {
    appStore.toggleDevice('mobile')
    appStore.setSidebar(false)
  } else if (width < 992) {
    appStore.toggleDevice('tablet')
    appStore.setSidebar(false)
  } else {
    appStore.toggleDevice('desktop')
    appStore.setSidebar(true)
  }
}

onMounted(() => {
  appStore.initFromStorage()
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div id="app">
      <router-view />
    </div>
  </el-config-provider>
</template>

<style>
#app {
  height: 100%;
}
</style>
