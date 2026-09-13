<template>
  <van-tag :type="audited ? 'success' : 'warning'">
    {{ audited ? '已审核' : '未审核' }}
  </van-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: [String, Number], default: '0' }
})

const audited = computed(() => String(props.status) === '1')
</script>
