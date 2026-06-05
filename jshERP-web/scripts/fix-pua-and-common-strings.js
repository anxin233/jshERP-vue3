/**
 * 移除 UTF-8 修复残留的 PUA 字符，并替换常见残留乱码
 */
const fs = require('fs')
const path = require('path')

const WEB = path.join(__dirname, '..')

const REPLACEMENTS = [
  ['新增宸ュ崟', '新增工单'],
  ['新增', '新增'], // noop placeholder
  ['绗\ue0c1簩琛岋細', '第二行：'],
  ['绗二行：', '第二行：'],
  ['蹇\ue0a1熺姸鎬佹祦杞\ue100寜閽?', '快速状态流转按钮'],
  ['棰勮\ue161完工', '预计完工'],
  ['搴旀敹閲戦\ue576', '应收金额'],
  ['瀹屽杽鏇村\ue61a淇℃伅', '完善更多信息'],
  ['浠庨」鐩\ue100簱导入', '从项目库导入'],
  ['<!-- 项目名称锛堜粎浠庨」鐩\ue100簱閫夋嫨锛?-->', '<!-- 项目名称（仅从项目库选择） -->'],
  ['// 閫変腑鍒氭墠新增\ue576鐨勯」', '// 选中刚才新增的项'],
  ['鏄\ue21b惁操作閫変腑鏁版嵁?', '是否操作选中数据?'],
  ['鏄\ue21b惁删除閫変腑鏁版嵁?', '是否删除选中数据?'],
  ['鏈熸湯搴旀敹', '期末应收'],
  ['鏈熸湯搴旀敹锛', '期末应收：'],
  ['公司名称闀垮害瓒呰繃30涓\ue161瓧绗', '公司名称长度超过30个字符'],
  ['销售协议\ue161暱搴﹁秴杩?00涓\ue161瓧绗', '销售协议长度超过100个字符'],
  ['请输入组编码!閫変腑', '默认选中'],
  ['//涓嶆樉绀鸿\ue161瑷€閫夋嫨鏍囩\ue137', '//不显示语言选择标签'],
  ['//璁剧疆鏈\ue100湴璇\ue161\ue161锛堝綋鍓嶇綉椤电殑璇\ue161\ue161锛夈€傚\ue6e7鏋滀笉璁剧疆锛岄粯璁ゅ氨鏄?', "//设置本地语言（当前网页的语言）。如果不设置，默认就是"],
  [' 绠€浣撲腑鏂?', " 'chinese_simplified' 简体中文"],
  ['鎵归噺', '批量'],
  ['修正库存', '修正库存'],
  ['锛堝惎鐢ㄥ悗锛岄渶瑕佸埌', '（启用后，需要到'],
  ['锛堝惎鐢ㄥ悠', '（启用后'],
  ['锛?', '）'],
  ['锛', '（'],
  ['€', ''],
  ['', ''],
  ['', ''],
  ['', ''],
  ['', ''],
  ['', ''],
  ['', ''],
].filter(([a, b]) => a !== b)
  .sort((a, b) => b[0].length - a[0].length)

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === 'scripts') continue
    const f = path.join(dir, e.name)
    if (e.isDirectory()) walk(f, files)
    else if (/\.(vue|js|html)$/.test(e.name)) files.push(f)
  }
  return files
}

let n = 0
const files = walk(path.join(WEB, 'src'))
files.push(path.join(WEB, 'index.html'))

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8')
  const orig = c
  // 移除私用区字符（迁移残留）
  c = c.replace(/[\uE000-\uF8FF]/g, '')
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
