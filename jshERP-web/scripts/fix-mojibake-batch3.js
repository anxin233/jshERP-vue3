/**
 * 第三批乱码修复（报表/单据/财务高频词）
 */
const fs = require('fs')
const path = require('path')
const WEB = path.join(__dirname, '..')

const REPLACEMENTS = [
  ['`鍏 ${total-Math.ceil(total/ipagination.pageSize)} 条`', '`共 ${total-Math.ceil(total/ipagination.pageSize)} 条`'],
  ['鏈湡鎬荤粨瀛橈細{{totalStockStr}}（屾荤粨瀛橀噾棰濓細{{totalCountMoneyStr}}', '本期总结存：{{totalStockStr}}（总结存金额：{{totalCountMoneyStr}}'],
  ['鏈湀鍙戠敟鎬婚（歿{allMonthAmount}}（屽綋鍓嶆讳綑棰濓細{{allCurrentAmount}}', '本月发生总额：{{allMonthAmount}}（当前总余额：{{allCurrentAmount}}'],
  ['[澶氳处鎴穄', '[多账户]'],
  ['付款鍗曠殑瑕佺礌鍜屽綍鍏ュ師鍒欎笌鈥滄敹娆惧崟鈥濈浉否屻', '付款单的要素和录入原则与“收款单”相同。'],
  ['付款鍗曚腑优惠金额璁″叆支出绫讳腑鐨勪粯娆句紭鎯犱腑（屼负璐熷?（堝洜浼樻儬鎰忓懗鐫瀹為檯灏戜粯娆撅級銆', '付款单中优惠金额计入支出类中的付款优惠中（为负值）（因优惠意味着实际少付款）。'],
  ['收入鍗曚富瑕佸鐞嗕竴浜涢攢鍞敹鍏ヤ互澶栫殑收入濡傜淮淇湇鍔℃敹鍏ャ佸埄鎭敹鍏ャ佽皟璐︽敹鍏ョ瓑銆', '收入单主要处理一些销售收款以外的收入如维修服务收入、利息收入、调账收入等。'],
  ['支出鍗曚富瑕佸鐞嗕竴浜涜繘璐ф敮鍑轰互澶栫殑支出濡傛按鐢垫敮鍑恒佹埧绉熸敮鍑虹瓑銆', '支出单主要处理一些进货支出以外的支出如水电支出、房租支出等。'],
  ['鍙皢状态佹槸閮ㄥ垎鍑哄簱鐨勫崟鎹己鍒跺畬鎴', '只可将状态是部分出库的单据强制完成'],
  ['鍙皢状态佹槸部分入库鐨勫崟鎹己鍒跺畬鎴', '只可将状态是部分入库的单据强制完成'],
  ['鍙鏈缁堟瑺娆剧殑鍊艰繘琛屼慨姝', '只有最终欠款的值进行修正'],
  ['列设置洿鏀逛簨浠?', '列设置更改事件'],
  ['修正成本鎴愬姛（', '修正成本成功！'],
  ['//鍔ㄦ佹浛鎹㈡墿灞曞瓧娈?', '//动态替换扩展字段'],
  ['// 鍏堝缓绔?number -> item 鐨勬槧灏?', '// 先建立 number -> item 的映射'],
  ['// 瀹為檯绱㈠紩', '// 实际索引'],
  ['// 瀹為檯鍒?', '// 实际列'],
  ['mpList: getMpListShort(storage.get(\'materialPropertyList\'))  //鎵╁睍灞炴?', 'mpList: getMpListShort(storage.get(\'materialPropertyList\'))  //扩展属性'],
  ['//绉婚櫎采购进度鍒?', '//移除采购进度列'],
  ['//娣诲姞采购进度鍒?', '//添加采购进度列'],
  ['//浠ラ攢瀹氳喘寮鍏?', '//以销定购开关'],
  ['//鍑哄叆搴撶鐞嗗紑鍏筹紝閫傚悎鐙珛浠撶鍦烘櫙', '//出入库管理开关，适合独立仓管场景'],
  ['结算澶辫触', '结算失败'],
  ['鏉愭枡列表', '材料列表'],
  ['单价(鍏?', '单价(元)'],
  ['宸ユ椂单价(鍏?灏忔椂)', '工时单价(元/小时)'],
  ['鏁版嵁绫诲瀷', '数据类型'],
  ['鏈夋瑺娆', '有欠款'],
  ['鏈湡娆犳', '本期欠款'],
  ['鏈湀鍙戠敟棰', '本月发生额'],
  ['瀹為檯付款', '实际付款'],
  ['瀹為檯收款', '实际收款'],
  ['瀹炰粯金额', '实付金额'],
  ['实际收款', '实际收款'],
  ['实际付款', '实际付款'],
  ['鍏抽棴', '关闭'],
  ['鏃ユ湡', '日期'],
  ['澶氬睘鎬', '多属性'],
  ['鍑哄簱鏃ユ湡', '出库日期'],
  ['鍑哄簱鏄庣粏', '出库明细'],
  ['璋冩嫧鏃ユ湡', '调拨日期'],
  ['浠撲綅璐ф灦', '仓位货架'],
  ['鍏抽敭璇', '关键词'],
  ['鏈夋棤搴忓垪鍙', '有无序列号'],
  ['鏈夋棤鎵瑰彿', '有无批号'],
  ['鍩虹閲嶉噺', '基础重量'],
  ['淇濊川鏈', '保质期'],
  ['鏈浣庡敭浠', '最低售价'],
  ['寮哄埗缁撳崟-浠ラ攢瀹氳喘', '强制结单-以销定购'],
  ['寮哄埗缁撳崟', '强制结单'],
  ['閮ㄥ垎鍑哄簱', '部分出库'],
  ['瀹屾垚鍑哄簱', '完成出库'],
  ['瀹屾垚鍏ュ簱', '完成入库'],
  ['鍏宠仈璁㈠崟', '关联订单'],
  ['鏈缁堟瑺娆', '最终欠款'],
  ['鍏跺畠璐圭敤', '其它费用'],
  ['鍏跺畠', '其它'],
  ['鏀跺彇璁㈤噾', '收取订金'],
  ['鏀粯璁㈤噾', '支付订金'],
  ['浠樻浼樻儬', '付款优惠'],
  ['鎵鹃浂', '找零'],
  ['寰呬粯娆', '待付款'],
  ['收入璐︽埛', '收入账户'],
  ['鏈夋敹娆惧崟', '有收款单'],
  ['text+"[璇穄]"', 'text+"[请]"'],
  ['type: "鍑哄簱"', 'type: "出库"'],
  ['type: "鍏ュ簱"', 'type: "入库"'],
  ['record.id, \'鍑哄簱\', \'销售\'', 'record.id, \'出库\', \'销售\''],
  ['<a-select-option value="1">鏈</a-select-option>', '<a-select-option value="1">有</a-select-option>'],
  ['<a-tag v-if="record.enableBatchNumber==1" color="orange">鎵</a-tag>', '<a-tag v-if="record.enableBatchNumber==1" color="orange">批</a-tag>'],
  ['placeholder="鏈"', 'placeholder="有"'],
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
