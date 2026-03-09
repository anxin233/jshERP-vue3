/**
 * useFinancialModal - 财务单据弹窗通用 Composable
 * 替代 Vue 2 FinancialModalMixin
 *
 * 提供财务弹窗的核心功能：单据初始化、审核管理、
 * 供应商/客户/账户/经手人/收支项目管理、明细表操作、
 * 快捷键支持、快捷按钮权限、欠款选择等
 *
 * 使用方式：
 * ```ts
 * const {
 *   action, readOnly, billStatus, checkFlag,
 *   supList, cusList, accountList, personList,
 *   addInit, initSystemConfig, handleOkAndCheck, handleOkOnly,
 *   // ...
 * } = useFinancialModal({
 *   prefixNo: 'SRI',
 *   handleOk: () => { ... },  // 实际保存方法
 *   close: () => { ... },     // 关闭弹窗方法
 * })
 * ```
 */
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAction } from '@/api/http'
import { getStore } from '@/utils/storage'
import { getCheckFlag } from '@/utils/index'
import {
  findBySelectSup,
  findBySelectCus,
  findBySelectRetail,
  findBySelectOrgan,
  getPersonByType,
  getAccount,
  findInOutItemByParam,
  getCurrentSystemConfig,
  getPlatformConfigByKey,
} from '@/api/system'
import dayjs from 'dayjs'

/** 快捷按钮权限 */
export interface QuickBtn {
  vendor: boolean
  customer: boolean
  account: boolean
  person: boolean
  inOutItem: boolean
}

/** 明细表配置 */
export interface AccountTable {
  columns: any[]
  dataSource: any[]
  loading?: boolean
  [key: string]: any
}

/** useFinancialModal 配置选项 */
export interface UseFinancialModalOptions {
  /** 单据前缀编号，如 'SRI'、'SPO' 等 */
  prefixNo: string
  /** 保存处理函数 */
  handleOk?: () => void
  /** 关闭弹窗函数 */
  close?: () => void
  /** 表单模型（reactive 对象） */
  model?: Record<string, any>
  /** 明细表配置 */
  accountTable?: AccountTable
}

/**
 * 获取当前日期时间格式化字符串
 */
function getNowFormatDateTime(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export function useFinancialModal(options: UseFinancialModalOptions) {
  // ==================== State ====================

  /** 当前操作类型：add | edit | approve */
  const action = ref('')
  /** 是否带机构新增 */
  const actionWithOrgan = ref(false)
  /** 供应商列表 */
  const supList = ref<any[]>([])
  /** 客户列表 */
  const cusList = ref<any[]>([])
  /** 会员列表 */
  const retailList = ref<any[]>([])
  /** 机构列表 */
  const organList = ref<any[]>([])
  /** 经手人列表 */
  const personList = ref<any[]>([])
  /** 账户列表 */
  const accountList = ref<any[]>([])
  /** 单据状态：'0' 未审核，'1' 已审核 */
  const billStatus = ref('0')
  /** 是否可审核 */
  const isCanCheck = ref(true)
  /** 快捷按钮权限 */
  const quickBtn = reactive<QuickBtn>({
    vendor: false,
    customer: false,
    account: false,
    person: false,
    inOutItem: false,
  })
  /** 原始审核是否开启 */
  const checkFlag = ref(true)
  /** 防抖定时器句柄 */
  const setTimeFlag = ref<ReturnType<typeof setTimeout> | null>(null)

  /** 弹窗宽度 */
  const width = ref('1200px')
  /** 弹窗最小宽度 */
  const minWidth = ref(1150)

  // ==================== 计算属性 ====================

  /** 是否只读（非新增且非编辑时为只读） */
  const readOnly = computed(() => {
    return action.value !== 'add' && action.value !== 'edit'
  })

  // ==================== 快捷键 ====================

  /**
   * 快捷键处理：Ctrl+S 保存
   */
  function handleOkKey(e: KeyboardEvent) {
    const key = e.keyCode || e.which
    if (key === 83 && e.ctrlKey) {
      // 保存 CTRL+S
      if (options.handleOk) {
        options.handleOk()
      }
      e.preventDefault()
    }
  }

  /**
   * 绑定快捷键事件
   * @param elementId 绑定事件的 DOM 元素 ID
   */
  function bindOkKey(elementId: string) {
    const el = document.getElementById(elementId)
    if (el) {
      el.addEventListener('keydown', handleOkKey)
    }
  }

  /**
   * 解绑快捷键事件
   * @param elementId 绑定事件的 DOM 元素 ID
   */
  function unbindOkKey(elementId: string) {
    const el = document.getElementById(elementId)
    if (el) {
      el.removeEventListener('keydown', handleOkKey)
    }
  }

  // ==================== 初始化方法 ====================

  /**
   * 新增初始化
   * 获取单据编号、设置默认时间/金额、设置默认账户
   * @param amountNum 单据前缀
   * @param formModel 表单数据（reactive 对象）
   */
  async function addInit(amountNum: string, formModel: Record<string, any>) {
    try {
      const res = await getAction('/sequence/buildNumber')
      if (res && res.code === 200) {
        formModel.billNo = amountNum + res.data.defaultNumber
      }
    } catch (err) {
      console.error('[useFinancialModal] addInit buildNumber error:', err)
    }

    await nextTick()
    formModel.billTime = getNowFormatDateTime()
    formModel.totalPrice = 0
    formModel.discountMoney = 0
    formModel.changeAmount = 0

    await nextTick()
    try {
      const res = await getAccount({})
      if (res && res.code === 200) {
        for (const item of res.data.accountList) {
          if (item.isDefault) {
            formModel.accountId = item.id
          }
        }
      }
    } catch (err) {
      console.error('[useFinancialModal] addInit getAccount error:', err)
    }
  }

  /**
   * 初始化系统配置（审核标志）
   */
  async function initSystemConfig() {
    try {
      const res = await getCurrentSystemConfig()
      if (res.code === 200 && res.data) {
        const multiBillType = res.data.multiBillType
        const multiLevelApprovalFlag = res.data.multiLevelApprovalFlag
        checkFlag.value = getCheckFlag(multiBillType, multiLevelApprovalFlag, options.prefixNo)
      }
    } catch (err) {
      console.error('[useFinancialModal] initSystemConfig error:', err)
    }
  }

  /**
   * 初始化供应商列表
   * @param organId 机构 ID（可选）
   */
  async function initSupplier(organId?: string | number) {
    try {
      const params: any = { limit: 1 }
      if (organId) params.organId = organId
      const res = await findBySelectSup(params)
      if (res) {
        supList.value = res
      }
    } catch (err) {
      console.error('[useFinancialModal] initSupplier error:', err)
    }
  }

  /**
   * 初始化客户列表
   * @param organId 机构 ID（可选）
   */
  async function initCustomer(organId?: string | number) {
    try {
      const params: any = { limit: 1 }
      if (organId) params.organId = organId
      const res = await findBySelectCus(params)
      if (res) {
        cusList.value = res
      }
    } catch (err) {
      console.error('[useFinancialModal] initCustomer error:', err)
    }
  }

  /**
   * 初始化机构列表
   * @param organId 机构 ID（可选）
   */
  async function initOrgan(organId?: string | number) {
    try {
      const params: any = { limit: 1 }
      if (organId) params.organId = organId
      const res = await findBySelectOrgan(params)
      if (res) {
        organList.value = res
      }
    } catch (err) {
      console.error('[useFinancialModal] initOrgan error:', err)
    }
  }

  /**
   * 初始化会员列表
   * @param organId 机构 ID（可选）
   */
  async function initRetail(organId?: string | number) {
    try {
      const params: any = { limit: 1 }
      if (organId) params.organId = organId
      const res = await findBySelectRetail(params)
      if (res) {
        retailList.value = res
      }
    } catch (err) {
      console.error('[useFinancialModal] initRetail error:', err)
    }
  }

  /** 初始化经手人列表 */
  async function initPerson() {
    try {
      const res = await getPersonByType({ type: '财务员' })
      if (res && res.code === 200) {
        personList.value = res.data.personList
      }
    } catch (err) {
      console.error('[useFinancialModal] initPerson error:', err)
    }
  }

  /**
   * 初始化收支项目列表（用于明细表下拉选择）
   * @param type 收支项目类型
   * @param accountTable 明细表配置
   */
  async function initInOutItem(type: string, accountTable?: AccountTable) {
    try {
      const res = await findInOutItemByParam({ type })
      if (res) {
        const table = accountTable || options.accountTable
        if (table) {
          for (const item of table.columns) {
            if (item.key === 'inOutItemId') {
              item.options = []
              for (let i = 0; i < res.length; i++) {
                item.options.push({
                  value: res[i].id + '', // 注意-此处 value 必须为字符串格式
                  text: res[i].name,
                  title: res[i].name,
                })
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('[useFinancialModal] initInOutItem error:', err)
    }
  }

  /**
   * 初始化账户列表（用于主表）
   */
  async function initAccount() {
    try {
      const res = await getAccount({})
      if (res && res.code === 200) {
        accountList.value = res.data.accountList
      }
    } catch (err) {
      console.error('[useFinancialModal] initAccount error:', err)
    }
  }

  /**
   * 初始化账户列表（用于明细表下拉选择）
   * @param accountTable 明细表配置
   */
  async function initDetailAccount(accountTable?: AccountTable) {
    try {
      const res = await getAccount({})
      if (res && res.code === 200) {
        const list = res.data.accountList
        const table = accountTable || options.accountTable
        if (table) {
          for (const item of table.columns) {
            if (item.key === 'accountId') {
              item.options = []
              for (let i = 0; i < list.length; i++) {
                item.options.push({
                  value: list[i].id + '', // 注意-此处 value 必须为字符串格式
                  text: list[i].name,
                  title: list[i].name,
                })
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('[useFinancialModal] initDetailAccount error:', err)
    }
  }

  // ==================== 搜索方法（带防抖 500ms） ====================

  /** 搜索供应商 */
  function handleSearchSupplier(value: string) {
    if (setTimeFlag.value != null) {
      clearTimeout(setTimeFlag.value)
    }
    setTimeFlag.value = setTimeout(() => {
      findBySelectSup({ key: value, limit: 1 }).then((res: any) => {
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
      findBySelectCus({ key: value, limit: 1 }).then((res: any) => {
        if (res) {
          cusList.value = res
        }
      })
    }, 500)
  }

  /** 搜索机构 */
  function handleSearchOrgan(value: string) {
    if (setTimeFlag.value != null) {
      clearTimeout(setTimeFlag.value)
    }
    setTimeFlag.value = setTimeout(() => {
      findBySelectOrgan({ key: value, limit: 1 }).then((res: any) => {
        if (res) {
          organList.value = res
        }
      })
    }, 500)
  }

  /** 搜索会员 */
  function handleSearchRetail(value: string) {
    if (setTimeFlag.value != null) {
      clearTimeout(setTimeFlag.value)
    }
    setTimeFlag.value = setTimeout(() => {
      findBySelectRetail({ key: value, limit: 1 }).then((res: any) => {
        if (res) {
          retailList.value = res
        }
      })
    }, 500)
  }

  // ==================== 选择/事件处理 ====================

  /**
   * 选择供应商或客户的触发事件（清空明细表）
   * @param value 选中的值
   * @param accountTable 明细表配置
   */
  function onChangeOrgan(value: any, accountTable?: AccountTable) {
    const table = accountTable || options.accountTable
    if (table) {
      table.dataSource = []
    }
  }

  // ==================== 快捷新增弹窗 ====================

  /**
   * 新增供应商
   * @param vendorModalFormRef 供应商弹窗引用
   */
  function addSupplier(vendorModalFormRef: any) {
    if (vendorModalFormRef) {
      vendorModalFormRef.add()
      vendorModalFormRef.title = '新增'
      vendorModalFormRef.disableSubmit = false
    }
  }

  /**
   * 新增客户
   * @param customerModalFormRef 客户弹窗引用
   */
  function addCustomer(customerModalFormRef: any) {
    if (customerModalFormRef) {
      customerModalFormRef.add()
      customerModalFormRef.title = '新增客户（提醒：如果找不到新添加的客户，请到用户管理检查是否分配了该客户权限）'
      customerModalFormRef.disableSubmit = false
    }
  }

  /**
   * 新增结算账户
   * @param accountModalFormRef 账户弹窗引用
   */
  function addAccount(accountModalFormRef: any) {
    if (accountModalFormRef) {
      accountModalFormRef.add()
      accountModalFormRef.title = '新增结算账户'
      accountModalFormRef.disableSubmit = false
    }
  }

  /**
   * 新增经手人
   * @param personModalFormRef 经手人弹窗引用
   */
  function addPerson(personModalFormRef: any) {
    if (personModalFormRef) {
      personModalFormRef.add()
      personModalFormRef.title = '新增经手人'
      personModalFormRef.disableSubmit = false
    }
  }

  /**
   * 新增收支项目
   * @param type 收支项目类型
   * @param inOutItemModalFormRef 收支项目弹窗引用
   */
  function addInOutItem(type: string, inOutItemModalFormRef: any) {
    if (inOutItemModalFormRef) {
      inOutItemModalFormRef.add(type)
      inOutItemModalFormRef.title = '新增收支项目'
      inOutItemModalFormRef.disableSubmit = false
    }
  }

  // ==================== 弹窗回调 ====================

  /** 供应商弹窗保存成功回调 */
  function vendorModalFormOk() {
    initSupplier()
  }

  /** 客户弹窗保存成功回调 */
  function customerModalFormOk() {
    initCustomer()
  }

  /** 账户弹窗保存成功回调 */
  function accountModalFormOk() {
    initAccount()
  }

  /** 经手人弹窗保存成功回调 */
  function personModalFormOk() {
    initPerson()
  }

  /**
   * 收支项目弹窗保存成功回调
   * @param type 收支项目类型
   */
  function inOutItemModalFormOk(type: string) {
    initInOutItem(type)
  }

  /** 流程弹窗保存成功回调 */
  function workflowModalFormOk() {
    if (options.close) {
      options.close()
    }
  }

  // ==================== 待收/待付款处理 ====================

  /**
   * 待收/待付款列表确认回调
   * @param organType 机构类型：'供应商' | '客户'
   * @param organId 机构 ID
   * @param selectBillRows 选中的单据行
   * @param formModel 表单数据
   * @param accountTable 明细表配置
   * @param requestSubTableDataExFn 填充明细表的函数
   */
  async function waitNeedListOk(
    organType: string,
    organId: string | number,
    selectBillRows: any[],
    formModel: Record<string, any>,
    accountTable?: AccountTable,
    requestSubTableDataExFn?: (rows: any[], table: AccountTable) => void,
  ) {
    if (organId) {
      formModel.organId = organId
      if (organType === '供应商') {
        try {
          const res = await findBySelectSup({ organId, limit: 1 })
          supList.value = res && Array.isArray(res) ? res : []
        } catch { /* empty */ }
      } else if (organType === '客户') {
        try {
          const res = await findBySelectCus({ organId, limit: 1 })
          cusList.value = res && Array.isArray(res) ? res : []
        } catch { /* empty */ }
      }
    }
    const table = accountTable || options.accountTable
    if (selectBillRows && selectBillRows.length > 0 && table) {
      if (requestSubTableDataExFn) {
        requestSubTableDataExFn(selectBillRows, table)
      } else {
        requestSubTableDataEx(selectBillRows, table, formModel)
      }
    } else {
      selectBeginNeed(organType, formModel, table)
    }
  }

  // ==================== 明细表事件 ====================

  /**
   * 新增行后自动滚动到最后一行
   * @param event 事件对象 { row, target }
   * @param accountDataTableRef 明细表组件引用
   */
  function onAdded(event: { row: any; target: any }, accountDataTableRef?: any) {
    const { target } = event
    if (accountDataTableRef) {
      setTimeout(() => {
        accountDataTableRef.resetScrollTop(
          (target.rows.length + 1) * accountDataTableRef.rowHeight,
        )
      }, 1000)
    }
  }

  /**
   * 删除行后重新计算统计列和欠款金额
   * @param ids 删除的行 ID
   * @param target 表格 target
   * @param formModel 表单数据
   */
  function onDeleted(ids: any, target: any, formModel?: Record<string, any>) {
    target.recalcAllStatisticsColumns()
    autoChangeAmount(target, formModel)
  }

  /**
   * 单元值改变时触发（每改变一个字符触发一次）
   * @param event 事件对象 { type, row, column, value, target }
   * @param formModel 表单数据
   */
  function onValueChange(event: { type: string; row: any; column: any; value: any; target: any }, formModel?: Record<string, any>) {
    const { column, target } = event
    switch (column.key) {
      case 'eachAmount':
        target.recalcAllStatisticsColumns()
        autoChangeAmount(target, formModel)
        break
    }
  }

  /**
   * 自动改变本次欠款的值
   * @param target 明细表 target（包含 statisticsColumns）
   * @param formModel 表单数据
   */
  function autoChangeAmount(target: any, formModel?: Record<string, any>) {
    const model = formModel || options.model
    if (!model) return

    const allEachAmount = Number(target.statisticsColumns.eachAmount) || 0
    let discountMoney = Number(model.discountMoney) || 0
    const changeAmount = (allEachAmount - discountMoney).toFixed(2)

    nextTick(() => {
      model.totalPrice = allEachAmount
      model.changeAmount = changeAmount
    })
  }

  /**
   * 改变优惠金额时重新计算实付金额
   * @param value 优惠金额值
   * @param formModel 表单数据
   */
  function onChangeDiscountMoney(value: number | string, formModel?: Record<string, any>) {
    const model = formModel || options.model
    if (!model) return

    const numValue = Number(value) || 0
    const totalPrice = Number(model.totalPrice) || 0
    const changeAmount = (totalPrice - numValue).toFixed(2)

    nextTick(() => {
      model.changeAmount = changeAmount
    })
  }

  /**
   * 选择欠款单据回调
   * @param selectBillRows 选中的单据行
   * @param accountTable 明细表配置
   * @param formModel 表单数据
   */
  function debtBillListOk(selectBillRows: any[], accountTable?: AccountTable, formModel?: Record<string, any>) {
    const table = accountTable || options.accountTable
    if (selectBillRows && selectBillRows.length > 0 && table) {
      requestSubTableDataEx(selectBillRows, table, formModel)
    }
  }

  /**
   * 查询明细数据，给明细里面的金额赋值
   * @param selectBillRows 选中的单据行
   * @param tab 明细表配置
   * @param formModel 表单数据
   * @param success 成功回调
   */
  function requestSubTableDataEx(
    selectBillRows: any[],
    tab: AccountTable,
    formModel?: Record<string, any>,
    success?: (res?: any) => void,
  ) {
    tab.loading = true
    const listEx: any[] = []
    let changeAmount = 0

    for (let i = 0; i < selectBillRows.length; i++) {
      const info = selectBillRows[i]
      info.billNumber = info.number
      info.needDebt = info.needDebt
      info.eachAmount = info.debt
      if (info.eachAmount !== 0) {
        changeAmount += Number(info.eachAmount) || 0
        listEx.push(info)
      }
    }

    tab.dataSource = listEx

    const model = formModel || options.model
    if (model) {
      nextTick(() => {
        model.totalPrice = changeAmount.toFixed(2)
        model.changeAmount = changeAmount.toFixed(2)
      })
    }

    if (typeof success === 'function') {
      success()
    }
    tab.loading = false
  }

  /**
   * 选择期初金额
   * @param type 类型：'供应商' | '客户'
   * @param formModel 表单数据
   * @param accountTable 明细表配置
   */
  function selectBeginNeed(type: string, formModel?: Record<string, any>, accountTable?: AccountTable) {
    const model = formModel || options.model
    const table = accountTable || options.accountTable
    if (!model) return

    const organId = model.organId
    if (organId) {
      const info = type === '供应商' ? '付款' : '收款'
      ElMessageBox.confirm(
        '是否选择期初金额，对期初进行' + info + '?',
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
        .then(() => {
          const listEx: any[] = []
          const beginInfo: Record<string, any> = {}
          beginInfo.billNumber = 'QiChu'
          getAction('/supplier/getBeginNeedByOrganId', { organId }).then((res: any) => {
            if (res.code === 200) {
              beginInfo.needDebt = res.data.needDebt ? res.data.needDebt : 0
              beginInfo.finishDebt = res.data.finishDebt
              beginInfo.eachAmount = res.data.eachAmount
              listEx.push(beginInfo)
              if (table) {
                table.dataSource = listEx
              }
              let amountVal = beginInfo.eachAmount
              if (amountVal) {
                amountVal = amountVal.toFixed(2)
              }
              nextTick(() => {
                model.totalPrice = amountVal
                model.changeAmount = amountVal
              })
            } else {
              ElMessage.info(res.data)
            }
          })
        })
        .catch(() => {
          // 取消
        })
    } else {
      ElMessage.warning('请选择' + type + '！')
    }
  }

  /**
   * 选择-待收款或者待付款
   * @param type 类型
   * @param waitNeedListRef 待收/付款列表组件引用
   */
  function handleWaitNeed(type: string, waitNeedListRef: any) {
    if (waitNeedListRef) {
      waitNeedListRef.show(type)
    }
  }

  // ==================== 保存/审核 ====================

  /** 保存并审核 */
  function handleOkAndCheck() {
    billStatus.value = '1'
    if (options.handleOk) {
      options.handleOk()
    }
  }

  /** 仅保存 */
  function handleOkOnly() {
    billStatus.value = '0'
    if (options.handleOk) {
      options.handleOk()
    }
  }

  /**
   * 发起流程
   * @param model 模型数据
   * @param modalWorkflowRef 流程弹窗引用
   */
  async function handleWorkflow(model?: Record<string, any>, modalWorkflowRef?: any) {
    const currentModel = model || options.model
    if (currentModel && currentModel.billNo) {
      try {
        const res = await getPlatformConfigByKey({ platformKey: 'send_workflow_url' })
        if (res && res.code === 200) {
          const sendWorkflowUrl =
            res.data.platformValue + '&no=' + currentModel.billNo + '&type=2'
          if (modalWorkflowRef) {
            modalWorkflowRef.show(currentModel, sendWorkflowUrl, currentModel.billNo, 2, 320)
            modalWorkflowRef.title = '发起流程'
          }
        }
      } catch (err) {
        console.error('[useFinancialModal] handleWorkflow error:', err)
      }
    } else {
      ElMessage.warning('请先保存单据后再提交流程！')
    }
  }

  /**
   * 加载快捷按钮权限：供应商、客户、结算账户、经手人、收支项目
   */
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
          quickBtn.account =
            btnStrList[i].url === '/system/account'
              ? btnStrList[i].btnStr.indexOf(1) > -1
              : quickBtn.account
          quickBtn.person =
            btnStrList[i].url === '/system/person'
              ? btnStrList[i].btnStr.indexOf(1) > -1
              : quickBtn.person
          quickBtn.inOutItem =
            btnStrList[i].url === '/system/in_out_item'
              ? btnStrList[i].btnStr.indexOf(1) > -1
              : quickBtn.inOutItem
        }
      }
    }
  }

  // ==================== 生命周期 ====================

  onMounted(() => {
    // 根据屏幕宽度设置弹窗尺寸
    const realScreenWidth = window.screen.width
    width.value = realScreenWidth < 1500 ? '1200px' : '1550px'
    minWidth.value = realScreenWidth < 1500 ? 1150 : 1500

    // 绑定快捷键
    bindOkKey(options.prefixNo)
  })

  onBeforeUnmount(() => {
    // 解绑快捷键
    unbindOkKey(options.prefixNo)
  })

  // ==================== 返回 ====================

  return {
    // State
    action,
    actionWithOrgan,
    supList,
    cusList,
    retailList,
    organList,
    personList,
    accountList,
    billStatus,
    isCanCheck,
    quickBtn,
    checkFlag,
    setTimeFlag,
    width,
    minWidth,

    // 计算属性
    readOnly,

    // 快捷键
    handleOkKey,
    bindOkKey,
    unbindOkKey,

    // 初始化方法
    addInit,
    initSystemConfig,
    initSupplier,
    initCustomer,
    initOrgan,
    initRetail,
    initPerson,
    initInOutItem,
    initAccount,
    initDetailAccount,

    // 搜索方法
    handleSearchSupplier,
    handleSearchCustomer,
    handleSearchOrgan,
    handleSearchRetail,

    // 选择/事件处理
    onChangeOrgan,

    // 快捷新增弹窗
    addSupplier,
    addCustomer,
    addAccount,
    addPerson,
    addInOutItem,

    // 弹窗回调
    vendorModalFormOk,
    customerModalFormOk,
    accountModalFormOk,
    personModalFormOk,
    inOutItemModalFormOk,
    workflowModalFormOk,

    // 待收/待付款处理
    waitNeedListOk,

    // 明细表事件
    onAdded,
    onDeleted,
    onValueChange,
    autoChangeAmount,
    onChangeDiscountMoney,
    debtBillListOk,
    requestSubTableDataEx,
    selectBeginNeed,
    handleWaitNeed,

    // 保存/审核
    handleOkAndCheck,
    handleOkOnly,
    handleWorkflow,

    // 快捷按钮权限
    initQuickBtn,
  }
}
