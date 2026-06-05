<template>
  <a-tooltip placement="topLeft">
    <template #title>
      <span>{{value}}</span>
    </template>
    <span class="j-ellipsis-text">{{ ellipsisText(value, length) }}</span>
  </a-tooltip>
</template>

<script>
  import { ellipsis } from '@/utils/filter'

  export default {
    name: 'JEllipsis',
    props: {
      value: {
        type: String,
        required: false,
      },
      length: {
        type: Number,
        required: false,
        default: 25,
      }
    },
    methods: {
      ellipsisText(value, length) {
        return ellipsis(value, length)
      }
    }
  }
</script>

<style scoped>

</style>
