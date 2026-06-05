/** 高频通用词：禁用、优惠率、序列号等 */
const fs = require('fs')
const path = require('path')
const WEB = path.join(__dirname, '..')

const REPLACEMENTS = [
  ['绂佺敤', '禁用'],
  ['浼樻儬鐜', '优惠率'],
  ['浼樻儬否庨噾棰', '优惠后金额'],
  ['鏀舵浼樻儬', '收款优惠'],
  ['搴忓垪鍙', '序列号'],
  ['color="orange">搴</a-tag>', 'color="orange">序</a-tag>'],
  ['寰呭叆搴?', '待入库('],
  ['//寰呭叆搴?', '//待入库'],
  ['状态佹洿鏂版垚鍔', '状态更新成功'],
  ['//编辑鐨勬儏鍐典笅', '//编辑的情况下'],
  ['flex-shrink: 0;  /* 闃叉琚帇缂?*/', 'flex-shrink: 0;  /* 防止被压缩 */'],
].filter(([a, b]) => a !== b)

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist'].includes(e.name)) continue
    const f = path.join(dir, e.name)
    if (e.isDirectory()) walk(f, files)
    else if (/\.(vue|js|html|less)$/.test(e.name)) files.push(f)
  }
  return files
}

let n = 0
for (const f of walk(path.join(WEB, 'src'))) {
  let c = fs.readFileSync(f, 'utf8')
  const orig = c
  for (const [from, to] of REPLACEMENTS) {
    if (c.includes(from)) c = c.split(from).join(to)
  }
  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8')
    n++
    console.log(path.relative(WEB, f))
  }
}
console.log(`\nupdated ${n} files`)
