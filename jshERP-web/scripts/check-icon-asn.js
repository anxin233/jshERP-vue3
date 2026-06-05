const fs = require('fs')
const path = require('path')

const asnDir = path.join(__dirname, '../node_modules/@ant-design/icons-svg/es/asn')
const vuePath = path.join(__dirname, '../src/views/system/modules/icon/Icons.vue')
const legacyPath = path.join(__dirname, '../src/components/legacy/legacy-icon-asn.js')

const src = fs.readFileSync(vuePath, 'utf8')
const all = new Set()
const re = /const \w+Icons = \[([^\]]+)\]/g
let m
while ((m = re.exec(src))) {
  m[1].split(',').forEach((part) => {
    const name = part.trim().replace(/['"]/g, '')
    if (name) all.add(name)
  })
}

const legacySrc = fs.readFileSync(legacyPath, 'utf8')
const mapped = new Set()
const keyRe = /['"]?([\w-]+)['"]?\s*:/g
const objStart = legacySrc.indexOf('export const outlinedIconAsn')
const objPart = legacySrc.slice(objStart)
let km
while ((km = keyRe.exec(objPart))) {
  if (km[1] !== 'export') mapped.add(km[1])
}

function toAsn (kebab) {
  const base = kebab.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  return base + 'Outlined'
}

const asnFiles = new Set(fs.readdirSync(asnDir).map((f) => f.replace('.js', '')))
const missing = []
for (const icon of [...all].sort()) {
  if (mapped.has(icon)) continue
  const asn = toAsn(icon)
  if (asnFiles.has(asn)) missing.push({ icon, asn })
}

console.log('Need mapping (' + missing.length + '):')
missing.forEach(({ icon, asn }) => console.log(icon + ' -> ' + asn))
