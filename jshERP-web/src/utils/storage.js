import Vue from 'vue'
import VueStorage from 'vue-ls'
import config from '@/defaultSettings'

let storageInstance = null

function getStorageInstance() {
  if (!storageInstance) {
    if (!Vue.ls) {
      Vue.use(VueStorage, config.storageOptions)
    }
    storageInstance = Vue.ls
  }
  return storageInstance
}

const storage = {
  get(name, def = null) {
    return getStorageInstance().get(name, def)
  },
  set(name, value, expire = null) {
    return getStorageInstance().set(name, value, expire)
  },
  remove(name) {
    return getStorageInstance().remove(name)
  },
  clear() {
    return getStorageInstance().clear()
  },
  on(name, callback) {
    return getStorageInstance().on(name, callback)
  },
  off(name, callback) {
    return getStorageInstance().off(name, callback)
  }
}

export function installStorage(app) {
  const instance = getStorageInstance()
  if (app && app.config && app.config.globalProperties) {
    app.config.globalProperties.$ls = instance
    app.config.globalProperties.$storage = storage
  }
  return instance
}

export const setStore = (name, content, maxAge = null) => {
  const expire = maxAge && !isNaN(parseInt(maxAge)) ? parseInt(maxAge) * 1000 : null
  return storage.set(name, content, expire)
}

export const getStore = name => storage.get(name)

export const clearStore = name => storage.remove(name)

export const clearAll = () => storage.clear()

export default storage
