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
      <el-button v-if="billPrintFlag && isShowPrintBtn" @click="handlePrintPro('零售退货入库', $refs.modalPrintPro)">
        三联打印-新版
      </el-button>
      <el-button v-if="billPrintFlag && isShowPrintBtn" @click="handlePrint('零售退货入库', $refs.modalPrint)">
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
          <el-form-item label="会员卡号" prop="organId">
            <el-select
              v-model="formModel.organId"
              placeholder="请选择会员卡号"
              filterable
              remote
              :remote-method="handleSearchRetail"
              :disabled="!rowCanEdit"
              style="width: 100%"
            >
              <el-option
                v-for="item in retailList"
                :key="item.id"
                :label="item.supplier"
                :value="item.id"
              />
              <template #footer>
                <div v-if="quickBtn.member" class="dropdown-btn" @click="addMember($refs.memberModalForm)">
                  <el-icon><Plus /></el-icon> 新增会员
                </div>
                <div class="dropdown-btn" @click="initRetail(0)">
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
          <el-form-item label="关联单据" prop="linkNumber">
            <el-input
              v-model="formModel.linkNumber"
              placeholder="请选择关联单据"
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
                placeholder="请扫描商品条码并回车"
                style="width: 260px"
                @keyup.enter="scanPressEnter(scanBarCodeRef)"
              />
              <el-button @click="stopScan">收起扫码</el-button>
            </template>
          </template>
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

      <!-- ==================== 金额区域 ==================== -->
      <el-row :gutter="24">
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="单据金额">
            <el-input
              v-model="formModel.changeAmount"
              readonly
              :style="{ color: 'purple', fontSize: '20px', fontWeight: 'bolder', textAlign: 'center' }"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="付款金额">
            <el-input
              v-model="formModel.getAmount"
              :style="{ color: 'red', fontSize: '20px', fontWeight: 'bolder', textAlign: 'center' }"
              @change="onChangeGetAmount"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="找零">
            <el-input
              v-model="formModel.backAmount"
              readonly
              :style="{ color: 'green', fontSize: '20px', fontWeight: 'bolder', textAlign: 'center' }"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="24">
          <el-form-item label="付款账户" prop="accountId">
            <el-select
              v-model="formModel.accountId"
              placeholder="请选择付款账户"
              clearable
              style="width: 100%; font-size: 20px"
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
                <div class="dropdown-btn" @click="initAccount(0)">
                  <el-icon><Refresh /></el-icon> 刷新
                </div>
              </template>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- ==================== 子弹窗 ==================== -->
    <LinkBillList ref="linkBillListRef" @ok="linkBillListOk" />
    <MemberModal ref="memberModalForm" @ok="memberModalFormOk" />
    <BatchSetDepot ref="batchSetDepotModalForm" @ok="batchSetDepotModalFormOk" />
    <BillPrintIframe ref="modalPrint" />
    <BillPrintProIframe ref="modalPrintPro" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import EditableTable from '@/components/table/EditableTable.vue'
import LinkBillList from './LinkBillList.vue'
import MemberModal from '@/views/system/components/MemberModal.vue'
import BatchSetDepot from './BatchSetDepot.vue'
import BillPrintIframe from './BillPrintIframe.vue'
import BillPrintProIframe from './BillPrintProIframe.vue'
import { useBillModal, FormTypes } from '@/composables/useBillModal'
import { postAction, getAction } from '@/api/http'
import { getMpListShort } from '@/utils/index'
import { getStore } from '@/utils/storage'

defineOptions({ name: 'RetailBackModal' })

// ==================== 组件 Ref ====================
const formRef = ref()
const materialDataTableRef = ref()
const linkBillListRef = ref()
const scanBarCodeRef = ref()

// ==================== 常量 ====================
const prefixNo = 'LSTH'

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
  accountId: undefined,
  changeAmount: 0,
  getAmount: 0,
  backAmount: 0,
  fileName: '',
  status: '0',
})

// ==================== 表单验证 ====================
const formRules = {
  operTime: [{ required: true, message: '请输入单据日期！', trigger: 'change' }],
  number: [{ required: true, message: '请输入单据编号!', trigger: 'blur' }],
  accountId: [{ required: true, message: '请选择结算账户！', trigger: 'change' }],
}

// ==================== 明细子表列定义 ====================
const materialTable = reactive({
  loading: false,
  dataSource: [] as any[],
  columns: [
    {
      title: '仓库名称', key: 'depotId', width: '10%', type: 'select' as const,
      placeholder: '请选择仓库', options: [] as any[],
      allowSearch: true, validateRules: [{ required: true, message: '仓库不能为空' }],
    },
    {
      title: '条码', key: 'barCode', width: '16%', type: FormTypes.popupJsh,
      kind: 'material', multi: true,
      validateRules: [{ required: true, message: '条码不能为空' }],
    },
    { title: '名称', key: 'name', width: '12%', type: FormTypes.normal },
    { title: '规格', key: 'standard', width: '10%', type: FormTypes.normal },
    { title: '型号', key: 'model', width: '10%', type: FormTypes.normal },
    { title: '颜色', key: 'color', width: '5%', type: FormTypes.normal },
    { title: '品牌', key: 'brand', width: '6%', type: FormTypes.normal },
    { title: '制造商', key: 'mfrs', width: '6%', type: FormTypes.normal },
    { title: '扩展1', key: 'otherField1', width: '4%', type: FormTypes.normal },
    { title: '扩展2', key: 'otherField2', width: '4%', type: FormTypes.normal },
    { title: '扩展3', key: 'otherField3', width: '4%', type: FormTypes.normal },
    { title: '库存', key: 'stock', width: '5%', type: FormTypes.normal },
    { title: '单位', key: 'unit', width: '5%', type: FormTypes.normal },
    { title: '序列号', key: 'snList', width: '12%', type: FormTypes.popupJsh, kind: 'snAdd', multi: true },
    { title: '批号', key: 'batchNumber', width: '8%', type: 'input' as const },
    { title: '有效期', key: 'expirationDate', width: '9%', type: 'input' as const },
    { title: '多属性', key: 'sku', width: '9%', type: FormTypes.normal },
    { title: '原数量', key: 'preNumber', width: '6%', type: FormTypes.normal },
    { title: '已退货', key: 'finishNumber', width: '6%', type: FormTypes.normal },
    {
      title: '数量', key: 'operNumber', width: '6%', type: 'inputNumber' as const,
      statistics: true, validateRules: [{ required: true, message: '数量不能为空' }],
    },
    { title: '单价', key: 'unitPrice', width: '6%', type: 'inputNumber' as const },
    { title: '金额', key: 'allPrice', width: '6%', type: 'inputNumber' as const, statistics: true },
    { title: '备注', key: 'remark', width: '7%', type: 'input' as const },
    { title: '关联id', key: 'linkId', width: '5%', type: FormTypes.hidden },
  ],
})

// ==================== useBillModal ====================
const {
  // 状态
  action,
  retailList,
  currentSelectDepotId,
  transferParam,
  defaultDepotId,
  accountList,
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
  initRetail,
  initDepot,
  initPlatform,
  initQuickBtn,
  // 搜索
  handleSearchRetail,
  // 快捷新增
  addMember,
  addAccount,
  handleBatchSetDepot,
  // 快捷新增回调
  memberModalFormOk,
  batchSetDepotModalFormOk,
  depotModalFormOk,
  accountModalFormOk,
  // 明细表事件
  onAdded,
  onValueChange,
  onDeleted,
  // 列控制
  changeColumnHide,
  changeColumnShow,
  changeFormTypes,
  // 扫码
  scanEnter,
  scanPressEnter,
  stopScan,
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
}

// ==================== 页面方法 ====================

/** 自定义初始化结算账户（零售退货的特有逻辑） */
function initAccountLocal(isChecked?: number | boolean) {
  getAction('/account/getAccount', {}).then((res: any) => {
    if (res && res.code === 200) {
      accountList.value = res.data.accountList
      if (isChecked && accountList.value.length > 0) {
        formModel.accountId = accountList.value[0].id
      }
    }
  })
}

/** 自动改变价格（零售退货覆盖：只设置 changeAmount/getAmount/backAmount） */
function autoChangePriceLocal(target: any) {
  const allLastMoney = target.statisticsColumns?.allPrice || 0
  nextTick(() => {
    formModel.changeAmount = allLastMoney
    formModel.getAmount = allLastMoney
    formModel.backAmount = 0
  })
}

/** 改变付款金额 */
function onChangeGetAmount() {
  const value = Number(formModel.getAmount) || 0
  const changeAmount = Number(formModel.changeAmount) || 0
  const backAmount = parseFloat((value - changeAmount).toFixed(2))
  formModel.backAmount = backAmount
}

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
    nextTick(() => {
      formModel.getAmount = 0
      formModel.backAmount = 0
      // 处理转单参数
      if (transferParam.value && transferParam.value.number) {
        const tp = transferParam.value
        linkBillListOk(tp.list, tp.number, tp.organId, tp.discountMoney, tp.deposit, tp.remark)
      }
    })
  } else {
    // 编辑/查看
    if (formModel.linkNumber) {
      rowCanEdit.value = false
      materialTable.columns[1].type = FormTypes.normal
    }
    formModel.operTime = formModel.operTimeStr || formModel.operTime
    if (formModel.backAmount) {
      formModel.getAmount = parseFloat((formModel.changeAmount + formModel.backAmount).toFixed(2))
    } else {
      formModel.getAmount = formModel.changeAmount
    }
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
  initRetail(0)
  initDepot()
  initAccountLocal(0)
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

  // 整理提交数据（零售退货：type=入库, subType=零售退货, 金额取反）
  const billMain: Record<string, any> = { ...formModel }
  let totalPrice = 0
  for (const item of detailArr) {
    totalPrice += (item.allPrice || 0) - 0
  }
  billMain.type = '入库'
  billMain.subType = '零售退货'
  billMain.totalPrice = 0 - totalPrice
  billMain.changeAmount = 0 - billMain.changeAmount
  if (fileList.value && fileList.value.length > 0) {
    billMain.fileName = fileList.value
  } else {
    billMain.fileName = ''
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
    console.error('[RetailBackModal] handleOk error:', e)
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
  rowCanEdit.value = true
  emit('close')
}

/** 搜索关联单据（关联零售出库单） */
function onSearchLinkNumber() {
  linkBillListRef.value?.show('出库', '零售', '会员', '1')
  if (linkBillListRef.value) {
    linkBillListRef.value.title = '请选择零售出库'
  }
}

/** 关联单据选择回调 */
function linkBillListOk(
  selectBillDetailRows: any[],
  linkNumber: string,
  organId: any,
  discountMoney?: number,
  deposit?: number,
  remark?: string,
) {
  rowCanEdit.value = false
  materialTable.columns[1].type = FormTypes.normal
  changeFormTypes(materialTable.columns, 'preNumber', 1)
  changeFormTypes(materialTable.columns, 'finishNumber', 1)

  if (selectBillDetailRows && selectBillDetailRows.length > 0) {
    const listEx: any[] = []
    let allTaxLastMoney = 0

    for (let j = 0; j < selectBillDetailRows.length; j++) {
      const info = selectBillDetailRows[j]
      info.linkId = info.id
      allTaxLastMoney += info.allPrice
      if (info.operNumber > 0) {
        listEx.push(info)
        changeColumnShow(info)
      }
    }

    materialTable.dataSource = listEx

    // 给优惠后金额重新赋值
    allTaxLastMoney = allTaxLastMoney || 0
    const discountLastMoney = parseFloat(allTaxLastMoney.toFixed(2))

    nextTick(() => {
      formModel.organId = organId
      formModel.linkNumber = linkNumber
      formModel.getAmount = discountLastMoney
      formModel.changeAmount = discountLastMoney
      formModel.backAmount = 0
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
