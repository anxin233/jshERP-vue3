const fs = require('fs')
const path = require('path')

const MAP = [
  ['<!-- 鐘舵佹覆鏌撴ā鏉?-->', '<!-- 状态渲染模板 -->'],
  ['this.$message.error("璇疯缃畊rl.list灞炴?")', 'this.$message.error("请设置url.list属性!")'],
  ['this.$message.error("璇疯缃畊rl.delete灞炴?")', 'this.$message.error("请设置url.delete属性!")'],
  ['//鍘熷鍗曟嵁绫诲瀷', '//原单据类型']
]

function walk (d, f = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, f)
    else if (/\.vue$/.test(e.name)) f.push(p)
  }
  return f
}

let n = 0
for (const f of walk(path.join(__dirname, '../src'))) {
  let c = fs.readFileSync(f, 'utf8')
  const o = c
  for (const [a, b] of MAP) c = c.split(a).join(b)
  if (c !== o) {
    fs.writeFileSync(f, c)
    n++
    console.log(f)
  }
}
console.log('done', n)
