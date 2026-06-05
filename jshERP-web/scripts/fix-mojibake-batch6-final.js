const fs = require('fs')
const path = require('path')
const WEB = path.join(__dirname, '..')
const REPLACEMENTS = [
  ['鍥剧墖', '图片'],
  ['鏆傛湭鏀舵', '暂未收'],
  ['入库鏄庣粏', '入库明细'],
  ['璋冩嫧鏄庣粏', '调拨明细'],
  ['璋冩嫧鍑哄簱', '调拨出库'],
]

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist'].includes(e.name)) continue
    const f = path.join(dir, e.name)
    if (e.isDirectory()) walk(f, files)
    else if (/\.(vue|js)$/.test(e.name)) files.push(f)
  }
  return files
}

let n = 0
for (const f of walk(path.join(WEB, 'src'))) {
  let c = fs.readFileSync(f, 'utf8')
  const orig = c
  for (const [a, b] of REPLACEMENTS) {
    if (c.includes(a)) c = c.split(a).join(b)
  }
  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8')
    n++
    console.log(path.relative(WEB, f))
  }
}
console.log('updated', n)
