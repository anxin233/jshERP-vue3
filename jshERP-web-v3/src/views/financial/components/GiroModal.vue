<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    fullscreen
    destroy-on-close
    :id="prefixNo"
    @close="handleCancel"
  >
    <!-- ==================== 底部按钮 ==================== -->
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button v-if="checkFlag && isCanCheck" :loading="confirmLoading" @click="handleOkAndCheck">
        保存并审核
      </el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOkOnly">
        保存（Ctrl+S）
      </el-button>
      <el-button v-if="!checkFlag" type="primary" @click="handleWorkflow(formModel, $refs.modalWorkflow)">
        提交流程
      </el-button>
    </template>

    <!-- ==================== 表单内容 ==================== -->
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="formRules"
      label-width="100px"
      v-loading="confirmLoading"
    >
      <el-row :gutter="24">
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="单据日期" prop="billTime">
            <el-date-picker
              v-model="formModel.billTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="单据编号" prop="billNo">
            <el-input v-model.trim="formModel.billNo" placeholder="请输入单据编号" />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="财务人员" prop="handsPersonId">
            <el-select
              v-model="formModel.handsPersonId"
              placeholder="请选择财务人员"
              filterable
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in personList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
              <template #footer>
                <div v-if="quickBtn.person" class="dropdown-btn" @click="addPerson($refs.personModalForm)">
                  <el-icon><Plus /></el-icon> 新增经手人
                </div>
                <div class="dropdown-btn" @click="initPerson()">
                  <el-icon><Refresh /></el-icon> 刷新
                </div>
              </template>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24"></el-col>
      </el-row>

      <!-- ==================== 明细子表 ==================== -->
      <div class="editable-table-section">
        <EditableTable
          ref="accountDataTableRef"
          :columns="accountTable.columns"
          :data-source="accountTable.dataSource"
          :max-height="300"
          :row-number="true"
          :row-selection="true"
          :action-button="true"
          :loading="accountTable.loading"
          @added="(e: any) => onAdded(e, accountDataTableRef)"
          @value-change="(e: any) => onValueChange(e, formModel)"
          @deleted="(ids: any, target: any) => onDeleted(ids, target, formModel)"
        />
      </div>

      <!-- ==================== 备注 ==================== -->
      <el-row :gutter="24" style="margin-top: 12px">
        <el-col :span="24">
          <el-form-item label="" label-width="0">
            <el-input
              v-model="formModel.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
              style="margin-top: 8px"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- ==================== 底部金额行 ==================== -->
      <el-row :gutter="24">
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="付款账户" prop="accountId">
            <el-select
              v-model="formModel.accountId"
              placeholder="请选择付款账户"
              filterable
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
              <template #footer>
                <div v-if="quickBtn.account" class="dropdown-btn" @click="addAccount($refs.accountModalForm)">
                  <el-icon><Plus /></el-icon> 新增
                </div>
                <div class="dropdown-btn" @click="initAccount()">
                  <el-icon><Refresh /></el-icon> 刷新
                </div>
              </template>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="合计金额">
            <el-input v-model.trim="formModel.changeAmount" placeholder="请输入实付金额" readonly />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24"></el-col>
        <el-col :lg="6" :md="12" :sm="24"></el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="附件">
            <el-upload
              v-model:file-list="fileList"
              action="/systemConfig/upload"
              multiple
              :limit="5"
            >
              <el-button type="primary" size="small">点击上传</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- ==================== 子弹窗 ==================== -->
    <AccountModal ref="accountModalForm" @ok="accountModalFormOk" />
    <PersonModal ref="personModalForm" @ok="personModalFormOk" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import EditableTable from '@/components/table/EditableTable.vue'
import AccountModal from '@/views/system/components/AccountModal.vue'
import PersonModal from '@/views/system/components/PersonModal.vue'
import { useFinancialModal } from '@/composables/useFinancialModal'
import { postAction, getAction } from '@/api/http'

defineOptions({ name: 'GiroModal' })

// ==================== 组件 Ref ====================
const formRef = ref()
const accountDataTableRef = ref()

// ==================== 常量 ====================
const prefixNo = 'ZZ'

// ==================== 本组件状态 ====================
const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const fileList = ref<any[]>([])

// ==================== 表单模型 ====================
const formModel = reactive<Record<string, any>>({
  id: '',
  billTime: '',
  billNo: '',
  handsPersonId: undefined,
  accountId: undefined,
  totalPrice: 0,
  changeAmount: 0,
  remark: '',
  fileName: '',
})

// ==================== 表单验证 ====================
const formRules = {
  billTime: [{ required: true, message: '请选择单据日期!', trigger: 'change' }],
  billNo: [{ required: true, message: '请输入单据编号!', trigger: 'blur' }],
  accountId: [{ required: true, message: '请选择付款账户!', trigger: 'change' }],
}

// ==================== 明细子表列定义 ====================
const accountTable = reactive({
  loading: false,
  dataSource: [] as any[],
  columns: [
    {
      title: '收款账户', key: 'accountId', width: '20%', type: 'select' as const,
      placeholder: '请选择收款账户', options: [] as any[],
      validateRules: [{ required: true, message: '收款账户不能为空' }],
    },
    {
      title: '金额', key: 'eachAmount', width: '10%', type: 'inputNumber' as const,
      statistics: true, placeholder: '请输入金额',
      validateRules: [{ required: true, message: '金额不能为空' }],
    },
    {
      title: '备注', key: 'remark', width: '30%', type: 'input' as const,
      placeholder: '请输入备注',
    },
  ],
})

// ==================== URL ====================
const url = {
  add: '/accountHead/addAccountHeadAndDetail',
  edit: '/accountHead/updateAccountHeadAndDetail',
  detailList: '/accountItem/getDetailList',
}

// ==================== useFinancialModal ====================
const {
  action,
  personList,
  accountList,
  billStatus,
  isCanCheck,
  quickBtn,
  checkFlag,
  readOnly,
  addInit,
  initSystemConfig,
  initPerson,
  initAccount,
  initDetailAccount,
  initQuickBtn,
  addAccount,
  addPerson,
  accountModalFormOk,
  personModalFormOk,
  onAdded,
  onDeleted,
  onValueChange,
  handleOkAndCheck,
  handleOkOnly,
  handleWorkflow,
} = useFinancialModal({
  prefixNo,
  model: formModel,
  accountTable,
  handleOk: handleOk,
  close: handleCancel,
})

// ==================== 页面方法 ====================

/** 新增 */
function add() {
  visible.value = true
  nextTick(() => {
    editAfter()
  })
}

/** 编辑/查看 */
function edit(record: any) {
  visible.value = true
  Object.assign(formModel, record)
  nextTick(() => {
    editAfter()
  })
}

/** 弹窗打开后的初始化 */
function editAfter() {
  billStatus.value = '0'

  if (action.value === 'add') {
    addInit(prefixNo, formModel)
    fileList.value = []
  } else {
    formModel.billTime = formModel.billTimeStr || formModel.billTime
    fileList.value = formModel.fileName || []

    // 加载子表数据
    const params = { headerId: formModel.id }
    requestSubTableData(url.detailList, params, accountTable)
  }

  initSystemConfig()
  initPerson()
  initAccount()
  initDetailAccount(accountTable)
  initQuickBtn()
}

/** 请求子表数据 */
async function requestSubTableData(urlPath: string, params: any, table: any) {
  table.loading = true
  try {
    const res = await getAction(urlPath, params)
    if (res && res.code === 200) {
      table.dataSource = res.data.rows || res.data || []
    }
  } catch (err) {
    console.error('[GiroModal] requestSubTableData error:', err)
  } finally {
    table.loading = false
  }
}

/** 提交保存 */
async function handleOk() {
  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.warning('请检查表单填写是否完整！')
    return
  }

  // 获取子表数据
  let detailArr: any[] = []
  if (accountDataTableRef.value) {
    detailArr = await accountDataTableRef.value.getValues()
  }
  if (!detailArr || detailArr.length === 0) {
    ElMessage.warning('请录入明细数据！')
    return
  }

  // 整理提交数据
  const billMain: Record<string, any> = { ...formModel }
  let totalPrice = 0
  for (const item of detailArr) {
    totalPrice += (item.eachAmount || 0) - 0
  }
  billMain.type = '转账'
  billMain.totalPrice = 0 - totalPrice
  billMain.changeAmount = 0 - billMain.changeAmount
  if (fileList.value && fileList.value.length > 0) {
    billMain.fileName = fileList.value
  }
  if (formModel.id) {
    billMain.id = formModel.id
  }
  billMain.status = billStatus.value

  const formData = {
    info: JSON.stringify(billMain),
    rows: JSON.stringify(detailArr),
  }

  confirmLoading.value = true
  try {
    const submitUrl = formModel.id ? url.edit : url.add
    const res = await postAction(submitUrl, formData)
    if (res.code === 200) {
      ElMessage.success(res.data?.message || '保存成功！')
      emit('ok')
      if (billStatus.value === '0') {
        // 保存不关闭，继续编辑
      } else {
        handleCancel()
      }
    } else {
      ElMessage.warning(res.data?.message || '保存失败！')
    }
  } catch (e) {
    console.error('[GiroModal] handleOk error:', e)
    ElMessage.error('保存失败！')
  } finally {
    confirmLoading.value = false
  }
}

/** 取消/关闭 */
function handleCancel() {
  visible.value = false
  formRef.value?.resetFields()
  accountTable.dataSource = []
  Object.keys(formModel).forEach((key) => {
    if (typeof formModel[key] === 'number') {
      formModel[key] = 0
    } else if (typeof formModel[key] === 'string') {
      formModel[key] = ''
    } else {
      formModel[key] = undefined
    }
  })
  fileList.value = []
  emit('close')
}

// ==================== Emits ====================
const emit = defineEmits<{
  ok: []
  close: []
}>()

// ==================== defineExpose ====================
defineExpose({
  add,
  edit,
  action,
  title,
  visible,
  isCanCheck,
  disableSubmit: ref(false),
  handleOk,
  handleCancel,
})
</script>

<style scoped lang="scss">
.editable-table-section {
  margin: 12px 0;
}

.dropdown-btn {
  padding: 4px 12px;
  cursor: pointer;
  color: var(--el-color-primary);

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>
