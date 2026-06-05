const fs = require('fs')
const path = require('path')
const WEB = path.join(__dirname, '..')
const REPLACEMENTS = [
  ['{title: \'鍥炬爣\'', '{title: \'图标\''],
  ['{title: \'绋庣巼(%)', '{title: \'税率(%)'],
  ['{ title: \'绋庣巼(%)', '{ title: \'税率(%)'],
  ['color="green">鏄</a-tag>', 'color="green">是</a-tag>'],
  ['handleExportXlsPost(\'出库鏄庣粏\'', 'handleExportXlsPost(\'出库明细\''],
]
function walk(d, f = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, f)
    else if (/\.(vue|js)$/.test(e.name)) f.push(p)
  }
  return f
}
let n = 0
for (const file of walk(path.join(WEB, 'src'))) {
  let c = fs.readFileSync(file, 'utf8')
  const o = c
  for (const [a, b] of REPLACEMENTS) if (c.includes(a)) c = c.split(a).join(b)
  if (c !== o) { fs.writeFileSync(file, c); n++; console.log(path.relative(WEB, file)) }
}
console.log('updated', n)
