/**
 * 一键执行全部乱码修复脚本（按顺序）
 */
const { execSync } = require('child_process')
const path = require('path')
const scripts = [
  'fix-mojibake-chinese.js',
  'fix-all-frontend-mojibake.js',
  'fix-mojibake-batch2.js',
  'fix-mojibake-batch3.js',
  'fix-mojibake-batch4.js',
  'fix-mojibake-batch5-common.js',
  'fix-mojibake-batch6-final.js',
  'fix-mojibake-batch7.js',
  'fix-remaining-mojibake-batch.js',
  'fix-final-chinese-strings.js',
]
const dir = __dirname
for (const s of scripts) {
  const p = path.join(dir, s)
  try {
    console.log('\n>>>', s)
    execSync(`node "${p}"`, { stdio: 'inherit', cwd: path.join(dir, '..') })
  } catch (e) {
    console.warn('skip', s, e.message)
  }
}
console.log('\nAll mojibake fix scripts finished.')
