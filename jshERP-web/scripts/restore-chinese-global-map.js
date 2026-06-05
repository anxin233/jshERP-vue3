/**
 * 从所有 git 与当前文件对中提取 乱码→正确中文 映射，全局替换
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const REPO = path.join(__dirname, '../..')
const WEB = path.join(__dirname, '..')
const SRC = path.join(WEB, 'src')

const GARBLED_RE = /閿€|璇烽€|鍔犺|缂栬|鏌ヨ|鍒犻|渚涘|鐢靛|鏈熷|鍗曟|搴撳|閲囪|闆跺|婊氬|绯荤粺|鎵嬫|鍚嶇|瑙勬|棰滆|鍝佺|榛樿|閲嶇|鏀惰|灞曞|纭畾|浠撳|閫€璐|瀹㈡|鎿嶄|鐘舵|澶嶅|鍒锋|璇疯|缁撴|寮€濮|鎼滅|鍖哄|鍟嗗|浼氬|缂栧彿|宸插|瀹℃|纭畾|鏈未|鍒犻|缂栬|鏌ヨ|闆跺/

function countCjk (t) {
  return (t.match(/[\u4e00-\u9fff]/g) || []).length
}

function countGarbled (t) {
  return (t.match(new RegExp(GARBLED_RE.source, 'g')) || []).length
}

function gitShow (rel) {
  try {
    return execSync(`git show HEAD:${rel}`, {
      cwd: REPO,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024
    })
  } catch {
    return null
  }
}

function extractTextChunks (content) {
  const chunks = []
  const patterns = [
    /label="([^"]+)"/g,
    /placeholder="([^"]+)"/g,
    /title="([^"]+)"/g,
    /message="([^"]+)"/g,
    />([^<>{}\n]+?)</g,
    /'([^']{1,120})'/g
  ]
  const seen = new Set()
  for (const re of patterns) {
    let m
    const r = new RegExp(re.source, re.flags)
    while ((m = r.exec(content))) {
      const t = m[1].trim()
      if (t.length < 2 || seen.has(t)) continue
      if (!/[\u4e00-\u9fff]/.test(t) && !GARBLED_RE.test(t)) continue
      if (/^[\d\s.,:;%]+$/.test(t)) continue
      if (t.includes('${') || t.includes('{{') || t.includes('+=', 1)) continue
      seen.add(t)
      chunks.push(t)
    }
  }
  return chunks
}

function walk (dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue
    const f = path.join(dir, e.name)
    if (e.isDirectory()) walk(f, files)
    else if (/\.vue$/.test(e.name)) files.push(f)
  }
  return files
}

// 构建全局映射
const globalMap = new Map()
for (const abs of walk(SRC)) {
  const rel = path.relative(REPO, abs).replace(/\\/g, '/')
  const git = gitShow(rel)
  if (!git) continue
  const cur = fs.readFileSync(abs, 'utf8')
  const gChunks = extractTextChunks(git)
  const cChunks = extractTextChunks(cur)
  const n = Math.min(gChunks.length, cChunks.length)
  for (let i = 0; i < n; i++) {
    const g = gChunks[i]
    const c = cChunks[i]
    if (c === g) continue
    if (countGarbled(c) > 0 && countCjk(g) > countCjk(c)) {
      globalMap.set(c, g)
    }
    if (countGarbled(g) === 0 && countGarbled(c) > 0 && countCjk(g) >= 2) {
      globalMap.set(c, g)
    }
  }
}

// 常见按钮/操作（git 中稳定出现）
const MANUAL = [
  ['闆跺敭鍑哄簱', '零售出库'],
  ['缂栬緫', '编辑'],
  ['澶嶅埗', '复制'],
  ['鍒犻櫎', '删除'],
  ['纭畾鍒犻櫎鍚', '确定删除吗'],
  ['纭畾鍒犻櫎鍚?', '确定删除吗'],
  ['鏌ヨ', '查询'],
  ['閲嶇疆', '重置'],
  ['鏀惰捣', '收起'],
  ['灞曞紑', '展开'],
  ['鍒楄缃', '列设置'],
  ['鍒锋柊鍒楄〃', '刷新列表'],
  ['鍒锋柊', '刷新'],
  ['瀹℃牳涓', '审核中']
]
MANUAL.forEach(([a, b]) => globalMap.set(a, b))

let fixed = 0
const entries = [...globalMap.entries()]
  .filter(([from, to]) => from && to && from !== to && countGarbled(from) > 0)
  .sort((a, b) => b[0].length - a[0].length)

for (const abs of walk(SRC)) {
  let cur = fs.readFileSync(abs, 'utf8')
  const before = countGarbled(cur)
  if (before === 0) continue
  let next = cur
  for (const [from, to] of entries) {
    if (next.includes(from)) next = next.split(from).join(to)
  }
  if (next !== cur && countGarbled(next) < before) {
    fs.writeFileSync(abs, next, 'utf8')
    fixed++
    console.log(path.relative(WEB, abs), `${before} -> ${countGarbled(next)}`)
  }
}

console.log(`\nglobal map size ${globalMap.size}, updated ${fixed} files`)
