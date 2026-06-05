/**
 * 修复注释/区域标记中的常见乱码片段（UTF-8 局部损坏）
 */
const fs = require('fs')
const path = require('path')

const WEB = path.join(__dirname, '..')
const SRC = path.join(WEB, 'src')

const REPLACEMENTS = [
  ['查询鍖哄煙', '查询区域'],
  ['鎼滅储鍖哄煙', '搜索区域'],
  ['操作鎸夐挳鍖哄煙', '操作按钮区域'],
  ['table鍖哄煙-begin', 'table区域-begin'],
  ['table鍖哄煙-end', 'table区域-end'],
  ['table鍖哄煙', 'table区域'],
  ['琛ㄥ崟鍖哄煙', '表单区域'],
  ['//鍔犺浇鏁版嵁 鑻ヤ紶鍏ュ弬鏁?鍒欏姞杞界涓€椤电殑鍐呭', '//加载数据 若传入参数1则加载第一页的内容'],
  ['//鍔犺浇鏁版嵁 鑻ヤ紶鍏ュ弬鏁?鍒欏姞杞界涓€椤电殑鍐呭', '//加载数据 若传入参数1则加载第一页的内容'],
  ['//鍔犺浇蹇嵎鎸夐挳锛氬垎閰嶇敤鎴?', '//加载快捷按钮：分配用户'],
  ['//鍔犺浇鍒濆鍖栧垪', '//加载初始化列'],
  ['// 鍔犺浇鎵€鏈夋暟鎹敤浜庢爲褰㈡樉绀?', '// 加载所有数据用于树形显示'],
  ['// 瑕嗙洊 mixin 鐨?modalFormOk锛氭爲褰㈡ā寮忎笅閲嶆柊鍔犺浇鍏ㄩ噺鏁版嵁', '// 覆盖 mixin 的 modalFormOk：树形模式下重新加载全量数据'],
  ['// 閲嶆柊鍔犺浇閫夐」鍒楄〃', '// 重新加载选项列表'],
  ['<!-- 查询鍖哄煙锛氭寜閫夐」缁勭瓫閫?-->', '<!-- 查询区域：按选项组筛选 -->'],
  ['<!-- ===== 鏅鸿兘杞﹁締鎼滅储 ===== -->', '<!-- ===== 智能车辆搜索 ===== -->'],
  ['<!-- 鎼滅储杈撳叆妗?-->', '<!-- 搜索输入框 -->'],
  ['<!-- 宸叉湁閫夐」锛氭寜鎼滅储璇嶈繃婊ゆ樉绀?-->', '<!-- 已有选项：按搜索词过滤显示 -->'],
  ['闆跺敭閫€璐', '零售退货'],
  ['闆跺敭鏁伴噺', '零售数量'],
  ['闆跺敭閲戦', '零售金额'],
  ['瀹為檯闆跺敭閲戦', '实际零售金额'],
  ['瀹為檯闆跺敭閲戦锛?', '实际零售金额：'],
  ['閿€鍞嚭搴?', '销售出库'],
  ['閿€鍞', '销售'],
  ['婊氬姩鍒伴《閮?', '滚动到顶部'],
  ['婊氬姩鍒伴《', '滚动到顶'],
  ['骞虫粦婊氬姩', '平滑滚动'],
  ['鍑虹幇婊氬姩鏉?', '出现滚动条'],
  ['姣忎釜鍖哄煙', '每个区域'],
  ['鍙€夌殑婊氬姩鏉＄編鍖?', '可选的滚动条美化'],
  ['鎼滅储璇?', '搜索词'],
  ['鎼滅储杈?', '搜索输'],
  ['鎼滅储', '搜索'],
  ['鎸夐挳', '按钮'],
  ['鍖哄煙', '区域'],
  ['鏅鸿兘', '智能'],
  ['杞﹁締', '车辆'],
  ['杈撳叆', '输入'],
  ['閫夐」', '选项'],
  ['缁勭', '组'],
  ['榛樿', '默认']
].sort((a, b) => b[0].length - a[0].length)

function walk (dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue
    const f = path.join(dir, e.name)
    if (e.isDirectory()) walk(f, files)
    else if (/\.(vue|js|less)$/.test(e.name)) files.push(f)
  }
  return files
}

let n = 0
for (const f of walk(SRC)) {
  let c = fs.readFileSync(f, 'utf8')
  const orig = c
  for (const [from, to] of REPLACEMENTS) {
    if (from !== to) c = c.split(from).join(to)
  }
  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8')
    n++
    console.log(path.relative(WEB, f))
  }
}

// index.html 底部 translate 注释
const indexPath = path.join(WEB, 'index.html')
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8')
  const orig = html
  const htmlFix = [
    ['婊氬姩鏉′紭鍖?', '滚动条优化'],
    ['<!-- 鍏ㄥ眬閰嶇疆-澶氳瑷€鍒囨崲-寮€濮?-->', '<!-- 全局配置-多语言切换-开始 -->'],
    ['<!-- 鍏ㄥ眬閰嶇疆-澶氳瑷€鍒囨崲-缁撴潫 -->', '<!-- 全局配置-多语言切换-结束 -->']
  ]
  for (const [a, b] of htmlFix) html = html.split(a).join(b)
  if (html !== orig) {
    fs.writeFileSync(indexPath, html, 'utf8')
    n++
    console.log('index.html')
  }
}

console.log(`\nfixed ${n} files`)
