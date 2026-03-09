<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleCancel"
  >
    <div v-loading="confirmLoading">
      <!-- 批量操作按钮区域 -->
      <div class="btn-operation-bar">
        <el-button @click="toggleChecked">
          {{ !checked ? '全选' : '全取消' }}
        </el-button>
        <el-button @click="editToggleChecked">
          {{ !editChecked ? '全选-编辑' : '全取消-编辑' }}
        </el-button>
        <el-button @click="auditToggleChecked">
          {{ !auditChecked ? '全选-审核' : '全取消-审核' }}
        </el-button>
        <el-button @click="unAuditToggleChecked">
          {{ !unAuditChecked ? '全选-反审核' : '全取消-反审核' }}
        </el-button>
        <el-button @click="exportToggleChecked">
          {{ !exportChecked ? '全选-导出' : '全取消-导出' }}
        </el-button>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="dataSource"
        :loading="loading"
        border
        size="default"
        row-key="id"
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="40" align="center" />
        <el-table-column prop="name" label="名称" align="center" />
        <el-table-column label="按钮列表" align="center">
          <template #default="{ row }">
            <el-checkbox
              v-if="row.pushBtn && row.pushBtn.indexOf(1) > -1"
              :model-value="row.btnStr ? row.btnStr.indexOf('1') > -1 : false"
              @change="onChange(row, '1')"
            >编辑</el-checkbox>
            <el-checkbox
              v-if="row.pushBtn && row.pushBtn.indexOf(2) > -1"
              :model-value="row.btnStr ? row.btnStr.indexOf('2') > -1 : false"
              @change="onChange(row, '2')"
            >审核</el-checkbox>
            <el-checkbox
              v-if="row.pushBtn && row.pushBtn.indexOf(7) > -1"
              :model-value="row.btnStr ? row.btnStr.indexOf('7') > -1 : false"
              @change="onChange(row, '7')"
            >反审核</el-checkbox>
            <el-checkbox
              v-if="row.pushBtn && row.pushBtn.indexOf(3) > -1"
              :model-value="row.btnStr ? row.btnStr.indexOf('3') > -1 : false"
              @change="onChange(row, '3')"
            >导出</el-checkbox>
            <el-checkbox
              v-if="row.pushBtn && row.pushBtn.indexOf(4) > -1"
              :model-value="row.btnStr ? row.btnStr.indexOf('4') > -1 : false"
              @change="onChange(row, '4')"
            >启用禁用</el-checkbox>
            <el-checkbox
              v-if="row.pushBtn && row.pushBtn.indexOf(5) > -1"
              :model-value="row.btnStr ? row.btnStr.indexOf('5') > -1 : false"
              @change="onChange(row, '5')"
            >打印</el-checkbox>
            <el-checkbox
              v-if="row.pushBtn && row.pushBtn.indexOf(6) > -1"
              :model-value="row.btnStr ? row.btnStr.indexOf('6') > -1 : false"
              @change="onChange(row, '6')"
            >作废</el-checkbox>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOk">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAction } from '@/api/http'
import { updateBtnStrByRoleId } from '@/api/system'

const emit = defineEmits<{ ok: [] }>()

const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const loading = ref(false)
const dataSource = ref<any[]>([])
const roleId = ref<string | number>('')

const checked = ref(false)
const editChecked = ref(false)
const auditChecked = ref(false)
const unAuditChecked = ref(false)
const exportChecked = ref(false)

function edit(id: string | number) {
  roleId.value = id
  visible.value = true
  checked.value = false
  editChecked.value = false
  auditChecked.value = false
  unAuditChecked.value = false
  exportChecked.value = false

  if (id) {
    loading.value = true
    getAction('/function/findRoleFunctionsById', { roleId: id }).then((res: any) => {
      if (res.code === 200) {
        dataSource.value = res.data.rows || []
      } else if (res.code === 400) {
        dataSource.value = []
      } else if (res.code === 500) {
        ElMessage.warning(res.data)
      }
      loading.value = false
    })
  }
}

function close() {
  visible.value = false
}

function handleCancel() {
  close()
}

function handleOk() {
  confirmLoading.value = true
  const funArray = dataSource.value
  const bindArr: { funId: any; btnStr: string }[] = []

  for (const item of funArray) {
    if (item.btnStr !== undefined && item.btnStr !== '' && item.btnStr !== 'null' && item.btnStr !== null) {
      bindArr.push({
        funId: item.id,
        btnStr: item.btnStr,
      })
    }
  }

  let btnStr = ''
  if (bindArr.length) {
    btnStr = JSON.stringify(bindArr)
  }

  updateBtnStrByRoleId({ roleId: roleId.value, btnStr })
    .then((res: any) => {
      if (res.code === 200) {
        emit('ok')
      } else {
        ElMessage.warning(res.data)
      }
    })
    .finally(() => {
      confirmLoading.value = false
      close()
    })
}

/** 全选/全取消 */
function toggleChecked() {
  checked.value = !checked.value
  for (const item of dataSource.value) {
    item.btnStr = checked.value ? item.pushBtn : ''
  }
}

/** 全选/全取消 - 编辑 */
function editToggleChecked() {
  editChecked.value = !editChecked.value
  for (const item of dataSource.value) {
    item.btnStr = parseArrByParam(1, item.btnStr, editChecked.value ? 1 : 0)
  }
}

/** 全选/全取消 - 审核 */
function auditToggleChecked() {
  auditChecked.value = !auditChecked.value
  for (const item of dataSource.value) {
    item.btnStr = parseArrByParam(2, item.btnStr, auditChecked.value ? 1 : 0)
  }
}

/** 全选/全取消 - 反审核 */
function unAuditToggleChecked() {
  unAuditChecked.value = !unAuditChecked.value
  for (const item of dataSource.value) {
    item.btnStr = parseArrByParam(7, item.btnStr, unAuditChecked.value ? 1 : 0)
  }
}

/** 全选/全取消 - 导出 */
function exportToggleChecked() {
  exportChecked.value = !exportChecked.value
  for (const item of dataSource.value) {
    item.btnStr = parseArrByParam(3, item.btnStr, exportChecked.value ? 1 : 0)
  }
}

/**
 * 格式转换，控制按钮的显示或隐藏
 * @param param 按钮标识
 * @param btnStr 当前按钮字符串
 * @param type 1=添加 0=移除
 */
function parseArrByParam(param: number, btnStr: string, type: number): string {
  if (!btnStr) btnStr = ''
  if (type) {
    btnStr = btnStr + ','
    if (btnStr.indexOf(param + ',') === -1) {
      btnStr = btnStr + param + ','
    }
  } else {
    btnStr = btnStr + ','
    if (btnStr.indexOf(param + ',') > -1) {
      btnStr = btnStr.replace(param + ',', '')
    }
  }
  if (btnStr) {
    btnStr = btnStr.replace('null', '')
    btnStr = btnStr.substring(0, btnStr.length - 1)
    if (btnStr.substring(0, 1) === ',') {
      btnStr = btnStr.substring(1)
    }
  }
  return btnStr
}

/** 从数组中移除指定值 */
function removeByVal(arr: string[], val: string) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      arr.splice(i, 1)
      break
    }
  }
}

/** 单个复选框切换 */
function onChange(record: any, value: string) {
  for (const item of dataSource.value) {
    if (item.id === record.id) {
      const btnStr = record.btnStr
      if (btnStr) {
        const btnArr = btnStr.split(',')
        if (btnStr.indexOf(value) > -1) {
          // 取消勾选
          removeByVal(btnArr, value)
          item.btnStr = btnArr.join(',')
        } else {
          // 勾选
          btnArr.push(value)
          item.btnStr = btnArr.join(',')
        }
      } else {
        // 首次勾选
        item.btnStr = value
      }
    }
  }
}

defineExpose({ edit, title })
</script>

<style scoped lang="scss">
.btn-operation-bar {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
