const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'src')

const MOJIBAKE_PATTERNS = [
  /绱㈠紩/,
  /閫娆/,
  /鏉＄爜/,
  /瀛楀吀/,
  /鏇存柊鏃堕棿/,
  /閾炬帴/,
  /[鍒鏈璐閲鎵鍗鏍鍑娴鐢缁璁鐗鍙璋冩嫧瀛楃杩浠樿垂绉熸埛瑙掕壊鍒涘缓鏈浣庢渶楂樿褰撳墠瀹為檯杩涜揣椤甸潰閾炬帴涓婁紶鑾峰彇鏉′欢鍒嗛厤鏍戝舰瑙嗗浘鍒楄〃鍒囨崲鏋勫缓浣跨敤閲嶈浇鍦ㄦ柊澧炰繚闄╂搷浣滃埗閫犲崟浣嶅師浠锋牸鎵归噺浼樻儬閲戦]/
]

function walk (dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!['node_modules', 'dist'].includes(ent.name)) walk(p, acc)
    } else if (/\.(vue|js)$/.test(ent.name)) {
      acc.push(p)
    }
  }
  return acc
}

const hits = []
for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\n/)
  lines.forEach((line, i) => {
    for (const re of MOJIBAKE_PATTERNS) {
      if (re.test(line)) {
        hits.push({ file: path.relative(ROOT, file), line: i + 1, text: line.trim().slice(0, 140) })
        break
      }
    }
  })
}

console.log(JSON.stringify(hits, null, 2))
