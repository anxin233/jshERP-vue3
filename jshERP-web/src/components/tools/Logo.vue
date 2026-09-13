<template>
  <div class="logo">
    <h1 v-if="showTitle">{{ title }}</h1>
  </div>
</template>

<script>
  import { mixin } from '@/utils/mixin.js'

  export default {
    name: 'Logo',
    mixins: [mixin],
    props: {
      title: {
        type: String,
        default: window.SYS_TITLE,
        required: false
      },
      showTitle: {
        type: Boolean,
        default: true,
        required: false
      }
    }
  }
</script>
<style lang="less" scoped>
  /* 与顶栏贯通：主色蓝底白字 */
  .logo {
    height: var(--jsh-logo-height, 49px) !important;
    line-height: var(--jsh-logo-height, 49px) !important;
    box-shadow: none !important;
    transition: background 300ms;
    overflow: hidden;
    padding-left: 16px;
    background: var(--jsh-logo-bg, #1890ff);

    h1 {
      display: inline-block;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: #fff;
      vertical-align: middle;
    }
  }
</style>
