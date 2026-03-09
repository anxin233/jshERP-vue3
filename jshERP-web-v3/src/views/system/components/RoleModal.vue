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
      <el-form-item label="角色名称" prop="name">
        <el-input v-model.trim="formModel.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="数据类型" prop="type">
        <el-select v-model="formModel.type" placeholder="请选择数据类型" style="width: 94%">
          <el-option label="全部数据" value="全部数据" />
          <el-option label="本机构数据" value="本机构数据" />
          <el-option label="个人数据" value="个人数据" />
        </el-select>
        <el-tooltip
          content="1、全部数据-该角色对应的用户可以看到全部单据；2、本机构数据-该角色对应的用户可以看到自己所在机构的全部单据；3、个人数据-该角色对应的用户只可以看到自己的单据。单据是指采购入库、销售出库等"
          placement="top"
        >
          <el-icon style="width: 6%; padding-left: 5px; font-size: 18px; cursor: pointer"><QuestionFilled /></el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="价格屏蔽">
        <el-select
          v-model="priceLimitValue"
          multiple
          placeholder="请选择价格屏蔽"
          style="width: 94%"
        >
          <el-option
            v-for="item in priceLimitOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-tooltip content="价格屏蔽支持多选，主要用于控制首页界面和物料的价格屏蔽" placement="top">
          <el-icon style="width: 6%; padding-left: 5px; font-size: 18px; cursor: pointer"><QuestionFilled /></el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="备注" prop="description">
        <el-input v-model="formModel.description" type="textarea" :rows="1" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input v-model.trim="formModel.sort" placeholder="请输入排序" />
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
import { QuestionFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { addRole, editRole, checkRole } from '@/api/system'

const emit = defineEmits<{ ok: [record?: any] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const formRef = ref<FormInstance>()

const formModel = reactive<Record<string, any>>({
  id: undefined,
  name: '',
  type: undefined,
  description: '',
  sort: '',
  priceLimit: '',
})

/** 价格屏蔽选项 */
const priceLimitOptions = [
  { value: '1', label: '屏蔽首页采购价' },
  { value: '2', label: '屏蔽首页零售价' },
  { value: '3', label: '屏蔽首页销售价' },
  { value: '4', label: '屏蔽单据采购价' },
  { value: '5', label: '屏蔽单据零售价' },
  { value: '6', label: '屏蔽单据销售价' },
]

/** 价格屏蔽已选值（多选数组） */
const priceLimitValue = ref<string[]>([])

/** 自定义校验：角色名称是否已存在 */
function validateRoleName(_rule: any, value: string, callback: any) {
  if (!value) {
    callback()
    return
  }
  const params = {
    name: value,
    id: formModel.id || 0,
  }
  checkRole(params).then((res: any) => {
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
    { required: true, message: '请输入角色名称!', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
    { validator: validateRoleName, trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择数据类型!', trigger: 'change' },
  ],
  description: [
    { min: 0, max: 126, message: '长度不超过 126 个字符', trigger: 'blur' },
  ],
})

function resetForm() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = undefined
  })
  formModel.name = ''
  formModel.type = undefined
  formModel.description = ''
  formModel.sort = ''
  formModel.priceLimit = ''
  priceLimitValue.value = []
}

function add() {
  resetForm()
  isReadOnly.value = false
  title.value = '新增【保存之后请继续分配功能】'
  visible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false
  title.value = '编辑【保存之后请继续分配功能】'
  visible.value = true
  nextTick(() => {
    Object.keys(record).forEach((key) => {
      if (key in formModel) {
        formModel[key] = record[key]
      }
    })
    // 解析价格屏蔽字符串为数组
    if (record.priceLimit) {
      priceLimitValue.value = record.priceLimit.split(',').filter((v: string) => v)
    }
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
    // 将价格屏蔽数组转换为逗号分隔字符串
    formData.priceLimit = priceLimitValue.value.join(',')
    let res: any
    if (!formModel.id) {
      res = await addRole(formData)
    } else {
      res = await editRole(formData)
    }
    if (res.code === 200) {
      emit('ok', formData)
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

defineExpose({ add, edit, title, isReadOnly })
</script>
