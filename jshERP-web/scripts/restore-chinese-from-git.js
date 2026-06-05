/**
 * 从 git HEAD 恢复中文文案，保留当前文件中的 Vue3 / Ant Design Vue4 写法
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const REPO = path.join(__dirname, '../..')
const WEB = path.join(__dirname, '..')
const SRC = path.join(WEB, 'src')

const GARBLED_RE = /閿€|璇烽€|鍔犺|缂栬|鏌ヨ|鍒犻|渚涘|鐢靛|鏈熷|鍗曟|搴撳|閲囪|闆跺|婊氬|绯荤粺|鎵嬫|鍚嶇|瑙勬|棰滆|鍝佺|榛樿|閲嶇|鏀惰|灞曞|纭畾|浠撳|閫€璐|瀹㈡|鎿嶄|鐘舵|鏈未|澶嶅|鍒锋|璇疯|鍗曟|缁撴|寮€濮|鎼滅|鍖哄|鍟嗗|浼氬|缂栧彿/

function countCjk (t) {
  return (t.match(/[\u4e00-\u9fff]/g) || []).length
}

function isGarbled (t) {
  return GARBLED_RE.test(t) || (countCjk(t) > 0 && /[€鍙鎴璇烽]/.test(t) && /[\u4e00-\u9fff]{2,}/.test(t) && !/[\u4e00-\u9fff]{4,}/.test(t.replace(/[^\u4e00-\u9fff]/g, '')))
}

function countGarbled (t) {
  let n = 0
  const re = new RegExp(GARBLED_RE.source, 'g')
  const m = t.match(re)
  if (m) n += m.length
  return n
}

function gitShow (relPath) {
  try {
    return execSync(`git show HEAD:${relPath}`, {
      cwd: REPO,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024
    })
  } catch {
    return null
  }
}

function mergeVue3Line (gitLine, curLine) {
  let line = gitLine
  if (curLine.includes('v-model:value') && line.includes('v-model="')) {
    line = line.replace(/\bv-model="/g, 'v-model:value="')
  }
  if (curLine.includes('v-model:checked') && /\bv-model="/.test(line)) {
    line = line.replace(/\bv-model="/g, 'v-model:checked="')
  }
  if (curLine.includes('v-model:checked') && /\bv-model:value="/.test(line)) {
    line = line.replace(/\bv-model:value="/g, 'v-model:checked="')
  }
  return line
}

function collectPairs (gitContent, curContent) {
  const pairs = []
  const patterns = [
    { re: /label="([^"]*)"/g, i: 1 },
    { re: /placeholder="([^"]*)"/g, i: 1 },
    { re: /title="([^"]*)"/g, i: 1 },
    { re: /message="([^"]*)"/g, i: 1 },
    { re: /title:\s*'([^']*)'/g, i: 1 },
    { re: /title:\s*"([^"]*)"/g, i: 1 },
    { re: /@click="myHandleDetail\(record,\s*'([^']*)'/g, i: 1 },
    { re: /'key':\s*'[^']*',\s*'value':\s*'([^']*)'/g, i: 1 }
  ]
  for (const { re, i } of patterns) {
    const gRe = new RegExp(re.source, re.flags)
    const cRe = new RegExp(re.source, re.flags)
    const gm = [...gitContent.matchAll(gRe)]
    const cm = [...curContent.matchAll(cRe)]
    for (let j = 0; j < Math.min(gm.length, cm.length); j++) {
      const g = gm[j][i]
      const c = cm[j][i]
      if (c && g && c !== g && countGarbled(c) > 0 && countCjk(g) >= countCjk(c)) {
        pairs.push([c, g])
      }
    }
  }
  return pairs
}

function applyReplacements (content, pairs) {
  let next = content
  const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length)
  const seen = new Set()
  for (const [from, to] of sorted) {
    if (!from || from === to || seen.has(from)) continue
    if (!next.includes(from)) continue
    next = next.split(from).join(to)
    seen.add(from)
  }
  return next
}

function restoreFile (absPath) {
  const rel = path.relative(REPO, absPath).replace(/\\/g, '/')
  const cur = fs.readFileSync(absPath, 'utf8')
  if (countGarbled(cur) === 0) return false

  const git = gitShow(rel)
  if (!git) return false

  let next = cur
  const pairs = collectPairs(git, cur)
  next = applyReplacements(next, pairs)

  const gitLines = git.split('\n')
  const curLines = next.split('\n')
  const out = []
  const len = Math.max(gitLines.length, curLines.length)
  let lineChanged = false
  for (let i = 0; i < len; i++) {
    const g = gitLines[i] || ''
    const c = curLines[i] || ''
    if (countGarbled(c) > 0 && countCjk(g) > countCjk(c) && countGarbled(g) < countGarbled(c)) {
      out.push(mergeVue3Line(g, c))
      lineChanged = true
    } else {
      out.push(c)
    }
  }
  next = out.join('\n')

  if (next !== cur && countGarbled(next) < countGarbled(cur)) {
    fs.writeFileSync(absPath, next, 'utf8')
    return true
  }
  return false
}

function walk (dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue
    const f = path.join(dir, e.name)
    if (e.isDirectory()) walk(f, files)
    else if (/\.(vue|js|html|less)$/.test(e.name)) files.push(f)
  }
  return files
}

let fixed = 0
const targets = [
  ...walk(SRC),
  path.join(WEB, 'index.html')
]
for (const f of targets) {
  if (restoreFile(f)) {
    fixed++
    console.log(path.relative(WEB, f))
  }
}
console.log(`\nrestored ${fixed} files`)
