const fs = require('fs')
const path = require('path')
const WEB = path.join(__dirname, '..')

const REPLACEMENTS = [
  ['鏈湀鍙戠敟鎬婚（歿{allMonthAmount}}（屽綋鍓嶆讳綑棰濓細{{allCurrentAmount}}', '本月发生总额：{{allMonthAmount}}（当前总余额：{{allCurrentAmount}}'],
  ['{ title: \'鏈湀鍙戠敟棰\'', '{ title: \'本月发生额\''],
  ['label="鎵瑰彿"', 'label="批号"'],
  ['title="鏈変粯娆惧崟"', 'title="有付款单"'],
  ['title="鏆傛湭浠樻"', 'title="暂未付"'],
  ['{ title: \'寰呬粯金额\'', '{ title: \'待付金额\''],
  ['subType: "采购閫璐"', 'subType: "采购退货"'],
  ['icon="link">寰呭嚭搴?', 'icon="link">待出库('],
  ['myHandleDetail(record, \'其它鍑哄簱\'', 'myHandleDetail(record, \'其它出库\''],
  ['initWaitBillCount(\'鍑哄簱\'', 'initWaitBillCount(\'出库\''],
  ['this.$message.warning("鎶辨瓑（屽彧鏈夋湭审核鐨勫崟鎹墠鑳藉垹闄わ紝璇峰厛杩涜反审核革紒")', 'this.$message.warning("抱歉，只有未审核的单据才能删除，请先反审核！")'],
  ['//寰呭嚭搴?', '//待出库'],
  ['show(\'鍑哄簱\'', 'show(\'出库\''],
  ['myHandleDetail(record, \'鎷嗗嵏鍗\'', 'myHandleDetail(record, \'拆卸单\''],
  ['subType: "鎷嗗嵏鍗"', 'subType: "拆卸单"'],
  ['myHandleDetail(record, \'璋冩嫧鍑哄簱\'', 'myHandleDetail(record, \'调拨出库\''],
  ['<!-- 涓嬫媺展开鏃跺缁堟樉绀衡滄坊鍔犫濆叆鍙ｏ紝渚夸簬鍦ㄩ夋嫨鏃剁洿鎺ユ柊澧?-->', '<!-- 下拉展开时始终显示“添加”入口，便于在选择时直接新增 -->'],
  ['<!-- 鏈緭鍏ユ悳绱㈣瘝鏃剁偣鍑烩滄坊鍔犫濆垯寮瑰嚭输入妗?-->', '<!-- 未输入搜索词时点击“添加”则弹出输入框 -->'],
  ['// 涓嬫媺展开鏃跺缁堟樉绀衡滄坊鍔犫濆叆鍙?', '// 下拉展开时始终显示“添加”入口'],
  ['// 鏈夋悳绱㈣瘝涓旀棤绮剧‘鍖归厤鏃舵樉绀衡滄坊鍔?xxx\'鈥濓紝否﹀垯鏄剧ず鈥滐紜 添加新选项鈥?', '// 有搜索词且无精确匹配时显示“添加 xxx”，否则显示“+ 添加新选项”'],
  ['// 娌℃湁褰撳墠鍊兼椂（岃嚜鍔ㄥ～鍏ラ粯璁ら夐」', '// 没有当前值时，自动填入默认选项'],
  ['// 重新加载选项列表（岀劧否庤嚜鍔ㄩ変腑鏂伴」', '// 重新加载选项列表，然后自动选中新项'],
  ['/* 璁?添加"鏉＄洰鏇寸獊鍑?*/', '/* 让“添加”条目更突出 */'],
  ['label="濮撳悕"', 'label="姓名"'],
  ['{ title: \'濮撳悕\'', '{ title: \'姓名\''],
  ['<!-- 选项缁勫垪琛?-->', '<!-- 选项组列表 -->'],
  ['<a-tag v-else color="green">绉熸埛绾</a-tag>', '<a-tag v-else color="green">租户级</a-tag>'],
  ['<!-- 新增/新增选项组选项缁勫脊绐?-->', '<!-- 新增选项组弹窗 -->'],
  ['label="缁勫悕绉"', 'label="组名称"'],
  ['\'选项缁存姢\'', '\'选项组维护\''],
  ['<!-- 新增/新增选项组选项 鍐呭祵琛ㄥ崟 -->', '<!-- 新增选项 内嵌表单 -->'],
  ['{ title: \'缁勫悕绉\'', '{ title: \'组名称\''],
  ['{ title: \'浣滅敤鑼冨洿\'', '{ title: \'作用范围\''],
  ['管理选项鎴愬姛', '管理选项成功'],
  ['管理选项澶辫触', '管理选项失败'],
  ['minusStockFlagSwitch: false, //璐熷簱瀛樼姸鎬?', 'minusStockFlagSwitch: false, //负库存状态'],
  ['multiBillTypeSelect: [], //鍗曟嵁绫诲瀷', 'multiBillTypeSelect: [], //单据类型'],
  ['// 浣跨敤 setTimeout 纭繚 DOM 鏇存柊瀹屾垚', '// 使用 setTimeout 确保 DOM 更新完成'],
  ['//鍒濆鍖栧姞杞藉唴瀹?', '//初始化加载内容'],
  ['{ \'key\': \'PDLR\', \'value\': \'鐩樼偣褰曞叆\' }', '{ \'key\': \'PDLR\', \'value\': \'盘点录入\' }'],
  ['{ \'key\': \'PDFP\', \'value\': \'鐩樼偣澶嶇洏\' }', '{ \'key\': \'PDFP\', \'value\': \'盘点复盘\' }'],
  ['//刷新娴忚鍣?', '//刷新浏览器'],
  ['/* 鍥哄畾楂樺害鐨勬粴鍔ㄥ鍣?*/', '/* 固定高度的滚动条 */'],
  ['/* 每个区域鏍峰紡 */', '/* 每个区域样式 */'],
].filter(([a, b]) => a !== b).sort((a, b) => b[0].length - a[0].length)

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
