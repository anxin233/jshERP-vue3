/**
 * useBillList - 单据列表页通用 Composable
 * 替代 Vue 2 BillListMixin
 *
 * 基于 useList 扩展，增加单据特有的逻辑：
 * - 单据审核 / 反审核
 * - 单据展开明细行
 * - 供应商 / 客户 / 散户搜索
 * - 系统配置（以销定购、出入库管理、多级审核）
 * - 单据转换（转入库、转出库、以销定购）
 * - 待办计数
 * - 列设置（按 prefixNo 存储）
 * - 日期范围默认 3 个月
 * - 快捷按钮权限
 * - 单据导出
 *
 * 使用方式：
 * ```ts
 * const {
 *   loading, dataSource, columns, selectedRowKeys,
 *   checkFlag, supList, cusList, expandedRowKeys,
 *   loadData, myHandleAdd, myHandleEdit, myHandleDelete,
 *   onExpand, transferBill, ...
 * } = useBillList({
 *   url: { list: '/depotHead/list', delete: '/depotHead/delete', ... },
 *   prefixNo: 'CGRK',
 *   defColumns: [...],
 *   defDataIndex: [...],
 *   modalFormRef,
 *   modalDetailRef,
 * })
 * ```
 */
import { ref, reactive, computed, onMounted, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAction, postAction } from '@/api/http'
import { getStore, setStore, clearStore } from '@/utils/storage'
import { getCheckFlag, getMpListShort } from '@/utils/index'
import { getPrevMonthFormatDate } from '@/utils/date'
import { useList, type ListColumn, type UseListOptions, type ListUrl } from '@/composables/useList'
import {
  findBillDetailByNumber,
} from '@/api/bill'
import {
  findBySelectSup,
  findBySelectCus,
  findBySelectRetail,
  getPersonByNumType,
  getUserList,
  getAccount,
  getCurrentSystemConfig,
  getPlatformConfigByKey,
} from '@/api/system'
import { waitBillCount } from '@/api/common'
import dayjs from 'dayjs'

// ==================== 类型定义 ====================

/** 单据 URL 配置（扩展基础 ListUrl） */
export interface BillListUrl extends ListUrl {
  /** 强制结单（批量） */
  forceCloseBatch?: string
  /** 强制结单-以销定购（批量） */
  forceClosePurchaseBatch?: string
}

/** useBillList 配置选项 */
export interface UseBillListOptions extends Omit<UseListOptions, 'url'> {
  /** API URL 配置 */
  url: BillListUrl
  /** 单据前缀编号，如 CGRK / CGTH / XSCK 等 */
  prefixNo: string
  /** 单据模型名称（用于导出） */
  model?: string
  /** 弹窗表单组件的 ref */
  modalFormRef?: Ref<any>
  /** 弹窗详情组件的 ref */
  modalDetailRef?: Ref<any>
  /** 转单弹窗组件的 ref */
  transferModalFormRef?: Ref<any>
  /** 转单-以销定购弹窗组件的 ref */
  transferPurchaseModalFormRef?: Ref<any>
  /** 单据导出 iframe 组件的 ref */
  billExcelIframeRef?: Ref<any>
}

/** 快捷按钮结构 */
interface QuickBtn {
  retailBack: string
  purchaseOrder: string
  purchaseIn: string
  purchaseBack: string
  saleOut: string
  saleBack: string
}

// ==================== 明细列定义 ====================

/** 零售出库明细列 */
const retailOutColumns: ListColumn[] = [
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '序列号', dataIndex: 'snList', width: 300 },
  { title: '批号', dataIndex: 'batchNumber' },
  { title: '有效期', dataIndex: 'expirationDate' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '重量', dataIndex: 'weight' },
  { title: '仓位货架', dataIndex: 'position' },
  { title: '备注', dataIndex: 'remark' },
]

/** 零售退货明细列 */
const retailBackColumns: ListColumn[] = [...retailOutColumns]

/** 请购单明细列 */
const purchaseApplyColumns: ListColumn[] = [
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '单位', dataIndex: 'unit' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '已采购', dataIndex: 'finishNumber' },
  { title: '备注', dataIndex: 'remark' },
]

/** 采购订单明细列 */
const purchaseOrderColumns: ListColumn[] = [
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '已采购', dataIndex: 'finishNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '税率(%)', dataIndex: 'taxRate' },
  { title: '税额', dataIndex: 'taxMoney' },
  { title: '价税合计', dataIndex: 'taxLastMoney' },
  { title: '备注', dataIndex: 'remark' },
]

/** 采购入库明细列 */
const purchaseInColumns: ListColumn[] = [
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '序列号', dataIndex: 'snList', width: 300 },
  { title: '批号', dataIndex: 'batchNumber' },
  { title: '有效期', dataIndex: 'expirationDate' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '已入库', dataIndex: 'finishNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '税率(%)', dataIndex: 'taxRate' },
  { title: '税额', dataIndex: 'taxMoney' },
  { title: '价税合计', dataIndex: 'taxLastMoney' },
  { title: '重量', dataIndex: 'weight' },
  { title: '仓位货架', dataIndex: 'position' },
  { title: '备注', dataIndex: 'remark' },
]

/** 采购退货明细列 */
const purchaseBackColumns: ListColumn[] = [
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '序列号', dataIndex: 'snList', width: 300 },
  { title: '批号', dataIndex: 'batchNumber' },
  { title: '有效期', dataIndex: 'expirationDate' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '已出库', dataIndex: 'finishNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '税率(%)', dataIndex: 'taxRate' },
  { title: '税额', dataIndex: 'taxMoney' },
  { title: '价税合计', dataIndex: 'taxLastMoney' },
  { title: '重量', dataIndex: 'weight' },
  { title: '仓位货架', dataIndex: 'position' },
  { title: '备注', dataIndex: 'remark' },
]

/** 销售订单明细列 */
const saleOrderColumns: ListColumn[] = [
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '已销售', dataIndex: 'finishNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '税率(%)', dataIndex: 'taxRate' },
  { title: '税额', dataIndex: 'taxMoney' },
  { title: '价税合计', dataIndex: 'taxLastMoney' },
  { title: '备注', dataIndex: 'remark' },
]

/** 销售出库明细列 */
const saleOutColumns: ListColumn[] = [
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '序列号', dataIndex: 'snList', width: 300 },
  { title: '批号', dataIndex: 'batchNumber' },
  { title: '有效期', dataIndex: 'expirationDate' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '已出库', dataIndex: 'finishNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '税率(%)', dataIndex: 'taxRate' },
  { title: '税额', dataIndex: 'taxMoney' },
  { title: '价税合计', dataIndex: 'taxLastMoney' },
  { title: '重量', dataIndex: 'weight' },
  { title: '仓位货架', dataIndex: 'position' },
  { title: '备注', dataIndex: 'remark' },
]

/** 销售退货明细列 */
const saleBackColumns: ListColumn[] = [
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '序列号', dataIndex: 'snList', width: 300 },
  { title: '批号', dataIndex: 'batchNumber' },
  { title: '有效期', dataIndex: 'expirationDate' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '已入库', dataIndex: 'finishNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '税率(%)', dataIndex: 'taxRate' },
  { title: '税额', dataIndex: 'taxMoney' },
  { title: '价税合计', dataIndex: 'taxLastMoney' },
  { title: '重量', dataIndex: 'weight' },
  { title: '仓位货架', dataIndex: 'position' },
  { title: '备注', dataIndex: 'remark' },
]

/** 其他入库明细列 */
const otherInColumns: ListColumn[] = [
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '序列号', dataIndex: 'snList', width: 300 },
  { title: '批号', dataIndex: 'batchNumber' },
  { title: '有效期', dataIndex: 'expirationDate' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '重量', dataIndex: 'weight' },
  { title: '仓位货架', dataIndex: 'position' },
  { title: '备注', dataIndex: 'remark' },
]

/** 其他出库明细列 */
const otherOutColumns: ListColumn[] = [...otherInColumns]

/** 调拨出库明细列 */
const allocationOutColumns: ListColumn[] = [
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '调入仓库', dataIndex: 'anotherDepotName' },
  { title: '单位', dataIndex: 'unit' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '重量', dataIndex: 'weight' },
  { title: '仓位货架', dataIndex: 'position' },
  { title: '备注', dataIndex: 'remark' },
]

/** 组装单明细列 */
const assembleColumns: ListColumn[] = [
  { title: '商品类型', dataIndex: 'mType' },
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '颜色', dataIndex: 'color' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '备注', dataIndex: 'remark' },
]

/** 拆卸单明细列 */
const disassembleColumns: ListColumn[] = [...assembleColumns]

/** 盘点复盘明细列 */
const stockCheckReplayColumns: ListColumn[] = [
  { title: '仓库名称', dataIndex: 'depotName' },
  { title: '条码', dataIndex: 'barCode' },
  { title: '名称', dataIndex: 'name' },
  { title: '规格', dataIndex: 'standard' },
  { title: '型号', dataIndex: 'model' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '制造商', dataIndex: 'mfrs' },
  { title: '扩展1', dataIndex: 'otherField1' },
  { title: '扩展2', dataIndex: 'otherField2' },
  { title: '扩展3', dataIndex: 'otherField3' },
  { title: '库存', dataIndex: 'stock' },
  { title: '单位', dataIndex: 'unit' },
  { title: '多属性', dataIndex: 'sku' },
  { title: '数量', dataIndex: 'operNumber' },
  { title: '单价', dataIndex: 'unitPrice' },
  { title: '金额', dataIndex: 'allPrice' },
  { title: '备注', dataIndex: 'remark' },
]

/** prefixNo -> 明细列映射 */
const detailColumnsMap: Record<string, ListColumn[]> = {
  LSCK: retailOutColumns,
  LSTH: retailBackColumns,
  QGD: purchaseApplyColumns,
  CGDD: purchaseOrderColumns,
  CGRK: purchaseInColumns,
  CGTH: purchaseBackColumns,
  XSDD: saleOrderColumns,
  XSCK: saleOutColumns,
  XSTH: saleBackColumns,
  QTRK: otherInColumns,
  QTCK: otherOutColumns,
  DBCK: allocationOutColumns,
  ZZD: assembleColumns,
  CXD: disassembleColumns,
  PDFP: stockCheckReplayColumns,
}

// ==================== Composable ====================

export function useBillList(options: UseBillListOptions) {
  const {
    prefixNo,
    model,
    modalFormRef,
    modalDetailRef,
    transferModalFormRef,
    transferPurchaseModalFormRef,
    billExcelIframeRef,
  } = options

  // ---- 基础列表功能（来自 useList） ----
  const listState = useList({
    ...options,
    // 使用 prefixNo 作为列设置存储的 key
    pageName: options.pageName || prefixNo,
    // 禁用 useList 内部的自动加载，由 useBillList 自行控制
    disableCreatedLoad: true,
    // 设置日期默认查询范围
    queryParam: {
      beginTime: getPrevMonthFormatDate(3),
      endTime: dayjs().format('YYYY-MM-DD'),
      ...(options.queryParam || {}),
    },
  })

  // 从 useList 中解构需要用到的内部方法和状态
  const {
    loading,
    dataSource,
    queryParam,
    columns,
    settingDataIndex,
    ipagination,
    selectedRowKeys,
    selectionRows,
    btnEnableList,
    getQueryParams,
    onClearSelected,
    handleDelete: baseHandleDelete,
    initActiveBtnStr,
    tableAddTotalRow,
  } = listState

  // ==================== 单据特有状态 ====================

  /** 原始审核是否开启 */
  const checkFlag = ref(true)
  /** 单据 Excel 是否开启 */
  const isShowExcel = ref(false)
  /** 以销定购的场景开关 */
  const purchaseBySaleFlag = ref(false)
  /** 出入库管理开关 */
  const inOutManageFlag = ref(false)
  /** 防抖定时器 */
  let setTimeFlag: ReturnType<typeof setTimeout> | null = null
  /** 待办数量 */
  const waitTotal = ref(0)
  /** 日期格式 */
  const dateFormat = ref('YYYY-MM-DD')
  /** 单据 Excel 导出地址 */
  const billExcelUrl = ref('')
  /** 默认仓库 ID */
  const defaultDepotId = ref('')

  // 下拉数据源
  const supList = ref<any[]>([])
  const cusList = ref<any[]>([])
  const retailList = ref<any[]>([])
  const salesManList = ref<any[]>([])
  const userList = ref<any[]>([])
  const accountList = ref<any[]>([])
  const depotList = ref<any[]>([])

  /** 展开行的 key 集合 */
  const expandedRowKeys = ref<(string | number)[]>([])
  /** 明细表头（动态计算后） */
  const detailColumns = ref<ListColumn[]>([])
  /** 明细列定义（根据 prefixNo 确定） */
  const defDetailColumns = ref<ListColumn[]>([])

  /** 日期范围（dayjs 对象数组，用于日期选择器 v-model） */
  const createTimeRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs(getPrevMonthFormatDate(3)),
    dayjs(),
  ])

  /** 快捷按钮权限 */
  const quickBtn = reactive<QuickBtn>({
    retailBack: '',
    purchaseOrder: '',
    purchaseIn: '',
    purchaseBack: '',
    saleOut: '',
    saleBack: '',
  })

  // ==================== 计算属性 ====================

  /** 导入 Excel 的完整 URL */
  const importExcelUrl = computed(() => {
    if (options.url.importExcelUrl) {
      const baseUrl = (window as any)._CONFIG?.domianURL || ''
      return `${baseUrl}/${options.url.importExcelUrl}`
    }
    return ''
  })

  /** 批量删除是否可用（所有选中行必须允许删除） */
  const isBatchDelEnabled = computed(() => {
    for (let i = 0; i < selectedRowKeys.value.length; i++) {
      if (selectionRows.value[i] && !selectionRows.value[i].actionsEnabled?.delete) {
        return false
      }
    }
    return true
  })

  // ==================== 核心方法（覆盖/扩展 useList） ====================

  /**
   * 加载数据（覆盖 useList.loadData）
   * 增加了展开行状态重置
   */
  async function loadData(arg?: number) {
    // 重置展开状态
    expandedRowKeys.value = []

    if (arg === 1) {
      ipagination.current = 1
    }
    const params = getQueryParams()
    loading.value = true

    try {
      const res = await getAction(options.url.list, params)
      if (res.code === 200) {
        dataSource.value = res.data.rows || []
        ipagination.total = res.data.total || 0
        tableAddTotalRow(columns.value, dataSource.value)
      } else if (res.code === 510) {
        ElMessage.warning(res.data)
      } else {
        ElMessage.warning(res.data?.message || '数据加载失败')
      }
    } catch (err) {
      console.error('[useBillList] loadData error:', err)
    } finally {
      loading.value = false
      onClearSelected()
    }
  }

  /**
   * 重置搜索（覆盖 useList.searchReset）
   * 保留 type/subType，重置日期范围为默认 3 个月
   */
  function searchReset() {
    const preservedType = queryParam.type
    const preservedSubType = queryParam.subType
    // 清空所有查询条件
    Object.keys(queryParam).forEach((key) => {
      queryParam[key] = undefined
    })
    // 恢复保留的字段和日期范围
    queryParam.type = preservedType
    queryParam.subType = preservedSubType
    queryParam.beginTime = getPrevMonthFormatDate(3)
    queryParam.endTime = dayjs().format('YYYY-MM-DD')
    createTimeRange.value = [dayjs(getPrevMonthFormatDate(3)), dayjs()]
    loadData(1)
  }

  /**
   * 初始化列设置（覆盖 useList.initColumnsSetting）
   * 增加以销定购逻辑：关闭时采购订单不显示关联订单列
   */
  function initColumnsSetting() {
    if (!options.defColumns) return

    const columnsStr = getStore(prefixNo) as string | null
    if (columnsStr && columnsStr.indexOf(',') > -1) {
      settingDataIndex.value = columnsStr.split(',')
    } else {
      settingDataIndex.value = options.defDataIndex || options.defColumns.map((c) => c.dataIndex)
    }
    columns.value = options.defColumns.filter((item) => {
      if (purchaseBySaleFlag.value) {
        // 以销定购-开启：显示所有配置的列
        return settingDataIndex.value.includes(item.dataIndex)
      } else {
        // 以销定购-关闭
        if (prefixNo === 'CGDD') {
          // 采购订单：不显示关联订单列
          if (item.dataIndex !== 'linkNumber') {
            return settingDataIndex.value.includes(item.dataIndex)
          }
          return false
        } else {
          return settingDataIndex.value.includes(item.dataIndex)
        }
      }
    })
  }

  /**
   * 列设置变更（覆盖 useList.onColChange）
   * 使用 prefixNo 作为存储 key
   */
  function onColChange(checkedValues: string[]) {
    if (!options.defColumns) return
    columns.value = options.defColumns.filter((item) =>
      checkedValues.includes(item.dataIndex),
    )
    setStore(prefixNo, checkedValues.join(','))
  }

  /**
   * 恢复默认列设置（覆盖 useList.handleRestDefault）
   * 使用 prefixNo 作为存储 key
   */
  function handleRestDefault() {
    clearStore(prefixNo)
    initColumnsSetting()
  }

  // ==================== 单据特有方法 ====================

  /**
   * 新增单据
   */
  function myHandleAdd() {
    const modalForm = modalFormRef?.value
    if (!modalForm) return
    modalForm.action = 'add'
    if (btnEnableList.value.indexOf(2) === -1) {
      modalForm.isCanCheck = false
    }
    // 调用基础 handleAdd 逻辑
    modalForm.add()
    modalForm.title = '新增'
    modalForm.disableSubmit = false
  }

  /**
   * 复制新增单据
   */
  function myHandleCopyAdd(record: any) {
    const modalForm = modalFormRef?.value
    if (!modalForm) return
    modalForm.action = 'copyAdd'
    if (btnEnableList.value.indexOf(2) === -1) {
      modalForm.isCanCheck = false
    }
    // 复制单据时移除关联单据的相关信息
    record.linkNumber = ''
    record.billType = ''
    record.deposit = ''
    modalForm.edit(record)
    modalForm.title = '复制新增'
    modalForm.disableSubmit = false
    // 开启明细的编辑模式
    modalForm.rowCanEdit = true
    const columnIndex = record.subType === '组装单' || record.subType === '拆卸单' ? 2 : 1
    if (modalForm.materialTable?.columns?.[columnIndex]) {
      modalForm.materialTable.columns[columnIndex].type = 'popupJsh'
    }
  }

  /**
   * 编辑单据（仅未审核的可编辑）
   */
  async function myHandleEdit(record: any) {
    if (record.status === '0') {
      const modalForm = modalFormRef?.value
      if (!modalForm) return
      modalForm.action = 'edit'
      if (btnEnableList.value.indexOf(2) === -1) {
        modalForm.isCanCheck = false
      }
      // 查询单条单据完整信息
      try {
        const res = await findBillDetailByNumber({ number: record.number })
        if (res && res.code === 200) {
          const item = res.data
          modalForm.edit(item)
          modalForm.title = '编辑'
          modalForm.disableSubmit = false
        }
      } catch (err) {
        console.error('[useBillList] myHandleEdit error:', err)
      }
    } else {
      ElMessage.warning('抱歉，只有未审核的单据才能编辑，请先进行反审核！')
    }
  }

  /**
   * 删除单据（仅未审核的可删除）
   */
  function myHandleDelete(record: any) {
    if (record.status === '0') {
      baseHandleDelete(record.id)
    } else {
      ElMessage.warning('抱歉，只有未审核的单据才能删除，请先进行反审核！')
    }
  }

  /**
   * 查看单据详情
   */
  function myHandleDetail(record: any, type: string, billPrefixNo: string) {
    const modalDetail = modalDetailRef?.value
    if (!modalDetail) return
    if (btnEnableList.value.indexOf(7) === -1) {
      modalDetail.isCanBackCheck = false
    }
    modalDetail.show(record, type, billPrefixNo)
    modalDetail.title = type + '-详情'
  }

  /**
   * 批量强制结单
   */
  function batchForceClose() {
    if (!options.url.forceCloseBatch) {
      ElMessage.error('请设置 url.forceCloseBatch 属性!')
      return
    }
    if (selectedRowKeys.value.length <= 0) {
      ElMessage.warning('请选择一条记录！')
      return
    }

    const ids = selectedRowKeys.value.join(',')

    ElMessageBox.confirm('是否强制结单选中数据?', '确认强制结单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        loading.value = true
        try {
          const res = await postAction(options.url.forceCloseBatch!, { ids })
          if (res.code === 200) {
            loadData()
          } else {
            ElMessage.warning(res.data?.message || '操作失败')
          }
        } finally {
          loading.value = false
        }
      })
      .catch(() => {
        // 取消
      })
  }

  /**
   * 批量强制结单（以销定购）
   */
  function batchForceClosePurchase() {
    if (!options.url.forceClosePurchaseBatch) {
      ElMessage.error('请设置 url.forceClosePurchaseBatch 属性!')
      return
    }
    if (selectedRowKeys.value.length <= 0) {
      ElMessage.warning('请选择一条记录！')
      return
    }

    const ids = selectedRowKeys.value.join(',')

    ElMessageBox.confirm('是否强制结单选中数据?', '确认强制结单(以销定购)', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        loading.value = true
        try {
          const res = await postAction(options.url.forceClosePurchaseBatch!, { ids })
          if (res.code === 200) {
            loadData()
          } else {
            ElMessage.warning(res.data?.message || '操作失败')
          }
        } finally {
          loading.value = false
        }
      })
      .catch(() => {
        // 取消
      })
  }

  /**
   * 审核单据
   */
  function handleApprove(record: any) {
    const modalForm = modalFormRef?.value
    if (!modalForm) return
    modalForm.action = 'approve'
    modalForm.edit(record)
    modalForm.title = '审核'
  }

  /**
   * 日期范围变化事件
   */
  function onDateChange(_value: any, dateString: [string, string]) {
    queryParam.beginTime = dateString[0]
    queryParam.endTime = dateString[1]
    if (dateString[0] && dateString[1]) {
      createTimeRange.value = [dayjs(dateString[0]), dayjs(dateString[1])]
    }
  }

  /**
   * 日期确认事件
   */
  function onDateOk(value: any) {
    console.log(value)
  }

  /**
   * 初始化系统配置（审核标志、以销定购、出入库管理、单据Excel地址）
   */
  async function initSystemConfig() {
    try {
      const res = await getCurrentSystemConfig()
      if (res.code === 200 && res.data) {
        const multiBillType = res.data.multiBillType
        const multiLevelApprovalFlag = res.data.multiLevelApprovalFlag
        checkFlag.value = getCheckFlag(multiBillType, multiLevelApprovalFlag, prefixNo)
        purchaseBySaleFlag.value = res.data.purchaseBySaleFlag === '1'
        inOutManageFlag.value = res.data.inOutManageFlag === '1'
      }
    } catch (err) {
      console.error('[useBillList] initSystemConfig error:', err)
    }

    try {
      const res = await getPlatformConfigByKey({ platformKey: 'bill_excel_url' })
      if (res && res.code === 200) {
        if (res.data.platformValue) {
          billExcelUrl.value = res.data.platformValue
        }
      }
    } catch (err) {
      console.error('[useBillList] getPlatformConfigByKey error:', err)
    }
  }

  /**
   * 初始化供应商列表
   */
  async function initSupplier() {
    try {
      const res = await findBySelectSup({ limit: 1 })
      if (res) {
        supList.value = res
      }
    } catch (err) {
      console.error('[useBillList] initSupplier error:', err)
    }
  }

  /**
   * 初始化客户列表
   */
  async function initCustomer() {
    try {
      const res = await findBySelectCus({ limit: 1 })
      if (res) {
        cusList.value = res
      }
    } catch (err) {
      console.error('[useBillList] initCustomer error:', err)
    }
  }

  /**
   * 初始化散户列表
   */
  async function initRetail() {
    try {
      const res = await findBySelectRetail({ limit: 1 })
      if (res) {
        retailList.value = res
      }
    } catch (err) {
      console.error('[useBillList] initRetail error:', err)
    }
  }

  /**
   * 初始化销售人员列表
   */
  async function initSalesman() {
    try {
      const res = await getPersonByNumType({ type: 1 })
      if (res) {
        salesManList.value = res
      }
    } catch (err) {
      console.error('[useBillList] initSalesman error:', err)
    }
  }

  /**
   * 获取仓库列表
   */
  async function getDepotData() {
    try {
      const res = await getAction('/depot/findDepotByCurrentUser')
      if (res.code === 200) {
        depotList.value = res.data
      } else {
        ElMessage.info(res.data)
      }
    } catch (err) {
      console.error('[useBillList] getDepotData error:', err)
    }
  }

  /**
   * 初始化用户列表
   */
  async function initUser() {
    try {
      const res = await getUserList({})
      if (res) {
        userList.value = res
      }
    } catch (err) {
      console.error('[useBillList] initUser error:', err)
    }
  }

  /**
   * 初始化账户列表
   */
  async function initAccount() {
    try {
      const res = await getAccount({})
      if (res && res.code === 200) {
        accountList.value = res.data.accountList
      }
    } catch (err) {
      console.error('[useBillList] initAccount error:', err)
    }
  }

  /**
   * 初始化待办单据计数
   */
  async function initWaitBillCount(type: string, subType: string, status: string) {
    try {
      const res = await waitBillCount({
        search: { type, subType, status },
      })
      if (res && res.code === 200) {
        waitTotal.value = res.data.total
      }
    } catch (err) {
      console.error('[useBillList] initWaitBillCount error:', err)
    }
  }

  /**
   * 加载快捷按钮权限（转入库、转出库等）
   */
  function initQuickBtn() {
    const btnStrList = getStore('winBtnStrList') as any[] | null
    if (btnStrList) {
      for (let i = 0; i < btnStrList.length; i++) {
        if (btnStrList[i].btnStr) {
          if (btnStrList[i].url === '/bill/retail_back') quickBtn.retailBack = btnStrList[i].btnStr
          if (btnStrList[i].url === '/bill/purchase_order') quickBtn.purchaseOrder = btnStrList[i].btnStr
          if (btnStrList[i].url === '/bill/purchase_in') quickBtn.purchaseIn = btnStrList[i].btnStr
          if (btnStrList[i].url === '/bill/purchase_back') quickBtn.purchaseBack = btnStrList[i].btnStr
          if (btnStrList[i].url === '/bill/sale_out') quickBtn.saleOut = btnStrList[i].btnStr
          if (btnStrList[i].url === '/bill/sale_back') quickBtn.saleBack = btnStrList[i].btnStr
        }
      }
    }
  }

  /**
   * 搜索供应商（防抖）
   */
  function handleSearchSupplier(value: string) {
    if (setTimeFlag != null) {
      clearTimeout(setTimeFlag)
    }
    setTimeFlag = setTimeout(async () => {
      try {
        const res = await findBySelectSup({ key: value, limit: 1 })
        if (res) {
          supList.value = res
        }
      } catch (err) {
        console.error('[useBillList] handleSearchSupplier error:', err)
      }
    }, 500)
  }

  /**
   * 搜索客户（防抖）
   */
  function handleSearchCustomer(value: string) {
    if (setTimeFlag != null) {
      clearTimeout(setTimeFlag)
    }
    setTimeFlag = setTimeout(async () => {
      try {
        const res = await findBySelectCus({ key: value, limit: 1 })
        if (res) {
          cusList.value = res
        }
      } catch (err) {
        console.error('[useBillList] handleSearchCustomer error:', err)
      }
    }, 500)
  }

  /**
   * 搜索散户（防抖）
   */
  function handleSearchRetail(value: string) {
    if (setTimeFlag != null) {
      clearTimeout(setTimeFlag)
    }
    setTimeFlag = setTimeout(async () => {
      try {
        const res = await findBySelectRetail({ key: value, limit: 1 })
        if (res) {
          retailList.value = res
        }
      } catch (err) {
        console.error('[useBillList] handleSearchRetail error:', err)
      }
    }, 500)
  }

  /**
   * 获取当前用户的默认仓库
   */
  async function getDepotByCurrentUser() {
    try {
      const res = await getAction('/depot/findDepotByCurrentUser')
      if (res.code === 200) {
        if (res.data.length === 1) {
          defaultDepotId.value = res.data[0].id + ''
        } else {
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].isDefault) {
              defaultDepotId.value = res.data[i].id + ''
            }
          }
        }
      }
    } catch (err) {
      console.error('[useBillList] getDepotByCurrentUser error:', err)
    }
  }

  /**
   * 跳转到下一个单据页面（转入库、转出库、以销定购等）
   */
  async function transferBill(type: string, quickBtnStr: string) {
    if (selectedRowKeys.value.length <= 0) {
      ElMessage.warning('请选择一条记录！')
      return
    }
    if (selectedRowKeys.value.length > 1) {
      ElMessage.warning('只能选择一条记录！')
      return
    }

    const info = selectionRows.value[0]
    if (info.status !== '1' && info.status !== '3') {
      ElMessage.warning('该状态不能' + type + '！')
      return
    }

    const linkType = type === '转采购订单-以销定购' ? 'purchase' : 'basic'
    const param = {
      headerId: info.id,
      mpList: '',
      linkType,
    }

    try {
      const res = await getAction('/depotItem/getDetailList', param)
      if (res.code === 200) {
        const deposit = info.changeAmount - info.finishDeposit
        const transferParam = {
          list: res.data.rows,
          number: info.number,
          organId: info.organId,
          discountMoney: info.discountMoney,
          deposit,
          remark: info.remark,
          accountId: info.accountId,
          salesMan: info.salesMan,
        }
        if (type === '转采购订单-以销定购') {
          const form = transferPurchaseModalFormRef?.value
          if (!form) return
          form.action = 'add'
          form.transferParam = transferParam
          form.defaultDepotId = defaultDepotId.value
          form.add()
          form.title = type
          if (quickBtnStr.indexOf(2) === -1) {
            form.isCanCheck = false
          }
        } else {
          const form = transferModalFormRef?.value
          if (!form) return
          form.action = 'add'
          form.transferParam = transferParam
          form.defaultDepotId = defaultDepotId.value
          form.add()
          form.title = type
          if (quickBtnStr.indexOf(2) === -1) {
            form.isCanCheck = false
          }
        }
      }
    } catch (err) {
      console.error('[useBillList] transferBill error:', err)
    }
  }

  /**
   * 导出单据
   */
  function handleExport() {
    const search = getQueryParams().search
    const iframe = billExcelIframeRef?.value
    if (!iframe) return
    iframe.show(model, billExcelUrl.value + '?search=' + search + '&type=1', 150)
    iframe.title = '确认导出'
  }

  // ==================== 展开/明细相关 ====================

  /**
   * 展开/折叠行
   */
  async function onExpand(expanded: boolean, record: any) {
    if (expanded) {
      expandedRowKeys.value = [...new Set([...expandedRowKeys.value, record.id])]
      let showType = 'basic'
      if (
        record.subType === '采购' ||
        record.subType === '采购退货' ||
        record.subType === '销售' ||
        record.subType === '销售退货'
      ) {
        if (record.status === '3') {
          showType = 'other'
        }
      } else {
        if (record.status === '3') {
          showType = 'basic'
        } else if (record.purchaseStatus === '3') {
          showType = 'purchase'
        }
      }
      const mpList = getStore('materialPropertyList') as any[] | null
      const params = {
        headerId: record.id,
        mpList: mpList ? getMpListShort(mpList) : '',
        linkType: showType,
        isReadOnly: '0',
      }
      const url = '/depotItem/getDetailList'
      await requestSubTableData(record, url, params)
    } else {
      expandedRowKeys.value = expandedRowKeys.value.filter((key) => key !== record.id)
    }
  }

  /**
   * 请求子表数据
   */
  async function requestSubTableData(
    record: any,
    url: string,
    params: any,
    success?: (res: any) => void,
  ) {
    record.loading = true
    try {
      const res = await getAction(url, params)
      if (res && res.code === 200) {
        record.childrens = res.data.rows
        initSetting(record, record.childrens)
        typeof success === 'function' && success(res)
      }
    } catch (err) {
      console.error('[useBillList] requestSubTableData error:', err)
    } finally {
      record.loading = false
    }
  }

  /**
   * 根据 prefixNo 和记录状态初始化明细列设置
   */
  function initSetting(record: any, ds: any[]) {
    // 根据 prefixNo 获取对应的明细列定义
    defDetailColumns.value = detailColumnsMap[prefixNo] || []

    // 动态替换扩展字段标题
    handleChangeDetailOtherField()

    // 判断各可选字段是否有值
    const needAddKeywords: string[] = []
    const checkFields = [
      'snList', 'batchNumber', 'expirationDate', 'sku', 'weight', 'position',
      'brand', 'mfrs', 'otherField1', 'otherField2', 'otherField3', 'taxRate', 'remark',
    ]
    for (let i = 0; i < ds.length; i++) {
      for (const field of checkFields) {
        if (ds[i][field]) {
          needAddKeywords.push(field)
        }
      }
    }

    const currentCol: ListColumn[] = []

    if (record.status === '3') {
      // 部分采购/部分销售时显示全部列
      for (let i = 0; i < defDetailColumns.value.length; i++) {
        currentCol.push({ ...defDetailColumns.value[i] })
      }
      detailColumns.value = currentCol
    } else if (record.purchaseStatus === '3') {
      // 将已出库的标题转为已采购，针对销售订单转采购订单的场景
      for (let i = 0; i < defDetailColumns.value.length; i++) {
        const info: ListColumn = {
          title: defDetailColumns.value[i].title,
          dataIndex: defDetailColumns.value[i].dataIndex,
        }
        if (defDetailColumns.value[i].width) {
          info.width = defDetailColumns.value[i].width
        }
        if (defDetailColumns.value[i].dataIndex === 'finishNumber') {
          info.title = '已采购'
        }
        if (defDetailColumns.value[i].dataIndex === 'barCode') {
          info.customRender = 'customBarCode'
        }
        currentCol.push(info)
      }
      detailColumns.value = currentCol
    } else {
      // 默认状态：动态显示/隐藏列
      const needRemoveKeywords = [
        'finishNumber', 'snList', 'batchNumber', 'expirationDate', 'sku', 'weight', 'position',
        'brand', 'mfrs', 'otherField1', 'otherField2', 'otherField3', 'taxRate', 'remark',
      ]
      for (let i = 0; i < defDetailColumns.value.length; i++) {
        const colDataIndex = defDetailColumns.value[i].dataIndex
        // 移除不需要的列
        if (needRemoveKeywords.indexOf(colDataIndex) === -1) {
          const info: ListColumn = {
            title: defDetailColumns.value[i].title,
            dataIndex: colDataIndex,
          }
          if (defDetailColumns.value[i].width) {
            info.width = defDetailColumns.value[i].width
          }
          if (colDataIndex === 'barCode') {
            info.customRender = 'customBarCode'
          }
          currentCol.push(info)
        }
        // 添加有数据的列
        if (needAddKeywords.indexOf(colDataIndex) > -1) {
          const info: ListColumn = {
            title: defDetailColumns.value[i].title,
            dataIndex: colDataIndex,
          }
          if (defDetailColumns.value[i].width) {
            info.width = defDetailColumns.value[i].width
          }
          currentCol.push(info)
        }
      }
      detailColumns.value = currentCol
    }
  }

  /**
   * 动态替换明细表扩展字段标题
   */
  function handleChangeDetailOtherField() {
    const mpList = getStore('materialPropertyList') as any[] | null
    if (!mpList) return

    const mpStr = getMpListShort(mpList)
    if (!mpStr) return

    const mpArr = mpStr.split(',')
    if (mpArr.length !== 3) return

    for (let i = 0; i < defDetailColumns.value.length; i++) {
      if (defDetailColumns.value[i].dataIndex === 'otherField1') {
        defDetailColumns.value[i].title = mpArr[0]
      }
      if (defDetailColumns.value[i].dataIndex === 'otherField2') {
        defDetailColumns.value[i].title = mpArr[1]
      }
      if (defDetailColumns.value[i].dataIndex === 'otherField3') {
        defDetailColumns.value[i].title = mpArr[2]
      }
    }
  }

  // ==================== 生命周期 ====================

  onMounted(() => {
    // 初始化列设置
    initColumnsSetting()
    // 读取 isShowExcel 配置
    isShowExcel.value = getStore('isShowExcel') || false
    // 加载数据
    loadData()
    // 初始化按钮权限
    initActiveBtnStr()
  })

  // ==================== 返回 ====================

  return {
    // ---- 来自 useList 的基础功能（透传） ----
    ...listState,

    // ---- 覆盖 useList 的方法 ----
    loadData,
    searchReset,
    initColumnsSetting,
    onColChange,
    handleRestDefault,

    // ---- 单据特有状态 ----
    checkFlag,
    isShowExcel,
    purchaseBySaleFlag,
    inOutManageFlag,
    waitTotal,
    dateFormat,
    billExcelUrl,
    defaultDepotId,
    supList,
    cusList,
    retailList,
    salesManList,
    userList,
    accountList,
    depotList,
    expandedRowKeys,
    detailColumns,
    defDetailColumns,
    createTimeRange,
    quickBtn,

    // ---- 单据特有的计算属性 ----
    importExcelUrl,
    isBatchDelEnabled,

    // ---- 单据 CRUD ----
    myHandleAdd,
    myHandleCopyAdd,
    myHandleEdit,
    myHandleDelete,
    myHandleDetail,
    handleApprove,

    // ---- 批量操作 ----
    batchForceClose,
    batchForceClosePurchase,

    // ---- 日期 ----
    onDateChange,
    onDateOk,

    // ---- 初始化方法 ----
    initSystemConfig,
    initSupplier,
    initCustomer,
    initRetail,
    initSalesman,
    getDepotData,
    initUser,
    initAccount,
    initWaitBillCount,
    initQuickBtn,

    // ---- 搜索（防抖） ----
    handleSearchSupplier,
    handleSearchCustomer,
    handleSearchRetail,

    // ---- 仓库 ----
    getDepotByCurrentUser,

    // ---- 转单 ----
    transferBill,

    // ---- 导出 ----
    handleExport,

    // ---- 展开明细 ----
    onExpand,
    requestSubTableData,
    initSetting,
    handleChangeDetailOtherField,
  }
}
