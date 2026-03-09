<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="1600px"
    :close-on-click-modal="false"
    @close="handleCancel"
    top="20px"
  >
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-row :gutter="24">
          <el-col :md="6" :sm="24">
            <el-form-item label="单据编号">
              <el-input v-model="queryParam.billNo" placeholder="请输入单据编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="操作员">
              <el-select
                v-model="queryParam.creator"
                placeholder="请选择操作员"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.id"
                  :label="item.userName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-form-item label="单据状态">
              <el-select v-model="queryParam.status" placeholder="请选择单据状态" clearable style="width: 100%">
                <el-option label="未审核" value="0" />
                <el-option label="已审核" value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="24">
            <el-button type="primary" @click="searchQuery">查询</el-button>
            <el-button @click="searchReset">重置</el-button>
            <el-button link type="primary" @click="toggleSearchStatus = !toggleSearchStatus">
              {{ toggleSearchStatus ? '收起' : '展开' }}
              <el-icon><ArrowUp v-if="toggleSearchStatus" /><ArrowDown v-else /></el-icon>
            </el-button>
          </el-col>
        </el-row>
        <!-- 展开的高级搜索 -->
        <template v-if="toggleSearchStatus">
          <el-row :gutter="24">
            <el-col :md="6" :sm="24">
              <el-form-item label="财务人员">
                <el-select
                  v-model="queryParam.handsPersonId"
                  placeholder="请选择财务人员"
                  filterable
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in personList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="账户信息">
                <el-select
                  v-model="queryParam.accountId"
                  placeholder="请选择账户信息"
                  filterable
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in accountList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="单据备注">
                <el-input v-model="queryParam.remark" placeholder="请输入单据备注" clearable />
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="销售单号">
                <el-input v-model="queryParam.number" placeholder="请输入销售单号" clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
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
      <el-table-column type="index" label="#" width="40" align="center" />
      <el-table-column label="单据编号" prop="billNo" width="120">
        <template #default="{ row }">
          <a @click="myHandleDetail(row)" style="color: #409eff; cursor: pointer;">{{ row.billNo }}</a>
        </template>
      </el-table-column>
      <el-table-column :label="organColumnTitle" prop="organName" width="140" show-overflow-tooltip />
      <el-table-column label="单据日期" prop="billTimeStr" width="140" />
      <el-table-column label="操作员" prop="userName" width="100" show-overflow-tooltip />
      <el-table-column label="财务人员" prop="handsPersonName" width="100" />
      <el-table-column :label="totalPriceLabel" prop="totalPrice" width="80" />
      <el-table-column label="优惠金额" prop="discountMoney" width="80" />
      <el-table-column :label="changeAmountLabel" prop="changeAmount" width="80" />
      <el-table-column label="备注" prop="remark" width="160" />
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === '0'" type="danger" size="small">未审核</el-tag>
          <el-tag v-if="row.status === '1'" type="success" size="small">已审核</el-tag>
          <el-tag v-if="row.status === '9'" type="warning" size="small">审核中</el-tag>
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
    <FinancialDetail ref="financialDetailRef" />
    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getAction } from '@/api/http'
import { findFinancialDetailByNumber } from '@/api/financial'
import {
  getUserList as apiGetUserList,
  getPersonByType,
  getAccount,
} from '@/api/system'
import FinancialDetail from '@/views/financial/components/FinancialDetail.vue'

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const loading = ref(false)
const title = ref('')
const toggleSearchStatus = ref(false)
const dataSource = ref<any[]>([])
const financialDetailRef = ref<InstanceType<typeof FinancialDetail> | null>(null)

const organColumnTitle = ref('客户')
const totalPriceLabel = ref('合计收款')
const changeAmountLabel = ref('实际收款')
const prefixNo = ref('')

const userList = ref<any[]>([])
const personList = ref<any[]>([])
const accountList = ref<any[]>([])

const queryParam = reactive<Record<string, any>>({
  billNo: '',
  beginTime: '',
  endTime: '',
  type: '',
  organId: '',
  creator: '',
  handsPersonId: '',
  accountId: '',
  status: '',
  remark: '',
  number: '',
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
  getAction('/accountHead/list', params).then((res: any) => {
    if (res && res.code === 200) {
      dataSource.value = res.data.rows || []
      ipagination.total = res.data.total || 0
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function show(type: string, organId: string | number, number?: string, beginTime?: string, endTime?: string) {
  queryParam.type = type
  queryParam.organId = organId || ''
  queryParam.number = number || ''
  queryParam.beginTime = beginTime || ''
  queryParam.endTime = endTime || ''
  if (type === '付款') {
    organColumnTitle.value = '供应商'
    totalPriceLabel.value = '合计付款'
    changeAmountLabel.value = '实际付款'
    prefixNo.value = 'FK'
    title.value = '历史付款'
  } else if (type === '收款') {
    organColumnTitle.value = '客户'
    totalPriceLabel.value = '合计收款'
    changeAmountLabel.value = '实际收款'
    prefixNo.value = 'SK'
    title.value = '历史收款'
  }
  visible.value = true
  loadData(1)
}

function initUser() {
  apiGetUserList({}).then((res: any) => {
    if (res && res.code === 200) {
      userList.value = res.data.userList || []
    }
  })
}

function initPerson() {
  getPersonByType({ type: '财务员' }).then((res: any) => {
    if (res && res.code === 200) {
      personList.value = res.data.personList || []
    }
  })
}

function initAccount() {
  getAccount({}).then((res: any) => {
    if (res && res.code === 200) {
      accountList.value = res.data.accountList || []
    }
  })
}

onMounted(() => {
  initUser()
  initPerson()
  initAccount()
})

function searchQuery() {
  loadData(1)
}

function searchReset() {
  queryParam.billNo = ''
  queryParam.creator = ''
  queryParam.handsPersonId = ''
  queryParam.accountId = ''
  queryParam.status = ''
  queryParam.remark = ''
  queryParam.number = ''
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

function myHandleDetail(record: any) {
  findFinancialDetailByNumber({ billNo: record.billNo }).then((res: any) => {
    if (res && res.code === 200) {
      if (financialDetailRef.value) {
        financialDetailRef.value.isCanBackCheck = false
        financialDetailRef.value.show(res.data, queryParam.type)
        financialDetailRef.value.title = '详情'
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
