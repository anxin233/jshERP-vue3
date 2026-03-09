<template>
  <div class="pro-table-wrapper">
    <!-- 表格主体 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="dataSource"
      :height="scroll?.y"
      :max-height="scroll?.y"
      :size="size"
      :stripe="stripe"
      :border="border"
      :row-key="normalizedRowKey"
      :show-summary="showSummary"
      :summary-method="summaryMethod"
      :default-sort="defaultSort"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 行选择列 -->
      <el-table-column
        v-if="rowSelection"
        type="selection"
        width="55"
        align="center"
        fixed="left"
      />

      <!-- 递归渲染列 -->
      <template v-for="col in columns" :key="col.key || col.dataIndex">
        <pro-table-column :column="col">
          <!-- 透传所有具名插槽给子组件 -->
          <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps || {}" />
          </template>
        </pro-table-column>
      </template>
    </el-table>

    <!-- 分页器 -->
    <div v-if="pagination !== false && pagination" class="pro-table-pagination">
      <el-pagination
        v-model:current-page="paginationState.current"
        v-model:page-size="paginationState.pageSize"
        :page-sizes="paginationState.pageSizeOptions"
        :total="paginationState.total"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  defineComponent,
  h,
  useSlots,
  nextTick,
  type PropType,
} from 'vue'
import { ElTableColumn } from 'element-plus'
import type { TableInstance, TableColumnInstance } from 'element-plus'

/* ------------------------------------------------------------------ */
/*  类型定义                                                           */
/* ------------------------------------------------------------------ */
export interface ProColumn {
  /** 列标题 */
  title: string
  /** 数据字段名 */
  dataIndex: string
  /** 列标识 */
  key?: string
  /** 列宽 */
  width?: number | string
  /** 最小列宽 */
  minWidth?: number | string
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 固定列 */
  fixed?: 'left' | 'right' | boolean
  /** 是否可排序 */
  sorter?: boolean
  /** 是否省略溢出文字 */
  ellipsis?: boolean
  /** 自定义渲染插槽名 */
  customRender?: string
  /** 兼容 AntD scopedSlots 写法 */
  scopedSlots?: {
    customRender?: string
  }
  /** 多级表头子列 */
  children?: ProColumn[]
  /** 自定义类名 */
  className?: string
}

export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
}

/* ------------------------------------------------------------------ */
/*  Props & Emits                                                      */
/* ------------------------------------------------------------------ */
const props = withDefaults(
  defineProps<{
    /** 列配置数组 */
    columns: ProColumn[]
    /** 数据源 */
    dataSource: any[]
    /** 加载状态 */
    loading?: boolean
    /** 行 key */
    rowKey?: string | ((row: any) => string | number)
    /** 是否显示行选择 */
    rowSelection?: boolean
    /** 选中行的 key 数组 */
    selectedRowKeys?: any[]
    /** 分页配置，false 关闭分页 */
    pagination?: PaginationConfig | false
    /** 兼容原 scroll 配置 */
    scroll?: { x?: number; y?: number }
    /** 是否显示合计行 */
    showSummary?: boolean
    /** 合计方法 */
    summaryMethod?: (param: {
      columns: TableColumnInstance[]
      data: any[]
    }) => (string | number)[]
    /** 表格尺寸 */
    size?: '' | 'large' | 'default' | 'small'
    /** 斑马纹 */
    stripe?: boolean
    /** 边框 */
    border?: boolean
  }>(),
  {
    loading: false,
    rowKey: 'id',
    rowSelection: false,
    selectedRowKeys: () => [],
    pagination: false,
    showSummary: false,
    size: 'default',
    stripe: false,
    border: true,
  },
)

const emit = defineEmits<{
  /** 兼容原 AntD Table onChange */
  (
    e: 'change',
    pagination: PaginationConfig | null,
    filters: Record<string, any>,
    sorter: Record<string, any>,
  ): void
  /** 行选择变化 */
  (e: 'selectChange', selectedRowKeys: any[], selectedRows: any[]): void
  /** 排序变化 */
  (
    e: 'sortChange',
    payload: { column: any; prop: string; order: string | null },
  ): void
}>()

/* ------------------------------------------------------------------ */
/*  内部状态                                                           */
/* ------------------------------------------------------------------ */
const tableRef = ref<TableInstance>()
const parentSlots = useSlots()

// 当前排序信息（用于 change 事件）
const currentSorter = ref<Record<string, any>>({})

// 默认排序
const defaultSort = ref<{ prop: string; order: string } | undefined>(undefined)

/* ------------------------------------------------------------------ */
/*  rowKey 归一化                                                      */
/* ------------------------------------------------------------------ */
const normalizedRowKey = computed(() => {
  if (typeof props.rowKey === 'function') return props.rowKey
  return props.rowKey
})

/** 根据 rowKey 获取行的标识值 */
function getRowKeyValue(row: any): any {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  return row[props.rowKey as string]
}

/* ------------------------------------------------------------------ */
/*  分页                                                               */
/* ------------------------------------------------------------------ */
const paginationState = computed(() => {
  if (props.pagination === false) {
    return { current: 1, pageSize: 10, total: 0, pageSizeOptions: [10, 20, 50, 100] }
  }
  return {
    current: props.pagination.current,
    pageSize: props.pagination.pageSize,
    total: props.pagination.total,
    pageSizeOptions: props.pagination.pageSizeOptions ?? [10, 20, 50, 100],
  }
})

function handleCurrentChange(page: number) {
  if (props.pagination === false) return
  const newPagination: PaginationConfig = {
    ...props.pagination,
    current: page,
  }
  emit('change', newPagination, {}, currentSorter.value)
}

function handleSizeChange(size: number) {
  if (props.pagination === false) return
  const newPagination: PaginationConfig = {
    ...props.pagination,
    current: 1,
    pageSize: size,
  }
  emit('change', newPagination, {}, currentSorter.value)
}

/* ------------------------------------------------------------------ */
/*  行选择                                                             */
/* ------------------------------------------------------------------ */
function handleSelectionChange(rows: any[]) {
  const keys = rows.map((row) => getRowKeyValue(row))
  emit('selectChange', keys, rows)
}

// 当外部 selectedRowKeys 变化时同步勾选状态
watch(
  () => props.selectedRowKeys,
  (keys) => {
    nextTick(() => {
      if (!tableRef.value || !props.rowSelection) return
      // 先清空
      tableRef.value.clearSelection()
      if (!keys || keys.length === 0) return
      // 根据 key 找到对应行并勾选
      const keySet = new Set(keys)
      props.dataSource.forEach((row) => {
        if (keySet.has(getRowKeyValue(row))) {
          tableRef.value!.toggleRowSelection(row, true)
        }
      })
    })
  },
  { immediate: true, deep: true },
)

/* ------------------------------------------------------------------ */
/*  排序                                                               */
/* ------------------------------------------------------------------ */
function handleSortChange({
  column,
  prop,
  order,
}: {
  column: any
  prop: string
  order: string | null
}) {
  currentSorter.value = { column, prop, order }
  emit('sortChange', { column, prop, order })

  // 同时触发 change 事件，保持 AntD 兼容
  if (props.pagination !== false) {
    emit('change', { ...props.pagination }, {}, { column, prop, order })
  } else {
    emit('change', null, {}, { column, prop, order })
  }
}

/* ------------------------------------------------------------------ */
/*  暴露方法                                                           */
/* ------------------------------------------------------------------ */
defineExpose({
  /** 获取 el-table 实例 */
  getTableRef: () => tableRef.value,
  /** 清空选择 */
  clearSelection: () => tableRef.value?.clearSelection(),
  /** 手动切换行选中 */
  toggleRowSelection: (row: any, selected?: boolean) =>
    tableRef.value?.toggleRowSelection(row, selected),
  /** 排序 */
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order),
  /** 清空排序 */
  clearSort: () => tableRef.value?.clearSort(),
})

/* ------------------------------------------------------------------ */
/*  递归列子组件（处理多级表头 + 插槽映射）                              */
/* ------------------------------------------------------------------ */
/**
 * ProTableColumn - 递归渲染 el-table-column 的内部子组件
 * 通过 defineComponent 定义以支持递归调用自身
 */
const ProTableColumn = defineComponent({
  name: 'ProTableColumn',
  props: {
    column: {
      type: Object as PropType<ProColumn>,
      required: true,
    },
  },
  setup(columnProps, { slots: childSlots }) {
    /**
     * 将 AntD 的 fixed: true 转为 Element Plus 的 fixed="left"
     */
    function normalizeFixed(fixed?: 'left' | 'right' | boolean) {
      if (fixed === true) return 'left'
      if (fixed === false) return undefined
      return fixed
    }

    /**
     * 获取列的自定义渲染插槽名
     * 优先级：customRender > scopedSlots.customRender
     */
    function getSlotName(col: ProColumn): string | undefined {
      return col.customRender || col.scopedSlots?.customRender
    }

    return () => {
      const col = columnProps.column
      const slotName = getSlotName(col)
      const hasChildren = col.children && col.children.length > 0

      // 构建 el-table-column 的属性
      const columnAttrs: Record<string, any> = {
        label: col.title,
        prop: col.dataIndex,
        width: col.width,
        'min-width': col.minWidth,
        align: col.align || 'center',
        fixed: normalizeFixed(col.fixed),
        sortable: col.sorter ? 'custom' : false,
        'show-overflow-tooltip': col.ellipsis ?? false,
        'class-name': col.className,
      }

      // 子列渲染（多级表头）
      const childColumns = hasChildren
        ? col.children!.map((child) =>
            h(
              ProTableColumn,
              { column: child, key: child.key || child.dataIndex },
              // 把父级传下来的插槽继续透传
              childSlots,
            ),
          )
        : undefined

      // 构建当前列的插槽对象
      const columnSlots: Record<string, any> = {}

      // 1. 默认插槽（单元格内容）
      if (slotName && parentSlots[slotName] && !hasChildren) {
        // 有自定义渲染插槽：映射到 #default
        columnSlots.default = (scope: { row: any; $index: number }) => {
          // 兼容 AntD 的 { text, record, index } 参数格式
          return parentSlots[slotName]!({
            text: scope.row[col.dataIndex],
            record: scope.row,
            index: scope.$index,
            column: col,
          })
        }
      } else if (hasChildren) {
        // 多级表头：渲染子列
        columnSlots.default = () => childColumns
      }

      // 2. 表头插槽
      if (parentSlots['headerCell']) {
        columnSlots.header = (scope: { column: any; $index: number }) => {
          return parentSlots['headerCell']!({
            title: col.title,
            column: col,
          })
        }
      }

      return h(
        ElTableColumn,
        columnAttrs,
        columnSlots,
      )
    }
  },
})
</script>

<style scoped>
.pro-table-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.pro-table-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 0;
}
</style>
