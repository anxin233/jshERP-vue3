<template>
  <j-select-biz-component
    :value="value"

    name="角色"
    displayKey="roleName"

    :returnKeys="returnKeys"
    :listUrl="url.list"
    :columns="columns"
    queryParamText="角色编码"

    v-on="listeners"
    v-bind="attrs"
  />
</template>

<script>
  import JSelectBizComponent from './JSelectBizComponent'

  export default {
    name: 'JSelectMultiUser',
    components: { JSelectBizComponent },
    props: ['value'],
    data() {
      return {
        returnKeys: ['id', 'roleCode'],
        url: { list: '/sys/role/list' },
        columns: [
          { title: '角色名称', dataIndex: 'roleName', align: 'center', width: 120 },
          { title: '角色编码', dataIndex: 'roleCode', align: 'center', width: 120 }
        ]
      }
    },
    computed: {
      attrs() {
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
