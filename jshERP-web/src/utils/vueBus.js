function createBus() {
  const events = new Map()
  return {
    $on(event, handler) {
      if (!events.has(event)) events.set(event, new Set())
      events.get(event).add(handler)
    },
    $off(event, handler) {
      if (!event) {
        events.clear()
        return
      }
      if (!handler) {
        events.delete(event)
        return
      }
      const handlers = events.get(event)
      if (handlers) handlers.delete(handler)
    },
    $emit(event, ...args) {
      const handlers = events.get(event)
      if (handlers) handlers.forEach(handler => handler(...args))
    }
  }
}

let install = function (app) {
  app.config.globalProperties.$bus = createBus()
}

export default { install }
