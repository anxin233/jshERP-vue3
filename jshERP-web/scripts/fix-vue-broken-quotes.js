const fs = require('fs')
const path = require('path')

function walk (dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, fn)
    } else if (entry.name.endsWith('.vue')) {
      fn(fullPath)
    }
  }
}

function fixVueTemplateQuotes (content) {
  let next = content
  const rules = [
    [/placeholder="([^"]*)\? v-model/g, 'placeholder="$1" v-model'],
    [/label="([^"]*)\?>/g, 'label="$1">'],
    [/label="([^"]*)\? :labelCol/g, 'label="$1" :labelCol'],
    [/label="([^"]*)\? :wrapperCol/g, 'label="$1" :wrapperCol'],
    [/placeholder="([^"]*)\? showSearch/g, 'placeholder="$1" showSearch'],
    [/placeholder="([^"]*)\? allow-clear/g, 'placeholder="$1" allow-clear'],
    [/placeholder="([^"]*)\? :rows/g, 'placeholder="$1" :rows'],
    [/\?, '/g, "', '"],
    [/title="([^"]*)\?>/g, 'title="$1">'],
    [/>([^<]{1,80})\?\/a-select-option>/g, '>$1</a-select-option>'],
    [/>([^<]{1,80})\?\/a-button>/g, '>$1</a-button>'],
    [/>([^<]{1,80})\?\/a-tag>/g, '>$1</a-tag>'],
    [/'([^']*)\?, /g, "'$1', "],
    [/title="([^"]*)\?@/g, 'title="$1" @'],
    [/title="([^"]*)\?"/g, 'title="$1"'],
    [/label="([^":]{1,40}) :labelCol/g, 'label="$1" :labelCol'],
    [/label="([^":]{1,40}) :wrapperCol/g, 'label="$1" :wrapperCol'],
    [/placeholder="([^":]{1,80}) showSearch/g, 'placeholder="$1" showSearch'],
    [/placeholder="([^":]{1,80}) allow-clear/g, 'placeholder="$1" allow-clear'],
    [/"([^"]*)\?,/g, '"$1",'],
    [/"\[([^\]]+)":/g, '"[$1]":'],
    [/\?\$\{total/g, ' ${total'],
    [/ 鏉">/g, ' 条`">'],
    [/ 鏉`/g, ' 条`'],
    [/placeholder="([^"\n]+)\n(\s+style=)/g, 'placeholder="$1"\n$2'],
    [/}}锛\?\/p>/g, '}}）</p>'],
    [/搴旀敹閲戦锛\?b/g, '应收金额：<b'],
    [/宸叉敹閲戦锛\?b/g, '已收金额：<b'],
    [/鍓╀綑搴旀敹锛\?b/g, '剩余应收：<b'],
    [/鍏\?\+/g, "入' +"],
    [/\}\}鏉\?椤\?\/span>/g, '}}条/页</span>'],
    [/= "([^"\n]*)\?(\r?\n)/g, '= "$1"$2'],
    [/'([^']*)\?\);/g, "'$1');"],
    [/'([^']*)\? \+/g, "'$1' +"],
    [/"\?;/g, '");']
  ]
  rules.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement)
  })
  return next
}

let fixed = 0
walk(path.join(__dirname, '../src'), filePath => {
  const original = fs.readFileSync(filePath, 'utf8')
  const content = fixVueTemplateQuotes(original)
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8')
    fixed += 1
    console.log(filePath)
  }
})
console.log(`fixed ${fixed} files`)
