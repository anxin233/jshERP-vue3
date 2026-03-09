<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="1300px"
    :close-on-click-modal="false"
    @close="handleCancel"
    top="20px"
  >
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper" v-if="selectType === 'list'">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-row :gutter="24">
          <el-col :md="6" :sm="24">
            <el-form-item label="单据编号">
              <el-input v-model="queryParam.number" placeholder="请输入单据编号查询" />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="商品信息">
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
          <el-col :md="6" :sm="24">
            <el-button type="primary" @click="searchQuery">查询</el-button>
            <el-button @click="searchReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!-- 单据列表 -->
    <el-table
      v-if="selectType === 'list'"
      :data="dataSource"
      border
      size="default"
      row-key="id"
      v-loading="loading"
      highlight-current-row
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
      style="width: 100%"
    >
      <el-table-column type="index" width="40" align="center" />
      <el-table-column :label="organTitle" prop="organName" width="120" show-overflow-tooltip />
      <el-table-column label="单据编号" prop="number" width="130">
        <template #default="{ row }">
          <a v-if="!queryParam.purchaseStatus" @click="myHandleDetail(row)" style="color: #409eff; cursor: pointer;">{{ row.number }}</a>
          <span v-else>{{ row.number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品信息" prop="materialsList" width="280" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.materialsList ? row.materialsList.replace(',', '，') : '' }}
        </template>
      </el-table-column>
      <el-table-column label="单据日期" prop="operTimeStr" width="145" />
      <el-table-column label="操作员" prop="userName" width="70" />
      <el-table-column label="数量" prop="materialCount" width="60" />
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
          <template v-if="!queryParam.purchaseStatus">
            <el-tag v-if="row?.status === '0'" type="danger" size="small">未审核</el-tag>
            <el-tag v-if="row?.status === '1'" type="success" size="small">已审核</el-tag>
            <el-tag
              v-if="row?.status === '2' && queryParam.subType === '请购单'"
              type="info"
              size="small"
            >完成采购</el-tag>
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
              v-if="row?.status === '3' && queryParam.subType === '请购单'"
              size="small"
            >部分采购</el-tag>
            <el-tag
              v-if="row?.status === '3' && queryParam.subType === '采购订单'"
              size="small"
            >部分采购</el-tag>
            <el-tag
              v-if="row?.status === '3' && queryParam.subType === '销售订单'"
              size="small"
            >部分销售</el-tag>
            <el-tag
              v-if="row?.status === '2' && (queryParam.subType === '采购' || queryParam.subType === '销售')"
              type="success"
              size="small"
            >已审核</el-tag>
            <el-tag
              v-if="row?.status === '3' && (queryParam.subType === '采购' || queryParam.subType === '销售')"
              type="success"
              size="small"
            >已审核</el-tag>
          </template>
          <template v-if="queryParam.purchaseStatus">
            <el-tag v-if="row.purchaseStatus === '0'" type="danger" size="small">未采购</el-tag>
            <el-tag
              v-if="row.purchaseStatus === '2' && queryParam.subType === '销售订单'"
              type="info"
              size="small"
            >完成采购</el-tag>
            <el-tag
              v-if="row.purchaseStatus === '3' && queryParam.subType === '销售订单'"
              size="small"
            >部分采购</el-tag>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!-- 明细列表 -->
    <el-table
      v-if="selectType === 'detail'"
      ref="detailTableRef"
      :data="dataSourceDetail"
      border
      size="default"
      row-key="id"
      v-loading="loading"
      @selection-change="handleDetailSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="40" />
      <el-table-column label="条码" prop="barCode" width="120" />
      <el-table-column label="名称" prop="name" width="150" show-overflow-tooltip />
      <el-table-column label="规格" prop="standard" width="100" show-overflow-tooltip />
      <el-table-column label="型号" prop="model" width="100" show-overflow-tooltip />
      <el-table-column label="单位" prop="unit" width="50" />
      <el-table-column label="数量" prop="operNumber" width="80" />
      <el-table-column
        v-if="showDetailPriceColumns"
        label="单价"
        prop="unitPrice"
        width="80"
      />
      <el-table-column
        v-if="showDetailPriceColumns"
        label="金额"
        prop="allPrice"
        width="80"
      />
      <el-table-column
        v-if="showDetailPriceColumns"
        label="税率(%)"
        prop="taxRate"
        width="80"
      />
      <el-table-column
        v-if="showDetailPriceColumns"
        label="税额"
        prop="taxMoney"
        width="80"
      />
      <el-table-column
        v-if="showDetailPriceColumns"
        label="价税合计"
        prop="taxLastMoney"
        width="80"
      />
      <el-table-column label="备注" prop="remark" width="100" show-overflow-tooltip />
    </el-table>
    <!-- 分页 (列表模式) -->
    <div v-if="selectType === 'list'" style="text-align: right; margin-top: 10px;">
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
      <el-button @click="handleCancel">关闭(ESC)</el-button>
      <el-button v-if="selectType === 'detail'" @click="handleBackBill">返回单据列表</el-button>
      <el-button type="primary" @click="handleOk">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getAction } from '@/api/http'
import { findBillDetailByNumber } from '@/api/bill'
import BillDetail from './BillDetail.vue'

const emit = defineEmits<{
  ok: [
    rows: any[],
    linkNumber: string,
    organId: string | number,
    discountMoney: number,
    deposit: number,
    remark: string,
    defaultDepotId: string,
    accountId: string | number,
    salesMan: string,
  ]
  close: []
}>()

const visible = ref(false)
const title = ref('操作')
const loading = ref(false)
const selectType = ref<'list' | 'detail'>('list')
const showType = ref('basic')
const organTitle = ref('')
const dateRange = ref<string[]>([])
const dataSource = ref<any[]>([])
const dataSourceDetail = ref<any[]>([])
const billDetailRef = ref<InstanceType<typeof BillDetail> | null>(null)

// 选中行相关
const selectedRowKeys = ref<(string | number)[]>([])
const selectBillRows = ref<any[]>([])
const selectBillDetailRows = ref<any[]>([])

let oldTitle = ''
let linkNumber = ''
let organId: string | number = ''
let accountId: string | number = ''
let salesMan = ''
let discountMoney = 0
let deposit = 0
let remark = ''
let defaultDepotId = ''

const queryParam = reactive<Record<string, any>>({
  number: '',
  materialParam: '',
  type: '',
  subType: '',
  status: '',
  beginTime: '',
  endTime: '',
  purchaseStatus: '',
})

const ipagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const showDetailPriceColumns = computed(() => queryParam.subType !== '请购单')

function loadData(page?: number) {
  if (page) ipagination.current = page
  loading.value = true
  const params = {
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

function show(type: string, subType: string, organType: string, status: string) {
  selectType.value = 'list'
  showType.value = 'basic'
  queryParam.type = type
  queryParam.subType = subType
  queryParam.status = status
  queryParam.purchaseStatus = ''
  organTitle.value = organType
  visible.value = true
  loadData(1)
}

function purchaseShow(
  type: string,
  subType: string,
  organType: string,
  status: string,
  purchaseStatus: string,
) {
  selectType.value = 'list'
  showType.value = 'purchase'
  queryParam.type = type
  queryParam.subType = subType
  queryParam.status = status
  queryParam.purchaseStatus = purchaseStatus
  organTitle.value = organType
  visible.value = true
  loadData(1)
}

function handleRowClick(row: any) {
  selectedRowKeys.value = [row.id]
}

function handleRowDblClick(row: any) {
  selectedRowKeys.value = [row.id]
  handleOk()
}

function handleDetailSelectionChange(rows: any[]) {
  selectBillDetailRows.value = rows
}

function handleBackBill() {
  selectType.value = 'list'
  title.value = oldTitle
  selectBillDetailRows.value = []
}

function handleOk() {
  if (selectType.value === 'list') {
    getDepotByCurrentUser()
    getSelectBillRows()
    if (selectBillRows.value.length > 0) {
      selectType.value = 'detail'
      oldTitle = title.value
      title.value = '请选择单据明细'
      const record = selectBillRows.value[0]
      linkNumber = record.number
      organId = record.organId
      accountId = record.accountId
      salesMan = record.salesMan
      discountMoney = record.discountMoney
      deposit = record.changeAmount - record.finishDeposit
      remark = record.remark
      loadDetailData(1)
    } else {
      ElMessage.warning('抱歉，请选择单据！')
    }
  } else {
    if (selectBillDetailRows.value.length) {
      emit(
        'ok',
        selectBillDetailRows.value,
        linkNumber,
        organId,
        discountMoney,
        deposit,
        remark,
        defaultDepotId,
        accountId,
        salesMan,
      )
      close()
    } else {
      ElMessage.warning('抱歉，请选择单据明细！')
    }
  }
}

function loadDetailData(arg?: number) {
  if (arg === 1) ipagination.current = 1
  if (selectBillRows.value.length > 0) {
    const record = selectBillRows.value[0]
    const param = {
      headerId: record.id,
      mpList: '',
      linkType: showType.value,
    }
    loading.value = true
    getAction('/depotItem/getDetailList', param).then((res: any) => {
      if (res.code === 200) {
        const list = res.data.rows || []
        const listEx: any[] = []
        for (const info of list) {
          if (info.finishNumber < info.preNumber) {
            listEx.push(info)
          } else {
            if (
              queryParam.subType === '采购' ||
              queryParam.subType === '销售' ||
              queryParam.subType === '零售'
            ) {
              // 针对退货单，不过滤明细
              listEx.push(info)
            }
          }
        }
        dataSourceDetail.value = listEx
        ipagination.total = res.data.total
      }
      if (res.code === 510) {
        ElMessage.warning(res.data)
      }
      loading.value = false
    })
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

function getSelectBillRows() {
  selectBillRows.value = dataSource.value.filter((row) =>
    selectedRowKeys.value.includes(row.id)
  )
}

function getDepotByCurrentUser() {
  getAction('/depot/findDepotByCurrentUser').then((res: any) => {
    if (res.code === 200) {
      if (res.data.length === 1) {
        defaultDepotId = res.data[0].id + ''
      } else {
        for (const item of res.data) {
          if (item.isDefault) {
            defaultDepotId = item.id + ''
          }
        }
      }
    }
  })
}

function myHandleDetail(record: any) {
  findBillDetailByNumber({ number: record.number }).then((res: any) => {
    if (res && res.code === 200) {
      let type = res.data.depotHeadType
      type = type.replace('其它', '')
      billDetailRef.value?.show(res.data, type)
      if (billDetailRef.value) {
        billDetailRef.value.title = type + '-详情'
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

defineExpose({ show, purchaseShow })
</script>
