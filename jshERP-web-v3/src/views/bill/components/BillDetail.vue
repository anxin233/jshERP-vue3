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
    <!-- 零售出库 -->
    <template v-if="billType === '零售出库'">
      <section id="retailOutPrint">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="会员卡号">{{ model.organName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="收款类型">{{ model.payType }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top:10px">
          <el-col :lg="18" :md="12" :sm="24">
            <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" />
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据金额">{{ model.changeAmount }}</el-descriptions-item>
              <el-descriptions-item label="收款金额">{{ model.getAmount }}</el-descriptions-item>
              <el-descriptions-item label="找零">{{ model.backAmount }}</el-descriptions-item>
              <el-descriptions-item label="收款账户">{{ model.accountName }}</el-descriptions-item>
            </el-descriptions>
            <template v-if="model.hasBackFlag">
              <div style="margin-top: 8px; font-weight: bold;">退货单号</div>
              <div v-for="(item, index) in linkNumberList" :key="index">
                <a @click="myHandleDetail(item.number)" style="color: #409eff; cursor: pointer;">{{ item.number }}</a>
              </div>
            </template>
          </el-col>
        </el-row>
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
      </section>
    </template>

    <!-- 零售退货入库 -->
    <template v-else-if="billType === '零售退货入库'">
      <section id="retailBackPrint">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="会员卡号">{{ model.organName }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="关联单据"><a @click="myHandleDetail(model.linkNumber)" style="color: #409eff; cursor: pointer;">{{ model.linkNumber }}</a></el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top:10px">
          <el-col :lg="18" :md="12" :sm="24">
            <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" />
          </el-col>
          <el-col :span="6">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据金额">{{ model.changeAmount }}</el-descriptions-item>
              <el-descriptions-item label="付款金额">{{ model.getAmount }}</el-descriptions-item>
              <el-descriptions-item label="找零">{{ model.backAmount }}</el-descriptions-item>
              <el-descriptions-item label="付款账户">{{ model.accountName }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
      </section>
    </template>

    <!-- 请购单 -->
    <template v-else-if="billType === '请购单'">
      <section id="purchaseApplyPrint">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" style="margin-top: 10px" />
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
      </section>
    </template>

    <!-- 采购订单 -->
    <template v-else-if="billType === '采购订单'">
      <section id="purchaseOrderPrint">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="供应商">{{ model.organName }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6" v-if="model.linkApply"><el-descriptions :column="1" border size="small"><el-descriptions-item label="关联请购单"><a @click="myHandleDetail(model.linkApply)" style="color:#409eff;cursor:pointer;">{{ model.linkApply }}</a></el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6" v-if="model.linkNumber && purchaseBySaleFlag"><el-descriptions :column="1" border size="small"><el-descriptions-item label="关联订单">{{ model.linkNumber }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" style="margin-top: 10px" />
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="优惠率">{{ model.discount }}%</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="付款优惠">{{ model.discountMoney }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="优惠后金额">{{ model.discountLastMoney }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top:10px">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="结算账户">{{ model.accountName }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="支付订金">{{ model.changeAmount }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
      </section>
    </template>

    <!-- 采购入库 / 采购退货出库 / 销售出库 / 销售退货入库 -->
    <template v-else-if="billType === '采购入库' || billType === '采购退货出库' || billType === '销售出库' || billType === '销售退货入库'">
      <section :id="sectionId">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item :label="organLabelForType">{{ model.organName }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item :label="linkLabel"><a @click="myHandleDetail(model.linkNumber)" style="color:#409eff;cursor:pointer;">{{ model.linkNumber }}</a></el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" style="margin-top: 10px" />
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="优惠率">{{ model.discount }}%</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item :label="discountLabel">{{ model.discountMoney }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="优惠后金额">{{ model.discountLastMoney }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="其它费用">{{ model.otherMoney }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top:10px">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="结算账户">{{ model.accountName }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6" v-if="model.deposit"><el-descriptions :column="1" border size="small"><el-descriptions-item label="扣除订金">{{ model.deposit }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item :label="changeAmountLabel">{{ model.changeAmount }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="本次欠款">{{ model.debt }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top:10px" v-if="model.hasBackFlag || financialBillNoList.length || model.salesManStr">
          <el-col :span="6" v-if="model.salesManStr"><el-descriptions :column="1" border size="small"><el-descriptions-item label="销售人员">{{ model.salesManStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6" v-if="model.hasBackFlag">
            <div style="font-weight:bold;">退货单号</div>
            <div v-for="(item, index) in linkNumberList" :key="index">
              <a @click="myHandleDetail(item.number)" style="color:#409eff;cursor:pointer;">{{ item.number }}</a>
            </div>
          </el-col>
          <el-col :span="6" v-if="financialBillNoList.length">
            <div style="font-weight:bold;">{{ financialBillLabel }}</div>
            <div v-for="(item, index) in financialBillNoList" :key="index">
              <a @click="myHandleFinancialDetail(item.billNo)" style="color:#409eff;cursor:pointer;">{{ item.billNo }}</a>
            </div>
          </el-col>
        </el-row>
      </section>
    </template>

    <!-- 销售订单 -->
    <template v-else-if="billType === '销售订单'">
      <section id="saleOrderPrint">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="客户">{{ model.organName }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="销售人员">{{ model.salesManStr }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" style="margin-top: 10px" />
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="优惠率">{{ model.discount }}%</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="付款优惠">{{ model.discountMoney }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="优惠后金额">{{ model.discountLastMoney }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top:10px">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="结算账户">{{ model.accountName }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="收取订金">{{ model.changeAmount }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
      </section>
    </template>

    <!-- 其它入库 / 其它出库 -->
    <template v-else-if="billType === '其它入库' || billType === '其它出库'">
      <section :id="billType === '其它入库' ? 'otherInPrint' : 'otherOutPrint'">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item :label="billType === '其它入库' ? '供应商' : '客户'">{{ model.organName }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" style="margin-top: 10px" />
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
      </section>
    </template>

    <!-- 调拨出库 -->
    <template v-else-if="billType === '调拨出库'">
      <section id="allocationOutPrint">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" style="margin-top: 10px" />
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
      </section>
    </template>

    <!-- 组装单 / 拆卸单 -->
    <template v-else-if="billType === '组装单' || billType === '拆卸单'">
      <section :id="billType === '组装单' ? 'assemblePrint' : 'disassemblePrint'">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" style="margin-top: 10px" />
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
      </section>
    </template>

    <!-- 盘点复盘 -->
    <template v-else-if="billType === '盘点复盘'">
      <section id="stockCheckReplayPrint">
        <el-row :gutter="24">
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据日期">{{ model.operTimeStr }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6"><el-descriptions :column="1" border size="small"><el-descriptions-item label="单据编号">{{ model.number }}</el-descriptions-item></el-descriptions></el-col>
          <el-col :span="6" v-if="model.linkNumber"><el-descriptions :column="1" border size="small"><el-descriptions-item label="关联盘点">{{ model.linkNumber }}</el-descriptions-item></el-descriptions></el-col>
        </el-row>
        <DetailTable :columns="columns" :data-source="dataSource" :loading="loading" style="margin-top: 10px" />
        <div v-if="model.remark" style="padding: 20px 10px;">{{ model.remark }}</div>
      </section>
    </template>

    <!-- 附件区域 -->
    <div v-if="fileList" style="margin-top: 10px;">
      <span style="font-weight: bold;">附件：</span>
      <span>{{ fileList }}</span>
    </div>

    <!-- 子对话框 -->
    <BillPrintIframe ref="modalDetail" />
    <BillPrintProIframe ref="modalProDetail" />

    <template #footer>
      <el-button @click="handleCancel">取消(ESC)</el-button>
      <!-- 打印按钮 -->
      <template v-if="isShowPrintBtn">
        <el-button v-if="billPrintFlag" @click="handlePrintPro">三联打印-新版</el-button>
        <el-button v-if="billPrintFlag" @click="handlePrint">三联打印</el-button>
      </template>
      <!-- 导出按钮 -->
      <el-button v-if="billType === '零售出库' || billType === '零售退货入库'" @click="retailExportExcel">导出</el-button>
      <el-button v-if="billType === '请购单'" @click="applyExportExcel">导出</el-button>
      <el-button v-if="billType === '采购订单' || billType === '销售订单'" @click="orderExportExcel">导出</el-button>
      <el-button v-if="billType === '采购入库' || billType === '采购退货出库' || billType === '销售出库' || billType === '销售退货入库'" @click="purchaseSaleExportExcel">导出</el-button>
      <el-button v-if="billType === '其它入库' || billType === '其它出库'" @click="otherExportExcel">导出</el-button>
      <el-button v-if="billType === '调拨出库'" @click="allocationOutExportExcel">导出</el-button>
      <el-button v-if="billType === '组装单' || billType === '拆卸单'" @click="assembleExportExcel">导出</el-button>
      <el-button v-if="billType === '盘点复盘'" @click="stockCheckReplayExportExcel">导出</el-button>
      <!-- 反审核 -->
      <el-button v-if="checkFlag && isCanBackCheck && model.status === '1'" @click="handleBackCheck">反审核</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAction, postAction, getFileAccessHttpUrl } from '@/api/http'
import { findBillDetailByNumber } from '@/api/bill'
import { getPlatformConfigByKey, getCurrentSystemConfig } from '@/api/system'
import { findFinancialDetailByNumber } from '@/api/financial'
import { getMpListShort, getCheckFlag, exportXlsPost } from '@/utils/index'
import { getStore } from '@/utils/storage'
import BillPrintIframe from './BillPrintIframe.vue'
import BillPrintProIframe from './BillPrintProIframe.vue'

interface ColumnDef {
  prop: string
  label: string
  width?: number
}

// 内联明细表格子组件
const DetailTable = defineComponent({
  name: 'DetailTable',
  props: {
    columns: { type: Array as () => ColumnDef[], default: () => [] },
    dataSource: { type: Array as () => any[], default: () => [] },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h(
        'div',
        { style: { width: '100%', overflowX: 'auto' } },
        [
          h(
            // @ts-ignore
            resolveComponent('el-table'),
            {
              data: props.dataSource,
              border: true,
              size: 'small',
              rowKey: 'id',
              loading: props.loading,
              style: { width: '100%' },
            },
            () => [
              h(resolveComponent('el-table-column'), {
                type: 'index',
                label: '#',
                width: 40,
                align: 'center',
              }),
              ...props.columns.map((col: ColumnDef) =>
                h(resolveComponent('el-table-column'), {
                  prop: col.prop,
                  label: col.label,
                  width: col.width,
                  showOverflowTooltip: true,
                }),
              ),
            ],
          ),
        ],
      )
  },
})

import { resolveComponent } from 'vue'

const emit = defineEmits<{ ok: []; close: [] }>()

const visible = ref(false)
const title = ref('详情')
const width = ref('1600px')
const modalStyle = ref('')
const model = ref<Record<string, any>>({})
const isCanBackCheck = ref(true)
const billType = ref('')
const billPrintFlag = ref(false)
const fileList = ref('')
const purchaseBySaleFlag = ref(false)
const linkNumberList = ref<any[]>([])
const financialBillNoList = ref<any[]>([])
const checkFlag = ref(true)
const isShowPrintBtn = ref(true)
const loading = ref(false)
const dataSource = ref<any[]>([])
const columns = ref<ColumnDef[]>([])
const otherFieldTitle = ref('')
let prefixNo = ''

// 根据窗口宽度设定对话框宽度
const realScreenWidth = window.screen.width
width.value = realScreenWidth < 1500 ? '1200px' : '1600px'

const modalDetail = ref<InstanceType<typeof BillPrintIframe> | null>(null)
const modalProDetail = ref<InstanceType<typeof BillPrintProIframe> | null>(null)

// =============== 各种单据类型对应的列定义 ===============
const retailColumns: ColumnDef[] = [
  { label: '仓库名称', prop: 'depotName' }, { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '单位', prop: 'unit' }, { label: '序列号', prop: 'snList', width: 300 },
  { label: '批号', prop: 'batchNumber' }, { label: '有效期', prop: 'expirationDate' },
  { label: '多属性', prop: 'sku' }, { label: '数量', prop: 'operNumber' },
  { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '重量', prop: 'weight' }, { label: '仓位货架', prop: 'position' }, { label: '备注', prop: 'remark' },
]

const purchaseApplyColumns: ColumnDef[] = [
  { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '单位', prop: 'unit' }, { label: '多属性', prop: 'sku' },
  { label: '数量', prop: 'operNumber' }, { label: '已采购', prop: 'finishNumber' }, { label: '备注', prop: 'remark' },
]

const purchaseOrderColumns: ColumnDef[] = [
  { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '单位', prop: 'unit' }, { label: '多属性', prop: 'sku' },
  { label: '数量', prop: 'operNumber' }, { label: '已采购', prop: 'finishNumber' },
  { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '税率(%)', prop: 'taxRate' }, { label: '税额', prop: 'taxMoney' }, { label: '价税合计', prop: 'taxLastMoney' },
  { label: '备注', prop: 'remark' },
]

const purchaseInColumns: ColumnDef[] = [
  { label: '仓库名称', prop: 'depotName' }, { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '单位', prop: 'unit' }, { label: '序列号', prop: 'snList', width: 300 },
  { label: '批号', prop: 'batchNumber' }, { label: '有效期', prop: 'expirationDate' },
  { label: '多属性', prop: 'sku' }, { label: '数量', prop: 'operNumber' }, { label: '已入库', prop: 'finishNumber' },
  { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '税率(%)', prop: 'taxRate' }, { label: '税额', prop: 'taxMoney' }, { label: '价税合计', prop: 'taxLastMoney' },
  { label: '重量', prop: 'weight' }, { label: '仓位货架', prop: 'position' }, { label: '备注', prop: 'remark' },
]

const saleOrderColumns: ColumnDef[] = [
  { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '单位', prop: 'unit' }, { label: '多属性', prop: 'sku' },
  { label: '数量', prop: 'operNumber' }, { label: '已销售', prop: 'finishNumber' },
  { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '税率(%)', prop: 'taxRate' }, { label: '税额', prop: 'taxMoney' }, { label: '价税合计', prop: 'taxLastMoney' },
  { label: '备注', prop: 'remark' },
]

const saleOutColumns: ColumnDef[] = [
  { label: '仓库名称', prop: 'depotName' }, { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '单位', prop: 'unit' }, { label: '序列号', prop: 'snList', width: 300 },
  { label: '批号', prop: 'batchNumber' }, { label: '有效期', prop: 'expirationDate' },
  { label: '多属性', prop: 'sku' }, { label: '数量', prop: 'operNumber' }, { label: '已出库', prop: 'finishNumber' },
  { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '税率(%)', prop: 'taxRate' }, { label: '税额', prop: 'taxMoney' }, { label: '价税合计', prop: 'taxLastMoney' },
  { label: '重量', prop: 'weight' }, { label: '仓位货架', prop: 'position' }, { label: '备注', prop: 'remark' },
]

const otherInOutColumns: ColumnDef[] = [
  { label: '仓库名称', prop: 'depotName' }, { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '单位', prop: 'unit' }, { label: '序列号', prop: 'snList', width: 300 },
  { label: '批号', prop: 'batchNumber' }, { label: '有效期', prop: 'expirationDate' },
  { label: '多属性', prop: 'sku' }, { label: '数量', prop: 'operNumber' },
  { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '重量', prop: 'weight' }, { label: '仓位货架', prop: 'position' }, { label: '备注', prop: 'remark' },
]

const allocationOutColumns: ColumnDef[] = [
  { label: '仓库名称', prop: 'depotName' }, { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '调入仓库', prop: 'anotherDepotName' },
  { label: '单位', prop: 'unit' }, { label: '多属性', prop: 'sku' },
  { label: '数量', prop: 'operNumber' }, { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '重量', prop: 'weight' }, { label: '仓位货架', prop: 'position' }, { label: '备注', prop: 'remark' },
]

const assembleColumns: ColumnDef[] = [
  { label: '商品类型', prop: 'mType' }, { label: '仓库名称', prop: 'depotName' },
  { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' }, { label: '颜色', prop: 'color' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '单位', prop: 'unit' }, { label: '多属性', prop: 'sku' },
  { label: '数量', prop: 'operNumber' }, { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '备注', prop: 'remark' },
]

const stockCheckReplayColumns: ColumnDef[] = [
  { label: '仓库名称', prop: 'depotName' }, { label: '条码', prop: 'barCode' }, { label: '名称', prop: 'name' },
  { label: '规格', prop: 'standard' }, { label: '型号', prop: 'model' },
  { label: '品牌', prop: 'brand' }, { label: '制造商', prop: 'mfrs' },
  { label: '扩展1', prop: 'otherField1' }, { label: '扩展2', prop: 'otherField2' }, { label: '扩展3', prop: 'otherField3' },
  { label: '库存', prop: 'stock' }, { label: '单位', prop: 'unit' }, { label: '多属性', prop: 'sku' },
  { label: '数量', prop: 'operNumber' }, { label: '单价', prop: 'unitPrice' }, { label: '金额', prop: 'allPrice' },
  { label: '备注', prop: 'remark' },
]

// 映射单据类型到列定义
const columnMap: Record<string, ColumnDef[]> = {
  '零售出库': retailColumns,
  '零售退货入库': retailColumns,
  '请购单': purchaseApplyColumns,
  '采购订单': purchaseOrderColumns,
  '采购入库': purchaseInColumns,
  '采购退货出库': purchaseInColumns,
  '销售订单': saleOrderColumns,
  '销售出库': saleOutColumns,
  '销售退货入库': saleOutColumns,
  '其它入库': otherInOutColumns,
  '其它出库': otherInOutColumns,
  '调拨出库': allocationOutColumns,
  '组装单': assembleColumns,
  '拆卸单': assembleColumns,
  '盘点复盘': stockCheckReplayColumns,
}

// =============== 计算属性 ===============
const sectionId = computed(() => {
  const map: Record<string, string> = {
    '采购入库': 'purchaseInPrint',
    '采购退货出库': 'purchaseBackPrint',
    '销售出库': 'saleOutPrint',
    '销售退货入库': 'saleBackPrint',
  }
  return map[billType.value] || ''
})

const organLabelForType = computed(() => {
  if (billType.value === '采购入库' || billType.value === '采购退货出库') return '供应商'
  return '客户'
})

const linkLabel = computed(() => {
  if (billType.value === '采购入库' || billType.value === '销售出库') return '关联订单'
  return '关联单据'
})

const discountLabel = computed(() => {
  if (billType.value === '采购退货出库') return '退款优惠'
  if (billType.value === '销售出库') return '收款优惠'
  return '付款优惠'
})

const changeAmountLabel = computed(() => {
  if (billType.value === '采购入库') return '本次付款'
  if (billType.value === '采购退货出库') return '本次退款'
  if (billType.value === '销售出库') return '本次收款'
  if (billType.value === '销售退货入库') return '本次退款'
  return '本次金额'
})

const financialBillLabel = computed(() => {
  if (billType.value === '采购入库') return '付款单号'
  return '收款单号'
})

// =============== 列构建 ===============
function initSetting(record: any, type: string, ds: any[]) {
  let defColumns = columnMap[type] || []
  // 动态替换扩展字段标题
  const mpList = getStore<any[]>('materialPropertyList')
  const mpStr = mpList ? getMpListShort(mpList) : ''
  if (mpStr) {
    const mpArr = mpStr.split(',')
    if (mpArr.length === 3) {
      otherFieldTitle.value = mpStr
      defColumns = defColumns.map((col) => {
        if (col.prop === 'otherField1') return { ...col, label: mpArr[0] }
        if (col.prop === 'otherField2') return { ...col, label: mpArr[1] }
        if (col.prop === 'otherField3') return { ...col, label: mpArr[2] }
        return col
      })
    }
  }

  // 判断哪些可选列有数据
  const needAddKeywords = new Set<string>()
  for (const row of ds) {
    if (row.snList) needAddKeywords.add('snList')
    if (row.batchNumber) needAddKeywords.add('batchNumber')
    if (row.expirationDate) needAddKeywords.add('expirationDate')
    if (row.sku) needAddKeywords.add('sku')
    if (row.weight) needAddKeywords.add('weight')
    if (row.position) needAddKeywords.add('position')
    if (row.brand) needAddKeywords.add('brand')
    if (row.mfrs) needAddKeywords.add('mfrs')
    if (row.otherField1) needAddKeywords.add('otherField1')
    if (row.otherField2) needAddKeywords.add('otherField2')
    if (row.otherField3) needAddKeywords.add('otherField3')
    if (row.taxRate) needAddKeywords.add('taxRate')
    if (row.remark) needAddKeywords.add('remark')
    if (record.status === '3' || record.purchaseStatus === '3') {
      needAddKeywords.add('finishNumber')
    }
  }

  const needRemoveKeywords = [
    'finishNumber', 'snList', 'batchNumber', 'expirationDate', 'sku', 'weight', 'position',
    'brand', 'mfrs', 'otherField1', 'otherField2', 'otherField3', 'taxRate', 'remark',
  ]

  const currentCol: ColumnDef[] = []
  for (const col of defColumns) {
    if (!needRemoveKeywords.includes(col.prop)) {
      currentCol.push({ ...col })
    }
    if (needAddKeywords.has(col.prop)) {
      const newCol = { ...col }
      if (record.purchaseStatus === '3' && col.prop === 'finishNumber') {
        newCol.label = '已采购'
      }
      currentCol.push(newCol)
    }
  }
  columns.value = currentCol
}

// =============== 配置加载 ===============
function initPlatform() {
  getPlatformConfigByKey({ platformKey: 'bill_print_flag' }).then((res: any) => {
    if (res && res.code === 200) {
      billPrintFlag.value = res.data.platformValue === '1'
    }
  })
}

function getSystemConfig() {
  getCurrentSystemConfig().then((res: any) => {
    if (res.code === 200 && res.data) {
      purchaseBySaleFlag.value = res.data.purchaseBySaleFlag === '1'
      const multiBillType = res.data.multiBillType
      const multiLevelApprovalFlag = res.data.multiLevelApprovalFlag
      checkFlag.value = getCheckFlag(multiBillType, multiLevelApprovalFlag, prefixNo)
      if (res.data.auditPrintFlag === '1') {
        isShowPrintBtn.value = model.value.status !== '0' && model.value.status !== '9'
      } else {
        isShowPrintBtn.value = true
      }
    }
  })
}

function getBillListByLinkNumber(number: string) {
  getAction('/depotHead/getBillListByLinkNumber', { number }).then((res: any) => {
    if (res && res.code === 200) linkNumberList.value = res.data
  })
}

function getFinancialBillNoByBillId(billId: string | number) {
  getAction('/accountHead/getFinancialBillNoByBillId', { billId }).then((res: any) => {
    if (res && res.code === 200) financialBillNoList.value = res.data
  })
}

// =============== 主入口 ===============
function show(record: any, type: string, pNo?: string) {
  findBillDetailByNumber({ number: record.number }).then((res: any) => {
    if (res && res.code === 200) {
      const item = res.data
      billType.value = type
      prefixNo = pNo || ''
      fileList.value = item.fileName || ''
      visible.value = true
      modalStyle.value = 'top:20px;height:95%;'
      model.value = { ...item }

      if (model.value.backAmount) {
        model.value.getAmount = (model.value.changeAmount + model.value.backAmount).toFixed(2)
      } else {
        model.value.getAmount = model.value.changeAmount
      }
      model.value.debt = (
        model.value.discountLastMoney + model.value.otherMoney -
        (model.value.deposit + model.value.changeAmount)
      ).toFixed(2)

      let showType = 'basic'
      if (
        item.subType === '采购' || item.subType === '采购退货' ||
        item.subType === '销售' || item.subType === '销售退货'
      ) {
        if (item.status === '3') showType = 'other'
      } else {
        if (item.status === '3') showType = 'basic'
        else if (item.purchaseStatus === '3') showType = 'purchase'
      }

      let isReadOnly = '1'
      if (item.subType === '组装单' || item.subType === '拆卸单') isReadOnly = '0'

      const mpList = getStore<any[]>('materialPropertyList')
      const params = {
        headerId: model.value.id,
        mpList: mpList ? getMpListShort(mpList) : '',
        linkType: showType,
        isReadOnly,
      }

      requestSubTableData(item, type, '/depotItem/getDetailList', params)
      initPlatform()
      getSystemConfig()
      getBillListByLinkNumber(model.value.number)
      getFinancialBillNoByBillId(model.value.id)
    }
  })
}

function requestSubTableData(record: any, type: string, url: string, params: any) {
  loading.value = true
  getAction(url, params)
    .then((res: any) => {
      if (res && res.code === 200) {
        dataSource.value = res.data.rows || []
        initSetting(record, type, dataSource.value)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// =============== 反审核 ===============
function handleBackCheck() {
  ElMessageBox.confirm('是否对该单据进行反审核?', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    loading.value = true
    postAction('/depotHead/batchSetStatus', { status: '0', ids: model.value.id })
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

// =============== 打印 ===============
function handlePrintPro() {
  getPlatformConfigByKey({ platformKey: 'bill_print_pro_url' }).then((res: any) => {
    if (res && res.code === 200) {
      const billPrintUrl = res.data.platformValue + '&no=' + model.value.number
      const billPrintHeight = document.documentElement.clientHeight - 260
      modalProDetail.value?.show(model.value, billPrintUrl, billPrintHeight)
      if (modalProDetail.value) {
        modalProDetail.value.title = billType.value + '-三联打印-新版'
      }
    }
  })
}

function handlePrint() {
  getPlatformConfigByKey({ platformKey: 'bill_print_url' }).then((res: any) => {
    if (res && res.code === 200) {
      const billPrintUrl = res.data.platformValue + '&no=' + model.value.number
      const billPrintHeight = dataSource.value.length * 50 + 600
      modalDetail.value?.show(model.value, billPrintUrl, billPrintHeight)
      if (modalDetail.value) {
        modalDetail.value.title = billType.value + '-三联打印'
      }
    }
  })
}

// =============== 导出 Excel ===============
function retailExportExcel() {
  const list: any[][] = []
  const head = '仓库名称,条码,名称,规格,型号,颜色,' + otherFieldTitle.value + ',库存,单位,序列号,批号,有效期,多属性,数量,单价,金额,备注'
  for (const ds of dataSource.value) {
    list.push([ds.depotName, ds.barCode, ds.name, ds.standard, ds.model, ds.color,
      ds.otherField1, ds.otherField2, ds.otherField3, ds.stock, ds.unit,
      ds.snList, ds.batchNumber, ds.expirationDate, ds.sku, ds.operNumber, ds.unitPrice, ds.allPrice, ds.remark])
  }
  const organName = model.value.organName ? '会员卡号' + model.value.organName : ''
  const tip = organName + ' 单据日期：' + model.value.operTimeStr + ' 单据编号：' + model.value.number
  exportXlsPost(billType.value + '_' + model.value.number, '单据导出', head, tip, list)
}

function applyExportExcel() {
  const list: any[][] = []
  const head = '条码,名称,规格,型号,颜色,' + otherFieldTitle.value + ',单位,多属性,原数量,已采购,数量,备注'
  for (const ds of dataSource.value) {
    list.push([ds.barCode, ds.name, ds.standard, ds.model, ds.color,
      ds.otherField1, ds.otherField2, ds.otherField3, ds.unit, ds.sku,
      ds.preNumber, ds.finishNumber, ds.operNumber, ds.remark])
  }
  const tip = '单据日期：' + model.value.operTimeStr + ' 单据编号：' + model.value.number
  exportXlsPost(billType.value + '_' + model.value.number, '单据导出', head, tip, list)
}

function orderExportExcel() {
  const list: any[][] = []
  let finishType = '', organType = ''
  if (billType.value === '采购订单') { finishType = '已入库'; organType = '供应商：' }
  else if (billType.value === '销售订单') { finishType = '已出库'; organType = '客户：' }
  const head = '条码,名称,规格,型号,颜色,' + otherFieldTitle.value + ',库存,单位,多属性,数量,' + finishType + ',单价,金额,税率(%),税额,价税合计,备注'
  for (const ds of dataSource.value) {
    list.push([ds.barCode, ds.name, ds.standard, ds.model, ds.color,
      ds.otherField1, ds.otherField2, ds.otherField3, ds.stock, ds.unit, ds.sku,
      ds.operNumber, ds.finishNumber, ds.unitPrice, ds.allPrice, ds.taxRate, ds.taxMoney, ds.taxLastMoney, ds.remark])
  }
  const organName = model.value.organName || ''
  const tip = organType + organName + ' 单据日期：' + model.value.operTimeStr + ' 单据编号：' + model.value.number
  exportXlsPost(billType.value + '_' + model.value.number, '单据导出', head, tip, list)
}

function purchaseSaleExportExcel() {
  const list: any[][] = []
  let organType = ''
  if (billType.value === '采购入库' || billType.value === '采购退货出库') organType = '供应商：'
  else if (billType.value === '销售出库' || billType.value === '销售退货入库') organType = '客户：'
  const head = '仓库名称,条码,名称,规格,型号,颜色,' + otherFieldTitle.value + ',库存,单位,序列号,批号,有效期,多属性,数量,单价,金额,税率(%),税额,价税合计,重量,备注'
  for (const ds of dataSource.value) {
    list.push([ds.depotName, ds.barCode, ds.name, ds.standard, ds.model, ds.color,
      ds.otherField1, ds.otherField2, ds.otherField3, ds.stock, ds.unit,
      ds.snList, ds.batchNumber, ds.expirationDate, ds.sku, ds.operNumber, ds.unitPrice, ds.allPrice,
      ds.taxRate, ds.taxMoney, ds.taxLastMoney, ds.weight, ds.remark])
  }
  const organName = model.value.organName || ''
  const linkNumber = model.value.linkNumber || ''
  const tip = organType + organName + ' 单据日期：' + model.value.operTimeStr + ' 单据编号：' + model.value.number + ' 关联单号：' + linkNumber
  exportXlsPost(billType.value + '_' + model.value.number, '单据导出', head, tip, list)
}

function otherExportExcel() {
  const list: any[][] = []
  let organType = ''
  if (billType.value === '其它入库') organType = '供应商：'
  else if (billType.value === '其它出库') organType = '客户：'
  const head = '仓库名称,条码,名称,规格,型号,颜色,' + otherFieldTitle.value + ',库存,单位,序列号,批号,有效期,多属性,数量,单价,金额,备注'
  for (const ds of dataSource.value) {
    list.push([ds.depotName, ds.barCode, ds.name, ds.standard, ds.model, ds.color,
      ds.otherField1, ds.otherField2, ds.otherField3, ds.stock, ds.unit,
      ds.snList, ds.batchNumber, ds.expirationDate, ds.sku, ds.operNumber, ds.unitPrice, ds.allPrice, ds.remark])
  }
  const organName = model.value.organName || ''
  const tip = organType + organName + ' 单据日期：' + model.value.operTimeStr + ' 单据编号：' + model.value.number
  exportXlsPost(billType.value + '_' + model.value.number, '单据导出', head, tip, list)
}

function allocationOutExportExcel() {
  const list: any[][] = []
  const head = '仓库名称,条码,名称,规格,型号,颜色,' + otherFieldTitle.value + ',库存,调入仓库,单位,多属性,数量,单价,金额,备注'
  for (const ds of dataSource.value) {
    list.push([ds.depotName, ds.barCode, ds.name, ds.standard, ds.model, ds.color,
      ds.otherField1, ds.otherField2, ds.otherField3, ds.stock, ds.anotherDepotName, ds.unit,
      ds.sku, ds.operNumber, ds.unitPrice, ds.allPrice, ds.remark])
  }
  const tip = '单据日期：' + model.value.operTimeStr + ' 单据编号：' + model.value.number
  exportXlsPost(billType.value + '_' + model.value.number, '单据导出', head, tip, list)
}

function assembleExportExcel() {
  const list: any[][] = []
  const head = '商品类型,仓库名称,条码,名称,规格,型号,颜色,' + otherFieldTitle.value + ',库存,单位,多属性,数量,单价,金额,备注'
  for (const ds of dataSource.value) {
    list.push([ds.mType, ds.depotName, ds.barCode, ds.name, ds.standard, ds.model, ds.color,
      ds.otherField1, ds.otherField2, ds.otherField3, ds.stock, ds.unit,
      ds.sku, ds.operNumber, ds.unitPrice, ds.allPrice, ds.remark])
  }
  const tip = '单据日期：' + model.value.operTimeStr + ' 单据编号：' + model.value.number
  exportXlsPost(billType.value + '_' + model.value.number, '单据导出', head, tip, list)
}

function stockCheckReplayExportExcel() {
  const list: any[][] = []
  const head = '仓库名称,条码,名称,规格,型号,' + otherFieldTitle.value + ',库存,单位,多属性,数量,单价,金额,备注'
  for (const ds of dataSource.value) {
    list.push([ds.depotName, ds.barCode, ds.name, ds.standard, ds.model,
      ds.otherField1, ds.otherField2, ds.otherField3, ds.stock, ds.unit,
      ds.sku, ds.operNumber, ds.unitPrice, ds.allPrice, ds.remark])
  }
  const linkNumber = model.value.linkNumber || ''
  const tip = '单据日期：' + model.value.operTimeStr + ' 单据编号：' + model.value.number + ' 关联单号：' + linkNumber
  exportXlsPost(billType.value + '_' + model.value.number, '单据导出', head, tip, list)
}

// =============== 关联单据跳转 ===============
function myHandleDetail(billNumber: string) {
  if (!billNumber) return
  findBillDetailByNumber({ number: billNumber }).then((res: any) => {
    if (res && res.code === 200) {
      const type = res.data.type === '其它' ? '' : res.data.type
      show(res.data, res.data.subType + type)
      title.value = res.data.subType + type + '-详情'
    }
  })
}

function myHandleFinancialDetail(billNo: string) {
  findFinancialDetailByNumber({ billNo }).then((res: any) => {
    if (res && res.code === 200) {
      // 财务详情弹窗 - 可根据项目需要扩展
      ElMessage.info('财务单号: ' + billNo)
    }
  })
}

// =============== 关闭/取消 ===============
function handleCancel() {
  close()
}

function close() {
  emit('close')
  visible.value = false
  modalStyle.value = ''
}

defineExpose({ show, title })
</script>

<style scoped>
.item-info {
  float: left;
  width: 30px;
  height: 30px;
  margin-left: 8px;
}
.item-img {
  cursor: pointer;
  position: static;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
