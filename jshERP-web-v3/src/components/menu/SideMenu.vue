<script setup lang="ts">
/**
 * SideMenu - 侧边菜单组件
 * 从 Vue 2 components/menu/SideMenu.vue 迁移
 * 使用 Element Plus el-menu 递归渲染菜单
 */
import { computed, type Component as VueComponent } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  Setting,
  Goods,
  Money,
  DataAnalysis,
  User,
  Document,
  FolderOpened,
  Menu as MenuIcon,
  Grid,
  Tickets,
  ShoppingCart,
  OfficeBuilding,
  Coin,
  List,
  PriceTag,
  TrendCharts,
  Histogram,
  Collection,
  Stamp,
  Bell,
  Operation,
  Tools,
  Management,
  Files,
  Box,
  Sell,
  Van,
  Shop,
  CreditCard,
  Wallet,
  Reading,
  Notebook,
} from '@element-plus/icons-vue'

interface MenuItem {
  path: string
  name?: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
  }
  children?: MenuItem[]
  hidden?: boolean
}

const props = defineProps<{
  /** 是否折叠 */
  collapsed: boolean
  /** 菜单列表 */
  menus: MenuItem[]
}>()

const route = useRoute()

/** 当前活跃的路由路径 */
const currentRoute = computed(() => route.path)

/**
 * 图标名称映射表 - 将原项目 iconfont 图标名映射为 Element Plus 图标
 */
const iconMap: Record<string, VueComponent> = {
  home: HomeFilled,
  setting: Setting,
  profile: User,
  user: User,
  shopping: ShoppingCart,
  shop: Shop,
  account_balance: OfficeBuilding,
  money: Money,
  pay: CreditCard,
  wallet: Wallet,
  'pie-chart': DataAnalysis,
  'bar-chart': Histogram,
  'line-chart': TrendCharts,
  dashboard: Grid,
  form: Document,
  table: List,
  file: Files,
  folder: FolderOpened,
  menu: MenuIcon,
  ticket: Tickets,
  goods: Goods,
  tag: PriceTag,
  coin: Coin,
  chart: DataAnalysis,
  bell: Bell,
  operation: Operation,
  tool: Tools,
  tree: Management,
  stamp: Stamp,
  collection: Collection,
  box: Box,
  sell: Sell,
  van: Van,
  reading: Reading,
  notebook: Notebook,
}

/**
 * 根据图标名称返回对应组件
 * 如果找不到匹配的图标则返回默认图标
 */
function getIcon(iconName?: string): VueComponent {
  if (!iconName) return MenuIcon
  // 尝试直接匹配
  if (iconMap[iconName]) return iconMap[iconName]
  // 尝试去掉前缀匹配（如 icon-xxx）
  const stripped = iconName.replace(/^icon[-_]?/, '')
  if (iconMap[stripped]) return iconMap[stripped]
  return MenuIcon
}

/**
 * 过滤隐藏的菜单项
 */
function getVisibleMenus(menus?: MenuItem[]): MenuItem[] {
  if (!menus) return []
  return menus.filter((menu) => {
    return !menu.hidden && !menu.meta?.hidden
  })
}
</script>

<template>
  <el-menu
    :default-active="currentRoute"
    :collapse="collapsed"
    :collapse-transition="false"
    background-color="#001529"
    text-color="rgba(255,255,255,0.65)"
    active-text-color="#fff"
    :unique-opened="true"
    router
    class="side-menu"
  >
    <template v-for="menu in getVisibleMenus(menus)" :key="menu.path">
      <!-- 有子菜单 -->
      <el-sub-menu
        v-if="getVisibleMenus(menu.children).length"
        :index="menu.path"
      >
        <template #title>
          <el-icon v-if="menu.meta?.icon">
            <component :is="getIcon(menu.meta.icon)" />
          </el-icon>
          <span>{{ menu.meta?.title }}</span>
        </template>
        <!-- 递归支持多级菜单 -->
        <template
          v-for="child in getVisibleMenus(menu.children)"
          :key="child.path"
        >
          <el-sub-menu
            v-if="getVisibleMenus(child.children).length"
            :index="child.path"
          >
            <template #title>
              <el-icon v-if="child.meta?.icon">
                <component :is="getIcon(child.meta.icon)" />
              </el-icon>
              <span>{{ child.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="grandChild in getVisibleMenus(child.children)"
              :key="grandChild.path"
              :index="grandChild.path"
            >
              <el-icon v-if="grandChild.meta?.icon">
                <component :is="getIcon(grandChild.meta.icon)" />
              </el-icon>
              <template #title>{{ grandChild.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="child.path">
            <el-icon v-if="child.meta?.icon">
              <component :is="getIcon(child.meta.icon)" />
            </el-icon>
            <template #title>{{ child.meta?.title }}</template>
          </el-menu-item>
        </template>
      </el-sub-menu>
      <!-- 无子菜单 -->
      <el-menu-item v-else :index="menu.path">
        <el-icon v-if="menu.meta?.icon">
          <component :is="getIcon(menu.meta.icon)" />
        </el-icon>
        <template #title>{{ menu.meta?.title }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<style lang="scss" scoped>
.side-menu {
  border-right: none;
  height: calc(100% - 48px);
  overflow-y: auto;
  overflow-x: hidden;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: #666;

    &:hover {
      background-color: #808080;
    }
  }

  // 折叠状态
  &.el-menu--collapse {
    width: 48px;
  }
}

// 子菜单活跃背景
:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #fff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary) !important;
}

// 菜单项 hover 效果
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
