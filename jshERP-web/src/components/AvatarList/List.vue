<template>
  <div :class="[prefixCls, size]">
    <ul>
      <slot></slot>
    </ul>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'AvatarList',
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-avatar-list'
    },
    size: {
      type: [String, Number],
      default: 'default'
    },
    maxLength: {
      type: Number,
      default: 0
    },
    excessItemsStyle: {
      type: Object,
      default: () => ({
        color: '#f56a00',
        backgroundColor: '#fde3cf'
      })
    }
  },
  provide() {
    return {
      avatarListSize: computed(() => this.size)
    }
  }
}
</script>
