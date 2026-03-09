<template>
  <div class="editable-table-wrapper">
    <!-- 顶部操作栏 -->
    <div v-if="actionButton && !disabled" class="editable-table-toolbar">
      <el-button type="primary" :icon="Plus" size="small" @click="add()">新增行</el-button>
      <el-button
        type="danger"
        :icon="Delete"
        size="small"
        :disabled="selectedRowKeys.length === 0"
        @click="removeSelectedRows"
      >
        删除选中
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="rows"
      :max-height="maxHeight"
      :show-summary="hasStatistics"
      :summary-method="summaryMethod"
      :row-key="(row: RowData) => row._id"
      :row-class-name="rowClassName"
      border
      size="default"
      @selection-change="onSelectionChange"
    >
      <!-- 行号列 -->
      <el-table-column v-if="rowNumber" label="#" width="50" align="center" fixed="left">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>

      <!-- 选择列 -->
      <el-table-column
        v-if="rowSelection"
        type="selection"
        width="45"
        align="center"
        fixed="left"
      />

      <!-- 动态数据列 -->
      <el-table-column
        v-for="col in visibleColumns"
        :key="col.key"
        :label="col.title"
        :width="col.width"
        :min-width="col.width ? undefined : 120"
        :fixed="col.fixed"
        :align="col.type === 'inputNumber' || col.type === 'checkbox' ? 'center' : undefined"
      >
        <template #header>
          <span>{{ col.title }}</span>
          <span v-if="isRequired(col)" class="required-star">*</span>
        </template>
        <template #default="{ row, $index }">
          <!-- 验证提示包裹 -->
          <el-tooltip
            :visible="!!getError(row._id, col.key)"
            :content="getError(row._id, col.key)"
            placement="top"
            effect="dark"
            popper-class="editable-table-error-tip"
          >
            <div class="editable-cell" :class="{ 'has-error': !!getError(row._id, col.key) }">
              <!-- input -->
              <el-input
                v-if="col.type === 'input'"
                v-model="row[col.key]"
                :placeholder="col.placeholder || `请输入${col.title}`"
                :disabled="disabled || col.disabled"
                size="default"
                clearable
                @change="(val: string) => onCellChange(row, col, val)"
              />

              <!-- inputNumber -->
              <el-input-number
                v-else-if="col.type === 'inputNumber'"
                v-model="row[col.key]"
                :placeholder="col.placeholder"
                :disabled="disabled || col.disabled"
                :controls="false"
                size="default"
                class="w-full"
                @change="(val: number | undefined) => onCellChange(row, col, val)"
              />

              <!-- select -->
              <el-select
                v-else-if="col.type === 'select'"
                v-model="row[col.key]"
                :placeholder="col.placeholder || `请选择${col.title}`"
                :disabled="disabled || col.disabled"
                size="default"
                clearable
                class="w-full"
                @change="(val: any) => onCellChange(row, col, val)"
              >
                <el-option
                  v-for="opt in col.options || []"
                  :key="opt.value"
                  :label="opt.text"
                  :value="opt.value"
                />
              </el-select>

              <!-- checkbox -->
              <el-checkbox
                v-else-if="col.type === 'checkbox'"
                v-model="row[col.key]"
                :disabled="disabled || col.disabled"
                @change="(val: boolean) => onCellChange(row, col, val)"
              />

              <!-- date -->
              <el-date-picker
                v-else-if="col.type === 'date'"
                v-model="row[col.key]"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="col.placeholder || `请选择${col.title}`"
                :disabled="disabled || col.disabled"
                size="default"
                class="w-full"
                @change="(val: string) => onCellChange(row, col, val)"
              />

              <!-- datetime -->
              <el-date-picker
                v-else-if="col.type === 'datetime'"
                v-model="row[col.key]"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                :placeholder="col.placeholder || `请选择${col.title}`"
                :disabled="disabled || col.disabled"
                size="default"
                class="w-full"
                @change="(val: string) => onCellChange(row, col, val)"
              />

              <!-- popup: 点击触发弹出的输入框 -->
              <el-input
                v-else-if="col.type === 'popup'"
                v-model="row[col.key]"
                :placeholder="col.placeholder || `请选择${col.title}`"
                :disabled="disabled || col.disabled"
                readonly
                size="default"
                @click="onPopupClick(row, col, $index)"
              >
                <template #suffix>
                  <el-icon class="popup-trigger"><Search /></el-icon>
                </template>
              </el-input>

              <!-- slot: 自定义插槽 -->
              <slot v-else-if="col.type === 'slot'" :name="col.key" :row="row" :column="col" :index="$index" />

              <!-- normal: 纯文本展示 -->
              <span v-else>{{ row[col.key] ?? '' }}</span>
            </div>
          </el-tooltip>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        v-if="actionButton && !disabled"
        label="操作"
        width="100"
        align="center"
        fixed="right"
      >
        <template #default="{ $index }">
          <el-button link type="primary" size="small" @click="insert($index + 1)">
            <el-icon><Plus /></el-icon>
          </el-button>
          <el-button link type="danger" size="small" @click="removeRow($index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>

      <!-- 拖拽列 -->
      <el-table-column v-if="dragSort && !disabled" label="" width="40" align="center" fixed="left">
        <template #default>
          <el-icon class="drag-handle" style="cursor: move;"><Rank /></el-icon>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Plus, Delete, Search, Rank } from '@element-plus/icons-vue'
import type { TableInstance } from 'element-plus'

// ==================== 类型定义 ====================
export interface EditableColumn {
  title: string
  key: string
  type: 'input' | 'inputNumber' | 'select' | 'checkbox' | 'date' | 'datetime' | 'popup' | 'slot' | 'hidden' | 'normal'
  width?: number | string
  placeholder?: string
  defaultValue?: any
  options?: Array<{ value: any; text: string }>
  disabled?: boolean
  validateRules?: Array<{ required?: boolean; message?: string; pattern?: string }>
  statistics?: boolean
  fixed?: 'left' | 'right'
}

interface RowData {
  _id: string
  [key: string]: any
}

// ==================== Props & Emits ====================
const props = withDefaults(
  defineProps<{
    columns: EditableColumn[]
    dataSource?: any[]
    rowNumber?: boolean
    rowSelection?: boolean
    actionButton?: boolean
    maxHeight?: number
    disabled?: boolean
    dragSort?: boolean
    loading?: boolean
  }>(),
  {
    dataSource: () => [],
    rowNumber: false,
    rowSelection: false,
    actionButton: false,
    maxHeight: 400,
    disabled: false,
    dragSort: false,
    loading: false,
  }
)

const emit = defineEmits<{
  added: [payload: { row: RowData; target: RowData[] }]
  deleted: [payload: { deleteIds: string[]; target: RowData[] }]
  valueChange: [payload: { type: string; row: RowData; column: EditableColumn; value: any; target: RowData[] }]
  popupClick: [payload: { row: RowData; column: EditableColumn; index: number }]
}>()

// ==================== 响应式状态 ====================
const tableRef = ref<TableInstance>()
const rows = ref<RowData[]>([])
const deleteIds = ref<string[]>([])
const selectedRowKeys = ref<string[]>([])
const errors = ref<Record<string, Record<string, string>>>({}) // { rowId: { colKey: message } }
let idCounter = 0

// ==================== 计算属性 ====================
/** 可见列（过滤 hidden） */
const visibleColumns = computed(() => props.columns.filter((c) => c.type !== 'hidden'))

/** 是否存在需要统计的列 */
const hasStatistics = computed(() => props.columns.some((c) => c.statistics))

// ==================== ID 生成 ====================
function generateId(): string {
  return `_new_${Date.now()}_${++idCounter}`
}

// ==================== 创建行 ====================
function createRow(data?: Record<string, any>): RowData {
  const row: RowData = { _id: data?.id || data?._id || generateId() }
  for (const col of props.columns) {
    if (data && data[col.key] !== undefined) {
      row[col.key] = data[col.key]
    } else {
      row[col.key] = col.defaultValue ?? (col.type === 'checkbox' ? false : col.type === 'inputNumber' ? undefined : '')
    }
  }
  return row
}

// ==================== 行操作方法 ====================
/** 添加 N 行 */
function add(num = 1) {
  for (let i = 0; i < num; i++) {
    const row = createRow()
    rows.value.push(row)
    emit('added', { row, target: rows.value })
  }
}

/** 在指定位置插入一行 */
function insert(index: number) {
  const row = createRow()
  rows.value.splice(index, 0, row)
  emit('added', { row, target: rows.value })
}

/** 删除选中行 */
function removeSelectedRows() {
  if (selectedRowKeys.value.length === 0) return
  const ids = [...selectedRowKeys.value]
  doRemoveRows(ids)
}

/** 删除指定 ID 的行 */
function removeRows(ids: string[]) {
  doRemoveRows(ids)
}

/** 内部删除逻辑 */
function doRemoveRows(ids: string[]) {
  const idsToRemove = new Set(ids)
  // 记录被删除的「已保存」行 ID（非临时行）
  for (const id of ids) {
    if (!id.startsWith('_new_')) {
      deleteIds.value.push(id)
    }
    // 清除该行的验证错误
    delete errors.value[id]
  }
  rows.value = rows.value.filter((r) => !idsToRemove.has(r._id))
  selectedRowKeys.value = selectedRowKeys.value.filter((k) => !idsToRemove.has(k))
  emit('deleted', { deleteIds: ids, target: rows.value })
}

/** 删除单行（通过索引） */
function removeRow(index: number) {
  const row = rows.value[index]
  if (row) doRemoveRows([row._id])
}

// ==================== 数据获取与设置 ====================
/** 获取所有数据（可选验证） */
async function getValues(validate = true): Promise<{ values: any[]; deleteIds: string[] }> {
  if (validate) {
    const valid = await validateAll()
    if (!valid) {
      return Promise.reject(new Error('数据验证失败'))
    }
  }
  const values = rows.value.map((row) => {
    const item: Record<string, any> = {}
    // 保留原始 ID（非临时行）
    if (!row._id.startsWith('_new_')) {
      item.id = row._id
    }
    for (const col of props.columns) {
      item[col.key] = row[col.key]
    }
    return item
  })
  return { values, deleteIds: [...deleteIds.value] }
}

/** 获取已删除的 ID 列表 */
function getDeleteIds(): string[] {
  return [...deleteIds.value]
}

/** 设置数据 */
function setValues(values: any[]) {
  errors.value = {}
  deleteIds.value = []
  rows.value = values.map((item) => createRow(item))
}

/** 清除选择 */
function clearSelection() {
  tableRef.value?.clearSelection()
  selectedRowKeys.value = []
}

/** 获取某列的统计值 */
function getStatisticsValue(key: string): number {
  return rows.value.reduce((sum, row) => {
    const val = Number(row[key])
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
}

// ==================== 验证 ====================
function validateAll(): Promise<boolean> {
  errors.value = {}
  let hasError = false
  for (const row of rows.value) {
    for (const col of props.columns) {
      if (!col.validateRules) continue
      for (const rule of col.validateRules) {
        const val = row[col.key]
        // required
        if (rule.required && (val === '' || val === undefined || val === null)) {
          setError(row._id, col.key, rule.message || `${col.title}不能为空`)
          hasError = true
          break
        }
        // pattern
        if (rule.pattern && val !== '' && val !== undefined && val !== null) {
          const regex = new RegExp(rule.pattern)
          if (!regex.test(String(val))) {
            setError(row._id, col.key, rule.message || `${col.title}格式不正确`)
            hasError = true
            break
          }
        }
      }
    }
  }
  return Promise.resolve(!hasError)
}

function setError(rowId: string, colKey: string, message: string) {
  if (!errors.value[rowId]) errors.value[rowId] = {}
  errors.value[rowId][colKey] = message
}

function getError(rowId: string, colKey: string): string {
  return errors.value[rowId]?.[colKey] || ''
}

function isRequired(col: EditableColumn): boolean {
  return !!col.validateRules?.some((r) => r.required)
}

/** 单元格值变更时清除该字段的验证错误 */
function clearCellError(rowId: string, colKey: string) {
  if (errors.value[rowId]) {
    delete errors.value[rowId][colKey]
    if (Object.keys(errors.value[rowId]).length === 0) {
      delete errors.value[rowId]
    }
  }
}

// ==================== 事件处理 ====================
function onCellChange(row: RowData, col: EditableColumn, value: any) {
  clearCellError(row._id, col.key)
  emit('valueChange', { type: col.type, row, column: col, value, target: rows.value })
}

function onSelectionChange(selection: RowData[]) {
  selectedRowKeys.value = selection.map((r) => r._id)
}

function onPopupClick(row: RowData, col: EditableColumn, index: number) {
  emit('popupClick', { row, column: col, index })
}

// ==================== 统计行 ====================
function summaryMethod({ columns: tableCols, data }: { columns: any[]; data: RowData[] }) {
  const sums: string[] = []
  tableCols.forEach((_: any, colIndex: number) => {
    // 第一个可见列显示"合计"
    const offset = (props.rowNumber ? 1 : 0) + (props.rowSelection ? 1 : 0)
    if (colIndex === offset) {
      sums[colIndex] = '合计'
      return
    }
    // 匹配到 statistics 列则计算合计
    const actualIndex = colIndex - offset - (props.dragSort && !props.disabled ? 1 : 0)
    const col = visibleColumns.value[actualIndex]
    if (col?.statistics) {
      const total = data.reduce((sum, row) => {
        const val = Number(row[col.key])
        return sum + (isNaN(val) ? 0 : val)
      }, 0)
      // 保留两位小数
      sums[colIndex] = String(Math.round(total * 100) / 100)
    } else {
      sums[colIndex] = ''
    }
  })
  return sums
}

// ==================== 行样式（拖拽） ====================
function rowClassName({ row }: { row: RowData }) {
  return `editable-row editable-row-${row._id}`
}

// ==================== 拖拽排序 ====================
let dragState = { draggingIndex: -1 }

function initDragSort() {
  if (!props.dragSort || props.disabled) return
  nextTick(() => {
    const tableEl = tableRef.value?.$el as HTMLElement | undefined
    if (!tableEl) return
    const tbody = tableEl.querySelector('.el-table__body-wrapper tbody')
    if (!tbody) return

    tbody.addEventListener('dragstart', onDragStart as EventListener)
    tbody.addEventListener('dragover', onDragOver as EventListener)
    tbody.addEventListener('drop', onDrop as EventListener)
    tbody.addEventListener('dragend', onDragEnd as EventListener)

    // 给所有行设置 draggable
    setRowsDraggable(tbody as HTMLElement)
  })
}

function setRowsDraggable(tbody: HTMLElement) {
  const trList = tbody.querySelectorAll('tr')
  trList.forEach((tr, index) => {
    tr.setAttribute('draggable', 'true')
    tr.dataset.index = String(index)
  })
}

function onDragStart(e: DragEvent) {
  const target = (e.target as HTMLElement).closest('tr') as HTMLElement | null
  if (!target?.dataset.index) return
  dragState.draggingIndex = Number(target.dataset.index)
  target.classList.add('dragging')
  e.dataTransfer!.effectAllowed = 'move'
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const target = (e.target as HTMLElement).closest('tr') as HTMLElement | null
  if (!target?.dataset.index) return
  const fromIndex = dragState.draggingIndex
  const toIndex = Number(target.dataset.index)
  if (fromIndex === toIndex || fromIndex < 0) return
  // 交换行
  const item = rows.value.splice(fromIndex, 1)[0]
  rows.value.splice(toIndex, 0, item)
  // 刷新 draggable 属性
  nextTick(() => {
    const tableEl = tableRef.value?.$el as HTMLElement | undefined
    const tbody = tableEl?.querySelector('.el-table__body-wrapper tbody') as HTMLElement | null
    if (tbody) setRowsDraggable(tbody)
  })
}

function onDragEnd(e: DragEvent) {
  const target = (e.target as HTMLElement).closest('tr') as HTMLElement | null
  target?.classList.remove('dragging')
  dragState.draggingIndex = -1
}

function destroyDragSort() {
  const tableEl = tableRef.value?.$el as HTMLElement | undefined
  if (!tableEl) return
  const tbody = tableEl.querySelector('.el-table__body-wrapper tbody')
  if (!tbody) return
  tbody.removeEventListener('dragstart', onDragStart as EventListener)
  tbody.removeEventListener('dragover', onDragOver as EventListener)
  tbody.removeEventListener('drop', onDrop as EventListener)
  tbody.removeEventListener('dragend', onDragEnd as EventListener)
}

// ==================== 生命周期 ====================
watch(
  () => props.dataSource,
  (val) => {
    if (val && val.length > 0) {
      setValues(val)
    }
  },
  { immediate: true }
)

onMounted(() => {
  initDragSort()
})

onBeforeUnmount(() => {
  destroyDragSort()
})

// ==================== 暴露方法 ====================
defineExpose({
  add,
  insert,
  removeSelectedRows,
  removeRows,
  getValues,
  getDeleteIds,
  setValues,
  clearSelection,
  getStatisticsValue,
})
</script>

<style scoped lang="scss">
.editable-table-wrapper {
  width: 100%;

  .editable-table-toolbar {
    margin-bottom: 8px;
    display: flex;
    gap: 8px;
  }

  .editable-cell {
    width: 100%;

    &.has-error {
      :deep(.el-input__wrapper),
      :deep(.el-select .el-input__wrapper),
      :deep(.el-input-number .el-input__wrapper) {
        box-shadow: 0 0 0 1px var(--el-color-danger) inset;
      }
    }
  }

  .required-star {
    color: var(--el-color-danger);
    margin-left: 2px;
  }

  .popup-trigger {
    cursor: pointer;
    color: var(--el-color-primary);
  }

  .w-full {
    width: 100%;
  }

  .drag-handle {
    font-size: 16px;
    color: var(--el-text-color-secondary);

    &:hover {
      color: var(--el-color-primary);
    }
  }

  // 拖拽中的行样式
  :deep(.el-table__body-wrapper) {
    tr.dragging {
      opacity: 0.5;
      background-color: var(--el-color-primary-light-9);
    }
  }
}
</style>
