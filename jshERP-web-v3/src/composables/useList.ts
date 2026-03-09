/**
 * useList - 列表页通用 Composable
 * 替代 Vue 2 JeecgListMixin（~575 行）
 *
 * 提供列表页的核心功能：数据加载、分页、排序、搜索、选择、
 * 批量操作、导出导入、列设置、按钮权限等
 *
 * 使用方式：
 * ```ts
 * const {
 *   loading, dataSource, columns, selectedRowKeys,
 *   ipagination, toggleSearchStatus,
 *   loadData, searchQuery, searchReset, handleTableChange,
 *   onSelectChange, onClearSelected, batchDel, handleDelete,
 * } = useList({
 *   url: { list: '/user/list', delete: '/user/delete', deleteBatch: '/user/deleteBatch' },
 *   columns: [...],
 * })
 * ```
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAction, deleteAction, postAction, downFile, downFilePost } from '@/api/http'
import { filterObj, getMpListShort } from '@/utils/index'
import { getStore, setStore, clearStore } from '@/utils/storage'
import { useDevice } from '@/composables/useDevice'
import dayjs from 'dayjs'

/** 列定义接口（兼容原 AntD Table columns） */
export interface ListColumn {
  title: string
  dataIndex: string
  key?: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right' | boolean
  sorter?: boolean
  ellipsis?: boolean
  customRender?: string
  scopedSlots?: { customRender?: string }
  children?: ListColumn[]
  [key: string]: any
}

/** URL 配置 */
export interface ListUrl {
  list: string
  delete?: string
  deleteBatch?: string
  exportXlsUrl?: string
  importExcelUrl?: string
  batchSetStatusUrl?: string
}

/** useList 配置选项 */
export interface UseListOptions {
  /** API URL 配置 */
  url: ListUrl
  /** 默认列定义（完整列表，含列设置功能） */
  defColumns?: ListColumn[]
  /** 默认显示的列索引 */
  defDataIndex?: string[]
  /** 初始查询条件 */
  queryParam?: Record<string, any>
  /** 页面名称（用于列设置存储 key） */
  pageName?: string
  /** URL 路径（用于按钮权限匹配） */
  urlPath?: string
  /** 默认排序字段 */
  sortColumn?: string
  /** 默认排序方向 */
  sortOrder?: 'asc' | 'desc'
  /** 默认分页大小 */
  pageSize?: number
  /** 是否禁用 created 时自动加载数据 */
  disableCreatedLoad?: boolean
}

export function useList(options: UseListOptions) {
  const { isMobile } = useDevice()

  // ==================== State ====================
  const loading = ref(false)
  const dataSource = ref<any[]>([])
  const queryParam = reactive<Record<string, any>>(options.queryParam || {})

  // 列
  const columns = ref<ListColumn[]>(options.defColumns || [])
  const settingDataIndex = ref<string[]>(options.defDataIndex || [])

  // 分页
  const ipagination = reactive({
    current: 1,
    pageSize: options.pageSize || 10,
    pageSizeOptions: [10, 20, 30, 50, 100],
    total: 0,
  })

  // 排序
  const isorter = reactive({
    column: options.sortColumn || 'createTime',
    order: options.sortOrder || 'desc',
  })

  // 筛选
  const filters = reactive<Record<string, any>>({})

  // 选择
  const selectedRowKeys = ref<any[]>([])
  const selectionRows = ref<any[]>([])

  // 搜索折叠
  const toggleSearchStatus = ref(false)

  // 按钮权限
  const btnEnableList = ref('')

  // ==================== 核心方法 ====================

  /**
   * 加载数据
   * @param arg 传入 1 则重置到第一页
   */
  async function loadData(arg?: number) {
    if (!options.url.list) {
      ElMessage.error('请设置 url.list 属性!')
      return
    }
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
      console.error('[useList] loadData error:', err)
    } finally {
      loading.value = false
      onClearSelected()
    }
  }

  /**
   * 获取查询参数
   */
  function getQueryParams(): Record<string, any> {
    const searchObj: Record<string, any> = {}
    searchObj.search = JSON.stringify(queryParam)
    const param = Object.assign({}, searchObj, isorter, filters)
    param.field = getQueryField()
    param.currentPage = ipagination.current
    param.pageSize = ipagination.pageSize
    return filterObj(param) || {}
  }

  /**
   * 获取查询字段（用于后端字段过滤）
   */
  function getQueryField(): string {
    let str = 'id,'
    columns.value.forEach((col) => {
      if (col.dataIndex) {
        str += ',' + col.dataIndex
      }
    })
    return str
  }

  /**
   * 搜索查询
   */
  function searchQuery() {
    loadData(1)
  }

  /**
   * 重置搜索
   */
  function searchReset() {
    // 重置所有查询条件
    Object.keys(queryParam).forEach((key) => {
      queryParam[key] = undefined
    })
    loadData(1)
  }

  /**
   * 切换搜索展开/折叠
   */
  function handleToggleSearch() {
    toggleSearchStatus.value = !toggleSearchStatus.value
  }

  // ==================== 表格事件 ====================

  /**
   * ProTable 的 change 事件处理
   * 兼容原 AntD Table 的 handleTableChange(pagination, filters, sorter)
   */
  function handleTableChange(
    pagination: any,
    _filters?: any,
    sorter?: any,
  ) {
    // 处理排序
    if (sorter && Object.keys(sorter).length > 0) {
      if (sorter.order) {
        isorter.column = sorter.prop || sorter.field || sorter.column
        isorter.order = sorter.order === 'ascending' || sorter.order === 'ascend' ? 'asc' : 'desc'
      } else {
        isorter.column = options.sortColumn || 'createTime'
        isorter.order = options.sortOrder || 'desc'
      }
    }

    // 处理分页
    if (pagination) {
      if (typeof pagination === 'object') {
        ipagination.current = pagination.current || pagination.currentPage || 1
        ipagination.pageSize = pagination.pageSize || 10
      }
    }

    loadData()
  }

  /**
   * 分页变化
   */
  function paginationChange(page: number, pageSize: number) {
    ipagination.current = page
    ipagination.pageSize = pageSize
    loadData()
  }

  /**
   * 分页大小变化
   */
  function paginationShowSizeChange(current: number, size: number) {
    ipagination.current = 1
    ipagination.pageSize = size
    loadData()
  }

  // ==================== 选择相关 ====================

  /**
   * 行选择变化
   */
  function onSelectChange(keys: any[], rows: any[]) {
    selectedRowKeys.value = keys
    selectionRows.value = rows
  }

  /**
   * 清空选择
   */
  function onClearSelected() {
    selectedRowKeys.value = []
    selectionRows.value = []
  }

  // ==================== CRUD 操作 ====================

  /**
   * 批量删除
   */
  function batchDel() {
    if (!options.url.deleteBatch) {
      ElMessage.error('请设置 url.deleteBatch 属性!')
      return
    }
    if (selectedRowKeys.value.length <= 0) {
      ElMessage.warning('请选择一条记录！')
      return
    }

    const ids = selectedRowKeys.value.join(',')

    ElMessageBox.confirm('是否删除选中数据?', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        loading.value = true
        try {
          const res = await deleteAction(options.url.deleteBatch!, { ids })
          if (res.code === 200) {
            loadData()
          } else {
            ElMessage.warning(res.data?.message || '删除失败')
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
   * 单条删除
   */
  async function handleDelete(id: string | number) {
    if (!options.url.delete) {
      ElMessage.error('请设置 url.delete 属性!')
      return
    }
    try {
      const res = await deleteAction(options.url.delete, { id })
      if (res.code === 200) {
        loadData()
      } else {
        ElMessage.warning(res.data?.message || '删除失败')
      }
    } catch (err) {
      console.error('[useList] handleDelete error:', err)
    }
  }

  /**
   * 批量设置状态
   */
  function batchSetStatus(status: string | number) {
    if (!options.url.batchSetStatusUrl) {
      ElMessage.error('请设置 url.batchSetStatusUrl 属性!')
      return
    }
    if (selectedRowKeys.value.length <= 0) {
      ElMessage.warning('请选择一条记录！')
      return
    }

    const ids = selectedRowKeys.value.join(',')

    ElMessageBox.confirm('是否操作选中数据?', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        loading.value = true
        try {
          const res = await postAction(options.url.batchSetStatusUrl!, { status, ids })
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
   * 新增/修改成功后刷新列表
   */
  function modalFormOk() {
    loadData()
  }

  /**
   * 弹窗关闭后刷新列表
   */
  function modalFormClose() {
    loadData()
  }

  // ==================== 列设置 ====================

  /**
   * 初始化列设置
   */
  function initColumnsSetting() {
    if (!options.pageName || !options.defColumns) return

    const columnsStr = getStore(options.pageName) as string | null
    if (columnsStr && columnsStr.indexOf(',') > -1) {
      settingDataIndex.value = columnsStr.split(',')
    } else {
      settingDataIndex.value = options.defDataIndex || options.defColumns.map((c) => c.dataIndex)
    }
    columns.value = options.defColumns.filter((item) =>
      settingDataIndex.value.includes(item.dataIndex),
    )
  }

  /**
   * 列设置变更
   */
  function onColChange(checkedValues: string[]) {
    if (!options.defColumns || !options.pageName) return

    columns.value = options.defColumns.filter((item) =>
      checkedValues.includes(item.dataIndex),
    )
    setStore(options.pageName, checkedValues.join(','))
  }

  /**
   * 恢复默认列设置
   */
  function handleRestDefault() {
    if (options.pageName) {
      clearStore(options.pageName)
    }
    initColumnsSetting()
  }

  // ==================== 导出导入 ====================

  /**
   * 导出 Excel (GET 方式)
   */
  async function handleExportXls(fileName?: string) {
    if (!options.url.exportXlsUrl) {
      ElMessage.error('请设置 url.exportXlsUrl 属性!')
      return
    }
    if (!fileName) {
      fileName = '导出文件'
    }

    const param: Record<string, any> = { ...queryParam }
    if (selectedRowKeys.value.length > 0) {
      param.selections = selectedRowKeys.value.join(',')
    }

    try {
      const data = await downFile(options.url.exportXlsUrl, param)
      if (!data) {
        ElMessage.warning('文件下载失败')
        return
      }
      downloadBlob(data, fileName)
    } catch (err) {
      ElMessage.error('导出失败')
    }
  }

  /**
   * 导出 Excel (POST 方式)
   */
  async function handleExportXlsPost(
    fileName: string,
    title: string,
    head: any,
    tip: string,
    list: any[],
  ) {
    if (!fileName) fileName = '导出文件'
    const paramObj = { title, head, tip, list }
    try {
      const data = await downFilePost(paramObj)
      if (!data) {
        ElMessage.warning('文件下载失败')
        return
      }
      downloadBlob(data, fileName)
    } catch (err) {
      ElMessage.error('导出失败')
    }
  }

  /**
   * 下载 Blob 数据为文件
   */
  function downloadBlob(data: any, fileName: string) {
    const url = window.URL.createObjectURL(
      new Blob([data], { type: 'application/vnd.ms-excel' }),
    )
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', `${fileName}_${dayjs().format('YYYYMMDDHHmmss')}.xls`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // ==================== 合计行 ====================

  /**
   * 表格增加合计行
   * 当 pageSize % 10 === 1 时启用（pageSize=11,21,31...）
   */
  function tableAddTotalRow(cols: ListColumn[], data: any[]) {
    if (data.length > 0 && ipagination.pageSize % 10 === 1) {
      const numKey = 'rowIndex'
      const totalRow: Record<string, any> = { [numKey]: '合计' }

      // 需要合计的列
      const parseCols =
        'initialStock,currentStock,currentStockPrice,currentWeight,initialAmount,thisMonthAmount,' +
        'currentAmount,inSum,inSumPrice,inOutSumPrice,outSum,outSumPrice,outInSumPrice,' +
        'operNumber,allPrice,numSum,priceSum,prevSum,thisSum,thisAllPrice,changeAmount,' +
        'taxMoney,currentNumber,lowCritical,highCritical,preNeed,debtMoney,backMoney,allNeed,' +
        'needDebt,realNeedDebt,finishDebt,debt,'

      cols.forEach((col) => {
        const { dataIndex } = col
        if (dataIndex === numKey) return

        let total: number | string = 0
        data.forEach((row) => {
          if (parseCols.indexOf(dataIndex + ',') > -1) {
            total = (total as number) + (Number.parseFloat(row[dataIndex]) || 0)
          } else {
            total = '-'
          }
        })
        if (total !== '-') {
          total = (total as number).toFixed(2)
        }
        totalRow[dataIndex] = total
      })
      data.push(totalRow)

      // 总数要增加合计行数
      const size = Math.ceil(ipagination.total / (ipagination.pageSize - 1))
      ipagination.total = ipagination.total + size
    }
  }

  // ==================== 按钮权限 ====================

  /**
   * 初始化按钮权限
   */
  function initActiveBtnStr() {
    const btnStrList = getStore('winBtnStrList') as any[] | null
    btnEnableList.value = ''
    if (options.urlPath && btnStrList) {
      for (let i = 0; i < btnStrList.length; i++) {
        if (btnStrList[i].url === options.urlPath) {
          if (btnStrList[i].btnStr) {
            btnEnableList.value = btnStrList[i].btnStr
          }
        }
      }
    }
  }

  // ==================== 扩展字段 ====================

  /**
   * 动态替换扩展字段标题
   */
  function handleChangeOtherField(queryTitle?: Record<string, string>) {
    const mpList = getStore('materialPropertyList') as any[] | null
    if (!mpList) return

    const mpStr = getMpListShort(mpList)
    if (!mpStr) return

    const mpArr = mpStr.split(',')
    if (mpArr.length !== 3) return

    // 更新查询标题
    if (queryTitle) {
      queryTitle.mp1 = mpArr[0]
      queryTitle.mp2 = mpArr[1]
      queryTitle.mp3 = mpArr[2]
    }

    // 更新列标题
    if (options.defColumns) {
      for (const col of options.defColumns) {
        if (col.dataIndex === 'otherField1') col.title = mpArr[0]
        if (col.dataIndex === 'otherField2') col.title = mpArr[1]
        if (col.dataIndex === 'otherField3') col.title = mpArr[2]
      }
    }
  }

  // ==================== 生命周期 ====================

  onMounted(() => {
    if (!options.disableCreatedLoad) {
      loadData()
      initActiveBtnStr()
    }
    if (options.defColumns && options.defDataIndex) {
      initColumnsSetting()
    }
  })

  // ==================== 返回 ====================

  return {
    // State
    loading,
    dataSource,
    queryParam,
    columns,
    settingDataIndex,
    ipagination,
    isorter,
    filters,
    selectedRowKeys,
    selectionRows,
    toggleSearchStatus,
    btnEnableList,

    // Core methods
    loadData,
    getQueryParams,
    searchQuery,
    searchReset,
    handleToggleSearch,

    // Table events
    handleTableChange,
    paginationChange,
    paginationShowSizeChange,

    // Selection
    onSelectChange,
    onClearSelected,

    // CRUD
    batchDel,
    handleDelete,
    batchSetStatus,
    modalFormOk,
    modalFormClose,

    // Column settings
    initColumnsSetting,
    onColChange,
    handleRestDefault,

    // Export/Import
    handleExportXls,
    handleExportXlsPost,

    // Utils
    tableAddTotalRow,
    handleChangeOtherField,
    initActiveBtnStr,
  }
}
