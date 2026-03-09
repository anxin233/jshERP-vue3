/**
 * useEditableTable - 可编辑表格弹窗通用 Composable
 * 替代 Vue 2 JEditableTableMixin
 *
 * 配合 @/components/table/EditableTable.vue 组件使用，
 * 提供弹窗式新增/编辑表单 + 多子表的核心逻辑：
 * 获取子表实例、表单与子表联合验证、数据请求、弹窗开关等
 *
 * 使用方式：
 * ```ts
 * const {
 *   title, visible, confirmLoading, model, activeKey,
 *   labelCol, wrapperCol,
 *   tableRefs,
 *   add, edit, close,
 *   handleOk, handleCancel, handleChangeTabs,
 *   request, requestSubTableData,
 *   registerTableRef,
 * } = useEditableTable({
 *   refKeys: ['materialTable', 'accountTable'],
 *   url: { add: '/depot/add', edit: '/depot/edit' },
 *   addDefaultRowNum: 1,
 *   classifyIntoFormData: (allValues) => { ... },
 * })
 * ```
 */
import { ref, reactive, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getAction, httpAction } from '@/api/http'

// ==================== 类型定义 ====================

/** EditableTable 组件暴露的方法接口 */
export interface EditableTableExposed {
  add: (num?: number) => void
  insert: (index: number) => void
  removeSelectedRows: () => void
  removeRows: (ids: string[]) => void
  getValues: (validate?: boolean) => Promise<{ values: any[]; deleteIds: string[] }>
  getDeleteIds: () => string[]
  setValues: (values: any[]) => void
  clearSelection: () => void
  getStatisticsValue: (key: string) => number
}

/** 子表 tab 配置（用于 requestSubTableData） */
export interface SubTableTab {
  loading: boolean
  dataSource: any[]
  [key: string]: any
}

/** 联合验证结果 */
export interface AllValidatedValues {
  formValue: Record<string, any>
  tablesValue: Array<{ values: any[]; deleteIds: string[] }>
}

/** URL 配置 */
export interface EditableTableUrl {
  add: string
  edit: string
}

/** useEditableTable 配置选项 */
export interface UseEditableTableOptions {
  /** 各子表的 ref key 列表 */
  refKeys: string[]
  /** 新增/编辑 API 地址 */
  url: EditableTableUrl
  /** 新增时每个子表默认添加的行数，默认 1 */
  addDefaultRowNum?: number
  /**
   * 将验证通过的所有值（主表 + 子表）分类组装为提交数据
   * 必须由调用方提供
   */
  classifyIntoFormData?: (allValues: AllValidatedValues) => any
  /** 新增前钩子 */
  addBefore?: () => void
  /** 新增后钩子（model 已设置为空对象之后） */
  addAfter?: (model: Record<string, any>) => void
  /** 编辑前钩子 */
  editBefore?: (record: Record<string, any>) => void
  /** 编辑后钩子（model 已赋值之后） */
  editAfter?: (model: Record<string, any>) => void
  /** 请求成功回调（替代原 $emit('ok')） */
  onOk?: () => void
  /** 弹窗关闭回调（替代原 $emit('close')） */
  onClose?: () => void
}

// ==================== 验证常量 ====================

/** 表单验证未通过标识 */
const VALIDATE_NO_PASSED = Symbol('VALIDATE_NO_PASSED')

// ==================== Composable ====================

export function useEditableTable(options: UseEditableTableOptions) {
  // -------------------- 响应式状态 --------------------
  const title = ref('操作')
  const visible = ref(false)
  const confirmLoading = ref(false)
  const model = ref<Record<string, any>>({})
  const activeKey = ref(options.refKeys[0] || '')

  /** 表单布局（兼容 el-col span 布局） */
  const labelCol = reactive({ xs: { span: 24 }, sm: { span: 6 } })
  const wrapperCol = reactive({ xs: { span: 24 }, sm: { span: 18 } })

  // -------------------- Ref 管理 --------------------

  /**
   * 存储各子表 EditableTable 组件实例的 Map
   * key 为 refKeys 中的名称，value 为组件暴露的方法
   */
  const tableRefs = reactive<Record<string, EditableTableExposed | null>>({})

  /** 主表单 FormInstance 引用 */
  const formRef = ref<FormInstance | null>(null)

  /**
   * 注册子表 ref
   * 在模板中使用：:ref="(el) => registerTableRef('materialTable', el)"
   */
  function registerTableRef(key: string, el: any) {
    if (el) {
      tableRefs[key] = el as EditableTableExposed
    } else {
      tableRefs[key] = null
    }
  }

  /**
   * 注册主表单 ref
   * 在模板中使用：ref="formRef" 或 :ref="(el) => registerFormRef(el)"
   */
  function registerFormRef(el: any) {
    formRef.value = el as FormInstance
  }

  // -------------------- 获取子表实例 --------------------

  /**
   * 获取指定 key 的 EditableTable 实例
   * 等待组件挂载完成后返回（轮询机制，与原 getRefPromise 相同）
   */
  function getRefPromise(key: string): Promise<EditableTableExposed> {
    return new Promise((resolve) => {
      ;(function next() {
        const ref = tableRefs[key]
        if (ref) {
          resolve(ref)
        } else {
          setTimeout(() => next(), 10)
        }
      })()
    })
  }

  /**
   * 获取所有子表的 EditableTable 实例
   */
  function getAllTable(): Promise<EditableTableExposed[]> {
    if (!Array.isArray(options.refKeys)) {
      throw new Error(throwNotArray('refKeys'))
    }
    const values = options.refKeys.map((key) => getRefPromise(key))
    return Promise.all(values)
  }

  /**
   * 遍历所有 EditableTable 实例并执行回调
   */
  function eachAllTable(callback: (table: EditableTableExposed, index: number) => void) {
    getAllTable().then((tables) => {
      tables.forEach((item, index) => {
        if (typeof callback === 'function') {
          callback(item, index)
        }
      })
    })
  }

  // -------------------- 核心业务方法 --------------------

  /**
   * 新增操作
   * 打开弹窗并为每个子表添加默认空行
   */
  function add() {
    if (typeof options.addBefore === 'function') options.addBefore()

    let rowNum = options.addDefaultRowNum
    if (typeof rowNum !== 'number') {
      rowNum = 1
      console.warn(
        '由于你没有设置 addDefaultRowNum 或 addDefaultRowNum 不是数字，' +
          '所以默认添加一条空数据，如果不想默认添加空数据，请将 addDefaultRowNum 设为 0',
      )
    }

    eachAllTable((item) => {
      item.add(rowNum!)
    })

    if (typeof options.addAfter === 'function') options.addAfter(model.value)

    edit({})
  }

  /**
   * 编辑（修改）操作
   * 打开弹窗并加载 record 数据到 model
   */
  function edit(record: Record<string, any>) {
    if (typeof options.editBefore === 'function') options.editBefore(record)

    visible.value = true
    activeKey.value = options.refKeys[0] || ''

    // 重置主表单验证状态
    nextTick(() => {
      formRef.value?.resetFields()
    })

    model.value = Object.assign({}, record)

    if (typeof options.editAfter === 'function') options.editAfter(model.value)
  }

  /**
   * 关闭弹窗，并将所有子表回归到初始状态
   */
  function close() {
    visible.value = false
    eachAllTable((item) => {
      // 清空子表数据（对应原 initialize）
      item.setValues([])
    })
    if (typeof options.onClose === 'function') options.onClose()
  }

  /**
   * 查询某个子表 tab 的数据
   * @param url   请求地址
   * @param params 请求参数
   * @param tab   子表 tab 对象（含 loading、dataSource 属性）
   * @param success 成功回调
   */
  function requestSubTableData(
    url: string,
    params: Record<string, any>,
    tab: SubTableTab,
    success?: (res: any) => void,
  ) {
    tab.loading = true
    getAction(url, params)
      .then((res: any) => {
        if (res && res.code === 200) {
          tab.dataSource = res.data.rows
          if (typeof success === 'function') success(res)
        }
      })
      .finally(() => {
        tab.loading = false
      })
  }

  /**
   * 发起请求，自动判断是执行新增还是修改操作
   * @param formData 提交数据
   */
  function request(formData: any): Promise<void> {
    let url = options.url.add
    let method = 'post'
    if (model.value.id) {
      url = options.url.edit
      method = 'put'
    }

    confirmLoading.value = true
    return httpAction(url, formData, method)
      .then((res: any) => {
        if (res.code === 200) {
          if (typeof options.onOk === 'function') options.onOk()
          confirmLoading.value = false
          close()
        } else {
          ElMessage.warning(res.data?.message || res.data || '操作失败')
          confirmLoading.value = false
        }
      })
      .finally(() => {
        // confirmLoading 已在上方处理
      })
  }

  // -------------------- 表单与子表联合验证 --------------------

  /**
   * 验证主表单
   * 适配 Element Plus 的 FormInstance.validate()
   */
  function validateForm(): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      if (!formRef.value) {
        // 如果没有主表单，直接返回空值
        resolve({})
        return
      }
      formRef.value
        .validate()
        .then(() => {
          // Element Plus validate 成功时不返回值，使用 model 作为表单值
          resolve({ ...model.value })
        })
        .catch(() => {
          reject({ error: VALIDATE_NO_PASSED })
        })
    })
  }

  /**
   * 验证并获取所有子表的值
   * @param tables EditableTable 实例数组
   */
  function validateTables(
    tables: EditableTableExposed[],
  ): Promise<Array<{ values: any[]; deleteIds: string[] }>> {
    if (!Array.isArray(tables)) {
      throw new Error(`validateTables 的 tables 参数需要一个数组，而传入的是 ${typeof tables}`)
    }
    return new Promise((resolve, reject) => {
      const results: Array<{ values: any[]; deleteIds: string[] }> = []
      let index = 0

      if (!tables || tables.length === 0) {
        resolve(results)
        return
      }

      ;(function next() {
        const table = tables[index]
        table
          .getValues(true)
          .then((all) => {
            results[index] = all
            if (++index === tables.length) {
              resolve(results)
            } else {
              next()
            }
          })
          .catch(() => {
            // 子表验证未通过，返回失败并附带索引以便跳转到对应 tab
            reject({ error: VALIDATE_NO_PASSED, index })
          })
      })()
    })
  }

  /**
   * 一次性验证主表单和所有子表
   * @param tables EditableTable 实例数组
   */
  function validateFormAndTables(
    tables: EditableTableExposed[],
  ): Promise<AllValidatedValues> {
    const allValues: AllValidatedValues = {
      formValue: {},
      tablesValue: [],
    }

    return validateForm()
      .then((formValue) => {
        allValues.formValue = formValue
        return validateTables(tables)
      })
      .then((tablesValue) => {
        allValues.tablesValue = tablesValue
        return allValues
      })
  }

  /**
   * 不验证直接获取所有子表的数据
   * @param tables EditableTable 实例数组
   */
  function getListTables(
    tables: EditableTableExposed[],
  ): Promise<Array<{ values: any[]; deleteIds: string[] }>> {
    if (!Array.isArray(tables)) {
      throw new Error(`getListTables 的 tables 参数需要一个数组，而传入的是 ${typeof tables}`)
    }
    return new Promise((resolve, reject) => {
      const results: Array<{ values: any[]; deleteIds: string[] }> = []
      let index = 0

      if (!tables || tables.length === 0) {
        resolve(results)
        return
      }

      ;(function next() {
        const table = tables[index]
        table
          .getValues(false)
          .then((all) => {
            results[index] = all
            if (++index === tables.length) {
              resolve(results)
            } else {
              next()
            }
          })
          .catch((error) => {
            reject(error)
          })
      })()
    })
  }

  /**
   * 一次性获取主表单值（仅验证单号字段）和所有子表数据（不验证）
   * 对应原 JEditableTableUtil.getListData
   * @param fields 需要验证的字段名数组，默认 ['number']
   * @param tables EditableTable 实例数组
   */
  function getListData(
    tables: EditableTableExposed[],
    fields: string[] = ['number'],
  ): Promise<AllValidatedValues> {
    const allValues: AllValidatedValues = {
      formValue: {},
      tablesValue: [],
    }

    return new Promise<Record<string, any>>((resolve, reject) => {
      if (!formRef.value) {
        resolve({})
        return
      }
      formRef.value
        .validateField(fields)
        .then(() => {
          resolve({ ...model.value })
        })
        .catch(() => {
          reject({ error: VALIDATE_NO_PASSED })
        })
    })
      .then((formValue) => {
        allValues.formValue = formValue
        return getListTables(tables)
      })
      .then((tablesValue) => {
        allValues.tablesValue = tablesValue
        return allValues
      })
  }

  // -------------------- 事件处理 --------------------

  /**
   * Tab 选项卡切换事件
   * 自动重置 scrollTop 状态，防止出现白屏
   */
  function handleChangeTabs(key: string) {
    activeKey.value = key
    // Tab 切换后让目标子表刷新滚动位置
    getRefPromise(key).then(() => {
      // EditableTable 基于 el-table，切换 tab 后 nextTick 即可触发重排
      nextTick()
    })
  }

  /**
   * 关闭按钮点击事件
   */
  function handleCancel() {
    close()
  }

  /**
   * 确定按钮点击事件
   * 触发主表单 + 所有子表的验证，通过后调用 classifyIntoFormData 并提交
   */
  function handleOk() {
    getAllTable()
      .then((tables) => {
        return validateFormAndTables(tables)
      })
      .then((allValues) => {
        if (typeof options.classifyIntoFormData !== 'function') {
          throw new Error(throwNotFunction('classifyIntoFormData'))
        }
        const formData = options.classifyIntoFormData(allValues)
        return request(formData)
      })
      .catch((e: any) => {
        if (e && e.error === VALIDATE_NO_PASSED) {
          // 如果有未通过表单验证的子表，自动跳转到它所在的 tab
          if (e.index != null) {
            activeKey.value = options.refKeys[e.index]
          }
        } else {
          console.error(e)
        }
      })
  }

  // -------------------- 错误提示工具 --------------------

  /**
   * 生成 "未定义或不是一个函数" 的错误消息
   */
  function throwNotFunction(name: string): string {
    return `${name} 未定义或不是一个函数`
  }

  /**
   * 生成 "未定义或不是一个数组" 的错误消息
   */
  function throwNotArray(name: string): string {
    return `${name} 未定义或不是一个数组`
  }

  // -------------------- 返回 --------------------

  return {
    // State
    title,
    visible,
    confirmLoading,
    model,
    activeKey,
    labelCol,
    wrapperCol,

    // Refs
    tableRefs,
    formRef,

    // Ref 注册
    registerTableRef,
    registerFormRef,

    // 获取子表实例
    getRefPromise,
    getAllTable,
    eachAllTable,

    // 核心业务方法
    add,
    edit,
    close,
    requestSubTableData,
    request,

    // 验证方法
    validateForm,
    validateTables,
    validateFormAndTables,
    getListTables,
    getListData,

    // 事件处理
    handleChangeTabs,
    handleCancel,
    handleOk,

    // 工具
    throwNotFunction,
    throwNotArray,

    // 常量
    VALIDATE_NO_PASSED,
  }
}
