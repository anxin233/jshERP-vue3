<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :style="modalStyle"
    fullscreen
    @close="handleCancel"
  >
    <!-- 收预付款 -->
    <template v-if="financialType === '收预付款'">
      <section id="advanceInPrint">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="付款会员">{{ model.organName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="财务人员">{{ model.handsPersonName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据日期">{{ model.billTimeStr }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据编号">{{ model.billNo }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        <el-table
          :data="dataSource"
          border
          size="small"
          row-key="id"
          v-loading="loading"
          style="width: 100%; margin-top: 10px"
        >
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="账户名称" prop="accountName" />
          <el-table-column label="金额" prop="eachAmount" />
          <el-table-column label="备注" prop="remark" />
        </el-table>
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24" style="margin-top: 10px">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="合计金额">{{ model.totalPrice }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="收款金额">{{ model.changeAmount }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </section>
    </template>

    <!-- 转账 -->
    <template v-if="financialType === '转账'">
      <section id="giroPrint">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="财务人员">{{ model.handsPersonName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据日期">{{ model.billTimeStr }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据编号">{{ model.billNo }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6"></el-col>
        </el-row>
        <el-table
          :data="dataSource"
          border
          size="small"
          row-key="id"
          v-loading="loading"
          style="width: 100%; margin-top: 10px"
        >
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="账户名称" prop="accountName" />
          <el-table-column label="金额" prop="eachAmount" />
          <el-table-column label="备注" prop="remark" />
        </el-table>
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24" style="margin-top: 10px">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="付款账户">{{ model.accountName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="实付金额">{{ model.changeAmount }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </section>
    </template>

    <!-- 收入 -->
    <template v-if="financialType === '收入'">
      <section id="itemInPrint">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="往来单位">{{ model.organName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="财务人员">{{ model.handsPersonName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据日期">{{ model.billTimeStr }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据编号">{{ model.billNo }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        <el-table
          :data="dataSource"
          border
          size="small"
          row-key="id"
          v-loading="loading"
          style="width: 100%; margin-top: 10px"
        >
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="收入项目" prop="inOutItemName" />
          <el-table-column label="金额" prop="eachAmount" />
          <el-table-column label="备注" prop="remark" />
        </el-table>
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24" style="margin-top: 10px">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="收入账户">{{ model.accountName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="收入金额">{{ model.changeAmount }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </section>
    </template>

    <!-- 支出 -->
    <template v-if="financialType === '支出'">
      <section id="itemOutPrint">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="往来单位">{{ model.organName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="财务人员">{{ model.handsPersonName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据日期">{{ model.billTimeStr }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据编号">{{ model.billNo }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        <el-table
          :data="dataSource"
          border
          size="small"
          row-key="id"
          v-loading="loading"
          style="width: 100%; margin-top: 10px"
        >
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="支出项目" prop="inOutItemName" />
          <el-table-column label="金额" prop="eachAmount" />
          <el-table-column label="备注" prop="remark" />
        </el-table>
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24" style="margin-top: 10px">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="支出账户">{{ model.accountName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="支出金额">{{ model.changeAmount }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </section>
    </template>

    <!-- 收款 -->
    <template v-if="financialType === '收款'">
      <section id="moneyInPrint">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="客户">{{ model.organName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="财务人员">{{ model.handsPersonName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据日期">{{ model.billTimeStr }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据编号">{{ model.billNo }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        <el-table
          :data="dataSource"
          border
          size="small"
          row-key="id"
          v-loading="loading"
          style="width: 100%; margin-top: 10px"
        >
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="销售单据编号" prop="billNumber" width="200" />
          <el-table-column label="应收欠款" prop="needDebt" />
          <el-table-column label="已收欠款" prop="finishDebt" />
          <el-table-column label="本次收款" prop="eachAmount" />
          <el-table-column label="备注" prop="remark" />
        </el-table>
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24" style="margin-top: 10px">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="收款账户">{{ model.accountName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="合计收款">{{ model.totalPrice }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="优惠金额">{{ model.discountMoney }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="实际收款">{{ model.changeAmount }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </section>
    </template>

    <!-- 付款 -->
    <template v-if="financialType === '付款'">
      <section id="moneyOutPrint">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="供应商">{{ model.organName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="财务人员">{{ model.handsPersonName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据日期">{{ model.billTimeStr }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据编号">{{ model.billNo }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        <el-table
          :data="dataSource"
          border
          size="small"
          row-key="id"
          v-loading="loading"
          style="width: 100%; margin-top: 10px"
        >
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="采购单据编号" prop="billNumber" width="200" />
          <el-table-column label="应付欠款" prop="needDebt" />
          <el-table-column label="已付欠款" prop="finishDebt" />
          <el-table-column label="本次付款" prop="eachAmount" />
          <el-table-column label="备注" prop="remark" />
        </el-table>
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24" style="margin-top: 10px">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="付款账户">{{ model.accountName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="合计付款">{{ model.totalPrice }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="优惠金额">{{ model.discountMoney }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="实际付款">{{ model.changeAmount }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </section>
    </template>

    <!-- 附件 -->
    <div v-if="fileList" style="padding: 10px 0;">
      <span style="font-weight: bold;">附件：</span>
      <span>{{ fileList }}</span>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消(ESC)</el-button>
      <!-- 打印按钮 -->
      <el-button v-if="financialType === '收预付款'" v-print="'#advanceInPrint'">打印</el-button>
      <el-button v-if="financialType === '转账'" v-print="'#giroPrint'">打印</el-button>
      <el-button v-if="financialType === '收入'" v-print="'#itemInPrint'">打印</el-button>
      <el-button v-if="financialType === '支出'" v-print="'#itemOutPrint'">打印</el-button>
      <el-button v-if="financialType === '收款'" v-print="'#moneyInPrint'">打印</el-button>
      <el-button v-if="financialType === '付款'" v-print="'#moneyOutPrint'">打印</el-button>
      <!-- 反审核 -->
      <el-button
        v-if="checkFlag && isCanBackCheck && model.status === '1'"
        @click="handleBackCheck"
      >反审核</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAction, postAction } from '@/api/http'
import { findFinancialDetailByNumber } from '@/api/financial'
import { getCurrentSystemConfig } from '@/api/system'
import { getCheckFlag } from '@/utils/index'

const emit = defineEmits<{ ok: []; close: [] }>()

const visible = ref(false)
const title = ref('详情')
const width = ref('1600px')
const modalStyle = ref('')
const model = ref<Record<string, any>>({})
const isCanBackCheck = ref(true)
const financialType = ref('')
const fileList = ref('')
const loading = ref(false)
const dataSource = ref<any[]>([])

/** 原始反审核是否开启 */
const checkFlag = ref(true)

let prefixNo = ''

const url = {
  detailList: '/accountItem/getDetailList',
  batchSetStatusUrl: '/accountHead/batchSetStatus',
}

/**
 * 显示详情弹窗
 * @param record 当前行数据（必须含 billNo）
 * @param type 财务类型（收预付款/收款/付款/收入/支出/转账）
 * @param pNo 单据前缀编号
 */
function show(record: any, type: string, pNo?: string) {
  findFinancialDetailByNumber({ billNo: record.billNo }).then((res: any) => {
    if (res && res.code === 200) {
      const item = res.data
      financialType.value = type
      prefixNo = pNo || ''
      fileList.value = item.fileName || ''
      visible.value = true
      modalStyle.value = 'top:20px;height:95%;'
      model.value = { ...item }

      const params = {
        headerId: model.value.id,
      }
      requestSubTableData(url.detailList, params)
      getSystemConfig()
    }
  })
}

function requestSubTableData(urlPath: string, params: Record<string, any>) {
  loading.value = true
  getAction(urlPath, params)
    .then((res: any) => {
      if (res && res.code === 200) {
        dataSource.value = res.data.rows || []
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function getSystemConfig() {
  getCurrentSystemConfig().then((res: any) => {
    if (res.code === 200 && res.data) {
      const multiBillType = res.data.multiBillType
      const multiLevelApprovalFlag = res.data.multiLevelApprovalFlag
      checkFlag.value = getCheckFlag(multiBillType, multiLevelApprovalFlag, prefixNo)
    }
  })
}

function handleBackCheck() {
  ElMessageBox.confirm('是否对该单据进行反审核?', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    loading.value = true
    postAction(url.batchSetStatusUrl, { status: '0', ids: model.value.id })
      .then((res: any) => {
        if (res.code === 200) {
          emit('ok')
          close()
        } else {
          ElMessage.warning(res.data?.message || '操作失败')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }).catch(() => {})
}

function handleCancel() {
  close()
}

function close() {
  emit('close')
  visible.value = false
  modalStyle.value = ''
}

defineExpose({ show, isCanBackCheck, title })
</script>
