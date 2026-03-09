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
      <el-button v-if="billPrintFlag && isShowPrintBtn" @click="handlePrintPro('其它出库', $refs.modalPrintPro)">
        三联打印-新版
      </el-button>
      <el-button v-if="billPrintFlag && isShowPrintBtn" @click="handlePrint('其它出库', $refs.modalPrint)">
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
          <el-form-item label="客户" prop="organId">
            <el-select
              v-model="formModel.organId"
              placeholder="请选择客户"
              filterable
              remote
              :remote-method="handleSearchCustomer"
              :disabled="!rowCanEdit"
              style="width: 100%"
              @change="handleOrganChange"
            >
              <el-option
                v-for="item in cusList"
                :key="item.id"
                :label="item.supplier"
                :value="item.id"
              />
              <template #footer>
                <div v-if="quickBtn.customer" class="dropdown-btn" @click="addCustomer($refs.customerModalForm)">
                  <el-icon><Plus /></el-icon> 新增客户
                </div>
                <div class="dropdown-btn" @click="initCustomer(0)">
                  <el-icon><Refresh /></el-icon> 刷新列表
                </div>
              </template>
            </el-select>
          </el-form-item>
        </el-col>
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
          <el-form-item v-if="inOutManageFlag && !formModel.billType" label="关联单据" prop="linkNumber">
            <el-input
              v-model="formModel.linkNumber"
              placeholder="请选择待出库单据"
              readonly
            >
              <template #append>
                <el-button :icon="Search" @click="onSearchLinkNumber" />
              </template>
            </el-input>
          </el-form-item>
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
                placeholder="请扫条码或序列号并回车"
                style="width: 260px"
                @keyup.enter="scanPressEnter(scanBarCodeRef)"
              />
              <el-button @click="stopScan">收起扫码</el-button>
            </template>
          </template>
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
          :row-selection="true"
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
    <CustomerModal ref="customerModalForm" @ok="customerModalFormOk" />
    <ImportItemModal ref="importItemModalForm" @ok="importItemModalFormOk" />
    <LinkBillList ref="linkBillListRef" @ok="linkBillListOk" />
    <BatchSetDepot ref="batchSetDepotModalForm" @ok="batchSetDepotModalFormOk" />
    <BillPrintIframe ref="modalPrint" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Search, Upload } from '@element-plus/icons-vue'
import EditableTable from '@/components/table/EditableTable.vue'
import CustomerModal from '@/views/system/components/CustomerModal.vue'
import ImportItemModal from './ImportItemModal.vue'
import LinkBillList from './LinkBillList.vue'
import BatchSetDepot from './BatchSetDepot.vue'
import BillPrintIframe from './BillPrintIframe.vue'
import { useBillModal, FormTypes } from '@/composables/useBillModal'
import { postAction } from '@/api/http'
import { getMpListShort } from '@/utils/index'
import { getStore } from '@/utils/storage'

defineOptions({ name: 'OtherOutModal' })

// ==================== 组件 Ref ====================
const formRef = ref()
const materialDataTableRef = ref()
const linkBillListRef = ref()
const scanBarCodeRef = ref()

// ==================== 常量 ====================
const prefixNo = 'QTCK'

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
  organId: undefined,
  operTime: '',
  number: '',
  linkNumber: '',
  remark: '',
  fileName: '',
  status: '0',
  billType: '',
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
    {
      title: '仓库名称', key: 'depotId', width: '8%', type: 'select' as const,
      placeholder: '请选择仓库', options: [] as any[],
      allowSearch: true, validateRules: [{ required: true, message: '仓库不能为空' }],
    },
    {
      title: '条码', key: 'barCode', width: '12%', type: FormTypes.popupJsh,
      kind: 'material', multi: true,
      validateRules: [{ required: true, message: '条码不能为空' }],
    },
    { title: '名称', key: 'name', width: '10%', type: FormTypes.normal },
    { title: '规格', key: 'standard', width: '9%', type: FormTypes.normal },
    { title: '型号', key: 'model', width: '9%', type: FormTypes.normal },
    { title: '颜色', key: 'color', width: '5%', type: FormTypes.normal },
    { title: '品牌', key: 'brand', width: '6%', type: FormTypes.normal },
    { title: '制造商', key: 'mfrs', width: '6%', type: FormTypes.normal },
    { title: '扩展1', key: 'otherField1', width: '4%', type: FormTypes.normal },
    { title: '扩展2', key: 'otherField2', width: '4%', type: FormTypes.normal },
    { title: '扩展3', key: 'otherField3', width: '4%', type: FormTypes.normal },
    { title: '库存', key: 'stock', width: '5%', type: FormTypes.normal },
    { title: '单位', key: 'unit', width: '4%', type: FormTypes.normal },
    { title: '序列号', key: 'snList', width: '12%', type: FormTypes.popupJsh, kind: 'sn', multi: true },
    { title: '批号', key: 'batchNumber', width: '7%', type: FormTypes.popupJsh, kind: 'batch', multi: false },
    { title: '有效期', key: 'expirationDate', width: '7%', type: 'input' as const, readonly: true },
    { title: '多属性', key: 'sku', width: '9%', type: FormTypes.normal },
    { title: '原数量', key: 'preNumber', width: '4%', type: FormTypes.normal },
    { title: '已入库', key: 'finishNumber', width: '4%', type: FormTypes.normal },
    {
      title: '数量', key: 'operNumber', width: '5%', type: 'inputNumber' as const,
      statistics: true, validateRules: [{ required: true, message: '数量不能为空' }],
    },
    { title: '单价', key: 'unitPrice', width: '5%', type: 'inputNumber' as const },
    { title: '金额', key: 'allPrice', width: '5%', type: 'inputNumber' as const, statistics: true },
    { title: '备注', key: 'remark', width: '5%', type: 'input' as const },
    { title: '关联id', key: 'linkId', width: '5%', type: FormTypes.hidden },
  ],
})

// ==================== useBillModal ====================
const {
  action,
  cusList,
  currentSelectDepotId,
  scanBarCode,
  scanStatus,
  billStatus,
  isCanCheck,
  quickBtn,
  billPrintFlag,
  isShowPrintBtn,
  checkFlag,
  inOutManageFlag,
  addInit,
  copyAddInit,
  requestSubTableData,
  initSystemConfig,
  initCustomer,
  initDepot,
  initPlatform,
  initQuickBtn,
  handleSearchCustomer,
  addCustomer,
  handleBatchSetDepot,
  handleOrganChange,
  customerModalFormOk,
  batchSetDepotModalFormOk,
  depotModalFormOk,
  onAdded,
  onValueChange,
  onDeleted,
  changeColumnHide,
  changeColumnShow,
  changeFormTypes,
  autoChangePrice,
  scanEnter,
  scanPressEnter,
  stopScan,
  onImport,
  importItemModalFormOk,
  handleOkAndCheck,
  handleOkOnly,
  handleWorkflow,
  handlePrint,
  handlePrintPro,
  handleChangeOtherField,
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

/** 弹窗打开后的初始化 */
function editAfter() {
  billStatus.value = '0'
  currentSelectDepotId.value = ''
  rowCanEdit.value = true
  materialTable.columns[1].type = FormTypes.popupJsh
  changeColumnHide()
  changeFormTypes(materialTable.columns, 'snList', 0)
  changeFormTypes(materialTable.columns, 'batchNumber', 0)
  changeFormTypes(materialTable.columns, 'expirationDate', 0)
  changeFormTypes(materialTable.columns, 'preNumber', 0)
  changeFormTypes(materialTable.columns, 'finishNumber', 0)

  if (action.value === 'add') {
    addInit(prefixNo)
    fileList.value = []
  } else {
    // 编辑/查看
    if (formModel.linkNumber) {
      rowCanEdit.value = false
      materialTable.columns[1].type = FormTypes.normal
    }
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
  initCustomer(0)
  initDepot()
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
  billMain.type = '出库'
  billMain.subType = '其它'
  billMain.totalPrice = totalPrice
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
        // 保存不关闭
      } else {
        handleCancel()
      }
    } else {
      ElMessage.warning(res.data?.message || '保存失败！')
    }
  } catch (e) {
    console.error('[OtherOutModal] handleOk error:', e)
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

/** 搜索关联单据 */
function onSearchLinkNumber() {
  linkBillListRef.value?.show('出库', '销售,采购退货', '1,3')
  if (linkBillListRef.value) {
    linkBillListRef.value.title = '请选择销售出库或采购退货'
  }
}

/** 关联单据选择回调 */
function linkBillListOk(
  selectBillDetailRows: any[],
  linkNumber: string,
  _organId?: any,
  _discountMoney?: number,
  _deposit?: number,
  remark?: string,
) {
  rowCanEdit.value = false
  materialTable.columns[1].type = FormTypes.normal
  changeFormTypes(materialTable.columns, 'preNumber', 1)
  changeFormTypes(materialTable.columns, 'finishNumber', 1)

  if (selectBillDetailRows && selectBillDetailRows.length > 0) {
    const listEx: any[] = []
    for (let j = 0; j < selectBillDetailRows.length; j++) {
      const info = selectBillDetailRows[j]
      if (info.finishNumber > 0) {
        info.operNumber = info.preNumber - info.finishNumber
      }
      info.unitPrice = 0
      info.allPrice = 0
      info.linkId = info.id
      listEx.push(info)
      changeColumnShow(info)
    }
    materialTable.dataSource = listEx

    nextTick(() => {
      formModel.linkNumber = linkNumber
      formModel.remark = remark || ''
    })
  }
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
