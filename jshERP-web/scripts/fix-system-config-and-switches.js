/**
 * 修复 SystemConfigList 被误替换的开关文案，并从 git 按行恢复中文（UTF-8）
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const REPO = path.join(__dirname, '../..')
const WEB = path.join(__dirname, '..')
const file = path.join(WEB, 'src/views/system/SystemConfigList.vue')

const git = execSync('git show HEAD:jshERP-web/src/views/system/SystemConfigList.vue', {
  cwd: REPO,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
})

let cur = fs.readFileSync(file, 'utf8')

// 误替换：全局映射把「启用/关闭」弄成了单据类型
cur = cur.replace(/checked-children="转账单"/g, 'checked-children="启用"')
cur = cur.replace(/un-checked-children="收预付款单"/g, 'un-checked-children="关闭"')

const gitLines = git.split('\n')
const curLines = cur.split('\n')
const GARBLED = /閿€|璇烽€|鍔犺|缂栬|鏌ヨ|鍒犻|渚涘|闆跺|鍟嗗|浼氬|缂栧彿|鍩烘|閰嶇|鑱旂|鍏徃|鍒嗛|鍚敤|鍏抽|鏀寔|璐熷|浠ラ|瓒呭|鏇存|寮哄|鍑哄|澶氳|绉诲|鍏堝|闆舵|瀹㈡|澶氱骇|锛堝惎|鎵归|淇敼|鐐规/

function cjkCount (s) {
  return (s.match(/[\u4e00-\u9fff]/g) || []).length
}

function garbledScore (s) {
  const m = s.match(/[\u4e00-\u9fff]/g) || []
  if (!m.length) return 0
  let bad = 0
  for (const ch of m) {
    if (/[鍙鎴璇烽€闂閫鐢靛鏈熷搴撳閲囪闆跺婊氬绯荤粺鎵嬫鍚嶇瑙勬棰滆鍝佺榛樿閲嶇鏀惰灞曞纭畾浠撳閫璐瀹㈡鎿嶄鐘舵澶嶅鍒锋缁撴寮€濮鎼滅鍖哄鍟浼缂彿宸插瀹℃]/.test(ch)) bad++
  }
  return bad
}

function mergeLine (g, c) {
  let line = g
  if (c.includes('v-model:value') && line.includes('v-model="')) {
    line = line.replace(/\bv-model="/g, 'v-model:value="')
  }
  if (c.includes('v-model:checked') && /\bv-model="/.test(line)) {
    line = line.replace(/\bv-model="/g, 'v-model:checked="')
  }
  if (c.includes('ref="formRef"')) return c // 保留 Vue3 form 结构行
  if (c.includes(':model="formModel"')) return c
  if (c.includes('formModel.')) return c
  return line
}

const out = []
const n = Math.max(gitLines.length, curLines.length)
for (let i = 0; i < n; i++) {
  const g = gitLines[i] || ''
  const c = curLines[i] || ''
  if (GARBLED.test(c) && cjkCount(g) >= cjkCount(c) && garbledScore(g) <= garbledScore(c)) {
    out.push(mergeLine(g, c))
  } else {
    out.push(c)
  }
}

let next = out.join('\n')
// 移除 PUA
next = next.replace(/[\uE000-\uF8FF]/g, '')

// 手工校正（git 本身也有部分损坏）
const MANUAL = [
  ['鍩烘湰璧勬枡', '基本资料'],
  ['閰嶇疆淇℃伅', '配置信息'],
  ['鑱旂郴浜', '联系人'],
  ['鍏徃鍦板潃', '公司地址'],
  ['鍏徃鐢佃瘽', '公司电话'],
  ['鍏徃浼犵湡', '公司传真'],
  ['鍒嗛厤浠撳簱鏉冮檺', '分配仓库权限'],
  ['鍒嗛厤瀹㈡埛鏉冮檺', '分配客户权限'],
  ['鏀寔璐熷簱瀛', '支持负库存'],
  ['浠ラ攢瀹氳喘', '以销定购'],
  ['瓒呭嚭鍏宠仈鍗曟嵁', '超出关联单据'],
  ['鏇存柊鍗曚环', '更新单价'],
  ['寮哄鏍', '强审核'],
  ['鍑哄叆搴撶鐞', '出入库管理'],
  ['澶氳处鎴', '多账户'],
  ['绉诲姩骞冲潎浠', '移动平均价'],
  ['鍏堝鏍稿悗鎵撳嵃', '先审核后打印'],
  ['闆舵敹浠樻', '零收付款'],
  ['瀹㈡埛闈欐€佸崟浠', '客户静态单价'],
  ['鍟嗗搧浠锋牸鍚惈绋', '商品价格含税'],
  ['澶氱骇瀹℃牳', '多级审核'],
  ['璇烽€夋嫨娴佺▼绫诲瀷', '请选择流程类型'],
  ['鐐规鍒锋柊', '点此刷新'],
  ['公司名称闀垮害瓒呰繃30涓瓧绗', '公司名称长度超过30个字符'],
  ['销售协议暱搴﹁秴杩?00涓瓧绗', '销售协议长度超过100个字符']
]
for (const [a, b] of MANUAL.sort((x, y) => y[0].length - x[0].length)) {
  next = next.split(a).join(b)
}

fs.writeFileSync(file, next, 'utf8')
console.log('fixed SystemConfigList.vue')
