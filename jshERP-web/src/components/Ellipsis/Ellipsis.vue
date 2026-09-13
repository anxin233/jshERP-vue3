<script>
  import { h } from 'vue'
  import { Tooltip } from 'ant-design-vue'

  // 递归提取插槽内容中的纯文本（兼容字符串、vnode、数组）
  function extractText (nodes) {
    if (nodes == null) return ''
    if (typeof nodes === 'string' || typeof nodes === 'number') return String(nodes)
    if (Array.isArray(nodes)) return nodes.map(extractText).join('')
    if (typeof nodes === 'object' && nodes.children != null) return extractText(nodes.children)
    return ''
  }

  // 全角字符按 2 个长度计算
  function getStrFullLength (str) {
    return str.split('').reduce((pre, cur) => {
      const charCode = cur.charCodeAt(0)
      return pre + (charCode >= 0 && charCode <= 128 ? 1 : 2)
    }, 0)
  }

  function cutStrByFullLength (str, maxLength) {
    let showLength = 0
    return str.split('').reduce((pre, cur) => {
      const charCode = cur.charCodeAt(0)
      showLength += charCode >= 0 && charCode <= 128 ? 1 : 2
      return showLength <= maxLength ? pre + cur : pre
    }, '')
  }

  export default {
    name: 'Ellipsis',
    props: {
      prefixCls: {
        type: String,
        default: 'ant-pro-ellipsis'
      },
      tooltip: {
        type: Boolean,
        default: true
      },
      length: {
        type: Number,
        default: 25
      },
      lines: {
        type: Number,
        default: 1
      },
      fullWidthRecognition: {
        type: Boolean,
        default: false
      }
    },
    render () {
      const { tooltip, length, fullWidthRecognition } = this
      const text = extractText(this.$slots.default ? this.$slots.default() : '')
      const textLength = fullWidthRecognition ? getStrFullLength(text) : text.length
      if (length === -1 || textLength <= length) {
        return h('span', text)
      }
      const displayText = fullWidthRecognition ? cutStrByFullLength(text, length) : text.slice(0, length)
      const ellipsisText = `${displayText}...`
      if (tooltip) {
        return h(Tooltip, { title: text }, { default: () => h('span', ellipsisText) })
      }
      return h('span', ellipsisText)
    }
  }
</script>
