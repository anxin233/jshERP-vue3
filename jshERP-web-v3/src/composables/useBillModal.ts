/**
 * useBillModal - 单据弹窗通用 Composable
 * 替代 Vue 2 BillModalMixin（~1200 行）
 *
 * 提供单据弹窗（新增/编辑）的核心功能：
 * - 表头表单初始化与字段联动
 * - 明细子表的列控制、行事件、价格计算
 * - 供应商/客户/会员/仓库/账户的选择与快捷新增
 * - 扫码录入、导入商品
 * - 多账户结算
 * - 优惠/付款/欠款自动联动
 * - 打印、流程、审核等操作
 * - 附件管理
 *
 * 使用方式：
 * ```ts
 * const {
 *   formModel, readOnly, supList, cusList, materialTable,
 *   addInit, editInit, handleOk, handleSave,
 *   initSupplier, initCustomer, ...
 * } = useBillModal({
 *   prefixNo: 'CGRK',
 *   formModel: reactive({ ... }),
 *   materialTable: reactive({ columns: [...], dataSource: [] }),
 * })
 * ```
 */
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAction, postAction, putAction } from '@/api/http'
import { getStore } from '@/utils/storage'
import { getMpListShort } from '@/utils/index'
import dayjs from 'dayjs'

// ===================== 类型定义 =====================

/** 列类型枚举（兼容原 FormTypes） */
export enum FormTypes {
  normal = 'normal',
  hidden = 'hidden',
  input = 'input',
  date = 'date',
  popupJsh = 'popupJsh',
}

/** 材料表列定义 */
export interface MaterialColumn {
  key: string
  title: string
  type: string | FormTypes
  options?: Array<{ value: string; text: string; title: string }>
  [k: string]: any
}

/** 材料表配置 */
export interface MaterialTableConfig {
  columns: MaterialColumn[]
  dataSource: any[]
  loading?: boolean
}

/** 快捷按钮权限 */
export interface QuickBtn {
  vendor: boolean
  customer: boolean
  member: boolean
  account: boolean
  depot: boolean
}

/** useBillModal 配置选项 */
export interface UseBillModalOptions {
  /** 单据前缀编号，如 CGRK / XSCK / LSCK 等 */
  prefixNo: string
  /** 表头表单的响应式模型（由调用方 reactive 创建） */
  formModel: Record<string, any>
  /** 明细表配置（由调用方 reactive 创建） */
  materialTable: MaterialTableConfig
  /**
   * 获取明细表的数据方法（由调用方实现）
   * 返回明细行数组
   */
  getTableData?: () => Promise<any[]>
  /**
   * 获取明细表统计列（由调用方实现）
   * 返回 { taxLastMoney: number, allPrice: number, ... }
   */
  getStatisticsColumns?: () => Record<string, number>
  /** 明细表 ref（用于滚动等操作） */
  materialDataTableRef?: any
}

// ===================== 辅助函数 =====================

/** 获取当前格式化日期时间 */
function getNowFormatDateTime(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// ===================== Composable =====================

export function useBillModal(options: UseBillModalOptions) {
  const { prefixNo, formModel, materialTable } = options

  // ==================== 响应式状态 ====================

  /** 操作类型：add | edit | detail */
  const action = ref('')
  /** 多账户按钮状态 */
  const manyAccountBtnStatus = ref(false)
  /** 供应商列表 */
  const supList = ref<any[]>([])
  /** 客户列表 */
  const cusList = ref<any[]>([])
  /** 零售会员列表 */
  const retailList = ref<any[]>([])
  /** 业务员列表 */
  const personList = reactive<{ options: any[]; value: string }>({
    options: [],
    value: '',
  })
  /** 当前选中仓库 ID */
  const currentSelectDepotId = ref('')
  /** 前页面传递参数 */
  const transferParam = ref<Record<string, any>>({})
  /** 默认仓库 ID */
  const defaultDepotId = ref('')
  /** 仓库列表 */
  const depotList = ref<any[]>([])
  /** 账户列表 */
  const accountList = ref<any[]>([])
  /** 多账户 ID 列表 */
  const accountIdList = ref<any[]>([])
  /** 多账户金额列表 */
  const accountMoneyList = ref<any[]>([])
  /** 单价 */
  const billUnitPirce = ref('')
  /** 扫码条码值 */
  const scanBarCode = ref('')
  /** 扫码状态（true=隐藏扫码框，false=显示） */
  const scanStatus = ref(true)
  /** 单据状态：0-未审核 1-已审核 */
  const billStatus = ref('0')
  /** 弹窗最小宽度 */
  const minWidth = ref(1100)
  /** 弹窗宽度 */
  const width = ref('1200px')
  /** 是否可以审核 */
  const isCanCheck = ref(true)
  /** 快捷按钮权限 */
  const quickBtn = reactive<QuickBtn>({
    vendor: false,
    customer: false,
    member: false,
    account: false,
    depot: false,
  })
  /** 是否显示打印标志 */
  const billPrintFlag = ref(false)
  /** 是否显示打印按钮 */
  const isShowPrintBtn = ref(true)
  /** 原始审核是否开启 */
  const checkFlag = ref(true)
  /** 零收付款的场景开关 */
  const zeroChangeAmountFlag = ref(false)
  /** 搜索防抖计时器 */
  const setTimeFlag = ref<ReturnType<typeof setTimeout> | null>(null)
  /** 以销定购标志 */
  const purchaseBySaleFlag = ref(false)
  /** 出入库管理标志 */
  const inOutManageFlag = ref(false)

  /** 金额验证规则 */
  const validatorRules = {
    price: {
      rules: [
        {
          pattern: /^(([0-9][0-9]*)|([0]\.\d{0,4}|[0-9][0-9]*\.\d{0,4}))$/,
          message: '金额格式不正确!',
        },
      ],
    },
  }

  /** 布局 spans（兼容原 Ant Design 栅格） */
  const spans = {
    labelCol1: { span: 2 },
    wrapperCol1: { span: 22 },
    labelCol1_5: { span: 3 },
    wrapperCol1_5: { span: 21 },
    labelCol2: { span: 4 },
    wrapperCol2: { span: 20 },
    labelCol3: { span: 6 },
    wrapperCol3: { span: 18 },
    labelCol6: { span: 12 },
    wrapperCol6: { span: 12 },
  }

  // ==================== 计算属性 ====================

  /** 是否只读（非新增/编辑模式） */
  const readOnly = computed(() => {
    return action.value !== 'add' && action.value !== 'edit'
  })

  // ==================== 快捷键处理 ====================

  /** 快捷键处理：Ctrl+S 保存 */
  function handleOkKey(e: KeyboardEvent) {
    const key = e.keyCode || e.which
    if (key === 83 && e.ctrlKey) {
      handleOkOnly()
      e.preventDefault()
    }
  }

  /** 绑定快捷键 */
  function bindKeydown() {
    const el = document.getElementById(prefixNo)
    if (el) {
      el.addEventListener('keydown', handleOkKey)
    }
  }

  /** 解绑快捷键 */
  function unbindKeydown() {
    const el = document.getElementById(prefixNo)
    if (el) {
      el.removeEventListener('keydown', handleOkKey)
    }
  }

  // ==================== 初始化方法 ====================

  /** 新增初始化 */
  async function addInit(amountNum: string) {
    try {
      const res = await getAction('/sequence/buildNumber')
      if (res && res.code === 200) {
        formModel.defaultNumber = amountNum + res.data.defaultNumber
        formModel.number = amountNum + res.data.defaultNumber
      }
    } catch (e) {
      console.error('[useBillModal] addInit buildNumber error:', e)
    }

    await nextTick()
    formModel.operTime = getNowFormatDateTime()
    formModel.discount = 0
    formModel.discountMoney = 0
    formModel.discountLastMoney = 0
    formModel.otherMoney = 0
    formModel.changeAmount = 0
    formModel.debt = 0

    await nextTick()
    try {
      const res = await getAction('/account/getAccount')
      if (res && res.code === 200) {
        for (const item of res.data.accountList) {
          if (item.isDefault) {
            formModel.accountId = item.id
          }
        }
        // 数据从前一个页面带过来的情况
        if (transferParam.value && transferParam.value.accountId) {
          formModel.accountId = transferParam.value.accountId
        }
      }
    } catch (e) {
      console.error('[useBillModal] addInit getAccount error:', e)
    }

    accountIdList.value = []
    accountMoneyList.value = []
    manyAccountBtnStatus.value = false
  }

  /** 复制新增初始化 */
  async function copyAddInit(amountNum: string) {
    try {
      const res = await getAction('/sequence/buildNumber')
      if (res && res.code === 200) {
        formModel.number = amountNum + res.data.defaultNumber
      }
    } catch (e) {
      console.error('[useBillModal] copyAddInit buildNumber error:', e)
    }

    await nextTick()
    formModel.operTime = getNowFormatDateTime()
  }

  /** 查询某个 tab 的数据 */
  async function requestSubTableData(
    url: string,
    params: Record<string, any>,
    tab: { loading: boolean; dataSource: any[] },
    success?: (res: any) => void,
  ) {
    tab.loading = true
    try {
      const res = await getAction(url, params)
      if (res && res.code === 200) {
        tab.dataSource = res.data.rows
        for (let i = 0; i < tab.dataSource.length; i++) {
          const info = tab.dataSource[i]
          info.isEdit = formModel.id ? 1 : 0
          changeColumnShow(info)
        }
        if (typeof success === 'function') {
          success(res)
        }
      }
    } finally {
      tab.loading = false
    }
  }

  // ==================== 列控制 ====================

  /**
   * 改变字段的状态
   * @param columns 列配置数组
   * @param key 字段 key
   * @param type 1=显示，0=隐藏
   */
  function changeFormTypes(columns: MaterialColumn[], key: string, type: number) {
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].key === key) {
        if (type) {
          if (key === 'snList' || key === 'batchNumber') {
            if (
              prefixNo === 'LSCK' ||
              prefixNo === 'CGTH' ||
              prefixNo === 'XSCK' ||
              prefixNo === 'QTCK' ||
              prefixNo === 'DBCK'
            ) {
              columns[i].type = FormTypes.popupJsh
            } else {
              if (key === 'snList') {
                columns[i].type = FormTypes.popupJsh
              } else {
                columns[i].type = FormTypes.input
              }
            }
          } else if (key === 'expirationDate') {
            if (
              prefixNo === 'LSTH' ||
              prefixNo === 'CGRK' ||
              prefixNo === 'XSTH' ||
              prefixNo === 'QTRK'
            ) {
              columns[i].type = FormTypes.date
            } else {
              columns[i].type = FormTypes.input
            }
          } else {
            columns[i].type = FormTypes.normal
          }
        } else {
          columns[i].type = FormTypes.hidden
        }
      }
    }
  }

  // ==================== 系统配置 ====================

  /** 初始化系统配置 */
  async function initSystemConfig() {
    try {
      const res = await getAction('/systemConfig/getCurrentInfo')
      if (res.code === 200 && res.data) {
        const multiBillType: string = res.data.multiBillType
        const multiLevelApprovalFlag: string = res.data.multiLevelApprovalFlag
        checkFlag.value = getCheckFlag(multiBillType, multiLevelApprovalFlag, prefixNo)
        purchaseBySaleFlag.value = res.data.purchaseBySaleFlag === '1'
        inOutManageFlag.value = res.data.inOutManageFlag === '1'
        zeroChangeAmountFlag.value = res.data.zeroChangeAmountFlag === '1'
        if (res.data.auditPrintFlag === '1') {
          isShowPrintBtn.value = !(
            formModel.status === '0' || formModel.status === '9'
          )
        } else {
          isShowPrintBtn.value = true
        }
      }
    } catch (e) {
      console.error('[useBillModal] initSystemConfig error:', e)
    }
  }

  // ==================== 供应商/客户/会员 ====================

  /** 初始化供应商列表 */
  async function initSupplier(isChecked?: number | boolean) {
    try {
      const res = await postAction('/supplier/findBySelect_sup', {
        organId: formModel.organId,
        limit: 1,
      })
      if (res) {
        supList.value = res
        if (isChecked && res.length > 0) {
          formModel.organId = res[0].id
        }
      }
    } catch (e) {
      console.error('[useBillModal] initSupplier error:', e)
    }
  }

  /** 初始化客户列表 */
  async function initCustomer(isChecked?: number | boolean) {
    try {
      const res = await postAction('/supplier/findBySelect_cus', {
        organId: formModel.organId,
        limit: 1,
      })
      if (res) {
        cusList.value = res
        if (isChecked && res.length > 0) {
          formModel.organId = res[0].id
        }
      }
    } catch (e) {
      console.error('[useBillModal] initCustomer error:', e)
    }
  }

  /** 初始化零售会员列表 */
  async function initRetail(isChecked?: number | boolean) {
    try {
      const res = await postAction('/supplier/findBySelect_retail', {
        organId: formModel.organId,
        limit: 1,
      })
      if (res) {
        retailList.value = res
        if (isChecked && res.length > 0) {
          formModel.organId = res[0].id
        }
      }
    } catch (e) {
      console.error('[useBillModal] initRetail error:', e)
    }
  }

  /** 初始化业务员列表 */
  async function initSalesman() {
    try {
      const res = await getAction('/person/getPersonByNumType', { type: 1 })
      if (res) {
        personList.options = res
      }
    } catch (e) {
      console.error('[useBillModal] initSalesman error:', e)
    }
  }

  /** 初始化仓库列表（填充明细表仓库下拉选项） */
  async function initDepot() {
    try {
      const res = await getAction('/depot/findDepotByCurrentUser')
      if (res.code === 200) {
        const arr = res.data
        for (const item of materialTable.columns) {
          if (item.key === 'depotId' || item.key === 'anotherDepotId') {
            item.options = []
            for (let i = 0; i < arr.length; i++) {
              item.options.push({
                value: arr[i].id + '', // 注意-此处 value 必须为字符串格式
                text: arr[i].depotName,
                title: arr[i].depotName,
              })
            }
          }
        }
      }
    } catch (e) {
      console.error('[useBillModal] initDepot error:', e)
    }
  }

  /** 初始化结算账户列表 */
  async function initAccount(isChecked?: number | boolean) {
    try {
      const res = await getAction('/account/getAccount')
      if (res && res.code === 200) {
        const list = res.data.accountList
        const lastId = list.length > 0 ? list[0].id : ''
        const sysRes = await getAction('/systemConfig/getCurrentInfo')
        if (sysRes.code === 200 && sysRes.data) {
          const multiAccountFlag = sysRes.data.multiAccountFlag
          if (multiAccountFlag === '1') {
            list.splice(0, 0, { id: 0, name: '多账户' })
          }
        }
        accountList.value = list
        if (isChecked) {
          formModel.accountId = lastId
        }
      }
    } catch (e) {
      console.error('[useBillModal] initAccount error:', e)
    }
  }

  // ==================== 搜索（带防抖） ====================

  /** 搜索供应商 */
  function handleSearchSupplier(value: string) {
    if (setTimeFlag.value != null) {
      clearTimeout(setTimeFlag.value)
    }
    setTimeFlag.value = setTimeout(() => {
      postAction('/supplier/findBySelect_sup', { key: value, limit: 1 }).then((res) => {
        if (res) {
          supList.value = res
        }
      })
    }, 500)
  }

  /** 搜索客户 */
  function handleSearchCustomer(value: string) {
    if (setTimeFlag.value != null) {
      clearTimeout(setTimeFlag.value)
    }
    setTimeFlag.value = setTimeout(() => {
      postAction('/supplier/findBySelect_cus', { key: value, limit: 1 }).then((res) => {
        if (res) {
          cusList.value = res
        }
      })
    }, 500)
  }

  /** 搜索零售会员 */
  function handleSearchRetail(value: string) {
    if (setTimeFlag.value != null) {
      clearTimeout(setTimeFlag.value)
    }
    setTimeFlag.value = setTimeout(() => {
      postAction('/supplier/findBySelect_retail', { key: value, limit: 1 }).then((res) => {
        if (res) {
          retailList.value = res
        }
      })
    }, 500)
  }

  // ==================== 多账户 ====================

  /** 处理多账户点击 */
  function handleManyAccount() {
    selectAccount(0)
  }

  /**
   * 选择账户
   * @param value 账户 id，0 表示多账户
   * @param manyAccountModalRef 多账户弹窗 ref（传入组件 ref）
   */
  function selectAccount(value: number | string, manyAccountModalRef?: any) {
    if (value === 0) {
      // 多账户
      if (manyAccountModalRef) {
        manyAccountModalRef.edit(accountIdList.value, accountMoneyList.value)
        manyAccountModalRef.title = '多账户结算'
      }
      manyAccountBtnStatus.value = true
    } else {
      accountIdList.value = []
      accountMoneyList.value = []
      manyAccountBtnStatus.value = false
    }
  }

  /** 多账户弹窗确认回调 */
  function manyAccountModalFormOk(idList: any[], moneyList: any[], allPrice: number) {
    accountIdList.value = idList
    accountMoneyList.value = moneyList
    const discountLastMoney = (formModel.discountLastMoney || 0) - 0
    const otherMoney = formModel.otherMoney ? formModel.otherMoney - 0 : 0
    const debt = (discountLastMoney + otherMoney - allPrice).toFixed(2)

    nextTick(() => {
      formModel.changeAmount = allPrice
      formModel.debt = parseFloat(debt)
    })
  }

  // ==================== 快捷新增弹窗 ====================

  /** 新增供应商 */
  function addSupplier(vendorModalRef?: any) {
    if (vendorModalRef) {
      vendorModalRef.add()
      vendorModalRef.title = '新增供应商'
      vendorModalRef.disableSubmit = false
    }
  }

  /** 新增客户 */
  function addCustomer(customerModalRef?: any) {
    if (customerModalRef) {
      customerModalRef.add()
      customerModalRef.title =
        '新增客户（提醒：如果找不到新添加的客户，请到用户管理检查是否分配了该客户权限）'
      customerModalRef.disableSubmit = false
    }
  }

  /** 新增会员 */
  function addMember(memberModalRef?: any) {
    if (memberModalRef) {
      memberModalRef.add()
      memberModalRef.title = '新增会员'
      memberModalRef.disableSubmit = false
    }
  }

  /** 批量切换仓库 */
  function handleBatchSetDepot(batchSetDepotModalRef?: any) {
    if (batchSetDepotModalRef) {
      batchSetDepotModalRef.add()
      batchSetDepotModalRef.title = '批量切换仓库'
      batchSetDepotModalRef.disableSubmit = false
    }
  }

  /** 新增仓库 */
  function addDepot(depotModalRef?: any) {
    if (depotModalRef) {
      depotModalRef.add()
      depotModalRef.title = '新增仓库'
      depotModalRef.disableSubmit = false
    }
  }

  /** 新增结算账户 */
  function addAccount(accountModalRef?: any) {
    if (accountModalRef) {
      accountModalRef.add()
      accountModalRef.title = '新增结算账户'
      accountModalRef.disableSubmit = false
    }
  }

  // ==================== 快捷新增回调 ====================

  /** 供应商新增成功回调 */
  function vendorModalFormOk() {
    initSupplier(1)
  }

  /** 客户新增成功回调 */
  function customerModalFormOk() {
    initCustomer(1)
  }

  /** 会员新增成功回调 */
  function memberModalFormOk() {
    initRetail(1)
  }

  /** 批量切换仓库回调 */
  async function batchSetDepotModalFormOk(depotId: string) {
    try {
      const detailArr = options.getTableData ? await options.getTableData() : []

      let barCodes = ''
      for (const detail of detailArr) {
        barCodes += detail.barCode + ','
      }
      if (barCodes) {
        barCodes = barCodes.substring(0, barCodes.length - 1)
      }

      const mpList = getStore('materialPropertyList') as any[] | null
      const param = {
        barCode: barCodes,
        organId: formModel.organId,
        depotId: depotId,
        mpList: mpList ? getMpListShort(mpList) : '',
        prefixNo: prefixNo,
      }

      const res = await getAction('/material/getMaterialByBarCode', param)
      if (res && res.code === 200) {
        const mList = res.data
        const newDetailArr: any[] = []
        if (mList && mList.length) {
          for (let i = 0; i < detailArr.length; i++) {
            const item = detailArr[i]
            item.depotId = depotId
            for (let j = 0; j < mList.length; j++) {
              if (mList[j].mBarCode === item.barCode) {
                item.stock = mList[j].stock
              }
            }
            newDetailArr.push(item)
          }
        } else {
          for (let i = 0; i < detailArr.length; i++) {
            const item = detailArr[i]
            item.depotId = depotId
            newDetailArr.push(item)
          }
        }
        materialTable.dataSource = newDetailArr
      }
    } catch (e) {
      console.error('[useBillModal] batchSetDepotModalFormOk error:', e)
    }
  }

  /** 仓库新增成功回调 */
  function depotModalFormOk() {
    initDepot()
  }

  /** 账户新增成功回调 */
  function accountModalFormOk() {
    initAccount(1)
  }

  /** 流程弹窗确认回调 */
  function workflowModalFormOk(closeFn?: () => void) {
    if (closeFn) closeFn()
  }

  // ==================== 明细表行事件 ====================

  /**
   * 新增行事件
   * @param event { row, target } 事件对象
   */
  async function onAdded(event: { row: any; target: any }) {
    const { row, target } = event
    target.setValues([{ rowKey: row.id, values: { operNumber: 0 } }])

    // 自动下滑到最后一行
    if (options.materialDataTableRef?.value) {
      setTimeout(() => {
        const tableRef = options.materialDataTableRef!.value
        if (tableRef && tableRef.resetScrollTop) {
          tableRef.resetScrollTop((target.rows.length + 1) * tableRef.rowHeight)
        }
      }, 1000)
    }

    if (currentSelectDepotId.value) {
      // 如果单据选择过仓库，则直接从当前选择的仓库加载
      target.setValues([
        { rowKey: row.id, values: { depotId: currentSelectDepotId.value } },
      ])
    } else {
      try {
        const res = await getAction('/depot/findDepotByCurrentUser')
        if (res.code === 200) {
          const arr = res.data
          if (arr.length === 1) {
            target.setValues([
              { rowKey: row.id, values: { depotId: arr[0].id + '' } },
            ])
          } else {
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].isDefault) {
                target.setValues([
                  { rowKey: row.id, values: { depotId: arr[i].id + '' } },
                ])
              }
            }
          }
        }
      } catch (e) {
        console.error('[useBillModal] onAdded findDepot error:', e)
      }
    }
  }

  // ==================== 单元格值变化处理 ====================

  /**
   * 单元值改变事件处理（单元值改变一个字符就触发一次）
   */
  function onValueChange(event: {
    type?: string
    row: any
    column: { key: string }
    value: any
    target: any
  }) {
    const { row, column, value, target } = event
    const mpList = getStore('materialPropertyList') as any[] | null
    let operNumber: number
    let unitPrice: number
    let allPrice: number
    let taxRate: number
    let taxMoney: number
    let taxLastMoney: number

    switch (column.key) {
      case 'depotId':
        currentSelectDepotId.value = row.depotId
        if (row.barCode) {
          getStockByDepotBarCode(row, target)
        }
        break

      case 'barCode':
        handleBarCodeChange(value, row, target, mpList)
        break

      case 'snList':
        if (value) {
          const snListStr = value.replaceAll('\uff0c', ',')
          const snArr = snListStr.split(',')
          operNumber = snArr.length
          taxRate = row.taxRate - 0
          unitPrice = row.unitPrice - 0
          allPrice = parseFloat((unitPrice * operNumber).toFixed(2))
          taxMoney = parseFloat(((taxRate * 0.01) * allPrice).toFixed(2))
          taxLastMoney = parseFloat((allPrice + taxMoney).toFixed(2))
          target.setValues([
            {
              rowKey: row.id,
              values: {
                operNumber,
                allPrice,
                taxMoney,
                taxLastMoney,
              },
            },
          ])
          target.recalcAllStatisticsColumns()
          autoChangePrice(target)
        }
        break

      case 'batchNumber':
        handleBatchNumberChange(value, row, target)
        break

      case 'operNumber':
        operNumber = value - 0
        taxRate = row.taxRate - 0
        unitPrice = row.unitPrice - 0
        allPrice = parseFloat((unitPrice * operNumber).toFixed(2))
        taxMoney = parseFloat(((taxRate * 0.01) * allPrice).toFixed(2))
        taxLastMoney = parseFloat((allPrice + taxMoney).toFixed(2))
        target.setValues([
          {
            rowKey: row.id,
            values: { allPrice, taxMoney, taxLastMoney },
          },
        ])
        target.recalcAllStatisticsColumns()
        autoChangePrice(target)
        break

      case 'unitPrice':
        operNumber = row.operNumber - 0
        unitPrice = value - 0
        taxRate = row.taxRate - 0
        allPrice = parseFloat((unitPrice * operNumber).toFixed(2))
        taxMoney = parseFloat(((taxRate * 0.01) * allPrice).toFixed(2))
        taxLastMoney = parseFloat((allPrice + taxMoney).toFixed(2))
        target.setValues([
          {
            rowKey: row.id,
            values: { allPrice, taxMoney, taxLastMoney },
          },
        ])
        target.recalcAllStatisticsColumns()
        autoChangePrice(target)
        break

      case 'allPrice':
        operNumber = row.operNumber - 0
        taxRate = row.taxRate - 0
        allPrice = value - 0
        unitPrice = parseFloat((allPrice / operNumber).toFixed(4))
        taxMoney = parseFloat(((taxRate * 0.01) * allPrice).toFixed(2))
        taxLastMoney = parseFloat((allPrice + taxMoney).toFixed(2))
        target.setValues([
          {
            rowKey: row.id,
            values: { unitPrice, taxMoney, taxLastMoney },
          },
        ])
        target.recalcAllStatisticsColumns()
        autoChangePrice(target)
        break

      case 'taxRate':
        operNumber = row.operNumber - 0
        allPrice = row.allPrice - 0
        unitPrice = row.unitPrice - 0
        taxRate = value - 0
        taxMoney = parseFloat(((taxRate * 0.01) * allPrice).toFixed(2))
        taxLastMoney = parseFloat((allPrice + taxMoney).toFixed(2))
        target.setValues([
          {
            rowKey: row.id,
            values: { taxMoney, taxLastMoney },
          },
        ])
        target.recalcAllStatisticsColumns()
        autoChangePrice(target)
        break

      case 'taxLastMoney':
        operNumber = row.operNumber - 0
        taxLastMoney = value - 0
        taxRate = row.taxRate - 0
        if (taxRate) {
          unitPrice = parseFloat(
            (taxLastMoney / operNumber / (1 + taxRate * 0.01)).toFixed(4),
          )
          allPrice = parseFloat((unitPrice * operNumber).toFixed(2))
          taxMoney = parseFloat((taxLastMoney - allPrice).toFixed(2))
        } else {
          // 税率为 0 的情况，特殊处理
          allPrice = taxLastMoney
          unitPrice = parseFloat((allPrice / operNumber).toFixed(4))
          taxMoney = 0
        }
        target.setValues([
          {
            rowKey: row.id,
            values: { unitPrice, allPrice, taxMoney },
          },
        ])
        target.recalcAllStatisticsColumns()
        autoChangePrice(target)
        break
    }
  }

  /** 处理条码变化（内部方法） */
  async function handleBarCodeChange(
    value: string,
    row: any,
    target: any,
    mpList: any[] | null,
  ) {
    const param = {
      barCode: value,
      organId: formModel.organId,
      mpList: mpList ? getMpListShort(mpList) : '',
      prefixNo: prefixNo,
    }
    try {
      const res = await getAction('/material/getMaterialByBarCode', param)
      if (res && res.code === 200) {
        const mList = res.data
        if (value.indexOf(',') > -1) {
          // 多个条码
          const detailArr = options.getTableData ? await options.getTableData() : []
          detailArr.pop() // 移除最后一行数据
          const mArr = detailArr
          for (let i = 0; i < mList.length; i++) {
            const mInfo = mList[i]
            changeColumnShow(mInfo)
            const mObj = parseInfoToObj(mInfo)
            ;(mObj as any).depotId = mInfo.depotId
            ;(mObj as any).stock = mInfo.stock
            ;(mObj as any).snList = ''
            ;(mObj as any).batchNumber = ''
            ;(mObj as any).expirationDate = ''
            mArr.push(mObj)
          }
          let allPriceTotal = 0
          let taxLastMoneyTotal = 0
          for (let j = 0; j < mArr.length; j++) {
            allPriceTotal += mArr[j].allPrice - 0
            taxLastMoneyTotal += mArr[j].taxLastMoney - 0
            // 组合和拆分单据给商品类型进行重新赋值
            if (j === 0) {
              mArr[0].mType = '组合件'
            } else {
              mArr[j].mType = '普通子件'
            }
          }
          materialTable.dataSource = mArr
          if (prefixNo === 'LSCK' || prefixNo === 'LSTH') {
            target.statisticsColumns.allPrice = allPriceTotal
          } else {
            target.statisticsColumns.taxLastMoney = taxLastMoneyTotal
          }
          autoChangePrice(target)
          // 强制渲染
          if (target.$forceUpdate) target.$forceUpdate()
        } else {
          // 单个条码
          const depotIdSelected =
            prefixNo !== 'CGDD' && prefixNo !== 'XSDD' ? row.depotId : ''
          const stockRes = await getAction('/depotItem/findStockByDepotAndBarCode', {
            depotId: depotIdSelected,
            barCode: row.barCode,
          })
          if (stockRes && stockRes.code === 200) {
            const mInfo = mList[0]
            changeColumnShow(mInfo)
            const mInfoEx: any = parseInfoToObj(mInfo)
            mInfoEx.stock = stockRes.data.stock
            mInfoEx.snList = ''
            mInfoEx.batchNumber = ''
            mInfoEx.expirationDate = ''
            const mObj = {
              rowKey: row.id,
              values: mInfoEx,
            }
            target.setValues([mObj])
            target.recalcAllStatisticsColumns()
            autoChangePrice(target)
            if (target.autoSelectBySpecialKey) {
              target.autoSelectBySpecialKey('operNumber', row.orderNum)
            }
            // 强制渲染
            if (target.$forceUpdate) target.$forceUpdate()
          }
        }
      }
    } catch (e) {
      console.error('[useBillModal] handleBarCodeChange error:', e)
    }
  }

  /** 处理批号变化（内部方法） */
  async function handleBatchNumberChange(value: string, row: any, target: any) {
    // 只针对零售出库、销售出库、采购退货、其它出库
    if (
      prefixNo === 'LSCK' ||
      prefixNo === 'XSCK' ||
      prefixNo === 'CGTH' ||
      prefixNo === 'QTCK'
    ) {
      const batchNumber = value
      let depotItemId: number | string = ''
      if (formModel.id) {
        // 只有在保存之后的编辑页面下才获取明细 id
        const rowId = row.id
        if (rowId.length <= 19) {
          depotItemId = rowId - 0
        }
      }
      try {
        const res = await getAction('/depotItem/getBatchNumberList', {
          name: '',
          depotItemId,
          depotId: row.depotId,
          barCode: row.barCode,
          batchNumber,
        })
        if (res && res.code === 200) {
          if (res.data && res.data.rows) {
            const info = res.data.rows[0]
            const preNumber = row.preNumber - 0
            const finishNumber = row.finishNumber - 0
            const totalNum = info.totalNum - 0
            let operNumber: number
            if (preNumber > 0) {
              if (totalNum > preNumber - finishNumber) {
                operNumber = preNumber - finishNumber
              } else {
                operNumber = totalNum
              }
            } else {
              operNumber = totalNum
            }
            const taxRate = row.taxRate - 0
            const unitPrice = row.unitPrice - 0
            const allPrice = parseFloat((unitPrice * operNumber).toFixed(2))
            const taxMoney = parseFloat(((taxRate * 0.01) * allPrice).toFixed(2))
            const taxLastMoney = parseFloat((allPrice + taxMoney).toFixed(2))
            target.setValues([
              {
                rowKey: row.id,
                values: {
                  expirationDate: info.expirationDateStr,
                  operNumber,
                  allPrice,
                  taxMoney,
                  taxLastMoney,
                },
              },
            ])
            target.recalcAllStatisticsColumns()
            autoChangePrice(target)
          }
        }
      } catch (e) {
        console.error('[useBillModal] handleBatchNumberChange error:', e)
      }
    }
  }

  // ==================== 商品对象转换 ====================

  /** 将商品信息转为行数据对象 */
  function parseInfoToObj(mInfo: any) {
    return {
      barCode: mInfo.mBarCode,
      name: mInfo.name,
      standard: mInfo.standard,
      model: mInfo.model,
      color: mInfo.color,
      brand: mInfo.brand,
      mfrs: mInfo.mfrs,
      otherField1: mInfo.otherField1,
      otherField2: mInfo.otherField2,
      otherField3: mInfo.otherField3,
      unit: mInfo.commodityUnit,
      sku: mInfo.sku,
      operNumber: 1,
      unitPrice: mInfo.billPrice,
      allPrice: mInfo.billPrice,
      taxRate: 0,
      taxMoney: 0,
      taxLastMoney: mInfo.billPrice,
    }
  }

  // ==================== 列显示/隐藏控制 ====================

  /** 使得型号、颜色、扩展信息、sku 等为隐藏 */
  function changeColumnHide() {
    changeFormTypes(materialTable.columns, 'model', 0)
    changeFormTypes(materialTable.columns, 'color', 0)
    changeFormTypes(materialTable.columns, 'brand', 0)
    changeFormTypes(materialTable.columns, 'mfrs', 0)
    changeFormTypes(materialTable.columns, 'otherField1', 0)
    changeFormTypes(materialTable.columns, 'otherField2', 0)
    changeFormTypes(materialTable.columns, 'otherField3', 0)
    changeFormTypes(materialTable.columns, 'sku', 0)
  }

  /** 使得 sku、序列号、批号、到期日等为显示 */
  function changeColumnShow(info: any) {
    if (info.model) {
      changeFormTypes(materialTable.columns, 'model', 1)
    }
    if (info.color) {
      changeFormTypes(materialTable.columns, 'color', 1)
    }
    if (info.brand) {
      changeFormTypes(materialTable.columns, 'brand', 1)
    }
    if (info.mfrs) {
      changeFormTypes(materialTable.columns, 'mfrs', 1)
    }
    if (info.otherField1) {
      changeFormTypes(materialTable.columns, 'otherField1', 1)
    }
    if (info.otherField2) {
      changeFormTypes(materialTable.columns, 'otherField2', 1)
    }
    if (info.otherField3) {
      changeFormTypes(materialTable.columns, 'otherField3', 1)
    }
    if (info.sku) {
      changeFormTypes(materialTable.columns, 'sku', 1)
    }
    if (info.enableSerialNumber === '1') {
      // 如果开启出入库管理，并且类型等于采购、采购退货、销售、销售退货，则跳过
      if (
        inOutManageFlag.value &&
        (prefixNo === 'CGRK' ||
          prefixNo === 'CGTH' ||
          prefixNo === 'XSCK' ||
          prefixNo === 'XSTH')
      ) {
        // 跳过
      } else {
        changeFormTypes(materialTable.columns, 'snList', 1)
      }
    }
    if (info.enableBatchNumber === '1') {
      // 如果开启出入库管理，并且类型等于采购、采购退货、销售、销售退货，则跳过
      if (
        inOutManageFlag.value &&
        (prefixNo === 'CGRK' ||
          prefixNo === 'CGTH' ||
          prefixNo === 'XSCK' ||
          prefixNo === 'XSTH')
      ) {
        // 跳过
      } else {
        changeFormTypes(materialTable.columns, 'batchNumber', 1)
        changeFormTypes(materialTable.columns, 'expirationDate', 1)
      }
    }
  }

  // ==================== 删除行事件 ====================

  /** 删除一行或多行的时候触发 */
  function onDeleted(_ids: any, target: any) {
    target.recalcAllStatisticsColumns()
    autoChangePrice(target)
  }

  // ==================== 库存查询 ====================

  /** 根据仓库和条码查询库存 */
  async function getStockByDepotBarCode(row: any, target: any) {
    try {
      const res = await getAction('/depotItem/findStockByDepotAndBarCode', {
        depotId: row.depotId,
        barCode: row.barCode,
      })
      if (res && res.code === 200) {
        target.setValues([{ rowKey: row.id, values: { stock: res.data.stock } }])
        target.recalcAllStatisticsColumns()
      }
    } catch (e) {
      console.error('[useBillModal] getStockByDepotBarCode error:', e)
    }
  }

  // ==================== 价格联动计算 ====================

  /** 改变优惠、本次付款、欠款的值（自动计算） */
  function autoChangePrice(target: any) {
    const allTaxLastMoney = target.statisticsColumns.taxLastMoney - 0
    const discount = (formModel.discount || 0) - 0
    const otherMoney = formModel.otherMoney ? formModel.otherMoney - 0 : 0
    const deposit = formModel.deposit
    const discountMoney = parseFloat((discount * 0.01 * allTaxLastMoney).toFixed(2))
    const discountLastMoney = parseFloat((allTaxLastMoney - discountMoney).toFixed(2))
    let changeAmountNew = parseFloat((discountLastMoney + otherMoney).toFixed(2))
    if (deposit) {
      changeAmountNew = parseFloat((changeAmountNew - deposit).toFixed(2))
    }

    nextTick(() => {
      changeAmountNew =
        prefixNo === 'CGDD' || prefixNo === 'XSDD' ? 0 : changeAmountNew
      formModel.discount = discount
      formModel.discountMoney = discountMoney
      formModel.discountLastMoney = discountLastMoney
      formModel.changeAmount = changeAmountNew
      formModel.debt = 0
      setZeroChangeAmount()
    })
  }

  /** 改变优惠率 */
  function onChangeDiscount(value: number | string) {
    const val = typeof value === 'object' ? (value as any)?.target?.value - 0 : value - 0
    const otherMoney = formModel.otherMoney ? formModel.otherMoney - 0 : 0
    const deposit = formModel.deposit
    const allTaxLastMoney = getStatisticsValue('taxLastMoney')
    const discountMoneyNew = parseFloat((allTaxLastMoney * val * 0.01).toFixed(2))
    const discountLastMoneyNew = parseFloat(
      (allTaxLastMoney - discountMoneyNew).toFixed(2),
    )
    let changeAmountNew = parseFloat((discountLastMoneyNew + otherMoney).toFixed(2))
    if (deposit) {
      changeAmountNew = parseFloat((changeAmountNew - deposit).toFixed(2))
    }

    nextTick(() => {
      changeAmountNew =
        prefixNo === 'CGDD' || prefixNo === 'XSDD' ? 0 : changeAmountNew
      formModel.discountMoney = discountMoneyNew
      formModel.discountLastMoney = discountLastMoneyNew
      formModel.changeAmount = changeAmountNew
      formModel.debt = 0
      setZeroChangeAmount()
    })
  }

  /** 改变付款优惠 */
  function onChangeDiscountMoney(value: number | string) {
    const val = typeof value === 'object' ? (value as any)?.target?.value - 0 : value - 0
    const otherMoney = formModel.otherMoney ? formModel.otherMoney - 0 : 0
    const deposit = formModel.deposit
    const allTaxLastMoney = getStatisticsValue('taxLastMoney')
    const discountNew = parseFloat((val / allTaxLastMoney * 100).toFixed(2))
    const discountLastMoneyNew = parseFloat((allTaxLastMoney - val).toFixed(2))
    let changeAmountNew = parseFloat((discountLastMoneyNew + otherMoney).toFixed(2))
    if (deposit) {
      changeAmountNew = parseFloat((changeAmountNew - deposit).toFixed(2))
    }

    nextTick(() => {
      changeAmountNew =
        prefixNo === 'CGDD' || prefixNo === 'XSDD' ? 0 : changeAmountNew
      formModel.discount = discountNew
      formModel.discountLastMoney = discountLastMoneyNew
      formModel.changeAmount = changeAmountNew
      formModel.debt = 0
      setZeroChangeAmount()
    })
  }

  /** 其它费用变化 */
  function onChangeOtherMoney(value: number | string) {
    const val = typeof value === 'object' ? (value as any)?.target?.value - 0 : value - 0
    const discountLastMoney = (formModel.discountLastMoney || 0) - 0
    const deposit = formModel.deposit
    let changeAmountNew = parseFloat((discountLastMoney + val).toFixed(2))
    if (deposit) {
      changeAmountNew = parseFloat((changeAmountNew - deposit).toFixed(2))
    }

    nextTick(() => {
      formModel.changeAmount = changeAmountNew
      formModel.debt = 0
      setZeroChangeAmount()
    })
  }

  /** 改变扣除订金 */
  function onChangeDeposit(value: number | string) {
    const val = typeof value === 'object' ? (value as any)?.target?.value - 0 : value - 0
    const discountLastMoney = (formModel.discountLastMoney || 0) - 0
    const otherMoney = formModel.otherMoney ? formModel.otherMoney - 0 : 0
    let changeAmountNew = parseFloat((discountLastMoney + otherMoney).toFixed(2))
    if (val) {
      changeAmountNew = parseFloat((changeAmountNew - val).toFixed(2))
    }

    nextTick(() => {
      formModel.changeAmount = changeAmountNew
      formModel.debt = 0
      setZeroChangeAmount()
    })
  }

  /** 改变本次付款 */
  function onChangeChangeAmount(value: number | string) {
    const val = typeof value === 'object' ? (value as any)?.target?.value - 0 : value - 0
    const discountLastMoney = (formModel.discountLastMoney || 0) - 0
    const otherMoney = formModel.otherMoney ? formModel.otherMoney - 0 : 0
    const deposit = formModel.deposit
    let debtNew = parseFloat((discountLastMoney + otherMoney - val).toFixed(2))
    if (deposit) {
      debtNew = parseFloat((debtNew - deposit).toFixed(2))
    }

    nextTick(() => {
      formModel.debt = debtNew
    })
  }

  /** 获取统计列的值（内部辅助方法） */
  function getStatisticsValue(key: string): number {
    if (options.getStatisticsColumns) {
      const stats = options.getStatisticsColumns()
      return (stats[key] || 0) - 0
    }
    if (options.materialDataTableRef?.value?.statisticsColumns) {
      return options.materialDataTableRef.value.statisticsColumns[key] - 0
    }
    return 0
  }

  // ==================== 客户切换联动 ====================

  /** 切换客户信息改变商品单价 */
  async function handleOrganChange(value: string | number) {
    const organId = value
    try {
      const detailArr = options.getTableData ? await options.getTableData() : []
      let barCodeStr = ''
      for (const detail of detailArr) {
        if (detail.barCode) {
          barCodeStr += detail.barCode + ','
        }
      }
      if (barCodeStr) {
        const mpList = getStore('materialPropertyList') as any[] | null
        const param = {
          barCode: barCodeStr,
          organId: organId,
          mpList: mpList ? getMpListShort(mpList) : '',
          prefixNo: prefixNo,
        }
        const res = await getAction('/material/getMaterialByBarCode', param)
        if (res && res.code === 200) {
          let allLastMoney = 0
          let allTaxLastMoney = 0
          const newDetailArr: any[] = []
          for (const detail of detailArr) {
            if (detail.barCode) {
              const mList = res.data
              for (let i = 0; i < mList.length; i++) {
                if (detail.barCode === mList[i].mBarCode) {
                  const taxRate = detail.taxRate - 0
                  detail.unitPrice = mList[i].billPrice - 0
                  detail.allPrice = parseFloat(
                    (detail.unitPrice * detail.operNumber).toFixed(2),
                  )
                  detail.taxMoney = parseFloat(
                    ((taxRate * 0.01) * detail.allPrice).toFixed(2),
                  )
                  detail.taxLastMoney = parseFloat(
                    (detail.allPrice + detail.taxMoney).toFixed(2),
                  )
                }
              }
              newDetailArr.push(detail)
            }
          }
          materialTable.dataSource = newDetailArr

          // 更新优惠后金额、本次付款等信息
          for (const newDetail of newDetailArr) {
            allLastMoney = allLastMoney + (newDetail.allPrice - 0)
            allTaxLastMoney = allTaxLastMoney + (newDetail.taxLastMoney - 0)
          }
          const discount = (formModel.discount || 0) - 0
          const otherMoney = formModel.otherMoney ? formModel.otherMoney - 0 : 0
          const deposit = formModel.deposit
          const discountMoney = parseFloat(
            (discount * 0.01 * allTaxLastMoney).toFixed(2),
          )
          const discountLastMoney = parseFloat(
            (allTaxLastMoney - discountMoney).toFixed(2),
          )
          let changeAmountNew = parseFloat(
            (discountLastMoney + otherMoney).toFixed(2),
          )
          if (deposit) {
            changeAmountNew = parseFloat((changeAmountNew - deposit).toFixed(2))
          }

          nextTick(() => {
            changeAmountNew = prefixNo === 'XSDD' ? 0 : changeAmountNew
            formModel.discount = discount
            formModel.discountMoney = discountMoney
            formModel.discountLastMoney = discountLastMoney
            formModel.changeAmount = changeAmountNew
            formModel.debt = 0
            setZeroChangeAmount()
          })
        }
      }
    } catch (e) {
      console.error('[useBillModal] handleOrganChange error:', e)
    }
  }

  // ==================== 零收付款 ====================

  /** 切换收付款的金额为 0 */
  function setZeroChangeAmount() {
    if (
      prefixNo === 'CGRK' ||
      prefixNo === 'CGTH' ||
      prefixNo === 'XSCK' ||
      prefixNo === 'XSTH'
    ) {
      if (zeroChangeAmountFlag.value) {
        const oldChangeAmount = (formModel.changeAmount || 0) - 0
        formModel.changeAmount = 0
        formModel.debt = oldChangeAmount
      }
    }
  }

  // ==================== 扫码功能 ====================

  /** 进入扫码模式 */
  function scanEnter(scanBarCodeRef?: any) {
    scanStatus.value = false
    nextTick(() => {
      if (scanBarCodeRef?.value) {
        scanBarCodeRef.value.focus()
      }
    })
  }

  /** 扫码回车处理 */
  async function scanPressEnter(scanBarCodeRef?: any) {
    if (scanBarCode.value) {
      try {
        const detailArr = options.getTableData ? await options.getTableData() : []
        const mpList = getStore('materialPropertyList') as any[] | null
        const param = {
          barCode: scanBarCode.value.trim(),
          organId: formModel.organId,
          mpList: mpList ? getMpListShort(mpList) : '',
          prefixNo: prefixNo,
        }
        const res = await getAction('/material/getMaterialByBarCode', param)
        if (res && res.code === 200) {
          let hasFinished = false
          let allLastMoney = 0
          let allTaxLastMoney = 0
          const newDetailArr: any[] = []
          let hasAdd = false

          for (const detail of detailArr) {
            if (detail.barCode) {
              // 如果扫码结果和条码重复，就在给原来的数量加 1
              if (detail.barCode === scanBarCode.value.trim() && !hasAdd) {
                detail.operNumber = (detail.operNumber - 0) + 1
                const taxRate = detail.taxRate - 0
                const unitPrice = detail.unitPrice - 0
                detail.allPrice = parseFloat((unitPrice * detail.operNumber).toFixed(2))
                detail.taxMoney = parseFloat(
                  ((taxRate * 0.01) * detail.allPrice).toFixed(2),
                )
                detail.taxLastMoney = parseFloat(
                  (detail.allPrice + detail.taxMoney).toFixed(2),
                )
                hasFinished = true
                hasAdd = true
              }
              // 如果扫码结果和序列号重复，就直接跳过
              if (detail.snList === scanBarCode.value.trim()) {
                ElMessage.warning('抱歉，已经扫描过该序列号！')
                hasFinished = true
              }
              newDetailArr.push(detail)
            }
          }

          if (!hasFinished) {
            // 将扫码的条码对应的商品加入列表
            const mList = res.data
            if (mList && mList.length > 0) {
              const mInfo = mList[0]
              changeColumnShow(mInfo)
              const item: any = {}
              item.depotId = mInfo.depotId
              item.barCode = mInfo.mBarCode
              item.name = mInfo.name
              item.standard = mInfo.standard
              item.model = mInfo.model
              item.color = mInfo.color
              item.materialOther = mInfo.materialOther
              item.stock = mInfo.stock
              item.unit = mInfo.commodityUnit
              item.sku = mInfo.sku
              if (mInfo.mBarCode !== scanBarCode.value.trim()) {
                if (
                  prefixNo === 'LSCK' ||
                  prefixNo === 'CGTH' ||
                  prefixNo === 'XSCK' ||
                  prefixNo === 'QTCK'
                ) {
                  // 此时给序列号赋值
                  item.snList = scanBarCode.value.trim()
                }
              }
              item.operNumber = 1
              item.unitPrice = mInfo.billPrice
              item.allPrice = mInfo.billPrice
              item.taxRate = 0
              item.taxMoney = 0
              item.taxLastMoney = mInfo.billPrice
              newDetailArr.push(item)
            } else {
              ElMessage.warning('抱歉，此条码不存在商品信息！')
            }
          }

          // 组合和拆分单据给商品类型进行重新赋值
          for (let i = 0; i < newDetailArr.length; i++) {
            if (i === 0) {
              newDetailArr[0].mType = '组合件'
            } else {
              newDetailArr[i].mType = '普通子件'
            }
          }
          materialTable.dataSource = newDetailArr

          // 更新优惠后金额、本次付款等信息
          for (const newDetail of newDetailArr) {
            allLastMoney = allLastMoney + (newDetail.allPrice - 0)
            allTaxLastMoney = allTaxLastMoney + (newDetail.taxLastMoney - 0)
          }
          const discount = (formModel.discount || 0) - 0
          const otherMoney = formModel.otherMoney ? formModel.otherMoney - 0 : 0
          const deposit = formModel.deposit
          const discountMoney = parseFloat(
            (discount * 0.01 * allTaxLastMoney).toFixed(2),
          )
          const discountLastMoney = parseFloat(
            (allTaxLastMoney - discountMoney).toFixed(2),
          )
          let changeAmountNew = parseFloat(
            (discountLastMoney + otherMoney).toFixed(2),
          )
          if (deposit) {
            changeAmountNew = parseFloat((changeAmountNew - deposit).toFixed(2))
          }

          if (prefixNo === 'LSCK' || prefixNo === 'LSTH') {
            nextTick(() => {
              formModel.changeAmount = allLastMoney
              formModel.getAmount = allLastMoney
              formModel.backAmount = 0
            })
          } else {
            nextTick(() => {
              changeAmountNew =
                prefixNo === 'CGDD' || prefixNo === 'XSDD' ? 0 : changeAmountNew
              formModel.discount = discount
              formModel.discountMoney = discountMoney
              formModel.discountLastMoney = discountLastMoney
              formModel.changeAmount = changeAmountNew
              formModel.debt = 0
            })
          }

          // 置空扫码的内容
          scanBarCode.value = ''
          if (scanBarCodeRef?.value) {
            scanBarCodeRef.value.focus()
          }

          // 自动下滑到最后一行
          if (options.materialDataTableRef?.value) {
            setTimeout(() => {
              const tableRef = options.materialDataTableRef!.value
              if (tableRef && tableRef.resetScrollTop) {
                tableRef.resetScrollTop(
                  (newDetailArr.length + 1) * tableRef.rowHeight,
                )
              }
            }, 1000)
          }
        }
      } catch (e) {
        console.error('[useBillModal] scanPressEnter error:', e)
      }
    }
  }

  /** 停止扫码 */
  function stopScan() {
    scanStatus.value = true
    scanBarCode.value = ''
  }

  // ==================== 导入 ====================

  /** 打开导入弹窗 */
  function onImport(importPrefix: string, importItemModalRef?: any) {
    if (importItemModalRef) {
      importItemModalRef.add(importPrefix)
    }
  }

  /** 导入商品回调 */
  function importItemModalFormOk(data: any[]) {
    materialTable.dataSource = data
    nextTick(() => {
      let discountLastMoney = 0
      for (let i = 0; i < data.length; i++) {
        discountLastMoney += data[i].taxLastMoney
        changeColumnShow(data[i])
      }
      formModel.discountLastMoney = discountLastMoney
    })
  }

  // ==================== 保存与审核 ====================

  /** 保存并审核 */
  function handleOkAndCheck() {
    billStatus.value = '1'
    handleOk()
  }

  /** 仅保存 */
  function handleOkOnly() {
    billStatus.value = '0'
    handleOk()
  }

  /**
   * 保存单据（空方法，由调用方通过 onSave 回调覆盖）
   * 调用方应实现具体的保存逻辑并调用本 composable 的 billStatus 等状态
   */
  function handleOk() {
    // 由调用方覆盖实现
    console.warn('[useBillModal] handleOk not implemented. Override this method.')
  }

  // ==================== 流程 ====================

  /** 发起流程 */
  async function handleWorkflow(modalWorkflowRef?: any) {
    if (formModel.id && formModel.number) {
      try {
        const res = await getAction('/platformConfig/getInfoByKey', {
          platformKey: 'send_workflow_url',
        })
        if (res && res.code === 200) {
          const sendWorkflowUrl =
            res.data.platformValue + '&no=' + formModel.number + '&type=1'
          if (modalWorkflowRef) {
            modalWorkflowRef.show(formModel, sendWorkflowUrl, formModel.number, 1, 320)
            modalWorkflowRef.title = '发起流程'
          }
        }
      } catch (e) {
        console.error('[useBillModal] handleWorkflow error:', e)
      }
    } else {
      ElMessage.warning('请先保存单据后再提交流程！')
    }
  }

  // ==================== 打印 ====================

  /** 三联打印新版 */
  async function handlePrintPro(billType: string, modalPrintProRef?: any) {
    if (formModel.id) {
      try {
        const res = await getAction('/platformConfig/getInfoByKey', {
          platformKey: 'bill_print_pro_url',
        })
        if (res && res.code === 200) {
          const billPrintUrl = res.data.platformValue + '&no=' + formModel.number
          const billPrintHeight = document.documentElement.clientHeight - 260
          if (modalPrintProRef) {
            modalPrintProRef.show(formModel, billPrintUrl, billPrintHeight)
            modalPrintProRef.title = billType + '-三联打印-新版'
          }
        }
      } catch (e) {
        console.error('[useBillModal] handlePrintPro error:', e)
      }
    } else {
      ElMessage.warning('请先保存单据后再打印！')
    }
  }

  /** 三联打印 */
  async function handlePrint(billType: string, modalPrintRef?: any) {
    if (formModel.id) {
      try {
        const res = await getAction('/platformConfig/getInfoByKey', {
          platformKey: 'bill_print_url',
        })
        if (res && res.code === 200) {
          const billPrintUrl = res.data.platformValue + '&no=' + formModel.number
          const billPrintHeight = materialTable.dataSource.length * 50 + 600
          if (modalPrintRef) {
            modalPrintRef.show(formModel, billPrintUrl, billPrintHeight)
            modalPrintRef.title = billType + '-三联打印'
          }
        }
      } catch (e) {
        console.error('[useBillModal] handlePrint error:', e)
      }
    } else {
      ElMessage.warning('请先保存单据后再打印！')
    }
  }

  // ==================== 平台配置 ====================

  /** 加载平台配置信息（打印标志） */
  async function initPlatform() {
    try {
      const res = await getAction('/platformConfig/getInfoByKey', {
        platformKey: 'bill_print_flag',
      })
      if (res && res.code === 200) {
        billPrintFlag.value = res.data.platformValue === '1'
      }
    } catch (e) {
      console.error('[useBillModal] initPlatform error:', e)
    }
  }

  // ==================== 快捷按钮权限 ====================

  /** 加载快捷按钮权限：供应商、客户、会员、结算账户、仓库 */
  function initQuickBtn() {
    const btnStrList = getStore('winBtnStrList') as any[] | null
    if (btnStrList) {
      for (let i = 0; i < btnStrList.length; i++) {
        if (btnStrList[i].btnStr) {
          quickBtn.vendor =
            btnStrList[i].url === '/system/vendor'
              ? btnStrList[i].btnStr.indexOf(1) > -1
              : quickBtn.vendor
          quickBtn.customer =
            btnStrList[i].url === '/system/customer'
              ? btnStrList[i].btnStr.indexOf(1) > -1
              : quickBtn.customer
          quickBtn.member =
            btnStrList[i].url === '/system/member'
              ? btnStrList[i].btnStr.indexOf(1) > -1
              : quickBtn.member
          quickBtn.account =
            btnStrList[i].url === '/system/account'
              ? btnStrList[i].btnStr.indexOf(1) > -1
              : quickBtn.account
          quickBtn.depot =
            btnStrList[i].url === '/system/depot'
              ? btnStrList[i].btnStr.indexOf(1) > -1
              : quickBtn.depot
        }
      }
    }
  }

  // ==================== 扩展字段 ====================

  /** 动态替换扩展字段标题 */
  function handleChangeOtherField() {
    const mpList = getStore('materialPropertyList') as any[] | null
    if (!mpList) return

    const mpStr = getMpListShort(mpList)
    if (mpStr) {
      const mpArr = mpStr.split(',')
      if (mpArr.length === 3) {
        for (let i = 0; i < materialTable.columns.length; i++) {
          if (materialTable.columns[i].key === 'otherField1') {
            materialTable.columns[i].title = mpArr[0]
          }
          if (materialTable.columns[i].key === 'otherField2') {
            materialTable.columns[i].title = mpArr[1]
          }
          if (materialTable.columns[i].key === 'otherField3') {
            materialTable.columns[i].title = mpArr[2]
          }
        }
      }
    }
  }

  // ==================== 审核标志辅助函数 ====================

  /** 获取审核标志 */
  function getCheckFlag(
    multiBillType: string,
    multiLevelApprovalFlag: string,
    prefix: string,
  ): boolean {
    if (multiLevelApprovalFlag === '1') {
      if (multiBillType) {
        const multiBillTypeArr = multiBillType.split(',')
        return multiBillTypeArr.indexOf(prefix) <= -1
      } else {
        return true
      }
    } else {
      return true
    }
  }

  // ==================== 生命周期 ====================

  /** 初始化屏幕宽度适配 */
  function initScreenWidth() {
    const realScreenWidth = window.screen.width
    width.value = realScreenWidth < 1500 ? '1200px' : '1550px'
    minWidth.value = realScreenWidth < 1500 ? 1150 : 1500
  }

  // 在 composable 创建时执行初始化
  initScreenWidth()

  onMounted(() => {
    bindKeydown()
  })

  onUnmounted(() => {
    unbindKeydown()
  })

  // ==================== 返回 ====================

  return {
    // ===== 响应式状态 =====
    action,
    manyAccountBtnStatus,
    supList,
    cusList,
    retailList,
    personList,
    currentSelectDepotId,
    transferParam,
    defaultDepotId,
    depotList,
    accountList,
    accountIdList,
    accountMoneyList,
    billUnitPirce,
    scanBarCode,
    scanStatus,
    billStatus,
    minWidth,
    width,
    isCanCheck,
    quickBtn,
    billPrintFlag,
    isShowPrintBtn,
    checkFlag,
    zeroChangeAmountFlag,
    purchaseBySaleFlag,
    inOutManageFlag,
    validatorRules,
    spans,

    // ===== 计算属性 =====
    readOnly,

    // ===== 初始化方法 =====
    addInit,
    copyAddInit,
    requestSubTableData,
    initSystemConfig,
    initSupplier,
    initCustomer,
    initRetail,
    initSalesman,
    initDepot,
    initAccount,
    initPlatform,
    initQuickBtn,
    initScreenWidth,

    // ===== 搜索方法 =====
    handleSearchSupplier,
    handleSearchCustomer,
    handleSearchRetail,

    // ===== 多账户 =====
    handleManyAccount,
    selectAccount,
    manyAccountModalFormOk,

    // ===== 快捷新增 =====
    addSupplier,
    addCustomer,
    addMember,
    handleBatchSetDepot,
    addDepot,
    addAccount,

    // ===== 快捷新增回调 =====
    vendorModalFormOk,
    customerModalFormOk,
    memberModalFormOk,
    batchSetDepotModalFormOk,
    depotModalFormOk,
    accountModalFormOk,
    workflowModalFormOk,

    // ===== 明细表事件 =====
    onAdded,
    onValueChange,
    onDeleted,

    // ===== 商品处理 =====
    parseInfoToObj,
    changeColumnHide,
    changeColumnShow,
    changeFormTypes,

    // ===== 库存 =====
    getStockByDepotBarCode,

    // ===== 价格联动 =====
    autoChangePrice,
    onChangeDiscount,
    onChangeDiscountMoney,
    onChangeOtherMoney,
    onChangeDeposit,
    onChangeChangeAmount,
    handleOrganChange,
    setZeroChangeAmount,

    // ===== 扫码 =====
    scanEnter,
    scanPressEnter,
    stopScan,

    // ===== 导入 =====
    onImport,
    importItemModalFormOk,

    // ===== 保存与审核 =====
    handleOk,
    handleOkAndCheck,
    handleOkOnly,

    // ===== 流程 =====
    handleWorkflow,

    // ===== 打印 =====
    handlePrint,
    handlePrintPro,

    // ===== 扩展字段 =====
    handleChangeOtherField,

    // ===== 快捷键 =====
    bindKeydown,
    unbindKeydown,
  }
}
