const fs = require('fs')
const path = require('path')

const WEB = path.join(__dirname, '..')
const REPLACEMENTS = [
  ['鑱旂郴浜', '联系人'],
  ['鑱旂郴鐢佃瘽', '联系电话'],
  ['鏈熸湯搴斾粯', '期末应付'],
  ['鏈熸湯应收', '期末应收'],
  ['鏈熸湯搴旀敹', '期末应收'],
  ['鏈熸湯搴旀敹锛', '期末应收：'],
  ['鍩烘湰淇℃伅', '基本信息'],
  ['鍩烘湰鍗曚綅', '基本单位'],
  ['棰勮完工', '预计完工'],
  ['搴旀敹閲戦', '应收金额'],
  ['绗簩琛岋細', '第二行：'],
  ['蹇熺姸鎬佹祦杞寜閽?', '快速状态流转按钮'],
  ['浠庨」鐩簱导入', '从项目库导入'],
  ['项目名称（堜粎浠庨」鐩簱閫夋嫨）', '项目名称（仅从项目库选择）'],
  ['// 鍥炲～鍩烘湰淇℃伅', '// 回填基本信息'],
  ['鏄惁操作閫変腑鏁版嵁?', '是否操作选中数据?'],
  ['鏄惁删除閫変腑鏁版嵁?', '是否删除选中数据?'],
  ['鏄惁新增选项', '是否新增选项'],
  ['鏄惁缁忕悊', '是否经理'],
  ['鏄惁鍚敤', '是否启用'],
  ['鏄惁灞曠ず多级审核', '是否展示多级审核'],
  ['//鏍￠獙鏄惁瀛樺湪澶氱骇瀹℃壒鎻掍欢', '//校验是否存在多级审批插件'],
  ['//鏍￠獙鏄惁瀛樺湪鐩樼偣鎻掍欢', '//校验是否存在盘点插件'],
  ['//鏍￠獙鏄惁瀛樺湪鐢熶骇鎻掍欢', '//校验是否存在生产插件'],
  ['默认选中', '默认选中'],
  ['公司名称长度超过30个字符', '公司名称长度超过30个字符'],
  ['销售协议长度超过100个字符', '销售协议长度超过100个字符']
].filter(([a, b]) => a !== b)
  .sort((a, b) => b[0].length - a[0].length)

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'scripts'].includes(e.name)) continue
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
  for (const [a, b] of REPLACEMENTS) c = c.split(a).join(b)
  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8')
    n++
    console.log(path.relative(WEB, f))
  }
}
console.log(`\nupdated ${n} files`)
