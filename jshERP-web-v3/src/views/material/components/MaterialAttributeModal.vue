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
      <el-form-item label="属性名" prop="attributeName">
        <el-input v-model.trim="formModel.attributeName" placeholder="请输入属性名" />
      </el-form-item>
      <el-form-item label="属性值">
        <el-tabs v-model="activeKey">
          <el-tab-pane label="标签模式" name="1">
            <div class="tag-container">
              <el-tag
                v-for="tag in tags"
                :key="tag"
                closable
                type="primary"
                style="margin: 0 4px 8px 0;"
                @close="handleClose(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="inputRef"
                v-model="inputValue"
                size="small"
                style="width: 150px;"
                @blur="handleInputConfirm"
                @keyup.enter="handleInputConfirm"
              />
              <el-button v-else size="small" @click="showInput">
                + 请输入属性值
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="文字模式" name="2">
            <el-input
              v-model="formModel.attributeValue"
              type="textarea"
              :rows="8"
              placeholder="请输入属性值"
              @input="handleValueChange"
            />
            <div style="color: #999; margin-top: 4px;">
              注意：属性值请用竖线隔开，比如：红色|橙色|黄色|绿色
            </div>
          </el-tab-pane>
        </el-tabs>
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
import { addMaterialAttribute, editMaterialAttribute, checkMaterialAttribute } from '@/api/material'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const isReadOnly = ref(false)
const disableSubmit = ref(false)
const formRef = ref<FormInstance>()
const inputRef = ref()

const activeKey = ref('1')
const tags = ref<string[]>([])
const inputVisible = ref(false)
const inputValue = ref('')

const formModel = reactive<Record<string, any>>({
  id: undefined,
  attributeName: '',
  attributeValue: '',
})

/** 异步校验属性名是否已存在 */
const validateAttributeName = async (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }
  try {
    const params = {
      name: value,
      id: formModel.id || 0,
    }
    const res = await checkMaterialAttribute(params)
    if (res && res.code === 200) {
      if (!res.data.status) {
        callback()
      } else {
        callback(new Error('名称已经存在'))
      }
    } else {
      callback(new Error(res.data))
    }
  } catch {
    callback()
  }
}

const rules = reactive<FormRules>({
  attributeName: [
    { required: true, message: '请输入属性名!', trigger: 'blur' },
    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' },
    { validator: validateAttributeName, trigger: 'blur' },
  ],
})

function resetForm() {
  formModel.id = undefined
  formModel.attributeName = ''
  formModel.attributeValue = ''
  tags.value = []
  activeKey.value = '1'
  inputVisible.value = false
  inputValue.value = ''
}

function add() {
  edit({})
}

function edit(record: any) {
  resetForm()
  isReadOnly.value = false
  visible.value = true
  nextTick(() => {
    if (record.id) {
      formModel.id = record.id
    }
    if (record.attributeName) {
      formModel.attributeName = record.attributeName
    }
    if (record.attributeValue) {
      formModel.attributeValue = record.attributeValue
      tags.value = record.attributeValue.split('|')
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

  // 同步 tags 到 attributeValue
  formModel.attributeValue = tags.value.join('|')

  if (!formModel.attributeValue) {
    ElMessage.warning('请输入属性值!')
    return
  }

  confirmLoading.value = true
  try {
    const formData = { ...formModel }
    let res: any
    if (!formModel.id) {
      res = await addMaterialAttribute(formData)
    } else {
      res = await editMaterialAttribute(formData)
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

/** 属性值文字模式变更，同步到 tags */
function handleValueChange(value: string) {
  if (value) {
    tags.value = value.split('|')
  } else {
    tags.value = []
  }
}

/** 删除 tag */
function handleClose(removedTag: string) {
  tags.value = tags.value.filter((tag) => tag !== removedTag)
  formModel.attributeValue = tags.value.join('|')
}

/** 展示 tag 输入框 */
function showInput() {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

/** 确认输入 tag */
function handleInputConfirm() {
  const val = inputValue.value.trim()
  if (val && !tags.value.includes(val)) {
    tags.value.push(val)
  }
  inputVisible.value = false
  inputValue.value = ''
  formModel.attributeValue = tags.value.join('|')
}

defineExpose({ add, edit, title, isReadOnly, disableSubmit })
</script>

<style scoped lang="scss">
.tag-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
