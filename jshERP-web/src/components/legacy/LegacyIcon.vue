<script>
import { h } from 'vue'
import { generate, svgBaseProps, isIconDefinition } from '@ant-design/icons-vue/es/utils'
import { resolveIconAsn } from './legacy-icon-asn'

function classNames(...items) {
  const classes = []
  items.forEach(item => {
    if (!item) {
      return
    }
    if (typeof item === 'string') {
      classes.push(item)
      return
    }
    if (Array.isArray(item)) {
      classes.push(classNames(...item))
      return
    }
    if (typeof item === 'object') {
      Object.keys(item).forEach(key => {
        if (item[key]) {
          classes.push(key)
        }
      })
    }
  })
  return classes.filter(Boolean).join(' ')
}

export default {
  name: 'LegacyIcon',
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'outlined'
    },
    spin: {
      type: Boolean,
      default: false
    },
    rotate: {
      type: Number,
      default: undefined
    },
    twoToneColor: {
      type: String,
      default: undefined
    },
    component: {
      type: [Object, Function],
      default: undefined
    }
  },
  render() {
    const spin = this.spin || this.type === 'loading'
    const iconDef = (this.component && isIconDefinition(this.component))
      ? this.component
      : resolveIconAsn(this.type, this.theme)

    if (!iconDef || !iconDef.icon) {
      return null
    }

    const svgStyle = this.rotate != null
      ? { transform: `rotate(${this.rotate}deg)` }
      : undefined

    const svgNode = generate(iconDef.icon, `svg-${iconDef.name}`, {
      ...svgBaseProps,
      style: svgStyle
    })

    return h('span', {
      ...this.$attrs,
      class: classNames('anticon', this.$attrs.class, {
        'anticon-spin': spin,
        [`anticon-${iconDef.name}`]: !!iconDef.name
      }),
      role: 'img',
      'aria-label': iconDef.name
    }, [svgNode])
  }
}
</script>
