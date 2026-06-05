/**
 * 该文件截取自 "ant-design-vue/es/_util/props-util.js" 文件，并对其做出特殊修改
 */
function classNames() {
  let classes = []

  for (let i = 0; i < arguments.length; i++) {
    let arg = arguments[i]
    if (!arg) continue

    let argType = typeof arg

    if (argType === 'string' || argType === 'number') {
      classes.push(arg)
    } else if (Array.isArray(arg) && arg.length) {
      let inner = classNames.apply(null, arg)
      if (inner) {
        classes.push(inner)
      }
    } else if (argType === 'object') {
      for (let key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key)
        }
      }
    }
  }
  return classes.join(' ')
}

const camelizeRE = /-(\w)/g

function camelize(str) {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}


function objectCamelize(obj) {
  let res = {}
  Object.keys(obj).forEach(k => (res[camelize(k)] = obj[k]))
  return res
}

function parseStyleText(cssText = '', camel) {
  const res = {}
  const listDelimiter = /;(?![^(]*\))/g
  const propertyDelimiter = /:(.+)/
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      const tmp = item.split(propertyDelimiter)
      if (tmp.length > 1) {
        const k = camel ? camelize(tmp[0].trim()) : tmp[0].trim()
        res[k] = tmp[1].trim()
      }
    }
  })
  return res
}

function mergeClassNames (cls, tempCls) {
  if (!tempCls) {
    return cls
  }
  if (typeof tempCls === 'string') {
    tempCls.split(' ').forEach(c => {
      const key = c.trim()
      if (key) {
        cls[key] = true
      }
    })
  } else if (Array.isArray(tempCls)) {
    classNames(tempCls)
      .split(' ')
      .forEach(c => {
        const key = c.trim()
        if (key) {
          cls[key] = true
        }
      })
  } else if (typeof tempCls === 'object') {
    cls = { ...cls, ...tempCls }
  }
  return cls
}

/** Vue 3：从组件实例 $attrs 读取 class（替代 Vue 2 的 ele.data） */
export function getClass (ele) {
  const attrs = ele && ele.$attrs ? ele.$attrs : {}
  let cls = mergeClassNames({}, attrs.class)
  return cls
}

/** Vue 3：从组件实例 $attrs 读取 style（替代 Vue 2 的 ele.data） */
export function getStyle (ele, camel) {
  const attrs = ele && ele.$attrs ? ele.$attrs : {}
  let style = attrs.style || {}

  if (typeof style === 'string') {
    style = parseStyleText(style, camel)
  } else if (style && typeof style === 'object') {
    style = camel ? objectCamelize(style) : { ...style }
  } else {
    style = {}
  }
  return style
}

