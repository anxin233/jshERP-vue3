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
      <el-form-item label="仓库名称" prop="name">
        <el-input v-model="formModel.name" placeholder="请输入仓库名称" />
      </el-form-item>
      <el-form-item label="仓库地址" prop="address">
        <el-input v-model="formModel.address" placeholder="请输入仓库地址" />
      </el-form-item>
      <el-form-item label="仓储费" prop="warehousing">
        <el-input v-model="formModel.warehousing" placeholder="请输入仓储费">
          <template #suffix>元/天/KG</template>
        </el-input>
      </el-form-item>
      <el-form-item label="搬运费" prop="truckage">
        <el-input v-model="formModel.truckage" placeholder="请输入搬运费">
          <template #suffix>元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="负责人" prop="principal">
        <el-select v-model="formModel.principal" placeholder="选择负责人" style="width: 100%">
          <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="formModel.sort" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formModel.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { addDepot, editDepot, checkDepot, getUserList } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const formRef = ref<FormInstance>()
const userList = ref<any[]>([])

const formModel = reactive<Record<string, any>>({
  id: undefined,
  name: '',
  address: '',
  warehousing: '',
  truckage: '',
  principal: undefined,
  sort: '',
  remark: '',
})

/** 异步校验仓库名称唯一性 */
const validateDepotName = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const params = {
    name: value,
    id: formModel.id || 0,
  }
  checkDepot(params).then((res: any) => {
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
  name: [
    { required: true, message: '请输入仓库名称!', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
    { validator: validateDepotName, trigger: 'blur' },
  ],
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  formModel.name = ''
  formModel.address = ''
  formModel.warehousing = ''
  formModel.truckage = ''
  formModel.sort = ''
  formModel.remark = ''
}

/** 加载用户列表（负责人下拉） */
function initUser() {
  getUserList({}).then((res: any) => {
    if (res) {
      userList.value = res
    }
  })
}

function add() {
  resetForm()
  isReadOnly.value = false
  title.value = '新增'
  visible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false
  title.value = '编辑'
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

  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    let res: any
    if (!formModel.id) {
      res = await addDepot(formData)
    } else {
      res = await editDepot(formData)
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

onMounted(() => {
  initUser()
})

defineExpose({ add, edit, isReadOnly, title })
</script>
