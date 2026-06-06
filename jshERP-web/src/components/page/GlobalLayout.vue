<template>
  <a-layout class="layout" :class="[device]">

    <template v-if="layoutMode === 'sidemenu'">
      <a-drawer
        v-if="device === 'mobile'"
        :rootClassName="'drawer-sider ' + navTheme"
        :bodyStyle="{ padding: 0, overflow: 'hidden' }"
        placement="left"
        @close="() => this.collapsed = false"
        :closable="false"
        :open="collapsed"
        :width="150"
      >
        <side-menu
          mode="inline"
          :menus="menus"
          @menuSelect="myMenuSelect"
          :theme="navTheme"
          :collapsed="false"
          :collapsible="true"></side-menu>
      </a-drawer>

      <side-menu
        v-else
        mode="inline"
        :menus="menus"
        @menuSelect="myMenuSelect"
        :theme="navTheme"
        :collapsed="collapsed"
        :collapsible="true"></side-menu>
    </template>
    <!-- 下次优化这些代码 -->
    <template v-else>
      <a-drawer
        v-if="device === 'mobile'"
        :rootClassName="'drawer-sider ' + navTheme"
        :bodyStyle="{ padding: 0, overflow: 'hidden' }"
        placement="left"
        @close="() => this.collapsed = false"
        :closable="false"
        :open="collapsed"
        :width="150"
      >
        <side-menu
          mode="inline"
          :menus="menus"
          @menuSelect="myMenuSelect"
          :theme="navTheme"
          :collapsed="false"
          :collapsible="true"></side-menu>
      </a-drawer>
    </template>

    <a-layout
      :class="[layoutMode, `content-width-${contentWidth}`]"
      :style="{ paddingLeft: fixSiderbar && isDesktop() ? `${sidebarOpened ? 150 : 80}px` : '0' }">
      <!-- layout header -->
      <global-header
        :mode="layoutMode"
        :menus="menus"
        :theme="navTheme"
        :collapsed="collapsed"
        :device="device"
        @toggle="toggle"
        @searchGlobalLayout="searchGlobalLayout"
      />

      <!-- layout content -->
      <a-layout-content :style="{ height: '100%', paddingTop: fixedHeader ? '49px' : '0' }">
        <slot></slot>
      </a-layout-content>

      <!-- layout footer -->
<!--      <a-layout-footer style="padding: 0px">-->
<!--        <global-footer/>-->
<!--      </a-layout-footer>-->
    </a-layout>

    <!-- update-start---- author:os_chengtgen -- date:20190830 --  for:issues/463 -编译主题颜色已生效，但还一直转圈，显示主题 正在编译 ---- -->
    <!--<setting-drawer></setting-drawer>-->
    <!-- update-end---- author:os_chengtgen -- date:20190830 --  for:issues/463 -编译主题颜色已生效，但还一直转圈，显示主题 正在编译 ---- -->
  </a-layout>
</template>

<script>
  import SideMenu from '@/components/menu/SideMenu'
  import GlobalHeader from '@/components/page/GlobalHeader'
  import GlobalFooter from '@/components/page/GlobalFooter'
  // update-start---- author:os_chengtgen -- date:20190830 --  for:issues/463 -编译主题颜色已生效，但还一直转圈，显示主题 正在编译 ------
  // import SettingDrawer from '@/components/setting/SettingDrawer'
  // 注释这个因为在个人设置模块已经加载了SettingDrawer页面
  // update-end ---- author:os_chengtgen -- date:20190830 --  for:issues/463 -编译主题颜色已生效，但还一直转圈，显示主题 正在编译 ------

  import { triggerWindowResizeEvent } from '@/utils/util'
  import { mapState, mapActions } from 'vuex'
  import { mixin, mixinDevice } from '@/utils/mixin.js'
  import storage from '@/utils/storage'

  export default {
    name: 'GlobalLayout',
    components: {
      SideMenu,
      GlobalHeader,
      GlobalFooter,
      // update-start---- author:os_chengtgen -- date:20190830 --  for:issues/463 -编译主题颜色已生效，但还一直转圈，显示主题 正在编译 ------
      // // SettingDrawer
      // 注释这个因为在个人设置模块已经加载了SettingDrawer页面
      // update-end ---- author:os_chengtgen -- date:20190830 --  for:issues/463 -编译主题颜色已生效，但还一直转圈，显示主题 正在编译 ------

    },
    mixins: [mixin, mixinDevice],
    data() {
      return {
        collapsed: false,
        activeMenu:{},
        menus: []
      }
    },
    computed: {
      ...mapState({
        // 主路由
        mainRouters: state => state.permission.addRouters,
        // 后台菜单
        permissionMenuList: state => state.user.permissionList
      })
    },
    watch: {
      sidebarOpened(val) {
        this.collapsed = !val
      }
    },
    created() {
      //--update-begin----author:scott---date:20190320------for:根据后台菜单配置，判断是否路由菜单字段，动态选择是否生成路由（为了支持参数URL菜单）------
      //this.menus = this.mainRouters.find((item) => item.path === '/').children;
      this.menus = this.permissionMenuList
      // 根据后台配置菜单，重新排序加载路由信息
      //console.log('----加载菜单逻辑----')
      //console.log(this.mainRouters)
      //console.log(this.permissionMenuList)
      //console.log('----navTheme------'+this.navTheme)
      //--update-end----author:scott---date:20190320------for:根据后台菜单配置，判断是否路由菜单字段，动态选择是否生成路由（为了支持参数URL菜单）------
    },
    methods: {
      ...mapActions(['setSidebar']),
      toggle() {
        this.collapsed = !this.collapsed
        this.setSidebar(!this.collapsed)
        triggerWindowResizeEvent()
      },
      menuSelect() {
        if (!this.isDesktop()) {
          this.collapsed = false
        }
      },
      myMenuSelect(value){
        // 此处触发动态路由被点击事件
        this.activeMenu = {}
        this.findMenuBykey(this.menus, value.key)
        if (!this.activeMenu.url) {
          return
        }
        this.$emit("dynamicRouterShow", value.key, this.activeMenu.id, this.activeMenu.text, this.activeMenu.component)
        const storeKey = 'route:title:' + this.activeMenu.url
        storage.set(storeKey, this.activeMenu.text)
      },
      findMenuBykey(menus,key){
        for(let i of menus){
          if(i.url==key){
            this.activeMenu = {...i}
          }else if(i.children && i.children.length>0){
            this.findMenuBykey(i.children,key)
          }
        }
      },
      searchGlobalLayout(key, id, title, component){
        this.$emit("dynamicRouterShow", key, id, title, component)
      }
      //update-end-author:taoyan date:20190430 for:动态路由title显示配置的菜单title而不是其对应路由的title
    }
  }

</script>

<style lang="less">
  body {
    // 打开滚动条固定显示
    overflow-y: scroll;

    &.colorWeak {
      filter: invert(80%);
    }
  }

  .layout {
    min-height: 100vh !important;
    overflow-x: hidden;

    &.mobile {

      .ant-layout-content {

        .content {
          margin: 24px 0 0;
        }
      }

      /**
       * ant-table-wrapper
       * 覆盖的表格手机模式样式，如果想修改在手机上表格最低宽度，可以在这里改动
       */
      .ant-table-wrapper {
        .ant-table-content {
          overflow-y: auto;
        }
        .ant-table-body {
          min-width: 800px;
        }
      }
      .sidemenu {
        .ant-header-fixedHeader {

          &.ant-header-side-opened, &.ant-header-side-closed {
            width: 100%
          }
        }
      }

      .topmenu {
        /* 必须为 topmenu  才能启用流式布局 */
        &.content-width-Fluid {
          .header-index-wide {
            margin-left: 0;
          }
        }
      }
      .header, .top-nav-header-index {
        .user-wrapper .action {
          padding: 0 12px;
        }
      }
    }

    &.ant-layout-has-sider {
      flex-direction: row;
    }

    .trigger {
      font-size: 22px;
      line-height: 42px;
      padding: 0 18px;
      cursor: pointer;
      transition: color 300ms, background 300ms;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }

    .topmenu {
      .ant-header-fixedHeader {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 9;
        width: 100%;
        transition: width .2s;

        &.ant-header-side-opened {
          width: 100%;
        }

        &.ant-header-side-closed {
          width: 100%;
        }
      }
      /* 必须为 topmenu  才能启用流式布局 */
      &.content-width-Fluid {
        .header-index-wide {
          max-width: unset;
          margin-left: 24px;
        }

        .page-header-index-wide {
          max-width: unset;
        }
      }

    }

    .sidemenu {
      .ant-header-fixedHeader {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 9;
        width: 100%;
        transition: width .2s;

        &.ant-header-side-opened {
          width: calc(100% - 150px)
        }

        &.ant-header-side-closed {
          width: calc(100% - 80px)
        }
      }
    }

    .header {
      height: 64px;
      padding: 0 12px 0 0;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
      position: relative;
    }

    .header, .top-nav-header-index {

      .user-wrapper {
        float: right;
        height: 100%;

        .action {
          cursor: pointer;
          padding: 0 14px;
          display: inline-block;
          transition: all .3s;

          height: 70%;
          line-height: 36px;

          &.action-full {
            height: 100%;
          }

          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .avatar {
            margin: 20px 10px 20px 0;
            color: #1890ff;
            background: hsla(0, 0%, 100%, .85);
            vertical-align: middle;
          }

          .icon {
            font-size: 16px;
            padding: 4px;
          }

          .anticon {
            color: white;
          }
        }
      }

      &.dark {
        .user-wrapper {

          .action {
            color: black;

            &:hover {
              background: rgba(0, 0, 0, 0.05);
            }

            .anticon {
              color: black;
            }
          }
        }
      }
    }

    &.mobile {
      .top-nav-header-index {

        .header-index-wide {

          .header-index-left {

            .trigger {
              color: rgba(255, 255, 255, 0.85);
              padding: 0 12px;
            }

            .logo.top-nav-header {
              text-align: center;
              width: 56px;
              line-height: 58px;
            }
          }
        }

        .user-wrapper .action .avatar {
          margin: 20px 0;
        }

        &.light {

          .header-index-wide {

            .header-index-left {
              .trigger {
                color: rgba(0, 0, 0, 0.65);
              }
            }
          }
          //
        }
      }
    }

    &.tablet {
      // overflow: hidden; text-overflow:ellipsis; white-space: nowrap;
      .top-nav-header-index {

        .header-index-wide {

          .header-index-left {
            .logo > a {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

    }

    .top-nav-header-index {
      box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
      position: relative;
      transition: background .3s, width .2s;

      .header-index-wide {
        width: 100%;
        margin: auto;
        padding: 0 20px 0 0;
        display: flex;
        height: 49px;

        .ant-menu.ant-menu-horizontal {
          border: none;
          height: 64px;
          line-height: 64px;
        }

        .header-index-left {
          flex: 1 1;
          display: flex;

          .logo.top-nav-header {
            width: 165px;
            height: 64px;
            position: relative;
            line-height: 64px;
            transition: all .3s;
            overflow: hidden;

            img {
              display: inline-block;
              vertical-align: middle;
              height: 32px;
            }

            h1 {
              color: #fff;
              display: inline-block;
              vertical-align: top;
              font-size: 16px;
              margin: 0 0 0 12px;
              font-weight: 400;
            }
          }
        }

        .header-index-right {
          float: right;
          height: 49px;
          overflow: hidden;
          .action:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }
        }
      }

      &.light {
        background-color: #fff;

        .header-index-wide {
          .header-index-left {
            .logo {
              h1 {
                color: #002140;
              }
            }
          }
        }
      }

      &.dark {

        .user-wrapper {

          .action {
            color: white;

            &:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          }
        }
        .header-index-wide .header-index-left .trigger:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }

    }

    // 内容区
    .layout-content {
      margin: 24px 24px 0px;
      height: 64px;
      padding: 0 12px 0 0;
    }

  }

  .topmenu {
    .page-header-index-wide {
      margin: 0 auto;
      width: 100%;
    }
  }

  /*
  // drawer-sider 自定义
  */
  .ant-drawer.drawer-sider {
    .sider {
      box-shadow: none;
      position: relative;
    }

    &.dark {
      .ant-drawer-content {
        background-color: rgb(0, 21, 41);
      }
    }
    &.light {
      box-shadow: none;
      .ant-drawer-content {
        background-color: #fff;
      }
    }

    .ant-drawer-body {
      padding: 0;
      overflow: hidden;
    }
  }

  // 菜单样式
  .sider {
    box-shadow: 2px 116px 6px 0 rgba(0, 21, 41, .35);
    position: relative;
    z-index: 10;

    &.ant-fixed-sidemenu {
      position: fixed;
      height: 100%;
    }

    .logo {
      height: 64px;
      position: relative;
      line-height: 64px;
      padding-left: 10px;
      -webkit-transition: all .3s;
      transition: all .3s;
      background: #ffffff;
      overflow: hidden;

      img, h1 {
        display: inline-block;
        vertical-align: middle;
      }

      img {
        height: 32px;
      }

      h1 {
        color: #fff;
        font-size: 18px;
        margin: 0 0 10px 8px;
        font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-weight: 600;
      }
    }

    &.light {
      background-color: #fff;
      box-shadow: 2px 116px 8px 0 rgba(29, 35, 41, 0.05);

      .logo {
        background: #fff;
        box-shadow: 1px 1px 0 0 #e8e8e8;

        h1 {
          color: unset;
        }
      }

      .ant-menu-light {
        border-right-color: transparent;
      }
    }

  }

  // 外置的样式控制
  .user-dropdown-menu-wrapper.ant-dropdown-menu {
    padding: 4px 0;

    .ant-dropdown-menu-item {
      width: 160px;
    }

    .ant-dropdown-menu-item > .anticon:first-child,
    .ant-dropdown-menu-item > a > .anticon:first-child,
    .ant-dropdown-menu-submenu-title > .anticon:first-child
    .ant-dropdown-menu-submenu-title > a > .anticon:first-child {
      min-width: 12px;
      margin-right: 8px;
    }

  }

  // 数据列表 样式
  .table-alert {
    margin-bottom: 16px;
  }

  .table-page-search-wrapper {

    .ant-form,
    .ant-form-inline {
      width: 100%;

      > .ant-row {
        display: flex !important;
        flex-flow: row wrap !important;
        width: 100%;
        min-width: 0;

        > [class*='ant-col'] {
          min-width: 0;
        }
      }

      .ant-form-item {
        display: block !important;
        width: 100% !important;
        margin-bottom: 12px;
        margin-right: 0;
      }

      .ant-form-item-row {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        width: 100% !important;
      }

      .ant-form-item-label {
        flex: 0 0 82px !important;
        width: 82px !important;
        max-width: 82px !important;
        padding-right: 8px;
        line-height: 32px;
        text-align: right;
        white-space: nowrap;
      }

      .ant-form-item-label > label {
        height: 32px;
        line-height: 32px;
      }

      .ant-form-item-control {
        flex: 1 1 auto !important;
        width: auto !important;
        max-width: none !important;
        min-width: 0;
        line-height: 32px;
      }

      .ant-form-item-control.ant-col-offset-1 {
        margin-left: 0 !important;
      }

      .ant-form-item-control-input,
      .ant-form-item-control-input-content {
        width: 100%;
        min-height: 32px;
      }

      .ant-input,
      .ant-input-number,
      .ant-select,
      .ant-picker {
        width: 100%;
      }
    }

    @media (min-width: 768px) {
      .ant-form-inline > .ant-row > .ant-col-md-4 {
        flex: 0 0 16.66666667% !important;
        max-width: 16.66666667% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-5 {
        flex: 0 0 20.83333333% !important;
        max-width: 20.83333333% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-6 {
        flex: 0 0 25% !important;
        max-width: 25% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-7 {
        flex: 0 0 29.16666667% !important;
        max-width: 29.16666667% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-8 {
        flex: 0 0 33.33333333% !important;
        max-width: 33.33333333% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-9 {
        flex: 0 0 37.5% !important;
        max-width: 37.5% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-10 {
        flex: 0 0 41.66666667% !important;
        max-width: 41.66666667% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-12 {
        flex: 0 0 50% !important;
        max-width: 50% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-15 {
        flex: 0 0 62.5% !important;
        max-width: 62.5% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-16 {
        flex: 0 0 66.66666667% !important;
        max-width: 66.66666667% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-18 {
        flex: 0 0 75% !important;
        max-width: 75% !important;
      }

      .ant-form-inline > .ant-row > .ant-col-md-24 {
        flex: 0 0 100% !important;
        max-width: 100% !important;
      }
    }

    @media (max-width: 767px) {
      .ant-form-inline > .ant-row > [class*='ant-col'] {
        flex: 0 0 100% !important;
        max-width: 100% !important;
      }
    }

    .table-page-search-submitButtons {
      display: inline-flex;
      align-items: center;
      height: 32px;
      margin-bottom: 12px;
      white-space: nowrap;
    }

  }

  .content {

    .table-operator {
      margin-bottom: 18px;

      button {
        margin-right: 8px;
      }
    }
  }
</style>
