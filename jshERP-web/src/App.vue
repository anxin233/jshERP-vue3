<template>
  <a-config-provider :locale="locale" :theme="antdTheme">
    <div id="app">
      <router-view/>
    </div>
  </a-config-provider>
</template>
<script>
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import enquireScreen from '@/utils/device'
  import defaultSettings from '@/defaultSettings'
  import { PRIMARY_COLOR } from '@/config/layout'
  import { mapState } from 'vuex'

  export default {
    data () {
      return {
        locale: zhCN,
      }
    },
    computed: {
      ...mapState({
        primaryColor: state => state.app.color || defaultSettings.primaryColor
      }),
      antdTheme () {
        const color = this.primaryColor || PRIMARY_COLOR
        // 同步 CSS 变量，供 layout-tokens / Less 场景使用
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--jsh-color-primary', color)
        }
        return {
          token: {
            colorPrimary: color,
            // 对齐老版 AntD v3 默认值（v4/v5 token 默认更黑更亮）
            colorLink: color,
            colorError: '#f5222d',
            colorText: 'rgba(0, 0, 0, 0.65)',
            colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
            colorBgLayout: '#f0f2f5',
            colorBgContainer: '#ffffff',
            borderRadius: 4,
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif`
          }
        }
      }
    },
    created () {
      let that = this
      enquireScreen(deviceType => {
        if (deviceType === 0) {
          that.$store.commit('TOGGLE_DEVICE', 'mobile')
          that.$store.dispatch('setSidebar', false)
        } else if (deviceType === 1) {
          that.$store.commit('TOGGLE_DEVICE', 'mobile')
          that.$store.dispatch('setSidebar', false)
        } else {
          that.$store.commit('TOGGLE_DEVICE', 'desktop')
          that.$store.dispatch('setSidebar', true)
        }
      })
    }
  }
</script>
<style>
  #app {
    height: 100%;
  }
</style>
