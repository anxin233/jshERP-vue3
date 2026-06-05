function getPrintTarget(value) {
  if (!value) return null
  if (typeof value === 'string') {
    return document.querySelector(value)
  }
  if (value && typeof value === 'object') {
    const selector = value.id || value.el || value.selector
    return selector ? document.querySelector(selector) : null
  }
  return null
}

function copyFormState(source, copy) {
  const sourceFields = source.querySelectorAll('input, select, textarea')
  const copiedFields = copy.querySelectorAll('input, select, textarea')
  sourceFields.forEach((field, index) => {
    const copied = copiedFields[index]
    if (!copied) return
    const tag = field.tagName.toLowerCase()
    const type = (field.getAttribute('type') || '').toLowerCase()
    if (type === 'radio' || type === 'checkbox') {
      if (field.checked) {
        copied.setAttribute('checked', 'checked')
      } else {
        copied.removeAttribute('checked')
      }
      return
    }
    if (tag === 'select') {
      Array.from(copied.options).forEach((option, optionIndex) => {
        if (field.options[optionIndex] && field.options[optionIndex].selected) {
          option.setAttribute('selected', 'selected')
        } else {
          option.removeAttribute('selected')
        }
      })
      return
    }
    if (tag === 'textarea') {
      copied.textContent = field.value
      return
    }
    copied.setAttribute('value', field.value)
  })
}

function copyCanvasState(source, copy) {
  const sourceCanvasList = source.querySelectorAll('canvas')
  const copiedCanvasList = copy.querySelectorAll('canvas')
  sourceCanvasList.forEach((canvas, index) => {
    const copied = copiedCanvasList[index]
    if (!copied) return
    try {
      const image = document.createElement('img')
      image.src = canvas.toDataURL()
      image.style.maxWidth = '100%'
      image.style.width = canvas.style.width || `${canvas.width}px`
      image.style.height = canvas.style.height || 'auto'
      copied.replaceWith(image)
    } catch (error) {
      copied.remove()
    }
  })
}

function preparePrintableNode(source) {
  const copy = source.cloneNode(true)
  copy.querySelectorAll('[ignore-print="true"], [ignoreprint="true"]').forEach(element => {
    element.remove()
  })
  copyFormState(source, copy)
  copyCanvasState(source, copy)
  return copy
}

function collectHeadHtml(options = {}) {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(link => `<link rel="stylesheet" href="${link.href}">`)
    .join('')
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules || [])
          .map(rule => rule.cssText)
          .join('')
      } catch (error) {
        return ''
      }
    })
    .join('')
  const extraHead = options.extraHead || ''
  const extraCss = options.extraCss
    ? String(options.extraCss)
      .split(',')
      .map(url => url.trim())
      .filter(Boolean)
      .map(url => `<link rel="stylesheet" href="${url}">`)
      .join('')
    : ''
  return `<head><title>${options.popTitle || document.title || ''}</title>${extraHead}${links}${extraCss}<style>${styles}</style></head>`
}

function createPrintFrame() {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  return iframe
}

function resolveOptions(value) {
  return value && typeof value === 'object' ? value : { selector: value }
}

function printElement(value) {
  const options = resolveOptions(value)
  const target = getPrintTarget(value)
  if (!target) {
    window.print()
    return Promise.resolve()
  }
  const printable = preparePrintableNode(target)
  const iframe = createPrintFrame()
  const printWindow = iframe.contentWindow
  const printDocument = iframe.contentDocument || printWindow.document
  printDocument.open()
  printDocument.write(`<!DOCTYPE html><html>${collectHeadHtml(options)}<body>${printable.outerHTML}</body></html>`)
  printDocument.close()
  return new Promise(resolve => {
    const cleanup = () => {
      setTimeout(() => {
        iframe.remove()
        resolve()
      }, 100)
    }
    const runPrint = () => {
      try {
        printWindow.focus()
        printWindow.print()
      } finally {
        cleanup()
      }
    }
    setTimeout(runPrint, 80)
  })
}

const PrintPlugin = {
  install(app) {
    app.directive('print', {
      mounted(el, binding) {
        el.__printValue__ = binding.value
        el.__printRunning__ = false
        el.__printClick__ = () => {
          if (el.__printRunning__) return
          el.__printRunning__ = true
          printElement(el.__printValue__).finally(() => {
            el.__printRunning__ = false
          })
        }
        el.addEventListener('click', el.__printClick__)
      },
      updated(el, binding) {
        el.__printValue__ = binding.value
      },
      beforeUnmount(el) {
        if (el.__printClick__) {
          el.removeEventListener('click', el.__printClick__)
        }
        delete el.__printValue__
        delete el.__printRunning__
        delete el.__printClick__
      }
    })
  }
}

export default PrintPlugin
