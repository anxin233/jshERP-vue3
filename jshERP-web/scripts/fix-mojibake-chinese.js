/**
 * 修复 UTF-8 被误按 Latin-1 解读后再次保存导致的中文乱码
 * 仅当修复后 CJK 字符增多且替换率合理时才写回文件
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SCAN_DIRS = [
  path.join(ROOT, 'src'),
  ROOT
]
const EXT = new Set(['.vue', '.js', '.html', '.less', '.css'])
const SKIP_DIR = new Set(['node_modules', 'dist', '.git', 'public'])

function walk (dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else {
      const ext = path.extname(entry.name).toLowerCase()
      if (EXT.has(ext)) files.push(full)
    }
  }
  return files
}

function recoverMojibake (text) {
  const bytes = new Uint8Array(text.length)
  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i) & 0xff
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return text
  }
}

function countCjk (text) {
  const m = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g)
  return m ? m.length : 0
}

/** 典型乱码片段（修复后应显著减少） */
function countGarbledMarkers (text) {
  const markers = [
    /閿€/g, /璇烽€/g, /鍔犺/g, /缂栬/g, /鏌ヨ/g, /鍒犻/g, /渚涘/g,
    /鐢靛/g, /鏈熷/g, /鍗曟/g, /搴撳/g, /閲囪/g, /闆跺/g, /婊氬/g,
    /绯荤粺/g, /鎵嬫/g, /鍚嶇/g, /瑙勬/g, /棰滆/g, /鍝佺/g
  ]
  let n = 0
  for (const re of markers) {
    const m = text.match(re)
    if (m) n += m.length
  }
  return n
}

function shouldApply (before, after) {
  if (before === after) return false
  const cjkBefore = countCjk(before)
  const cjkAfter = countCjk(after)
  const garbledBefore = countGarbledMarkers(before)
  const garbledAfter = countGarbledMarkers(after)
  if (cjkAfter < cjkBefore) return false
  if (garbledAfter >= garbledBefore && cjkAfter <= cjkBefore) return false
  // 替换字符过多可能是误伤
  const replacementRatio = (after.match(/\uFFFD/g) || []).length / Math.max(after.length, 1)
  if (replacementRatio > 0.01) return false
  return cjkAfter > cjkBefore || garbledAfter < garbledBefore
}

let fixed = 0
const files = []
SCAN_DIRS.forEach(d => walk(d, files))
const unique = [...new Set(files)]

for (const filePath of unique) {
  if (filePath.endsWith('fix-mojibake-chinese.js')) continue
  const before = fs.readFileSync(filePath, 'utf8')
  const after = recoverMojibake(before)
  if (shouldApply(before, after)) {
    fs.writeFileSync(filePath, after, 'utf8')
    fixed++
    console.log(path.relative(ROOT, filePath))
  }
}

console.log(`\nfixed ${fixed} files`)
