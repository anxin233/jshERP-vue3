<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :style="modalStyle"
    fullscreen
    @close="handleCancel"
  >
    <iframe
      :src="billPrintUrl"
      :height="height"
      style="width: 100%; border: none;"
    />
    <template #footer>
      <el-button @click="handleCancel">取消(ESC)</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const title = ref('三联打印预览')
const width = ref('1500px')
const modalStyle = ref('')
const billPrintUrl = ref('')
const height = ref('')
const model = ref<Record<string, any>>({})

function show(record: Record<string, any>, url: string, printHeight: number | string) {
  height.value = String(printHeight)
  billPrintUrl.value = url
  visible.value = true
  modalStyle.value = 'top:20px;height:95%;'
  model.value = { ...record }
}

function handleCancel() {
  close()
}

function close() {
  billPrintUrl.value = ''
  visible.value = false
  modalStyle.value = ''
}

defineExpose({ show, title })
</script>
