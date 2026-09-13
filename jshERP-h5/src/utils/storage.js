const PREFIX = 'jsh-h5__'

export function set (key, value, expireMs) {
  try {
    const payload = { value, expire: expireMs ? Date.now() + expireMs : 0 }
    localStorage.setItem(PREFIX + key, JSON.stringify(payload))
  } catch {
    // 存储不可用时静默失败
  }
}

export function get (key, defaultValue = '') {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return defaultValue
    const payload = JSON.parse(raw)
    if (!payload || typeof payload !== 'object') return defaultValue
    if (payload.expire && Date.now() > payload.expire) {
      localStorage.removeItem(PREFIX + key)
      return defaultValue
    }
    return payload.value === undefined || payload.value === null ? defaultValue : payload.value
  } catch {
    return defaultValue
  }
}

export function remove (key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}
