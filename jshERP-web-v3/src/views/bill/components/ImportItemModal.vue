<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form label-width="80px" v-loading="confirmLoading">
      <el-form-item label="模板">
        <span>
          <a :href="tmpUrl" target="_blank"><b>明细Excel模板[下载]</b></a>
        </span>
      </el-form-item>
      <el-form-item label="文件">
        <el-upload
          :action="importExcelUrl"
          :headers="tokenHeader"
          :data="setFileData()"
          :show-file-list="false"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
        >
          <el-button type="primary">导入</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

const emit = defineEmits<{
  ok: [rows: any[]]
  close: []
}>()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/jshERP-boot'

const visible = ref(false)
const title = ref('导入明细')
const confirmLoading = ref(false)
const prefixNo = ref('')
const tmpUrl = ref('')

const tokenHeader = computed(() => ({
  'X-Access-Token': getToken() || '',
}))

const importExcelUrl = computed(() => {
  return `${apiBaseUrl}/depotItem/importItemExcel`
})

function add(prefix: string) {
  prefixNo.value = prefix
  if (prefix === 'QGD') {
    tmpUrl.value = '/doc/apply_item_template.xls'
  } else if (prefix === 'CGDD' || prefix === 'XSDD') {
    tmpUrl.value = '/doc/order_item_template.xls'
  } else if (prefix === 'CGRK' || prefix === 'XSCK') {
    tmpUrl.value = '/doc/buy_sale_item_template.xls'
  } else if (prefix === 'QTRK' || prefix === 'QTCK') {
    tmpUrl.value = '/doc/in_out_item_template.xls'
  }
  visible.value = true
}

function close() {
  emit('close')
  visible.value = false
}

function handleCancel() {
  close()
}

function setFileData() {
  return {
    prefixNo: prefixNo.value,
  }
}

function handleImportSuccess(response: any) {
  if (response.code === 200) {
    ElMessage.success('导入成功' + response.data.rows.length + '条')
    emit('ok', response.data.rows)
    close()
  } else if (response.code === 500) {
    ElMessage.warning(response.data?.message || '导入失败')
  }
}

function handleImportError() {
  ElMessage.error('文件导入失败')
}

defineExpose({ add })
</script>
