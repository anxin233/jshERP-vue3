/**
 * Enhance Store - JS enhancement records
 * Migrated from Vue 2 store/modules/enhance.js
 * Uses Pinia Composition API style
 */
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { setStore } from '@/utils/storage'

const ENHANCE_PRE = 'enhance_'

export interface EnhanceRecord {
  code: string
  [key: string]: any
}

export const useEnhanceStore = defineStore('enhance', () => {
  // State
  const enhanceJs = reactive<Record<string, EnhanceRecord[]>>({})

  /**
   * Add a table enhance record
   * Migrated from Vue 2 ADD_TABLE_ENHANCE mutation
   */
  function addEnhanceRecord(record: EnhanceRecord) {
    if (!enhanceJs[record.code]) {
      enhanceJs[record.code] = []
    }
    enhanceJs[record.code].push({ ...record })

    // Keep max 16 records per code
    const arr = enhanceJs[record.code]
    while (arr.length > 16) {
      arr.shift()
    }

    setStore(ENHANCE_PRE + record.code, arr)
  }

  return {
    // State
    enhanceJs,

    // Actions
    addEnhanceRecord
  }
})
