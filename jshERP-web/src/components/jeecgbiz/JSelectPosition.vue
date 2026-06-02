<template>
  <j-select-biz-component :width="1000" v-bind="configs" v-on="listeners"/>
</template>

<script>
  import JSelectBizComponent from './JSelectBizComponent'

  export default {
    name: 'JSelectPosition',
    components: { JSelectBizComponent },
    props: ['value'],
    data() {
      return {
        settings: {
          name: '职务',
          displayKey: 'name',
          returnKeys: ['id', 'code'],
          listUrl: '/sys/position/list',
          queryParamCode: 'name',
          queryParamText: '职务名称',
          columns: [
            { title: '职务名称', dataIndex: 'name', align: 'center', width: '30%', widthRight: '70%' },
            { title: '职务编码', dataIndex: 'code', align: 'center', width: '35%' },
            { title: '职级', dataIndex: 'rank_dictText', align: 'center', width: '25%' }
          ]
        }
      }
    },
    computed: {
      configs() {
        return Object.assign({ value: this.value }, this.settings, this.passthroughAttrs)
      },
      passthroughAttrs() {
        const attrs = {}
        Object.keys(this.$attrs).forEach(key => {
          if (!/^on[A-Z]|^onUpdate:/.test(key)) {
            attrs[key] = this.$attrs[key]
          }
        })
        return attrs
      },
      listeners() {
        const listeners = {}
        Object.assign(listeners, this['$' + 'listeners'] || {})
        Object.keys(this.$attrs).forEach(key => {
          if (/^on[A-Z]|^onUpdate:/.test(key)) {
            const eventName = key.slice(2).replace(/^[A-Z]/, match => match.toLowerCase())
            listeners[eventName] = this.$attrs[key]
          }
        })
        return listeners
      }
    }
  }
</script>

<style lang="less" scoped></style>
