/**
 * 列配置静态检查：构建前或代码审查时扫描 defColumns 常见问题
 * 用法: node scripts/check-column-config.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'src')
const VIEW_DIRS = ['views', 'components']
const FORM_HINT = /请输入|请选择/

let errorCount = 0

function rel(file) {
  return path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/')
}

function report(file, line, message) {
  errorCount++
  console.error(`${rel(file)}:${line}: ${message}`)
}

function lineOf(content, index, baseLine) {
  return baseLine + content.slice(0, index).split('\n').length - 1
}

function extractTopLevelObjects(arrayBody) {
  const items = []
  let depth = 0
  let start = -1
  let inString = null
  let escaped = false

  for (let i = 0; i < arrayBody.length; i++) {
    const ch = arrayBody[i]
    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === inString) {
        inString = null
      }
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = ch
      continue
    }
    if (ch === '{') {
      depth++
      if (depth === 1) {
        start = i
      }
      continue
    }
    if (ch === '}') {
      if (depth === 1 && start >= 0) {
        items.push(arrayBody.slice(start, i + 1))
        start = -1
      }
      depth--
    }
  }
  return items
}

function scanDefColumnsBlocks(content, file) {
  const defColumnsRe = /defColumns\s*:\s*\[/g
  let match
  while ((match = defColumnsRe.exec(content)) !== null) {
    const arrayStart = match.index + match[0].length - 1
    let depth = 0
    let inString = null
    let escaped = false
    let arrayEnd = -1
    const baseLine = content.slice(0, match.index).split('\n').length

    for (let i = arrayStart; i < content.length; i++) {
      const ch = content[i]
      if (inString) {
        if (escaped) {
          escaped = false
          continue
        }
        if (ch === '\\') {
          escaped = true
          continue
        }
        if (ch === inString) {
          inString = null
        }
        continue
      }
      if (ch === '"' || ch === "'") {
        inString = ch
        continue
      }
      if (ch === '[') depth++
      if (ch === ']') {
        depth--
        if (depth === 0) {
          arrayEnd = i
          break
        }
      }
    }

    if (arrayEnd < 0) continue
    const arrayBody = content.slice(arrayStart + 1, arrayEnd)
    const columns = extractTopLevelObjects(arrayBody)
    const blockStartIndex = arrayStart + 1

    for (const col of columns) {
      const colIndex = arrayBody.indexOf(col)
      const line = lineOf(content, blockStartIndex + colIndex, baseLine)
      const dataIndexMatch = col.match(/dataIndex\s*:\s*['"]([^'"]+)['"]/)
      const titleMatch = col.match(/title\s*:\s*['"]([^'"]*)['"]/)
      const hide = /hideInColumnSetting\s*:\s*true/.test(col)

      if (!dataIndexMatch) {
        report(file, line, 'defColumns 项缺少 dataIndex')
        continue
      }

      const dataIndex = dataIndexMatch[1]
      if (hide) continue

      if (!titleMatch || !titleMatch[1].trim()) {
        if (dataIndex === 'action' || dataIndex === 'rowIndex') {
          report(file, line, `列 "${dataIndex}" 缺少 title（列设置将依赖兜底）`)
        } else {
          report(file, line, `列 "${dataIndex}" 缺少 title`)
        }
        continue
      }

      const title = titleMatch[1]
      if (FORM_HINT.test(title)) {
        report(file, line, `列 "${dataIndex}" 的 title 疑似表单校验文案: "${title}"`)
      }
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walk(full)
    } else if (name.endsWith('.vue') || name.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8')
      if (content.includes('defColumns')) {
        scanDefColumnsBlocks(content, full)
      }
    }
  }
}

for (const sub of VIEW_DIRS) {
  walk(path.join(ROOT, sub))
}

if (errorCount > 0) {
  console.error(`\n共 ${errorCount} 个问题，请修复 defColumns 列标题配置。`)
  process.exit(1)
}

console.log('列配置检查通过。')
