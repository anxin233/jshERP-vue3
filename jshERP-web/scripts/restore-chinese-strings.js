/**
 * 按出现顺序对齐 git / 当前文件中的中英文字符串并替换乱码
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const REPO = path.join(__dirname, '../..')
const WEB = path.join(__dirname, '..')
const SRC = path.join(WEB, 'src')

const GARBLED_RE = /閿€|璇烽€|鍔犺|缂栬|鏌ヨ|鍒犻|渚涘|鐢靛|鏈熷|鍗曟|搴撳|閲囪|闆跺|婊氬|绯荤粺|鎵嬫|鍚嶇|瑙勬|棰滆|鍝佺|榛樿|閲嶇|鏀惰|灞曞|纭畾|浠撳|閫€璐|瀹㈡|鎿嶄|鐘舵|澶嶅|鍒锋|璇疯|缁撴|寮€濮|鎼滅|鍖哄|鍟嗗|浼氬|缂栧彿|鏈未|宸插|瀹℃|纭畾/

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
    /'([^']{1,120})'/g,
    /"([^"]{1,120})"/g
  ]
  const seen = new Set()
  for (const re of patterns) {
    let m
    const r = new RegExp(re.source, re.flags)
    while ((m = r.exec(content))) {
      const t = m[1].trim()
      if (t.length < 2 || seen.has(t)) continue
      if (!/[\u4e00-\u9fff]/.test(t) && !GARBLED_RE.test(t)) continue
      if (/^[\d\s.,:;]+$/.test(t)) continue
      if (t.includes('${') || t.includes('{{')) continue
      seen.add(t)
      chunks.push(t)
    }
  }
  return chunks
}

function buildMap (gitChunks, curChunks) {
  const map = new Map()
  const n = Math.min(gitChunks.length, curChunks.length)
  for (let i = 0; i < n; i++) {
    const g = gitChunks[i]
    const c = curChunks[i]
    if (c === g) continue
    if (countGarbled(c) === 0 && countCjk(c) > countCjk(g)) continue
    if (countCjk(g) >= countCjk(c) && (countGarbled(c) > 0 || countGarbled(g) === 0)) {
      map.set(c, g)
    }
  }
  return map
}

function applyMap (content, map) {
  let next = content
  const entries = [...map.entries()].sort((a, b) => b[0].length - a[0].length)
  for (const [from, to] of entries) {
    if (!from || from === to) continue
    next = next.split(from).join(to)
  }
  return next
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

let fixed = 0
for (const abs of walk(SRC)) {
  const rel = path.relative(REPO, abs).replace(/\\/g, '/')
  const cur = fs.readFileSync(abs, 'utf8')
  if (countGarbled(cur) === 0) continue
  const git = gitShow(rel)
  if (!git) continue
  const map = buildMap(extractTextChunks(git), extractTextChunks(cur))
  if (map.size === 0) continue
  const next = applyMap(cur, map)
  if (next !== cur && countGarbled(next) < countGarbled(cur)) {
    fs.writeFileSync(abs, next, 'utf8')
    fixed++
    console.log(`${path.relative(WEB, abs)} (${map.size} strings)`)
  }
}

console.log(`\nupdated ${fixed} files`)
