/**
 * 第二批常见乱码→正确中文（工单/系统/导入/注释等）
 */
const fs = require('fs')
const path = require('path')

const WEB = path.join(__dirname, '..')

const REPLACEMENTS = [
  // index.html translate.js 注释
  ['//璁剧疆鏈\ue100湴璇\ue161\ue161锛堝綋鍓嶇綉椤电殑璇\ue161\ue161锛夈€傚\ue6e7鏋滀笉璁剧疆锛岄粯璁ゅ氨鏄?\'chinese_simplified\' 绠€浣撲腑鏂?', "//设置本地语言（当前网页的语言）。如果不设置，默认就是 'chinese_simplified' 简体中文"],
  ['//璁剧疆鏈\ue100湴璇\ue161\ue161锛堝綋鍓嶇綉椤电殑璇\ue161\ue161锛夈€傚\ue6e7鏋滀笉璁剧疆锛岄粯璁ゅ氨鏄?', "//设置本地语言（当前网页的语言）。如果不设置，默认就是"],
  ['//缈昏瘧鑷\ue044畾涔?', '//翻译自定义'],
  ['//寮€鍚痟tml椤甸潰鍙樺寲鐨勭洃鎺э紝瀵瑰彉鍖栭儴鍒嗕細杩涜\ue511鑷\ue044姩缈昏瘧', '//开启html页面变化的监控，对变化部分会进行自动翻译'],
  ['//涓嶆樉绀鸿\ue161瑷€閫夋嫨鏍囩\ue137', '//不显示语言选择标签'],
  ['//鎵ц\ue511缈昏瘧鍒濆\ue750鍖栨搷浣滐紝鏄剧ず鍑簊elect璇\ue161█閫夋嫨', '//执行翻译初始化操作，显示出select语言选择'],
  ['//VUE鐨勬覆鏌撻渶瑕佹椂闂达紝鎵€浠ョ暀鍑轰竴鐐圭偣鏃堕棿鏉ヨ繘琛岀炕璇戝垏鎹?', '//VUE的渲染需要时间，所以留出一点点时间来进行翻译切换'],
  ['//椤甸潰 DOM 宸叉覆鏌撳畬姣曪紝褰撶劧鏈€濂芥槸鑳界洃鎺у埌鏁翠釜vue娓叉煋瀹屾瘯鍚庤Е鍙戞渶濂?', '//页面 DOM 已渲染完毕，当然最好是能监控到整个vue渲染完毕后触发最好'],
  ['//2绉掑悗鍐嶄竴娆★紝閬垮厤鏈夐仐婕?', '//2秒后再来一次，避免有遗漏'],
  ['绠′紛浣矱RP', '管伊佳ERP'],

  // 工单 / 项目
  ['宸ュ崟缁撶畻寮圭獥', '工单结算弹窗'],
  ['宸ュ崟缁撶畻', '工单结算'],
  ['宸ュ崟鍒楄〃', '工单列表'],
  ['宸ュ崟鍙凤細', '工单号：'],
  ['宸ュ崟鍙', '工单号'],
  ['宸ュ崟璇︽儏', '工单详情'],
  ['鏂板\ue576宸ュ崟', '新增工单'],
  ['鏂板\ue576', '新增'],
  ['鏂板', '新增'],
  ['鍙栨秷宸ュ崟', '取消工单'],
  ['杞︾墝鍙', '车牌号'],
  ['车辆/杞︾墝', '车辆/车牌'],
  ['鎺ヨ溅鏃ユ湡鑼冨洿', '接车日期范围'],
  ['鎺ヨ溅鏃ユ湡', '接车日期'],
  ['鎺ヨ溅鏃堕棿', '接车时间'],
  ['绗\ue0c1簩琛岋細', '第二行：'],
  ['鍏ㄩ儴绫诲埆', '全部类别'],
  ['鍏ㄩ儴', '全部'],
  ['鏃犵墝', '无牌'],
  ['瀹屽伐', '完工'],
  ['缁撶畻鏀舵\ue0d6', '结算收款'],
  ['缁х画鏀舵\ue0d6', '继续收款'],
  ['缁撶畻璐︽埛', '结算账户'],
  ['缁撶畻閲戦\ue576', '结算金额'],
  ['缁撶畻', '结算'],
  ['璇︽儏', '详情'],
  ['鏁呴殰鎻忚堪', '故障描述'],
  ['娲惧伐浜哄憳', '派工人员'],
  ['棰勮\ue161瀹屽伐', '预计完工'],
  ['搴旀敹閲戦\ue576', '应收金额'],
  ['蹇\ue0a1熺姸鎬佹祦杞\ue100寜閽?', '快速状态流转按钮'],
  ['浠庨」鐩\ue100簱瀵煎叆', '从项目库导入'],

  // 通用按钮
  ['瀵煎嚭', '导出'],
  ['瀵煎叆', '导入'],
  ['会员瀵煎叆', '会员导入'],
  ['鍟嗗搧瀵煎叆', '商品导入'],
  ['客户Excel妯℃澘[涓嬭浇]', '客户Excel模板[下载]'],
  ['妯℃澘', '模板'],
  ['涓嬭浇', '下载'],

  // SystemConfig / FunctionList
  ['锛堝惎鐢ㄥ悗锛屼細鏍规嵁鍗曟嵁褰曞叆鑷\ue044姩鏇存柊鍟嗗搧鍗曚环锛岄粯璁ゆ槸转账单鐘舵€侊級', '（启用后，会根据单据录入自动更新商品单价，默认是转账单状态）'],
  ['公司名称闀垮害瓒呰繃30涓\ue161瓧绗', '公司名称长度超过30个字符'],
  ['销售协议\ue161暱搴﹁秴杩?00涓\ue161瓧绗', '销售协议长度超过100个字符'],
  ['璁剧疆涓€涓\ue044緢澶х殑鏁板瓧鑾峰彇鎵€鏈夋暟鎹?', '设置一个很大的数字获取所有数据'],
  ['鏂板\ue576瀛愯彍鍗曪紙鏍戝舰瑙嗗浘涓撶敤锛?', '新增子菜单（树形视图专用）'],

  // OptionList 注释
  ['<!-- 鏂板\ue576/新增选项组选项缁勫脊绐?-->', '<!-- 新增选项组弹窗 -->'],
  ['<!-- 鏂板\ue576/新增选项组选项 鍐呭祵琛ㄥ崟 -->', '<!-- 新增选项 内嵌表单 -->'],

  // DynamicOptionSelect
  ['// 閫変腑鍒氭墠鏂板\ue576鐨勯」', '// 选中刚才新增的项'],

  // WorkOrderModal
  ['/** 鍟嗗搧杩滅▼搜索鐢ㄧ殑默认仓库锛堝簱瀛樺睍绀猴級锛屽彇褰撳墠鐢ㄦ埛棣栦釜仓库 */', '/** 商品远程搜索用的默认仓库（库存展示），取当前用户首个仓库 */'],
  ['// 鈥斺€斺€?寮€鍚\ue21b柟寮?鈥斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€?', '// ---------- 开启方法 ----------'],
  ['/** 鎺ュ彛涓昏〃鍟嗗搧 id锛堝吋瀹?snake_case锛?*/', '/** 接口主表商品 id（兼容 snake_case） */'],
  ['// 杞︾墝鍙峰繀濉\ue0ac紝闄ら潪鍕鹃€夆€滄棤鐗屸€?', '// 车牌号必填，除非勾选“无牌”'],
  ['杞︾墝鍙蜂负蹇呭～锛屾垨鍕鹃€夆€滄棤鐗屸€', '车牌号为必填，或勾选“无牌”'],

  // 货币符号误编码
  ['楼 ', '￥ '],

  ['鍟嗗搧', '商品']
].sort((a, b) => b[0].length - a[0].length)

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === 'scripts') continue
    const f = path.join(dir, e.name)
    if (e.isDirectory()) walk(f, files)
    else if (/\.(vue|js|html|less)$/.test(e.name)) files.push(f)
  }
  return files
}

let n = 0
const targets = [path.join(WEB, 'src'), path.join(WEB, 'index.html')]
const files = []
for (const t of targets) {
  if (fs.statSync(t).isFile()) files.push(t)
  else walk(t, files)
}

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8')
  const orig = c
  for (const [from, to] of REPLACEMENTS) {
    if (from !== to && c.includes(from)) c = c.split(from).join(to)
  }
  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8')
    n++
    console.log(path.relative(WEB, f))
  }
}

// 修复误合并的重复 let templateName（中文修复脚本副作用）
for (const f of walk(path.join(WEB, 'src'))) {
  let c = fs.readFileSync(f, 'utf8')
  const dup = /let templateName = '[^']+'\s*\n\s*this\.\$refs\.modalImportForm\.initModal\([^)]+\);\s*\n\s*let templateName = '([^']+)'/g
  if (dup.test(c)) {
    c = c.replace(
      /let templateName = '[^']+'\s*\n(\s*this\.\$refs\.modalImportForm\.initModal\([^)]+\);\s*\n)\s*let templateName = '([^']+)'/g,
      "let templateName = '$2'\n$1"
    )
    fs.writeFileSync(f, c, 'utf8')
    console.log('dedupe templateName:', path.relative(WEB, f))
    n++
  }
}

console.log(`\nupdated ${n} files`)
