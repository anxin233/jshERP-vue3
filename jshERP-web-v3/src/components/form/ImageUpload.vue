<script setup lang="ts">
/**
 * ImageUpload - 图片上传组件
 * 基于 el-upload + el-image，支持预览和删除
 * 上传地址: /systemConfig/upload
 * 请求头: X-Access-Token
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { getFileAccessHttpUrl } from '@/api/http'
import type { UploadProps, UploadFile, UploadUserFile } from 'element-plus'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    limit?: number
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    limit: 1,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/jshERP-boot'
const uploadUrl = `${apiBaseUrl}/systemConfig/upload`
const previewVisible = ref(false)
const previewUrl = ref('')

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
    .map((url, index) => ({
      name: `image-${index}`,
      url: getFileAccessHttpUrl(url)
    }))
})

/** 上传成功回调 */
const handleSuccess: UploadProps['onSuccess'] = (response, _uploadFile, uploadFiles) => {
  if (response && response.code === 200) {
    const urls = uploadFiles
      .map((f: UploadFile) => {
        if (f.response) {
          return (f.response as any).data
        }
        // 已有文件取原始 URL
        return extractRelativeUrl(f.url || '')
      })
      .filter(Boolean)
    emit('update:modelValue', urls.join(','))
  } else {
    ElMessage.error(response?.msg || '上传失败')
  }
}

/** 从完整 URL 中提取相对路径 */
function extractRelativeUrl(fullUrl: string): string {
  if (fullUrl.startsWith(apiBaseUrl)) {
    return fullUrl.substring(apiBaseUrl.length + 1)
  }
  return fullUrl
}

/** 上传失败回调 */
const handleError: UploadProps['onError'] = () => {
  ElMessage.error('图片上传失败')
}

/** 删除文件 */
const handleRemove: UploadProps['onRemove'] = (_uploadFile, uploadFiles) => {
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

/** 预览图片 */
function handlePreview(file: UploadFile) {
  previewUrl.value = file.url || ''
  previewVisible.value = true
}

/** 上传前校验 */
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  const isLt5M = rawFile.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}
</script>

<template>
  <div class="image-upload">
    <el-upload
      :action="uploadUrl"
      :headers="headers"
      :file-list="fileList"
      :limit="limit"
      :disabled="disabled"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      list-type="picture-card"
      accept="image/*"
      name="file"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>

    <el-dialog v-model="previewVisible" title="图片预览" width="600px" append-to-body>
      <div class="preview-wrapper">
        <el-image :src="previewUrl" fit="contain" style="width: 100%" />
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.image-upload {
  .preview-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
