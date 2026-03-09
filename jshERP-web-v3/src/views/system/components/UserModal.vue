<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
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
      <el-form-item label="登录名称" prop="loginName">
        <el-input v-model="formModel.loginName" placeholder="请输入登录名称" :disabled="!!formModel.id" />
      </el-form-item>
      <el-form-item v-if="!formModel.id" label="用户密码" prop="password">
        <el-input v-model="formModel.password" type="password" placeholder="请输入用户密码" show-password />
      </el-form-item>
      <el-form-item label="用户姓名" prop="username">
        <el-input v-model="formModel.username" placeholder="请输入用户姓名" />
      </el-form-item>
      <el-form-item label="角色" prop="roleId">
        <template v-if="!formModel.id || formModel.id !== formModel.tenantId">
          <el-select v-model="formModel.roleId" placeholder="选择角色" style="width: 100%">
            <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </template>
        <span v-else>{{ tenantRoleName }}</span>
      </el-form-item>
      <el-form-item label="机构">
        <el-tree-select
          v-model="formModel.orgaId"
          :data="orgaTree"
          :render-after-expand="false"
          placeholder="请选择机构"
          clearable
          check-strictly
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="职位">
        <el-input v-model="formModel.position" placeholder="请输入职位" />
      </el-form-item>
      <el-form-item label="是否经理">
        <el-select v-model="formModel.leaderFlag" placeholder="请选择是否经理" style="width: 100%">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="电话号码">
        <el-input v-model="formModel.phonenum" placeholder="请输入电话号码" />
      </el-form-item>
      <el-form-item label="电子邮箱">
        <el-input v-model="formModel.email" placeholder="请输入电子邮箱" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input v-model="formModel.userBlngOrgaDsplSeq" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formModel.description" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
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
import { addUser, editUser, queryOrganizationTreeList, roleAllList } from '@/api/system'
import CryptoJS from 'crypto-js'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const formRef = ref<FormInstance>()
const orgaTree = ref<any[]>([])
const roleList = ref<any[]>([])
const tenantRoleName = ref('')

const formModel = reactive<Record<string, any>>({
  id: undefined,
  tenantId: undefined,
  loginName: '',
  password: '',
  username: '',
  roleId: undefined,
  orgaId: undefined,
  position: '',
  leaderFlag: undefined,
  phonenum: '',
  email: '',
  userBlngOrgaDsplSeq: '',
  description: '',
})

const rules = reactive<FormRules>({
  loginName: [{ required: true, message: '请输入登录名称!', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入用户密码!', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*\d).{6,}$/, message: '用户密码至少要有数字和小写字母，并且长度至少6位!', trigger: 'blur' },
  ],
  username: [{ required: true, message: '请输入用户姓名!', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色!', trigger: 'change' }],
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  formModel.loginName = ''
  formModel.password = ''
  formModel.username = ''
  formModel.position = ''
  formModel.phonenum = ''
  formModel.email = ''
  formModel.userBlngOrgaDsplSeq = ''
  formModel.description = ''
}

function add() {
  resetForm()
  isReadOnly.value = false
  title.value = '新增'
  visible.value = true
  loadOrgaData()
  loadRoleData()
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false
  title.value = '编辑'
  visible.value = true
  loadOrgaData()
  loadRoleData()
  nextTick(() => {
    Object.keys(record).forEach((key) => {
      if (key in formModel) {
        formModel[key] = record[key]
      }
    })
    tenantRoleName.value = record.roleName || ''
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

  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    let res: any
    if (!formModel.id) {
      formData.password = CryptoJS.MD5(formModel.password).toString()
      res = await addUser(formData)
    } else {
      res = await editUser(formData)
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

function loadOrgaData() {
  queryOrganizationTreeList({ id: '' }).then((res: any) => {
    if (res) {
      orgaTree.value = transformTreeData(res)
    }
  })
}

function loadRoleData() {
  roleAllList({}).then((res: any) => {
    if (res) {
      roleList.value = res
    }
  })
}

/** 转换后端树结构为 el-tree-select 格式 */
function transformTreeData(data: any[]): any[] {
  if (!data) return []
  return data.map((item) => ({
    value: item.id || item.key || item.value,
    label: item.title || item.label || item.name,
    children: item.children ? transformTreeData(item.children) : undefined,
  }))
}

defineExpose({ add, edit, isReadOnly, title })
</script>
