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
      <el-button v-if="billPrintFlag && isShowPrintBtn" @click="handlePrintPro('请购单', $refs.modalPrintPro)">
        三联打印-新版
      </el-button>
      <el-button v-if="billPrintFlag && isShowPrintBtn" @click="handlePrint('请购单', $refs.modalPrint)">
        三联打印
      </el-button>
      <el-button v-if="checkFlag && isCanCheck" :loading="confirmLoading" @click="handleOkAndCheck">
        保存并审核
      </el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleOkOnly">
        保存（Ctrl+S）
      </el-button>
      <el-button v-if="!checkFlag" type="primary" @click="handleWorkflow($refs.modalWorkflow)">
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
          <el-form-item label="单据日期" prop="operTime">
            <el-date-picker
              v-model="formModel.operTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="单据编号" prop="number">
            <el-input v-model.trim="formModel.number" placeholder="请输入单据编号" />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
        </el-col>
      </el-row>

      <!-- ==================== 明细子表 ==================== -->
      <div class="editable-table-section">
        <!-- 子表上方操作栏 -->
        <div class="editable-table-extra" style="margin-bottom: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
          <template v-if="rowCanEdit">
            <template v-if="scanStatus">
              <el-button @click="scanEnter(scanBarCodeRef)">扫码录入</el-button>
            </template>
            <template v-else>
              <el-input
                ref="scanBarCodeRef"
                v-model="scanBarCode"
                placeholder="请扫描商品条码并回车"
                style="width: 260px"
                @keyup.enter="scanPressEnter(scanBarCodeRef)"
              />
              <el-button @click="stopScan">收起扫码</el-button>
            </template>
          </template>
          <el-button @click="handleHistoryBillList">
            <el-icon><Clock /></el-icon> 历史单据
          </el-button>
          <el-button v-if="rowCanEdit" :icon="Upload" @click="onImport(prefixNo, $refs.importItemModalForm)">
            导入明细
          </el-button>
        </div>

        <EditableTable
          ref="materialDataTableRef"
          :columns="materialTable.columns"
          :data-source="materialTable.dataSource"
          :max-height="300"
          :row-number="false"
          :row-selection="rowCanEdit"
          :action-button="rowCanEdit"
          :disabled="!rowCanEdit"
          :loading="materialTable.loading"
          @value-change="onValueChange"
          @added="onAdded"
          @deleted="onDeleted"
        />
      </div>

      <!-- ==================== 备注 ==================== -->
      <el-row :gutter="24" style="margin-top: 12px">
        <el-col :span="24">
          <el-form-item label="" label-width="0">
            <el-input
              v-model="formModel.remark"
              type="textarea"
              :rows="1"
              placeholder="请输入备注"
              style="margin-top: 8px"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- ==================== 附件 ==================== -->
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
    <ImportItemModal ref="importItemModalForm" @ok="importItemModalFormOk" />
    <HistoryBillList ref="historyBillListRef" />
    <BillPrintIframe ref="modalPrint" />
    <!-- <BillPrintProIframe ref="modalPrintPro" /> -->
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Upload } from '@element-plus/icons-vue'
import EditableTable from '@/components/table/EditableTable.vue'
import ImportItemModal from './ImportItemModal.vue'
import HistoryBillList from './HistoryBillList.vue'
import BillPrintIframe from './BillPrintIframe.vue'
import { useBillModal, FormTypes } from '@/composables/useBillModal'
import { postAction } from '@/api/http'
import { getMpListShort } from '@/utils/index'
import { getStore } from '@/utils/storage'

defineOptions({ name: 'PurchaseApplyModal' })

// ==================== 组件 Ref ====================
const formRef = ref()
const materialDataTableRef = ref()
const historyBillListRef = ref()
const scanBarCodeRef = ref()

// ==================== 常量 ====================
const prefixNo = 'QGD'

// ==================== 本组件状态 ====================
const visible = ref(false)
const title = ref('操作')
const confirmLoading = ref(false)
const fileList = ref<any[]>([])
const rowCanEdit = ref(true)

// ==================== 表单模型 ====================
const formModel = reactive<Record<string, any>>({
  id: '',
  tenantId: '',
  operTime: '',
  number: '',
  remark: '',
  fileName: '',
  status: '0',
})

// ==================== 表单验证 ====================
const formRules = {
  operTime: [{ required: true, message: '请输入单据日期！', trigger: 'change' }],
  number: [{ required: true, message: '请输入单据编号!', trigger: 'blur' }],
}

// ==================== 明细子表列定义 ====================
const materialTable = reactive({
  loading: false,
  dataSource: [] as any[],
  columns: [
    { title: '', key: 'hiddenKey', width: '1%', type: FormTypes.hidden },
    {
      title: '条码', key: 'barCode', width: '12%', type: FormTypes.popupJsh,
      kind: 'material', multi: true,
      validateRules: [{ required: true, message: '条码不能为空' }],
    },
    { title: '名称', key: 'name', width: '10%', type: FormTypes.normal },
    { title: '规格', key: 'standard', width: '9%', type: FormTypes.normal },
    { title: '型号', key: 'model', width: '9%', type: FormTypes.normal },
    { title: '颜色', key: 'color', width: '6%', type: FormTypes.normal },
    { title: '品牌', key: 'brand', width: '6%', type: FormTypes.normal },
    { title: '制造商', key: 'mfrs', width: '6%', type: FormTypes.normal },
    { title: '扩展1', key: 'otherField1', width: '4%', type: FormTypes.normal },
    { title: '扩展2', key: 'otherField2', width: '4%', type: FormTypes.normal },
    { title: '扩展3', key: 'otherField3', width: '4%', type: FormTypes.normal },
    { title: '单位', key: 'unit', width: '6%', type: FormTypes.normal },
    { title: '多属性', key: 'sku', width: '10%', type: FormTypes.normal },
    {
      title: '数量', key: 'operNumber', width: '6%', type: 'inputNumber' as const,
      statistics: true, validateRules: [{ required: true, message: '数量不能为空' }],
    },
    { title: '备注', key: 'remark', width: '8%', type: 'input' as const },
  ],
})

// ==================== useBillModal ====================
const {
  // 状态
  action,
  scanBarCode,
  scanStatus,
  billStatus,
  isCanCheck,
  quickBtn,
  billPrintFlag,
  isShowPrintBtn,
  checkFlag,
  readOnly,
  // 初始化方法
  addInit,
  copyAddInit,
  requestSubTableData,
  initSystemConfig,
  initPlatform,
  initQuickBtn,
  // 明细表事件
  onAdded,
  onValueChange,
  onDeleted,
  // 列控制
  changeColumnHide,
  // 扫码
  scanEnter,
  scanPressEnter,
  stopScan,
  // 导入
  onImport,
  importItemModalFormOk,
  // 保存
  handleOkAndCheck,
  handleOkOnly,
  // 流程
  handleWorkflow,
  // 打印
  handlePrint,
  handlePrintPro,
  // 扩展字段
  handleChangeOtherField,
  // 快捷键
  bindKeydown,
  unbindKeydown,
} = useBillModal({
  prefixNo,
  formModel,
  materialTable,
  materialDataTableRef,
  getTableData: async () => {
    if (materialDataTableRef.value) {
      return materialDataTableRef.value.getValues()
    }
    return []
  },
  getStatisticsColumns: () => {
    if (materialDataTableRef.value) {
      return materialDataTableRef.value.getStatisticsValue?.() || {}
    }
    return {}
  },
})

// ==================== URL ====================
const url = {
  add: '/depotHead/addDepotHeadAndDetail',
  edit: '/depotHead/updateDepotHeadAndDetail',
  detailList: '/depotItem/getDetailList',
  importExcelUrl: '/depotItem/importItemExcel',
}

// ==================== 页面方法 ====================

/** 新增 */
function add() {
  visible.value = true
  nextTick(() => {
    editAfter()
    bindKeydown()
  })
}

/** 编辑/查看 */
function edit(record: any) {
  visible.value = true
  Object.assign(formModel, record)
  nextTick(() => {
    editAfter()
    bindKeydown()
  })
}

/** 弹窗打开后的初始化（新增/编辑/复制通用） */
function editAfter() {
  billStatus.value = '0'
  rowCanEdit.value = true
  changeColumnHide()

  if (action.value === 'add') {
    addInit(prefixNo)
    fileList.value = []
  } else {
    // 编辑/查看
    formModel.operTime = formModel.operTimeStr || formModel.operTime
    fileList.value = formModel.fileName || []

    // 加载子表数据
    const params = {
      headerId: formModel.id,
      mpList: getMpListShort(getStore('materialPropertyList') as string),
      linkType: 'basic',
    }
    requestSubTableData(url.detailList, params, materialTable)
  }

  // 复制新增 - 初始化单号和日期
  if (action.value === 'copyAdd') {
    formModel.id = ''
    formModel.tenantId = ''
    copyAddInit(prefixNo)
  }

  initSystemConfig()
  initPlatform()
  initQuickBtn()
  handleChangeOtherField()
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
  if (materialDataTableRef.value) {
    detailArr = await materialDataTableRef.value.getValues()
  }
  if (!detailArr || detailArr.length === 0) {
    ElMessage.warning('请录入商品明细！')
    return
  }

  // 整理提交数据
  const billMain: Record<string, any> = { ...formModel }
  let totalPrice = 0
  for (const item of detailArr) {
    totalPrice += (item.allPrice || 0) - 0
  }
  billMain.type = '其它'
  billMain.subType = '请购单'
  billMain.totalPrice = 0 - totalPrice
  if (fileList.value && fileList.value.length > 0) {
    billMain.fileName = fileList.value
  } else {
    billMain.fileName = ''
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
    console.error('[PurchaseApplyModal] handleOk error:', e)
    ElMessage.error('保存失败！')
  } finally {
    confirmLoading.value = false
  }
}

/** 取消/关闭 */
function handleCancel() {
  visible.value = false
  unbindKeydown()
  formRef.value?.resetFields()
  materialTable.dataSource = []
  Object.keys(formModel).forEach((key) => {
    if (key === 'status') {
      formModel[key] = '0'
    } else if (typeof formModel[key] === 'number') {
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

/** 历史单据 */
function handleHistoryBillList() {
  const organId = formModel.organId
  historyBillListRef.value?.show('其它', '请购单', '', organId)
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
