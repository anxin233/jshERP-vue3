<template>
  <div class="scan-input">
    <van-field
      ref="fieldRef"
      v-model="value"
      :placeholder="placeholder"
      clearable
      autocomplete="off"
      @keyup.enter="handleEnter"
    >
      <template #left-icon>
        <van-icon name="scan" />
      </template>
      <template #button>
        <van-button
          size="small"
          type="primary"
          plain
          @click="openCamera"
        >
          扫码
        </van-button>
      </template>
    </van-field>

    <van-popup
      v-model:show="cameraVisible"
      position="bottom"
      round
      :style="{ height: '60%' }"
      :lazy-render="false"
      @closed="stopCamera"
    >
      <div class="scan-input__camera">
        <video
          ref="videoRef"
          class="scan-input__video"
          playsinline
          muted
        />
        <p class="scan-input__tip">
          {{ cameraTip }}
        </p>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '请扫描条码或手动输入后回车' },
  clearAfterScan: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue', 'scan'])

const value = ref(props.modelValue)
const fieldRef = ref(null)
const videoRef = ref(null)
const cameraVisible = ref(false)
const cameraTip = ref('将条码对准摄像头...')
let stream = null
let detectTimer = null

function handleEnter () {
  const code = value.value.trim()
  if (!code) return
  emit('scan', code)
  emit('update:modelValue', code)
  if (props.clearAfterScan) {
    value.value = ''
    emit('update:modelValue', '')
  }
}

function cameraSupported () {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.BarcodeDetector)
}

async function openCamera () {
  if (!cameraSupported()) {
    showToast('当前环境不支持摄像头扫码，请使用扫码枪或手动输入')
    return
  }
  cameraVisible.value = true
  await nextTick()
  startCamera()
}

async function startCamera () {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }
    const detector = new window.BarcodeDetector({
      formats: ['code_128', 'ean_13', 'ean_8', 'code_39', 'qr_code', 'upc_a', 'upc_e', 'itf', 'codabar']
    })
    cameraTip.value = '将条码对准摄像头...'
    const detect = async () => {
      if (!videoRef.value || !cameraVisible.value) return
      try {
        const codes = await detector.detect(videoRef.value)
        if (codes && codes.length > 0 && codes[0].rawValue) {
          const code = codes[0].rawValue
          emit('scan', code)
          showToast(`已识别：${code}`)
          cameraVisible.value = false
          return
        }
      } catch {
        // 单帧识别失败继续
      }
      detectTimer = setTimeout(detect, 400)
    }
    detect()
  } catch {
    cameraTip.value = '摄像头打开失败，请使用扫码枪或手动输入'
    showToast('摄像头打开失败，请检查权限')
  }
}

function stopCamera () {
  if (detectTimer) {
    clearTimeout(detectTimer)
    detectTimer = null
  }
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}
</script>

<style lang="less" scoped>
.scan-input {
  &__camera {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 16px;
  }

  &__video {
    width: 100%;
    max-height: 70%;
    background: #000;
    border-radius: 8px;
  }

  &__tip {
    margin-top: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
