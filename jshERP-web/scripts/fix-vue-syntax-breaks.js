/**
 * 修复 Vite 全量 glob 暴露的 JS 字符串语法断裂（? 替代逗号/引号）
 */
const fs = require('fs')
const path = require('path')

function walk (dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(fullPath, fn)
    else if (entry.name.endsWith('.vue')) fn(fullPath)
  }
}

function fixContent (content) {
  let next = content

  // + "元" 断裂
  next = next.replace(/\+ "锛\?/g, "+ '元'")
  next = next.replace(/\+ "元\?/g, "+ '元'")

  // 列 title：态', 被编码成 鐘舵€"
  next = next.replace(/title: '鐘舵€",dataIndex/g, "title: '状态', dataIndex")
  next = next.replace(/title: '绉熸埛鐘舵€",dataIndex/g, "title: '租户状态', dataIndex")
  next = next.replace(/title: '([^']*)",dataIndex/g, "title: '$1', dataIndex")
  next = next.replace(/placeholder="([^"]*)\?\/>/g, 'placeholder="$1"/>')
  next = next.replace(/placeholder="([^"]*)\?>/g, 'placeholder="$1">')
  next = next.replace(/value="([^"]*)\?>([^<]*)</g, 'value="$1">$2<')

  // title / modalTitle 行末缺引号
  next = next.replace(/(\.title = '[^'\n]+)\?(\s*\n)/g, "$1'$2")
  next = next.replace(/(groupModalTitle = '[^'\n]+)\?(\s*\n)/g, "$1'$2")
  next = next.replace(/(\.title = "[^"\n]+)\?(\s*\n)/g, '$1"$2')

  // let head 行：? → 逗号，并补全缺失的收尾引号
  next = next.replace(/^(\s*let head = ')(.+)$/gm, (line, prefix, rest) => {
    if (!rest.includes('?')) return line
    let body = rest
    if (body.endsWith("'")) body = body.slice(0, -1)
    body = body.replace(/\?/g, ',')
    return prefix + body + "'"
  })

  next = next.replace(/\?\/b>/g, '</b>')
  next = next.replace(/\?\/a>/g, '</a>')
  next = next.replace(/\?b>/g, '<b>')
  next = next.replace(/type:'([^']*)",/g, "type:'$1',")
  next = next.replace(/\?\/td>/g, '</td>')
  next = next.replace(/'value': '([^']*)\? \},/g, "'value': '$1' },")
  next = next.replace(/ModalTitle: '([^']*)",/g, "ModalTitle: '$1',")

  return next
}

let fixed = 0
walk(path.join(__dirname, '../src'), filePath => {
  const original = fs.readFileSync(filePath, 'utf8')
  const content = fixContent(original)
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8')
    fixed++
    console.log(filePath)
  }
})
console.log(`fixed ${fixed} files`)
