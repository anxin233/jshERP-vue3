<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="1300px"
    :close-on-click-modal="false"
    @close="handleCancel"
    top="50px"
  >
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-row :gutter="24">
          <el-col :md="4" :sm="24" v-if="organLabel">
            <el-form-item :label="organLabel">
              <el-select
                v-model="queryParam.organId"
                placeholder="请选择"
                clearable
                filterable
                remote
                :remote-method="handleSearchSupplier"
                style="width: 100%"
              >
                <el-option
                  v-for="item in supplierList"
                  :key="item.id"
                  :label="item.supplier"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="5" :sm="24">
            <el-form-item label="单号">
              <el-input v-model="queryParam.number" placeholder="请输入单据编号" />
            </el-form-item>
          </el-col>
          <el-col :md="5" :sm="24">
            <el-form-item label="商品">
              <el-input v-model="queryParam.materialParam" placeholder="条码|名称|规格|型号" />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="单据日期">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                @change="onDateChange"
              />
            </el-form-item>
          </el-col>
          <el-col :md="4" :sm="24">
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
      @sort-change="handleSortChange"
      style="width: 100%"
    >
      <el-table-column type="index" label="#" width="40" align="center" />
      <el-table-column
        v-if="organLabel"
        :label="organLabel"
        prop="organName"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column label="单据编号" prop="number" width="150">
        <template #default="{ row }">
          <a @click="myHandleDetail(row)" style="color: #409eff; cursor: pointer;">{{ row.number }}</a>
        </template>
      </el-table-column>
      <el-table-column label="商品信息" prop="materialsList" width="280" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.materialsList ? row.materialsList.replace(',', '，') : '' }}
        </template>
      </el-table-column>
      <el-table-column label="单据日期" prop="operTimeStr" width="145" />
      <el-table-column label="操作员" prop="userName" width="70" />
      <el-table-column label="数量" prop="materialCount" width="50" />
      <el-table-column
        v-if="queryParam.subType !== '请购单'"
        label="金额合计"
        prop="totalPrice"
        width="70"
      />
      <el-table-column
        v-if="queryParam.subType !== '请购单'"
        label="含税合计"
        width="70"
      >
        <template #default="{ row }">
          {{
            row.discountLastMoney
              ? (row.discountMoney + row.discountLastMoney).toFixed(2)
              : row.totalPrice
          }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="70" align="center">
        <template #default="{ row }">
          <el-tag v-if="row?.status === '0'" type="danger" size="small">未审核</el-tag>
          <el-tag v-if="row?.status === '1'" type="success" size="small">已审核</el-tag>
          <el-tag
            v-if="row?.status === '2' && queryParam.subType === '采购订单'"
            type="info"
            size="small"
          >完成采购</el-tag>
          <el-tag
            v-if="row?.status === '2' && queryParam.subType === '销售订单'"
            type="info"
            size="small"
          >完成销售</el-tag>
          <el-tag
            v-if="row?.status === '3' && queryParam.subType === '采购订单'"
            size="small"
          >部分采购</el-tag>
          <el-tag
            v-if="row?.status === '3' && queryParam.subType === '销售订单'"
            size="small"
          >部分销售</el-tag>
          <el-tag
            v-if="row?.status === '9' && (queryParam.subType === '采购订单' || queryParam.subType === '销售订单')"
            type="warning"
            size="small"
          >审核中</el-tag>
        </template>
      </el-table-column>
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
    <!-- 子对话框 -->
    <BillDetail ref="billDetailRef" />
    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getAction } from '@/api/http'
import { findBillDetailByNumber } from '@/api/bill'
import { findBySelectSup, findBySelectCus } from '@/api/system'
import BillDetail from './BillDetail.vue'

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const title = ref('历史单据')
const loading = ref(false)
const organLabel = ref('')
const supplierList = ref<any[]>([])
const dataSource = ref<any[]>([])
const dateRange = ref<string[]>([])
const billDetailRef = ref<InstanceType<typeof BillDetail> | null>(null)
let setTimeFlag: ReturnType<typeof setTimeout> | null = null

const queryParam = reactive<Record<string, any>>({
  organId: undefined,
  number: '',
  materialParam: '',
  type: '',
  subType: '',
  status: '',
  beginTime: '',
  endTime: '',
})

const ipagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

function loadData(page?: number) {
  if (page) ipagination.current = page
  loading.value = true
  const params: Record<string, any> = {
    ...queryParam,
    currentPage: ipagination.current,
    pageSize: ipagination.pageSize,
  }
  getAction('/depotHead/list', params).then((res: any) => {
    if (res && res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function show(type: string, subType: string, organType: string, organId?: number | string) {
  queryParam.type = type
  queryParam.subType = subType
  organLabel.value = organType
  visible.value = true
  loadSupplier(organType, organId)
  loadData(1)
}

function loadSupplier(organType: string, organId?: number | string) {
  if (organType === '供应商') {
    findBySelectSup({ limit: 1 }).then((res: any) => {
      if (res) {
        supplierList.value = res
        if (organId) {
          queryParam.organId = organId
          loadData(1)
        }
      }
    })
  } else if (organType === '客户') {
    findBySelectCus({ limit: 1 }).then((res: any) => {
      if (res) {
        supplierList.value = res
        if (organId) {
          queryParam.organId = organId
          loadData(1)
        }
      }
    })
  }
}

function handleSearchSupplier(value: string) {
  if (setTimeFlag) clearTimeout(setTimeFlag)
  if (organLabel.value === '供应商') {
    setTimeFlag = setTimeout(() => {
      findBySelectSup({ key: value, limit: 1 }).then((res: any) => {
        if (res) supplierList.value = res
      })
    }, 500)
  } else if (organLabel.value === '客户') {
    setTimeFlag = setTimeout(() => {
      findBySelectCus({ key: value, limit: 1 }).then((res: any) => {
        if (res) supplierList.value = res
      })
    }, 500)
  }
}

function onDateChange(val: string[] | null) {
  if (val && val.length === 2) {
    queryParam.beginTime = val[0]
    queryParam.endTime = val[1]
  } else {
    queryParam.beginTime = ''
    queryParam.endTime = ''
  }
}

function searchQuery() {
  loadData(1)
}

function searchReset() {
  queryParam.organId = undefined
  queryParam.number = ''
  queryParam.materialParam = ''
  queryParam.beginTime = ''
  queryParam.endTime = ''
  dateRange.value = []
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

function handleSortChange() {
  // reserved for sort
}

function myHandleDetail(record: any) {
  findBillDetailByNumber({ number: record.number }).then((res: any) => {
    if (res && res.code === 200) {
      let type = res.data.depotHeadType
      type = type.replace('其它', '')
      billDetailRef.value?.show(res.data, type)
      if (billDetailRef.value) {
        billDetailRef.value.title = '详情'
      }
    }
  })
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
