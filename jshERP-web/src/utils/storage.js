import config from '@/defaultSettings'

const storageOptions = config.storageOptions || {}
const namespace = storageOptions.namespace || ''
const storageType = storageOptions.storage || 'local'
let memoryStore = {}

function getBackend() {
  if (storageType === 'session' && typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage
  }
  if (storageType === 'local' && typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null
    },
    setItem(key, value) {
      memoryStore[key] = String(value)
    },
    removeItem(key) {
      delete memoryStore[key]
    },
    clear() {
      memoryStore = {}
    }
  }
}

function buildKey(name) {
  return `${namespace}${name}`
}

function decodeValue(raw, name, def) {
  if (raw == null) return def
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && Object.prototype.hasOwnProperty.call(parsed, 'value')) {
      if (parsed.expire && parsed.expire < Date.now()) {
        storage.remove(name)
        return def
      }
      return parsed.value
    }
    return parsed
  } catch (e) {
    return raw
  }
}

const storage = {
  get(name, def = null) {
    return decodeValue(getBackend().getItem(buildKey(name)), name, def)
  },
  set(name, value, expire = null) {
    const expireAt = expire && !isNaN(parseInt(expire)) ? Date.now() + parseInt(expire) : null
    getBackend().setItem(buildKey(name), JSON.stringify({ value, expire: expireAt }))
    return value
  },
  remove(name) {
    getBackend().removeItem(buildKey(name))
  },
  clear() {
    const backend = getBackend()
    if (!namespace || !backend.length) {
      backend.clear()
      return
    }
    const keys = []
    for (let i = 0; i < backend.length; i++) {
      const key = backend.key(i)
      if (key && key.indexOf(namespace) === 0) keys.push(key)
    }
    keys.forEach(key => backend.removeItem(key))
  },
  on(name, callback) {
    if (typeof window === 'undefined' || !callback) return
    window.addEventListener('storage', event => {
      if (event.key === buildKey(name)) {
        callback(this.get(name), event)
      }
    })
  },
  off() {}
}

export function installStorage(app) {
  if (app && app.config && app.config.globalProperties) {
    if (!('$ls' in app.config.globalProperties)) {
      app.config.globalProperties.$ls = storage
    }
    app.config.globalProperties.$storage = storage
  }
  return storage
}

export const setStore = (name, content, maxAge = null) => {
  const expire = maxAge && !isNaN(parseInt(maxAge)) ? parseInt(maxAge) * 1000 : null
  return storage.set(name, content, expire)
}

export const getStore = name => storage.get(name)

export const clearStore = name => storage.remove(name)

export const clearAll = () => storage.clear()

export default storage
