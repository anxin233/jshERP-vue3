<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="650px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      label-width="100px"
      v-loading="confirmLoading"
    >
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="结算账户1" prop="oneAccountId">
            <el-select
              v-model="formModel.oneAccountId"
              placeholder="请选择结算账户"
              clearable
              style="width: 185px"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="结算金额" prop="oneAccountPrice">
            <el-input-number
              v-model="formModel.oneAccountPrice"
              placeholder="请输入金额"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="结算账户2" prop="twoAccountId">
            <el-select
              v-model="formModel.twoAccountId"
              placeholder="请选择结算账户"
              clearable
              style="width: 185px"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="结算金额" prop="twoAccountPrice">
            <el-input-number
              v-model="formModel.twoAccountPrice"
              placeholder="请输入金额"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="结算账户3" prop="threeAccountId">
            <el-select
              v-model="formModel.threeAccountId"
              placeholder="请选择结算账户"
              clearable
              style="width: 185px"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="结算金额" prop="threeAccountPrice">
            <el-input-number
              v-model="formModel.threeAccountPrice"
              placeholder="请输入金额"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOk">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getAccount } from '@/api/system'

const emit = defineEmits<{
  ok: [accountIdList: (number | string)[], accountMoneyList: number[], allPrice: number]
  close: []
}>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()
const accountList = ref<any[]>([])

const formModel = reactive<Record<string, any>>({
  oneAccountId: undefined,
  oneAccountPrice: undefined,
  twoAccountId: undefined,
  twoAccountPrice: undefined,
  threeAccountId: undefined,
  threeAccountPrice: undefined,
})

function resetForm() {
  formModel.oneAccountId = undefined
  formModel.oneAccountPrice = undefined
  formModel.twoAccountId = undefined
  formModel.twoAccountPrice = undefined
  formModel.threeAccountId = undefined
  formModel.threeAccountPrice = undefined
}

function initAccount() {
  getAccount({}).then((res: any) => {
    if (res && res.code === 200) {
      accountList.value = res.data.accountList
    }
  })
}

function edit(idStr: string, moneyStr: string) {
  initAccount()
  resetForm()

  let idList: string[] = []
  let moneyList: string[] = []
  if (idStr && idStr.indexOf(',') > -1) {
    idList = idStr.split(',')
    moneyList = moneyStr.split(',')
  } else {
    idList = idStr ? [idStr] : []
    moneyList = moneyStr ? [moneyStr] : []
  }

  if (idList[0]) formModel.oneAccountId = Number(idList[0])
  if (idList[1]) formModel.twoAccountId = Number(idList[1])
  if (idList[2]) formModel.threeAccountId = Number(idList[2])
  if (moneyList[0]) formModel.oneAccountPrice = Math.abs(Number(moneyList[0]))
  if (moneyList[1]) formModel.twoAccountPrice = Math.abs(Number(moneyList[1]))
  if (moneyList[2]) formModel.threeAccountPrice = Math.abs(Number(moneyList[2]))

  visible.value = true
}

function close() {
  emit('close')
  visible.value = false
}

function handleOk() {
  let allPrice = 0
  confirmLoading.value = true

  const accountIdList: (number | string)[] = []
  const accountMoneyList: number[] = []

  if (formModel.oneAccountId !== undefined) accountIdList.push(formModel.oneAccountId)
  if (formModel.twoAccountId !== undefined) accountIdList.push(formModel.twoAccountId)
  if (formModel.threeAccountId !== undefined) accountIdList.push(formModel.threeAccountId)

  if (formModel.oneAccountPrice !== undefined) {
    accountMoneyList.push(formModel.oneAccountPrice)
    allPrice += formModel.oneAccountPrice
  }
  if (formModel.twoAccountPrice !== undefined) {
    accountMoneyList.push(formModel.twoAccountPrice)
    allPrice += formModel.twoAccountPrice
  }
  if (formModel.threeAccountPrice !== undefined) {
    accountMoneyList.push(formModel.threeAccountPrice)
    allPrice += formModel.threeAccountPrice
  }

  if (accountIdList.length < 2 || accountMoneyList.length < 2) {
    ElMessage.warning('抱歉，多账户结算必须选择两个以上账户和金额！')
    confirmLoading.value = false
    return
  }

  if (
    (formModel.oneAccountId && !formModel.oneAccountPrice) ||
    (formModel.twoAccountId && !formModel.twoAccountPrice) ||
    (formModel.threeAccountId && !formModel.threeAccountPrice)
  ) {
    ElMessage.warning('抱歉，请填写结算金额！')
    confirmLoading.value = false
    return
  }

  emit('ok', accountIdList, accountMoneyList, allPrice)
  confirmLoading.value = false
  close()
}

function handleCancel() {
  close()
}

defineExpose({ edit, title })
</script>
