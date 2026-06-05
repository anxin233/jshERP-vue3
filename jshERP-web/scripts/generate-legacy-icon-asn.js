/**
 * 从 Icons.vue 图标名 + 手工别名生成 legacy-icon-asn.js
 * 运行: node scripts/generate-legacy-icon-asn.js
 */
const fs = require('fs')
const path = require('path')

const asnDir = path.join(__dirname, '../node_modules/@ant-design/icons-svg/es/asn')
const vuePath = path.join(__dirname, '../src/views/system/modules/icon/Icons.vue')
const outPath = path.join(__dirname, '../src/components/legacy/legacy-icon-asn.js')

const src = fs.readFileSync(vuePath, 'utf8')
const iconNames = new Set()
const re = /const \w+Icons = \[([^\]]+)\]/g
let m
while ((m = re.exec(src))) {
  m[1].split(',').forEach((part) => {
    const name = part.trim().replace(/['"]/g, '')
    if (name) iconNames.add(name)
  })
}

/** 旧版 type 别名（无独立 ASN 或语义映射） */
const aliases = {
  home: 'DashboardOutlined',
  present: 'DashboardOutlined',
  'info-circle-o': 'InfoCircleOutlined',
  'pay-circle': 'PayCircleOutlined',
  'down-circle-o': 'DownCircleOutlined',
  'up-circle-o': 'UpCircleOutlined',
  'left-circle-o': 'LeftCircleOutlined',
  'right-circle-o': 'RightCircleOutlined',
  'play-circle-o': 'PlayCircleOutlined',
  'up-square-o': 'UpSquareOutlined',
  'down-square-o': 'DownSquareOutlined',
  'left-square-o': 'LeftSquareOutlined',
  'right-square-o': 'RightSquareOutlined'
}

function kebabToAsnName (kebab) {
  return kebab.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Outlined'
}

const asnFiles = new Set(fs.readdirSync(asnDir).map((f) => f.replace('.js', '')))

/** key -> ASN component export name */
const keyToAsn = new Map()

for (const icon of iconNames) {
  if (aliases[icon]) {
    keyToAsn.set(icon, aliases[icon])
    continue
  }
  const asn = kebabToAsnName(icon)
  if (asnFiles.has(asn)) {
    keyToAsn.set(icon, asn)
  }
}

for (const [key, asn] of Object.entries(aliases)) {
  if (!keyToAsn.has(key) && asnFiles.has(asn)) {
    keyToAsn.set(key, asn)
  }
}

const usedAsn = new Set(keyToAsn.values())
const importLines = [...usedAsn].sort().map(
  (name) => `import ${name} from '@ant-design/icons-svg/es/asn/${name}'`
)
importLines.push("import CloudFilled from '@ant-design/icons-svg/es/asn/CloudFilled'")

const mapEntries = [...keyToAsn.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([key, asn]) => {
    const k = /^[a-z][a-z0-9-]*$/.test(key) && !key.includes('-') ? key : `'${key}'`
    return `  ${k}: ${asn}`
  })

const content = `/**
 * 旧 type 到 @ant-design/icons-svg 定义的映射（绕过 icons-vue Outlined 组件在 compat 下丢 prop）
 * 由 scripts/generate-legacy-icon-asn.js 根据 Icons.vue 自动生成，勿手改后又被覆盖。
 * 重新生成: node scripts/generate-legacy-icon-asn.js
 */
${importLines.join('\n')}

export const outlinedIconAsn = {
${mapEntries.join(',\n')}
}

export const filledIconAsn = {
  cloud: CloudFilled
}

export function normalizeIconType(type) {
  return String(type || '')
    .trim()
    .replace(/^icon-/, '')
    .replace(/-o$/, '')
}

export function resolveIconAsn(type, theme) {
  const normalizedType = normalizeIconType(type)
  if (theme === 'filled' && filledIconAsn[normalizedType]) {
    return filledIconAsn[normalizedType]
  }
  return outlinedIconAsn[normalizedType] || null
}
`

fs.writeFileSync(outPath, content, 'utf8')
console.log('Wrote', outPath)
console.log('Mapped icons:', keyToAsn.size)
const unmapped = [...iconNames].filter((i) => !keyToAsn.has(i))
if (unmapped.length) {
  console.log('Icons.vue entries without ASN (' + unmapped.length + '):', unmapped.slice(0, 20).join(', '), unmapped.length > 20 ? '...' : '')
}
