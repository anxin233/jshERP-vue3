const fs = require('fs')
const p = require('path').join(__dirname, '../src/views/report/AccountReport.vue')
let c = fs.readFileSync(p, 'utf8')
c = c.replace(
  /<span>[^<]*allMonthAmount[^<]*<\/span>/,
  '<span>本月发生总额：{{allMonthAmount}}（当前总余额：{{allCurrentAmount}}</span>'
)
fs.writeFileSync(p, c)
console.log('AccountReport span fixed')
