/**
 * useFinancialList - 财务列表页通用 Composable
 * 替代 Vue 2 FinancialListMixin
 *
 * 基于 useList 进行扩展，提供财务模块列表页的专用功能：
 * 审核管理、供应商/客户/机构/会员/人员/账户/收支项目初始化、
 * 搜索防抖、日期范围、单据导出等
 *
 * 使用方式：
 * ```ts
 * const {
 *   // useList 的所有返回值 ...
 *   checkFlag, isShowExcel, billExcelUrl, prefixNo, waitTotal,
 *   supList, cusList, organList, retailList, userList,
 *   personList, accountList, inOutItemList,
 *   myHandleAdd, myHandleEdit, myHandleDelete, myHandleDetail,
 *   handleApprove, initSystemConfig, ...
 * } = useFinancialList({
 *   url: { list: '/accountHead/list', delete: '/accountHead/delete' },
 *   prefixNo: 'SRI',
 *   columns: [...],
 * })
 * ```
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useList, type UseListOptions } from '@/composables/useList'
import { getAction } from '@/api/http'
import { getStore } from '@/utils/storage'
import { getCheckFlag } from '@/utils/index'
import {
  findBySelectSup,
  findBySelectCus,
  findBySelectOrgan,
  findBySelectRetail,
  getUserList as apiGetUserList,
  getPersonByType,
  getAccount,
  getCurrentSystemConfig,
  getPlatformConfigByKey,
  findInOutItemByParam,
} from '@/api/system'
import { findFinancialDetailByNumber } from '@/api/financial'
import { getNeedCount } from '@/api/bill'
import dayjs from 'dayjs'

/** useFinancialList 配置选项 */
export interface UseFinancialListOptions extends UseListOptions {
  /** 单据前缀编号，如 'SRI'、'SPO' 等 */
  prefixNo?: string
  /** 模态框 ref（modalForm），用于控制弹窗行为 */
  modalFormRef?: any
  /** 详情弹窗 ref（modalDetail） */
  modalDetailRef?: any
  /** 单据 Excel 导出 iframe ref */
  billExcelIframeRef?: any
}

/**
 * 获取当前日期格式化字符串
 */
function getFormatDate(): string {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * 获取前 N 个月的日期格式化字符串
 */
function getPrevMonthFormatDate(monthCount: number): string {
  return dayjs().subtract(monthCount, 'month').format('YYYY-MM-DD')
}

export function useFinancialList(options: UseFinancialListOptions) {
  // ==================== 扩展 useList ====================

  // 设置默认查询参数（日期范围）
  const defaultQueryParam = {
    beginTime: getPrevMonthFormatDate(3),
    endTime: getFormatDate(),
    createTimeRange: [getPrevMonthFormatDate(3), getFormatDate()] as string[],
    ...(options.queryParam || {}),
  }

  const listResult = useList({
    ...options,
    queryParam: defaultQueryParam,
    disableCreatedLoad: true, // 由本 composable 控制加载时机
  })

  // ==================== 财务列表专用 State ====================

  /** 原始审核是否开启 */
  const checkFlag = ref(true)
  /** 单据 Excel 是否开启 */
  const isShowExcel = ref(false)
  /** 防抖定时器句柄 */
  const setTimeFlag = ref<ReturnType<typeof setTimeout> | null>(null)
  /** 单据 Excel 导出地址 */
  const billExcelUrl = ref('')
  /** 单据前缀编号 */
  const prefixNo = ref(options.prefixNo || '')
  /** 待审核数量 */
  const waitTotal = ref(0)

  /** 供应商列表 */
  const supList = ref<any[]>([])
  /** 客户列表 */
  const cusList = ref<any[]>([])
  /** 机构列表 */
  const organList = ref<any[]>([])
  /** 会员列表 */
  const retailList = ref<any[]>([])
  /** 用户列表 */
  const userList = ref<any[]>([])
  /** 经手人列表 */
  const personList = ref<any[]>([])
  /** 账户列表 */
  const accountList = ref<any[]>([])
  /** 收支项目列表 */
  const inOutItemList = ref<any[]>([])

  // ==================== 计算属性 ====================

  /** Excel 导入 URL */
  const importExcelUrl = computed(() => {
    const domianURL = (window as any)._CONFIG?.domianURL || ''
    return `${domianURL}/${options.url.importExcelUrl || ''}`
  })

  /** 是否可以批量删除（检查所有选中行的 delete 权限） */
  const isBatchDelEnabled = computed(() => {
    for (let i = 0; i < listResult.selectedRowKeys.value.length; i++) {
      if (
        listResult.selectionRows.value[i] &&
        !listResult.selectionRows.value[i].actionsEnabled?.delete
      ) {
        return false
      }
    }
    return true
  })

  // ==================== 方法 ====================

  /**
   * 新增单据
   * @param modalFormRef 模态框组件引用
   * @param handleAdd useList 的 handleAdd 或父组件的新增方法
   */
  function myHandleAdd(modalFormRef: any, handleAddFn?: () => void) {
    if (modalFormRef) {
      modalFormRef.action = 'add'
      modalFormRef.actionWithOrgan = false
      if (listResult.btnEnableList.value.indexOf('2') === -1) {
        modalFormRef.isCanCheck = false
      }
    }
    if (handleAddFn) {
      handleAddFn()
    }
  }

  /**
   * 带机构的新增单据
   * @param modalFormRef 模态框组件引用
   * @param handleAdd useList 的 handleAdd 或父组件的新增方法
   */
  function myHandleAddWithOrgan(modalFormRef: any, handleAddFn?: () => void) {
    if (modalFormRef) {
      modalFormRef.action = 'add'
      modalFormRef.actionWithOrgan = true
      if (listResult.btnEnableList.value.indexOf('2') === -1) {
        modalFormRef.isCanCheck = false
      }
    }
    if (handleAddFn) {
      handleAddFn()
    }
  }

  /**
   * 编辑单据（只有未审核的单据才能编辑）
   * @param record 当前行数据
   * @param modalFormRef 模态框组件引用
   * @param handleEditFn 编辑处理函数
   */
  async function myHandleEdit(record: any, modalFormRef: any, handleEditFn?: (item: any) => void) {
    if (record.status === '0') {
      if (modalFormRef) {
        modalFormRef.action = 'edit'
        if (listResult.btnEnableList.value.indexOf('2') === -1) {
          modalFormRef.isCanCheck = false
        }
      }
      // 查询单条财务信息
      try {
        const res = await findFinancialDetailByNumber({ billNo: record.billNo })
        if (res && res.code === 200) {
          const item = res.data
          if (handleEditFn) {
            handleEditFn(item)
          }
        }
      } catch (err) {
        console.error('[useFinancialList] myHandleEdit error:', err)
      }
    } else {
      ElMessage.warning('抱歉，只有未审核的单据才能编辑，请先进行反审核！')
    }
  }

  /**
   * 删除单据（只有未审核的单据才能删除）
   * @param record 当前行数据
   */
  function myHandleDelete(record: any) {
    if (record.status === '0') {
      listResult.handleDelete(record.id)
    } else {
      ElMessage.warning('抱歉，只有未审核的单据才能删除，请先进行反审核！')
    }
  }

  /**
   * 查看详情
   * @param record 当前行数据
   * @param type 类型
   * @param prefixNoVal 前缀编号
   * @param modalDetailRef 详情弹窗引用
   * @param handleDetailFn 详情处理函数
   */
  function myHandleDetail(
    record: any,
    type: string,
    prefixNoVal: string,
    modalDetailRef: any,
    handleDetailFn?: (record: any, type: string, prefixNoVal: string) => void,
  ) {
    if (modalDetailRef) {
      if (listResult.btnEnableList.value.indexOf('7') === -1) {
        modalDetailRef.isCanBackCheck = false
      }
    }
    if (handleDetailFn) {
      handleDetailFn(record, type, prefixNoVal)
    }
  }

  /**
   * 审核单据
   * @param record 当前行数据
   * @param modalFormRef 模态框组件引用
   */
  function handleApprove(record: any, modalFormRef: any) {
    if (modalFormRef) {
      modalFormRef.action = 'approve'
      modalFormRef.edit(record)
      modalFormRef.title = '审核'
    }
  }

  /**
   * 重置搜索条件（保留 type 字段，重置日期范围）
   */
  function searchReset() {
    const currentType = listResult.queryParam.type
    Object.keys(listResult.queryParam).forEach((key) => {
      listResult.queryParam[key] = undefined
    })
    listResult.queryParam.type = currentType
    listResult.queryParam.beginTime = getPrevMonthFormatDate(3)
    listResult.queryParam.endTime = getFormatDate()
    listResult.queryParam.createTimeRange = [getPrevMonthFormatDate(3), getFormatDate()]
    listResult.loadData(1)
  }

  /**
   * 初始化系统配置（审核标志 + 单据 Excel URL）
   */
  async function initSystemConfig() {
    try {
      const res = await getCurrentSystemConfig()
      if (res.code === 200 && res.data) {
        const multiBillType = res.data.multiBillType
        const multiLevelApprovalFlag = res.data.multiLevelApprovalFlag
        checkFlag.value = getCheckFlag(multiBillType, multiLevelApprovalFlag, prefixNo.value)
      }
    } catch (err) {
      console.error('[useFinancialList] initSystemConfig error:', err)
    }

    try {
      const res = await getPlatformConfigByKey({ platformKey: 'bill_excel_url' })
      if (res && res.code === 200) {
        if (res.data.platformValue) {
          billExcelUrl.value = res.data.platformValue
        }
      }
    } catch (err) {
      console.error('[useFinancialList] getPlatformConfigByKey error:', err)
    }
  }

  /** 初始化供应商列表 */
  async function initSupplier() {
    try {
      const res = await findBySelectSup({ limit: 1 })
      if (res) {
        supList.value = res
      }
    } catch (err) {
      console.error('[useFinancialList] initSupplier error:', err)
    }
  }

  /** 初始化客户列表 */
  async function initCustomer() {
    try {
      const res = await findBySelectCus({ limit: 1 })
      if (res) {
        cusList.value = res
      }
    } catch (err) {
      console.error('[useFinancialList] initCustomer error:', err)
    }
  }

  /** 初始化机构列表 */
  async function initOrgan() {
    try {
      const res = await findBySelectOrgan({ limit: 1 })
      if (res) {
        organList.value = res
      }
    } catch (err) {
      console.error('[useFinancialList] initOrgan error:', err)
    }
  }

  /** 初始化会员列表 */
  async function initRetail() {
    try {
      const res = await findBySelectRetail({ limit: 1 })
      if (res) {
        retailList.value = res
      }
    } catch (err) {
      console.error('[useFinancialList] initRetail error:', err)
    }
  }

  /** 初始化用户列表 */
  async function initUser() {
    try {
      const res = await apiGetUserList({})
      if (res) {
        userList.value = res
      }
    } catch (err) {
      console.error('[useFinancialList] initUser error:', err)
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
      console.error('[useFinancialList] initPerson error:', err)
    }
  }

  /** 初始化账户列表 */
  async function initAccount() {
    try {
      const res = await getAccount({})
      if (res && res.code === 200) {
        accountList.value = res.data.accountList
      }
    } catch (err) {
      console.error('[useFinancialList] initAccount error:', err)
    }
  }

  /**
   * 初始化收支项目列表
   * @param type 收支项目类型
   */
  async function initInOutItem(type: string) {
    try {
      const res = await findInOutItemByParam({ type })
      if (res) {
        inOutItemList.value = res
      }
    } catch (err) {
      console.error('[useFinancialList] initInOutItem error:', err)
    }
  }

  /**
   * 获取待处理数量
   * @param type 类型
   */
  async function initGetNeedCount(type: string) {
    try {
      const res = await getNeedCount({ type })
      if (res && res.code === 200) {
        waitTotal.value = res.data.needCount
      }
    } catch (err) {
      console.error('[useFinancialList] initGetNeedCount error:', err)
    }
  }

  /**
   * 搜索供应商（带防抖 500ms）
   */
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

  /**
   * 搜索客户（带防抖 500ms）
   */
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

  /**
   * 搜索机构（带防抖 500ms）
   */
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

  /**
   * 搜索会员（带防抖 500ms）
   */
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

  /**
   * 日期范围变化事件
   * @param value 日期值（Element Plus DatePicker 的值）
   * @param dateString 格式化后的日期字符串数组 [开始日期, 结束日期]
   */
  function onDateChange(value: any, dateString?: string[]) {
    if (Array.isArray(value) && value.length === 2) {
      // Element Plus date-picker 返回的是 Date 对象或 dayjs 对象
      const start = dayjs(value[0]).format('YYYY-MM-DD')
      const end = dayjs(value[1]).format('YYYY-MM-DD')
      listResult.queryParam.beginTime = start
      listResult.queryParam.endTime = end
      listResult.queryParam.createTimeRange = [start, end]
    } else if (dateString && dateString.length === 2) {
      listResult.queryParam.beginTime = dateString[0]
      listResult.queryParam.endTime = dateString[1]
      if (dateString[0] && dateString[1]) {
        listResult.queryParam.createTimeRange = [dateString[0], dateString[1]]
      }
    } else {
      // 日期被清空
      listResult.queryParam.beginTime = ''
      listResult.queryParam.endTime = ''
      listResult.queryParam.createTimeRange = []
    }
  }

  /**
   * 日期确认事件
   */
  function onDateOk(value: any) {
    console.log(value)
  }

  /**
   * 导出单据
   * @param model 模型数据
   * @param billExcelIframeRef 单据 Excel iframe 引用
   */
  function handleExport(model: any, billExcelIframeRef: any) {
    const search = listResult.getQueryParams().search
    if (billExcelIframeRef) {
      billExcelIframeRef.show(model, billExcelUrl.value + '?search=' + search + '&type=2', 150)
      billExcelIframeRef.title = '确认导出'
    }
  }

  // ==================== 生命周期 ====================

  onMounted(() => {
    isShowExcel.value = getStore('isShowExcel') ?? false
    // 加载列表数据（useList 的 disableCreatedLoad 被设为 true）
    listResult.loadData()
    listResult.initActiveBtnStr()
  })

  // ==================== 返回 ====================

  return {
    // 透传 useList 的所有返回值
    ...listResult,

    // 财务列表专用 State
    checkFlag,
    isShowExcel,
    billExcelUrl,
    prefixNo,
    waitTotal,
    supList,
    cusList,
    organList,
    retailList,
    userList,
    personList,
    accountList,
    inOutItemList,

    // 计算属性
    importExcelUrl,
    isBatchDelEnabled,

    // 覆盖 useList 的 searchReset
    searchReset,

    // 财务列表专用方法
    myHandleAdd,
    myHandleAddWithOrgan,
    myHandleEdit,
    myHandleDelete,
    myHandleDetail,
    handleApprove,
    initSystemConfig,
    initSupplier,
    initCustomer,
    initOrgan,
    initRetail,
    initUser,
    initPerson,
    initAccount,
    initInOutItem,
    initGetNeedCount,
    handleSearchSupplier,
    handleSearchCustomer,
    handleSearchOrgan,
    handleSearchRetail,
    onDateChange,
    onDateOk,
    handleExport,
  }
}
