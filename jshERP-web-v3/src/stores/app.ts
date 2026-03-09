/**
 * App Store - application-level state
 * Migrated from Vue 2 store/modules/app.js
 * Uses Pinia Composition API style
 */
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { setStore, getStore } from '@/utils/storage'

// Storage keys (matching original mutation-types.js)
const SIDEBAR_TYPE = 'SIDEBAR_TYPE'
const DEFAULT_THEME = 'DEFAULT_THEME'
const DEFAULT_LAYOUT_MODE = 'DEFAULT_LAYOUT_MODE'
const DEFAULT_COLOR = 'DEFAULT_COLOR'
const DEFAULT_COLOR_WEAK = 'DEFAULT_COLOR_WEAK'
const DEFAULT_FIXED_HEADER = 'DEFAULT_FIXED_HEADER'
const DEFAULT_FIXED_SIDEMENU = 'DEFAULT_FIXED_SIDEMENU'
const DEFAULT_FIXED_HEADER_HIDDEN = 'DEFAULT_FIXED_HEADER_HIDDEN'
const DEFAULT_CONTENT_WIDTH_TYPE = 'DEFAULT_CONTENT_WIDTH_TYPE'
const DEFAULT_MULTI_PAGE = 'DEFAULT_MULTI_PAGE'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebar = reactive({
    opened: true,
    withoutAnimation: false
  })
  const device = ref<string>('desktop')
  const theme = ref<string>('')
  const layout = ref<string>('')
  const contentWidth = ref<string>('')
  const fixedHeader = ref<boolean>(false)
  const fixSiderbar = ref<boolean>(true)
  const autoHideHeader = ref<boolean>(false)
  const color = ref<string | null>(null)
  const weak = ref<boolean>(false)
  const multipage = ref<boolean>(true)

  // Actions
  function setSidebar(type: boolean) {
    sidebar.opened = type
    setStore(SIDEBAR_TYPE, type)
  }

  function closeSidebar(withoutAnimation: boolean) {
    setStore(SIDEBAR_TYPE, true)
    sidebar.opened = false
    sidebar.withoutAnimation = withoutAnimation
  }

  function toggleDevice(val: string) {
    device.value = val
  }

  function toggleTheme(val: string) {
    setStore(DEFAULT_THEME, val)
    theme.value = val
  }

  function toggleLayoutMode(val: string) {
    setStore(DEFAULT_LAYOUT_MODE, val)
    layout.value = val
  }

  function toggleFixedHeader(fixed: boolean) {
    if (!fixed) {
      autoHideHeader.value = false
      setStore(DEFAULT_FIXED_HEADER_HIDDEN, false)
    }
    setStore(DEFAULT_FIXED_HEADER, fixed)
    fixedHeader.value = fixed
  }

  function toggleFixSiderbar(fixed: boolean) {
    setStore(DEFAULT_FIXED_SIDEMENU, fixed)
    fixSiderbar.value = fixed
  }

  function toggleFixedHeaderHidden(show: boolean) {
    setStore(DEFAULT_FIXED_HEADER_HIDDEN, show)
    autoHideHeader.value = show
  }

  function toggleContentWidth(type: string) {
    setStore(DEFAULT_CONTENT_WIDTH_TYPE, type)
    contentWidth.value = type
  }

  function toggleColor(val: string) {
    setStore(DEFAULT_COLOR, val)
    color.value = val
  }

  function toggleWeak(flag: boolean) {
    setStore(DEFAULT_COLOR_WEAK, flag)
    weak.value = flag
  }

  function toggleMultipage(multipageFlag: boolean) {
    setStore(DEFAULT_MULTI_PAGE, multipageFlag)
    multipage.value = multipageFlag
  }

  /**
   * Restore state from localStorage on app start
   */
  function initFromStorage() {
    const sidebarType = getStore(SIDEBAR_TYPE)
    if (sidebarType !== undefined && sidebarType !== null) {
      sidebar.opened = sidebarType
    }

    const storedTheme = getStore(DEFAULT_THEME)
    if (storedTheme) {
      theme.value = storedTheme
    }

    const storedLayout = getStore(DEFAULT_LAYOUT_MODE)
    if (storedLayout) {
      layout.value = storedLayout
    }

    const storedContentWidth = getStore(DEFAULT_CONTENT_WIDTH_TYPE)
    if (storedContentWidth) {
      contentWidth.value = storedContentWidth
    }

    const storedFixedHeader = getStore(DEFAULT_FIXED_HEADER)
    if (storedFixedHeader !== undefined && storedFixedHeader !== null) {
      fixedHeader.value = storedFixedHeader
    }

    const storedFixSiderbar = getStore(DEFAULT_FIXED_SIDEMENU)
    if (storedFixSiderbar !== undefined && storedFixSiderbar !== null) {
      fixSiderbar.value = storedFixSiderbar
    }

    const storedAutoHideHeader = getStore(DEFAULT_FIXED_HEADER_HIDDEN)
    if (storedAutoHideHeader !== undefined && storedAutoHideHeader !== null) {
      autoHideHeader.value = storedAutoHideHeader
    }

    const storedColor = getStore(DEFAULT_COLOR)
    if (storedColor) {
      color.value = storedColor
    }

    const storedWeak = getStore(DEFAULT_COLOR_WEAK)
    if (storedWeak !== undefined && storedWeak !== null) {
      weak.value = storedWeak
    }

    const storedMultipage = getStore(DEFAULT_MULTI_PAGE)
    if (storedMultipage !== undefined && storedMultipage !== null) {
      multipage.value = storedMultipage
    }
  }

  return {
    // State
    sidebar,
    device,
    theme,
    layout,
    contentWidth,
    fixedHeader,
    fixSiderbar,
    autoHideHeader,
    color,
    weak,
    multipage,

    // Actions
    setSidebar,
    closeSidebar,
    toggleDevice,
    toggleTheme,
    toggleLayoutMode,
    toggleFixedHeader,
    toggleFixSiderbar,
    toggleFixedHeaderHidden,
    toggleContentWidth,
    toggleColor,
    toggleWeak,
    toggleMultipage,
    initFromStorage
  }
})
