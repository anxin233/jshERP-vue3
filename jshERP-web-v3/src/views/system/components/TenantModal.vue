<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-width="120px"
      v-loading="confirmLoading"
    >
      <el-form-item label="登录名称" prop="loginName">
        <el-input
          v-model="formModel.loginName"
          placeholder="请输入登录名称"
          :disabled="!!formModel.id"
        >
          <template #suffix>
            <span style="color: #909399; font-size: 12px">初始密码：123456</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="用户数量限制" prop="userNumLimit">
        <el-input-number
          v-model="formModel.userNumLimit"
          style="width: 100%"
          placeholder="请输入用户数量限制"
          :controls="false"
        />
      </el-form-item>
      <el-form-item v-if="formModel.id" label="租户角色" prop="roleId">
        <el-select v-model="formModel.roleId" placeholder="请选择租户角色" style="width: 100%">
          <el-option v-for="item in tenantRoleList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formModel.id" label="租户类型" prop="type">
        <el-select v-model="formModel.type" placeholder="请选择租户类型" style="width: 100%">
          <el-option label="试用租户" value="0" />
          <el-option label="付费租户" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="到期时间" prop="expireTime">
        <el-date-picker
          v-model="formModel.expireTime"
          type="datetime"
          placeholder="请选择到期时间"
          style="width: 100%"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formModel.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注（微信号）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOk">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { addTenant, editTenant, checkTenant, getTenantRoleList } from '@/api/system'
import CryptoJS from 'crypto-js'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()
const tenantRoleList = ref<any[]>([])

const formModel = reactive<Record<string, any>>({
  id: undefined,
  loginName: '',
  userNumLimit: undefined,
  roleId: undefined,
  type: undefined,
  expireTime: '',
  remark: '',
})

/** 登录名称校验器 */
const validateLoginName = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入登录名称!'))
    return
  }
  const params = {
    name: value,
    id: formModel.id || 0,
  }
  checkTenant(params).then((res: any) => {
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('登录名称已经存在'))
      }
    } else {
      callback(new Error(res.data))
    }
  })
}

const rules = reactive<FormRules>({
  loginName: [
    { required: true, message: '请输入登录名称!', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
    { validator: validateLoginName, trigger: 'blur' },
  ],
})

function resetForm() {
  formModel.id = undefined
  formModel.loginName = ''
  formModel.userNumLimit = undefined
  formModel.roleId = undefined
  formModel.type = undefined
  formModel.expireTime = ''
  formModel.remark = ''
}

function add() {
  resetForm()
  title.value = '新增'
  visible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function edit(record: any) {
  resetForm()
  title.value = '编辑'
  visible.value = true
  nextTick(() => {
    formModel.id = record.id
    formModel.loginName = record.loginName || ''
    formModel.userNumLimit = record.userNumLimit
    formModel.roleId = record.roleId
    formModel.type = record.type !== undefined ? String(record.type) : undefined
    formModel.expireTime = record.expireTimeStr || ''
    formModel.remark = record.remark || ''
    formRef.value?.clearValidate()
  })
  loadTenantRoleList()
}

function loadTenantRoleList() {
  getTenantRoleList({}).then((res: any) => {
    if (res) {
      tenantRoleList.value = res
    }
  })
}

function close() {
  visible.value = false
}

async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    let res: any
    if (!formModel.id) {
      formData.password = CryptoJS.MD5('123456').toString()
      res = await addTenant(formData)
    } else {
      res = await editTenant(formData)
    }
    if (res.code === 200) {
      emit('ok')
      close()
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  } finally {
    confirmLoading.value = false
  }
}

function handleCancel() {
  close()
}

defineExpose({ add, edit, title })
</script>
