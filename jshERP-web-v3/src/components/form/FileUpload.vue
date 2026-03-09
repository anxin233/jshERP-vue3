<script setup lang="ts">
/**
 * FileUpload - 文件上传组件
 * 基于 el-upload，支持预览/下载/删除
 * 上传地址: /systemConfig/upload
 */
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { getFileAccessHttpUrl } from '@/api/http'
import type { UploadProps, UploadFile, UploadUserFile } from 'element-plus'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    limit?: number
    disabled?: boolean
    accept?: string
  }>(),
  {
    modelValue: '',
    limit: 1,
    disabled: false,
    accept: ''
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/jshERP-boot'
const uploadUrl = `${apiBaseUrl}/systemConfig/upload`

/** 请求头 */
const headers = computed(() => ({
  'X-Access-Token': getToken() || ''
}))

/** 将 modelValue(逗号分隔URL) 转为 fileList */
const fileList = computed<UploadUserFile[]>(() => {
  if (!props.modelValue) return []
  return props.modelValue
    .split(',')
    .filter(Boolean)
    .map((url, index) => {
      const fileName = url.split('/').pop() || `file-${index}`
      return {
        name: fileName,
        url: getFileAccessHttpUrl(url)
      }
    })
})

/** 从完整 URL 中提取相对路径 */
function extractRelativeUrl(fullUrl: string): string {
  if (fullUrl.startsWith(apiBaseUrl)) {
    return fullUrl.substring(apiBaseUrl.length + 1)
  }
  return fullUrl
}

/** 收集当前文件列表中的 URL 并更新 modelValue */
function updateModelValue(uploadFiles: UploadFile[]) {
  const urls = uploadFiles
    .map((f: UploadFile) => {
      if (f.response) {
        return (f.response as any).data
      }
      return extractRelativeUrl(f.url || '')
    })
    .filter(Boolean)
  emit('update:modelValue', urls.join(','))
}

/** 上传成功 */
const handleSuccess: UploadProps['onSuccess'] = (response, _uploadFile, uploadFiles) => {
  if (response && response.code === 200) {
    updateModelValue(uploadFiles)
  } else {
    ElMessage.error(response?.msg || '上传失败')
  }
}

/** 上传失败 */
const handleError: UploadProps['onError'] = () => {
  ElMessage.error('文件上传失败')
}

/** 删除文件 */
const handleRemove: UploadProps['onRemove'] = (_uploadFile, uploadFiles) => {
  updateModelValue(uploadFiles)
}

/** 预览/下载文件 */
function handlePreview(file: UploadFile) {
  const url = file.url || (file.response as any)?.data
  if (url) {
    const fullUrl = getFileAccessHttpUrl(url)
    window.open(fullUrl, '_blank')
  }
}

/** 上传前校验 */
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isLt10M = rawFile.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}
</script>

<template>
  <div class="file-upload">
    <el-upload
      :action="uploadUrl"
      :headers="headers"
      :file-list="fileList"
      :limit="limit"
      :disabled="disabled"
      :accept="accept"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      name="file"
    >
      <el-button type="primary" :disabled="disabled">
        <el-icon class="el-icon--left"><UploadFilled /></el-icon>
        点击上传
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          单个文件不超过 10MB
        </div>
      </template>
    </el-upload>
  </div>
</template>

<style lang="scss" scoped>
.file-upload {
  width: 100%;
}
</style>
