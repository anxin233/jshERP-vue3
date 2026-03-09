<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    @close="handleCancel"
    top="20px"
  >
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-row :gutter="24">
          <el-col :md="12" :sm="24">
            <el-form-item :label="organType">
              <el-select
                v-model="queryParam.organId"
                :placeholder="'请选择' + organType"
                clearable
                filterable
                remote
                :remote-method="handleSearchSupplier"
                style="width: 100%"
              >
                <el-option
                  v-for="item in supList"
                  :key="item.id"
                  :label="item.supplier"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="12" :sm="24">
            <el-button type="primary" @click="searchQuery">查询</el-button>
            <el-button @click="searchReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- table区域 -->
    <el-table
      :data="dataSource"
      border
      size="default"
      row-key="id"
      v-loading="loading"
      style="width: 100%"
    >
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <a @click="handleAction(row)" style="color: #409eff; cursor: pointer;">{{ actionType }}</a>
        </template>
      </el-table-column>
      <el-table-column :label="organType" prop="supplier" width="400" show-overflow-tooltip />
      <el-table-column label="欠款金额" prop="allNeed" width="150" />
    </el-table>

    <!-- 分页 -->
    <div style="text-align: right; margin-top: 10px;">
      <el-pagination
        v-model:current-page="ipagination.current"
        v-model:page-size="ipagination.pageSize"
        :total="ipagination.total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <div style="margin-top: 10px;">
      注意：具体欠款详情，请到<b>报表查询</b>中的<b>{{ organType }}对账</b>查看
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消(ESC)</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getAction } from '@/api/http'
import { findBySelectCus, findBySelectSup } from '@/api/system'
import dayjs from 'dayjs'

const emit = defineEmits<{
  ok: [organType: string, organId: string | number, rows: any[]]
  close: []
}>()

const visible = ref(false)
const title = ref('操作')
const loading = ref(false)
const organType = ref('')
const actionType = ref('')
const dataSource = ref<any[]>([])
const supList = ref<any[]>([])

let setTimeFlag: ReturnType<typeof setTimeout> | null = null

function getFormatDate(): string {
  return dayjs().format('YYYY-MM-DD')
}

const queryParam = reactive<Record<string, any>>({
  organId: undefined,
  supplierType: '',
  hasDebt: '1',
  beginTime: '1990-01-01',
  endTime: getFormatDate(),
})

const ipagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

function loadData(page?: number) {
  if (page) ipagination.current = page
  loading.value = true
  const params = {
    ...queryParam,
    currentPage: ipagination.current,
    pageSize: ipagination.pageSize,
  }
  getAction('/depotHead/getStatementAccount', params)
    .then((res: any) => {
      if (res && res.code === 200) {
        dataSource.value = res.data.rows || []
        ipagination.total = res.data.total || 0
      }
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}

/**
 * 显示待收/待付款列表弹窗
 * @param type 机构类型（客户/供应商）
 */
function show(type: string) {
  organType.value = type
  visible.value = true

  if (type === '客户') {
    title.value = '待收款客户'
    queryParam.supplierType = '客户'
    actionType.value = '收款'
  } else if (type === '供应商') {
    title.value = '待付款供应商'
    queryParam.supplierType = '供应商'
    actionType.value = '付款'
  }

  loadData(1)
  initSupplier()
}

function initSupplier() {
  if (organType.value === '客户') {
    findBySelectCus({ limit: 1 }).then((res: any) => {
      if (res) {
        supList.value = res
      }
    })
  } else if (organType.value === '供应商') {
    findBySelectSup({ limit: 1 }).then((res: any) => {
      if (res) {
        supList.value = res
      }
    })
  }
}

function handleSearchSupplier(value: string) {
  if (setTimeFlag) clearTimeout(setTimeFlag)
  if (organType.value === '客户') {
    setTimeFlag = setTimeout(() => {
      findBySelectCus({ key: value, limit: 1 }).then((res: any) => {
        if (res) supList.value = res
      })
    }, 500)
  } else if (organType.value === '供应商') {
    setTimeFlag = setTimeout(() => {
      findBySelectSup({ key: value, limit: 1 }).then((res: any) => {
        if (res) supList.value = res
      })
    }, 500)
  }
}

/**
 * 选择供应商进行付款 / 选择客户进行收款
 * 查询该机构的所有欠款单据，通过 ok 事件返回给父组件
 */
function handleAction(record: any) {
  let type = ''
  let subType = ''
  if (organType.value === '客户') {
    type = '出库'
    subType = '销售'
  } else if (organType.value === '供应商') {
    type = '入库'
    subType = '采购'
  }

  const params: Record<string, any> = {
    search: {
      organId: record.id,
      materialParam: '',
      number: '',
      type,
      subType,
      status: '',
    },
    currentPage: 1,
    pageSize: 1000,
  }

  getAction('/depotHead/debtList', params).then((res: any) => {
    if (res.code === 200) {
      const rows = res.data.rows || []
      emit('ok', organType.value, record.id, rows)
      close()
    }
  })
}

function searchQuery() {
  loadData(1)
}

function searchReset() {
  queryParam.organId = undefined
  queryParam.supplierType = organType.value
  queryParam.hasDebt = '1'
  queryParam.beginTime = '1990-01-01'
  queryParam.endTime = getFormatDate()
  loadData(1)
}

function handleSizeChange(val: number) {
  ipagination.pageSize = val
  loadData(1)
}

function handleCurrentChange(val: number) {
  ipagination.current = val
  loadData()
}

function close() {
  emit('close')
  visible.value = false
}

function handleCancel() {
  close()
}

defineExpose({ show })
</script>
