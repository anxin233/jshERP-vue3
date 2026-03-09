<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-width="100px"
      v-loading="confirmLoading"
    >
      <el-form-item label="仓库名称" prop="depotId">
        <el-select
          v-model="formModel.depotId"
          placeholder="请选择仓库"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="depot in depotList"
            :key="depot.id"
            :label="depot.depotName"
            :value="depot.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOk">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getAction } from '@/api/http'

const emit = defineEmits<{
  ok: [depotId: number | string]
  close: []
}>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()
const depotList = ref<any[]>([])

const formModel = reactive<Record<string, any>>({
  depotId: undefined,
})

const rules = reactive<FormRules>({
  depotId: [{ required: true, message: '请选择仓库!', trigger: 'change' }],
})

function getDepotData() {
  getAction('/depot/findDepotByCurrentUser').then((res: any) => {
    if (res.code === 200) {
      depotList.value = res.data
    }
  })
}

function add() {
  edit({})
  getDepotData()
}

function edit(record: Record<string, any>) {
  formRef.value?.resetFields()
  formModel.depotId = record.depotId ?? undefined
  visible.value = true
}

function close() {
  emit('close')
  visible.value = false
}

async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  confirmLoading.value = true
  emit('ok', formModel.depotId)
  confirmLoading.value = false
  close()
}

function handleCancel() {
  close()
}

defineExpose({ add, edit, title })
</script>
