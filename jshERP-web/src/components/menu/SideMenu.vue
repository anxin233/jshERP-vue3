<template>
  <a-layout-sider
    :class="['sider', isDesktop() ? null : 'shadow', theme, fixSiderbar && isDesktop() ? 'ant-fixed-sidemenu' : null ]"
    :width="siderWidth + 'px'"
    :collapsible="collapsible"
    :collapsed="collapsed"
    :collapsedWidth="siderCollapsedWidth"
    :trigger="null">
    <logo />
    <s-menu
      :collapsed="collapsed"
      :menu="menus"
      :theme="theme"
      @select="onSelect"
      :mode="mode"
      :style="smenuStyle">
    </s-menu>
  </a-layout-sider>

</template>

<script>
  import Logo from '../tools/Logo'
  import SMenu from './index'
  import { mixin, mixinDevice } from '@/utils/mixin.js'
  import { SIDER_WIDTH, SIDER_COLLAPSED_WIDTH, LOGO_HEIGHT } from '@/config/layout'

  export default {
    name: "SideMenu",
    components: { Logo, SMenu },
    mixins: [mixin, mixinDevice],
    props: {
      mode: {
        type: String,
        required: false,
        default: 'inline'
      },
      theme: {
        type: String,
        required: false,
        default: 'dark'
      },
      collapsible: {
        type: Boolean,
        required: false,
        default: false
      },
      collapsed: {
        type: Boolean,
        required: false,
        default: false
      },
      menus: {
        type: Array,
        required: true
      }
    },
    data () {
      return {
        siderWidth: SIDER_WIDTH,
        siderCollapsedWidth: SIDER_COLLAPSED_WIDTH
      }
    },
    computed:{
      smenuStyle() {
        let style = { 'padding': '0' }
        if (this.fixSiderbar) {
          style['height'] = `calc(100% - ${LOGO_HEIGHT}px)`
          style['overflow'] = 'auto'
          style['overflow-x'] = 'hidden'
        }
        return style
      }
    },
    methods: {
      onSelect (obj) {
        this.$emit('menuSelect', obj)
      }
    }
  }
</script>
<style lang="less" scoped>
  /* 文档 24 阶段 5：细条半透明滚动条，可感知滚动 */
  .sider {
    @scrollBarSize: 6px;

    :deep(ul.ant-menu) {
      &::-webkit-scrollbar {
        width: @scrollBarSize;
        height: @scrollBarSize;
        display: block;
      }

      &::-webkit-scrollbar-track {
        background-color: transparent;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: @scrollBarSize;
        background-color: rgba(0, 0, 0, 0.2);

        &:hover {
          background-color: rgba(0, 0, 0, 0.35);
        }
      }
    }

    &.dark :deep(ul.ant-menu) {
      &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.25);

        &:hover {
          background-color: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }
</style>

<!-- update_begin author:sunjianlei date:20190530 for: 选中首页的时候不显示背景颜色 -->
<style lang="less">
  /* 侧栏选中项右侧竖线：antdv 4.x 默认 colorActiveBarWidth=0，这里兜底强制绘制 */
  .sider .ant-menu-inline .ant-menu-item-selected::after,
  .sider .ant-menu-vertical .ant-menu-item-selected::after {
    border-right: 3px solid var(--jsh-color-primary, @primary-color) !important;
    transform: scaleY(1) !important;
    opacity: 1 !important;
  }

  .sider.dark .ant-menu-inline .ant-menu-item-selected::after,
  .sider.dark .ant-menu-vertical .ant-menu-item-selected::after {
    border-right-color: rgba(255, 255, 255, 0.9) !important;
  }

  .ant-menu.ant-menu-root {
    & > .ant-menu-item:first-child {
      background-color: transparent;

      & > a, & > a:hover {
        color: rgba(0, 0, 0, 0.65);
      }

      &.ant-menu-item-selected {
        & > a, & > a:hover {
          color: @primary-color;
        }
      }
    }

    &.ant-menu-dark > .ant-menu-item:first-child {
      & > a, & > a:hover {
        color: rgba(255, 255, 255, 0.65);
      }

      &.ant-menu-item-selected {
        & > a, & > a:hover {
          color: rgba(255, 255, 255, 1);
        }
      }
    }
  }
</style>
<!-- update_end author:sunjianlei date:20190530 for: 选中首页的时候不显示背景颜色 -->
