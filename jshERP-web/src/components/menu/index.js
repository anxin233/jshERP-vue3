import { h } from 'vue'
import { Menu } from 'ant-design-vue'
import { RouterLink } from 'vue-router'
import LegacyIcon from '@/components/legacy/LegacyIcon.vue'

export default {
  name: 'SMenu',
  props: {
    menu: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    mode: {
      type: String,
      required: false,
      default: 'inline'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      openKeys: [],
      selectedKeys: [],
      cachedOpenKeys: []
    }
  },
  computed: {
    rootSubmenuKeys () {
      const keys = []
      this.menu.forEach(item => keys.push(item.url))
      return keys
    },
    menuItems () {
      return this.buildMenuItems(this.menu)
    }
  },
  mounted () {
    this.updateMenu()
  },
  watch: {
    collapsed (val) {
      if (val) {
        this.cachedOpenKeys = this.openKeys.concat()
        this.openKeys = []
      } else {
        this.openKeys = this.cachedOpenKeys
      }
    },
    $route () {
      this.updateMenu()
    }
  },
  methods: {
    onOpenChange (openKeys) {
      if (this.mode === 'horizontal') {
        this.openKeys = openKeys
        return
      }
      const latestOpenKey = openKeys.find(key => !this.openKeys.includes(key))
      if (!this.rootSubmenuKeys.includes(latestOpenKey)) {
        this.openKeys = openKeys
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    },
    updateMenu () {
      const routes = this.$route.matched.concat()
      const { hidden } = this.$route.meta
      if (routes.length >= 3 && hidden) {
        routes.pop()
        this.selectedKeys = [routes[routes.length - 1].path]
      } else {
        this.selectedKeys = [routes.pop().path]
      }
      const openKeys = []
      if (this.mode === 'inline') {
        routes.forEach(item => {
          openKeys.push(item.path)
        })
      }
      if (!this.selectedKeys || this.selectedKeys[0].indexOf(':') < 0) {
        this.collapsed ? (this.cachedOpenKeys = openKeys) : (this.openKeys = openKeys)
      }
    },
    onMenuClick ({ key }) {
      if (key && (key.indexOf('http://') > -1 || key.indexOf('https://') > -1)) {
        window.open(key)
        return
      }
      this.selectedKeys = [key]
      this.$emit('select', { key, selectedKeys: [key] })
    },
    buildMenuItems (menuList) {
      return menuList
        .filter(item => !item.hidden)
        .map(item => this.buildItem(item))
        .filter(item => item != null)
    },
    buildItem (menu) {
      if (menu.hidden) {
        return null
      }
      if (menu.children && !menu.alwaysShow) {
        return this.buildSubMenuItem(menu)
      }
      return this.buildMenuItem(menu)
    },
    buildMenuItem (menu) {
      // 后台菜单仅有 url/text，无 name；路由 name 与菜单解耦，统一用 path 跳转
      const toPath = menu.url || menu.path
      if (!toPath) {
        return null
      }
      const linkProps = { to: toPath }
      if (menu.children) {
        menu.children.forEach(item => {
          item.meta = Object.assign(item.meta || {}, { hidden: true })
        })
      }
      const icon = this.renderIconVNode(menu.icon)
      return {
        key: menu.url,
        icon,
        label: h(RouterLink, { ...linkProps, title: menu.text }, {
          default: () => menu.text
        })
      }
    },
    buildSubMenuItem (menu) {
      const children = []
      if (!menu.alwaysShow) {
        menu.children.forEach(item => {
          const node = this.buildItem(item)
          if (node != null) {
            children.push(node)
          }
        })
      }
      return {
        key: menu.url,
        label: menu.text,
        title: menu.text,
        icon: this.renderIconVNode(menu.icon),
        children
      }
    },
    renderIconVNode (icon) {
      const normalized = typeof icon === 'string' ? icon.trim() : icon
      if (!normalized || normalized === 'none') {
        return null
      }
      if (typeof normalized === 'object') {
        return h(LegacyIcon, { component: normalized })
      }
      return h(LegacyIcon, { type: normalized })
    }
  },
  render () {
    return h(Menu, {
      mode: this.mode,
      theme: this.theme,
      inlineIndent: 12,
      selectedKeys: this.selectedKeys,
      openKeys: this.openKeys,
      items: this.menuItems,
      'onUpdate:selectedKeys': keys => {
        this.selectedKeys = keys
      },
      'onUpdate:openKeys': keys => {
        this.onOpenChange(keys)
      },
      onClick: this.onMenuClick
    })
  }
}
