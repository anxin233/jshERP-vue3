<template>
  <!-- , width: fixedHeader ? `calc(100% - ${sidebarOpened ? 256 : 80}px)` : '100%'  -->
  <a-layout-header
    v-if="!headerBarFixed"
    :class="[fixedHeader && 'ant-header-fixedHeader', sidebarOpened ? 'ant-header-side-opened' : 'ant-header-side-closed', ]"
    :style="{ padding: '0' }">

    <div v-if="mode === 'sidemenu'" class="header" :class="theme">
      <legacy-icon
        v-if="device==='mobile'"
        class="trigger"
        :type="collapsed ? 'menu-fold' : 'menu-unfold'"
        @click="toggle"></legacy-icon>

      <span v-if="device === 'desktop'" class="company-name">{{ companyName }}</span>
      <span v-else>{{ systemTitle }}</span>
      <jump-info ref="jumpModal"></jump-info>
      <user-menu :theme="theme" @searchGlobalHeader="searchGlobalHeader" />
    </div>
    <!-- 顶部导航栏模式 -->
    <div v-else :class="['top-nav-header-index', theme]">
      <div class="header-index-wide">
        <div class="header-index-left" :style="topMenuStyle.headerIndexLeft">
          <logo class="top-nav-header" :show-title="device !== 'mobile'" :style="topMenuStyle.topNavHeader"/>
          <div v-if="device !== 'mobile'" :style="topMenuStyle.topSmenuStyle">
            <s-menu
              mode="horizontal"
              :menu="menus"
              :theme="theme"></s-menu>
          </div>
          <legacy-icon
            v-else
            class="trigger"
            :type="collapsed ? 'menu-fold' : 'menu-unfold'"
            @click="toggle"></legacy-icon>
        </div>
        <user-menu class="header-index-right" :theme="theme" :style="topMenuStyle.headerIndexRight"/>
      </div>
    </div>

  </a-layout-header>
</template>

<script>
  import JumpInfo from './JumpInfo'
  import UserMenu from '../tools/UserMenu'
  import SMenu from '../menu/'
  import Logo from '../tools/Logo'
  import { getCurrentSystemConfig } from '@/api/api'
  import { mixin } from '@/utils/mixin.js'

  export default {
    name: 'GlobalHeader',
    components: {
      JumpInfo,
      UserMenu,
      SMenu,
      Logo
    },
    mixins: [mixin],
    props: {
      mode: {
        type: String,
        // sidemenu, topmenu
        default: 'sidemenu'
      },
      menus: {
        type: Array,
        required: true
      },
      theme: {
        type: String,
        required: false,
        default: 'dark'
      },
      collapsed: {
        type: Boolean,
        required: false,
        default: false
      },
      device: {
        type: String,
        required: false,
        default: 'desktop'
      }
    },
    data() {
      return {
        headerBarFixed: false,
        systemTitle: window.SYS_TITLE,
        companyName: '',
        topMenuStyle: {
          headerIndexLeft: {},
          topNavHeader: {},
          headerIndexRight: {},
          topSmenuStyle: {}
        }
      }
    },
    watch: {
      /** 监听设备变化 */
      device() {
        if (this.mode === 'topmenu') {
          this.buildTopMenuStyle()
        }
      },
      /** 监听导航栏模式变化 */
      mode(newVal) {
        if (newVal === 'topmenu') {
          this.buildTopMenuStyle()
        }
      }
    },
    mounted() {
      window.addEventListener('scroll', this.handleScroll)
      if (this.mode === 'topmenu') {
        this.buildTopMenuStyle()
      }
      if(window.location.host === 'cloud.huaxiaerp.vip' || window.location.host === 'cloud.huaxiaerp.com') {
        this.showJump()
      }
    },
    created () {
      this.initSystemConfig()
    },
    methods: {
      showJump() {
        this.$refs.jumpModal.handleShow()
      },
      handleScroll() {
        if (this.autoHideHeader) {
          let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
          if (scrollTop > 100) {
            this.headerBarFixed = true
          } else {
            this.headerBarFixed = false
          }
        } else {
          this.headerBarFixed = false
        }
      },
      toggle() {
        this.$emit('toggle')
      },
      buildTopMenuStyle() {
        if (this.mode === 'topmenu') {
          if (this.device === 'mobile') {
            // 手机端需要清空样式，否则显示会错乱
            this.topMenuStyle.topNavHeader = {}
            this.topMenuStyle.topSmenuStyle = {}
            this.topMenuStyle.headerIndexRight = {}
            this.topMenuStyle.headerIndexLeft = {}
          } else {
            let rightWidth = '360px'
            this.topMenuStyle.topNavHeader = { 'min-width': '165px' }
            this.topMenuStyle.topSmenuStyle = { 'width': 'calc(100% - 165px)' }
            this.topMenuStyle.headerIndexRight = { 'min-width': rightWidth }
            this.topMenuStyle.headerIndexLeft = { 'width': `calc(100% - ${rightWidth})` }
          }
        }
      },
      searchGlobalHeader(key, id, title, component){
        this.$emit("searchGlobalLayout", key, id, title, component)
      },
      initSystemConfig() {
        getCurrentSystemConfig().then((res) => {
          if(res.code === 200 && res.data){
            this.companyName = res.data.companyName
          }
        })
      },
    }
  }
</script>

<style lang="less" scoped>
  /* 文档 24：统一 header 高度；light=浅底深字，dark=深底浅字 */
  @height: var(--jsh-header-height, 49px);

  .layout {

    .top-nav-header-index {

      .header-index-wide {
        margin-left: 10px;

        .ant-menu.ant-menu-horizontal {
          height: @height;
          line-height: @height;
        }
      }
      .trigger {
        line-height: var(--jsh-header-height, 49px);
        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }
    }

    .header {
      z-index: 2;
      height: @height;
      transition: background 300ms, color 300ms;
      /* light：浅底深字 */
      color: var(--jsh-header-color-light, #fff);
      background-color: var(--jsh-header-bg-light, #1890ff);
      box-shadow: none;
      border-bottom: 1px solid var(--jsh-header-border, transparent);

      /* dark：深底浅字 */
      &.dark {
        color: var(--jsh-header-color-dark, rgba(255, 255, 255, 0.85));
        background-color: var(--jsh-header-bg-dark, #001529) !important;
        box-shadow: none;
        border-bottom-color: transparent;
      }
    }

    .header, .top-nav-header-index {
      &.dark .trigger:hover {
        background: rgba(255, 255, 255, 0.12);
      }
      &.light .trigger:hover {
        background: rgba(255, 255, 255, 0.12);
      }
    }
  }

  .ant-layout-header {
    height: @height;
    line-height: @height;
  }

  .company-name {
    font-size:16px;
    padding-left:16px
  }

  .change-title {
    font-size:14px;
    padding-left:16px;
    color:yellow;
  }

  .change-title a {
    font-size:14px;
    color:yellow;
    text-decoration:underline;
  }

</style>