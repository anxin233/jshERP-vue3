<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="1200px"
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
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="名称" prop="supplier">
            <el-input v-model.trim="formModel.supplier" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人">
            <el-input v-model.trim="formModel.contacts" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="手机号码">
            <el-input v-model.trim="formModel.telephone" placeholder="请输入手机号码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话">
            <el-input v-model.trim="formModel.phoneNum" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电子邮箱">
            <el-input v-model.trim="formModel.email" placeholder="请输入电子邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="传真">
            <el-input v-model.trim="formModel.fax" placeholder="请输入传真" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="期初应收">
            <el-input v-model.trim="formModel.beginNeedGet" placeholder="请输入期初应收" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="期末应收">
            <el-input v-model.trim="formModel.allNeedGet" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="纳税人识别号">
            <el-input v-model.trim="formModel.taxNum" placeholder="请输入纳税人识别号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="税率(%)">
            <el-input-number
              v-model="formModel.taxRate"
              placeholder="请输入税率"
              style="width: 100%"
              :controls="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开户行">
            <el-input v-model.trim="formModel.bankName" placeholder="请输入开户行" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账号">
            <el-input v-model.trim="formModel.accountNumber" placeholder="请输入账号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址">
            <el-input v-model.trim="formModel.address" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序">
            <el-input v-model.trim="formModel.sort" placeholder="请输入排序" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注">
            <el-input v-model.trim="formModel.description" type="textarea" :rows="2" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <template v-if="isReadOnly">
        <el-button @click="handleCancel">取消</el-button>
      </template>
      <template v-else>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="handleOk">保存</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { addSupplier, editSupplier, checkSupplier } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const disableSubmit = ref(false)
const formRef = ref<FormInstance>()

const formModel = reactive<Record<string, any>>({
  id: undefined,
  supplier: '',
  contacts: '',
  telephone: '',
  phoneNum: '',
  email: '',
  fax: '',
  beginNeedGet: '',
  allNeedGet: '',
  beginNeedPay: '',
  taxNum: '',
  taxRate: undefined,
  bankName: '',
  accountNumber: '',
  address: '',
  sort: '',
  description: '',
})

const validateSupplierName = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入名称!'))
    return
  }
  const params = {
    name: value,
    type: '客户',
    id: formModel.id ? formModel.id : 0,
  }
  checkSupplier(params).then((res: any) => {
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('名称已经存在'))
      }
    } else {
      callback(new Error(res.data))
    }
  })
}

const rules = reactive<FormRules>({
  supplier: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { min: 2, max: 60, message: '长度在 2 到 60 个字符', trigger: 'blur' },
    { validator: validateSupplierName, trigger: 'blur' },
  ],
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  formModel.supplier = ''
  formModel.contacts = ''
  formModel.telephone = ''
  formModel.phoneNum = ''
  formModel.email = ''
  formModel.fax = ''
  formModel.beginNeedGet = ''
  formModel.allNeedGet = ''
  formModel.beginNeedPay = ''
  formModel.taxNum = ''
  formModel.taxRate = undefined
  formModel.bankName = ''
  formModel.accountNumber = ''
  formModel.address = ''
  formModel.sort = ''
  formModel.description = ''
}

function add() {
  edit({})
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false
  title.value = record.id ? '编辑' : '新增'
  visible.value = true
  nextTick(() => {
    Object.keys(record).forEach((key) => {
      if (key in formModel) {
        formModel[key] = record[key]
      }
    })
    formRef.value?.clearValidate()
  })
}

function close() {
  visible.value = false
  isReadOnly.value = false
}

async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (formModel.beginNeedGet && formModel.beginNeedPay) {
    ElMessage.warning('期初应收和期初应付不能同时输入')
    return
  }

  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    formData.type = '客户'
    let res: any
    if (!formModel.id) {
      res = await addSupplier(formData)
    } else {
      res = await editSupplier(formData)
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

defineExpose({ add, edit, title, isReadOnly, disableSubmit })
</script>
