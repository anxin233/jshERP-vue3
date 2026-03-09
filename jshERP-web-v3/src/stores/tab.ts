/**
 * Tab Store - multi-tab management
 * Extracted from TabLayout.vue logic, new store for Vue 3
 * Uses Pinia Composition API style
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TabPage {
  path: string
  fullPath: string
  name: string
  meta?: {
    title?: string
    icon?: string
    componentName?: string
    keepAlive?: boolean
    [key: string]: any
  }
}

export const useTabStore = defineStore('tab', () => {
  // State
  const pageList = ref<TabPage[]>([])
  const activePage = ref<string>('')
  const cachedComponents = ref<string[]>([])

  /**
   * Add a tab page
   */
  function addTab(page: TabPage) {
    // Check if tab already exists
    const existIndex = pageList.value.findIndex(p => p.path === page.path)
    if (existIndex === -1) {
      pageList.value.push(page)
    } else {
      // Update existing tab's fullPath (may have different query params)
      pageList.value[existIndex] = { ...page }
    }
    activePage.value = page.path
    updateCache()
  }

  /**
   * Remove a tab page by path
   * Returns the path to navigate to after removal
   */
  function removeTab(path: string): string {
    const index = pageList.value.findIndex(p => p.path === path)
    if (index === -1) return activePage.value

    pageList.value.splice(index, 1)

    // If removed tab was the active one, switch to adjacent tab
    if (activePage.value === path) {
      if (pageList.value.length > 0) {
        // Try to go to the tab at the same position, or the last one
        const newIndex = Math.min(index, pageList.value.length - 1)
        activePage.value = pageList.value[newIndex].path
      } else {
        activePage.value = ''
      }
    }

    updateCache()
    return activePage.value
  }

  /**
   * Close all tabs to the left of specified path
   */
  function closeLeft(path: string) {
    const index = pageList.value.findIndex(p => p.path === path)
    if (index > 0) {
      pageList.value.splice(0, index)
    }
    // If active page was closed, switch to the target path
    if (!pageList.value.find(p => p.path === activePage.value)) {
      activePage.value = path
    }
    updateCache()
  }

  /**
   * Close all tabs to the right of specified path
   */
  function closeRight(path: string) {
    const index = pageList.value.findIndex(p => p.path === path)
    if (index >= 0 && index < pageList.value.length - 1) {
      pageList.value.splice(index + 1)
    }
    // If active page was closed, switch to the target path
    if (!pageList.value.find(p => p.path === activePage.value)) {
      activePage.value = path
    }
    updateCache()
  }

  /**
   * Close all tabs except the specified path
   */
  function closeOthers(path: string) {
    const targetPage = pageList.value.find(p => p.path === path)
    if (targetPage) {
      pageList.value = [targetPage]
      activePage.value = path
    }
    updateCache()
  }

  /**
   * Set active page
   */
  function setActivePage(path: string) {
    activePage.value = path
  }

  /**
   * Update the cached components list based on current pages
   */
  function updateCache() {
    cachedComponents.value = pageList.value
      .filter(page => page.meta?.keepAlive !== false && page.meta?.componentName)
      .map(page => page.meta!.componentName!)
  }

  /**
   * Clear all tabs
   */
  function clearAll() {
    pageList.value = []
    activePage.value = ''
    cachedComponents.value = []
  }

  return {
    // State
    pageList,
    activePage,
    cachedComponents,

    // Actions
    addTab,
    removeTab,
    closeLeft,
    closeRight,
    closeOthers,
    setActivePage,
    updateCache,
    clearAll
  }
})
