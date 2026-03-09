<script setup lang="ts">
/**
 * IframePageView - 内嵌 iframe 页面容器
 * 从 Vue 2 components/layouts/IframePageView.vue 迁移
 * 用于在系统内展示外部链接页面（iframe 嵌入），全高度占满
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const iframeUrl = ref('')
const iframeId = ref('')
const iframeHeight = ref('800px')

/**
 * 根据路由 meta 中的 url 构建 iframe 地址
 * 保留原 Vue 2 的 URL 处理逻辑
 */
function initIframe() {
  let url = route.meta?.url as string | undefined
  iframeId.value = route.path

  // 根据窗口大小计算高度
  const isMobile = window.innerWidth < 768
  if (isMobile) {
    iframeHeight.value = '800px'
  } else {
    iframeHeight.value = `${document.documentElement.clientHeight - 100}px`
  }

  if (url) {
    url = url.replace('/system', '')
    if (url.indexOf('.html') === -1) {
      // 地址不以 .html 结尾的，需要重新构造 url
      const urlArr = url.split('/')
      if (urlArr.length >= 4) {
        url = '/' + urlArr[1] + '/' + urlArr[2] + '/' + urlArr[2] + '.html?t=' + urlArr[3]
      }
    }
    url = document.location.protocol + '//' + window.location.host + url
    iframeUrl.value = url
  }
}

onMounted(() => {
  initIframe()
})
</script>

<template>
  <div class="iframe-page-view">
    <iframe
      :id="iframeId"
      :src="iframeUrl"
      frameborder="0"
      width="100%"
      :height="iframeHeight"
      scrolling="auto"
      class="iframe-content"
    />
  </div>
</template>

<style lang="scss" scoped>
.iframe-page-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.iframe-content {
  display: block;
  border: none;
  min-height: calc(100vh - 120px);
}
</style>
