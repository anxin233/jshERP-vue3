<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @keyup.enter="searchQuery">
            <a-row :gutter="16">
              <a-col :md="5" :sm="24">
                <a-form-item label="工单号" :labelCol="{span:6}" :wrapperCol="{span:18}">
                  <a-input placeholder="请输入工单号" v-model:value="queryParam.orderNo" allowClear />
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="24">
                <a-form-item label="客户姓名" :labelCol="{span:7}" :wrapperCol="{span:17}">
                  <a-input placeholder="请输入客户姓名" v-model:value="queryParam.customerName" allowClear />
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="24">
                <a-form-item label="车牌号" :labelCol="{span:6}" :wrapperCol="{span:18}">
                  <a-input placeholder="请输入车牌号" v-model:value="queryParam.licensePlate" allowClear />
                </a-form-item>
              </a-col>
              <a-col :md="4" :sm="24">
                <a-form-item label="状态" :labelCol="{span:6}" :wrapperCol="{span:18}">
                  <dynamic-option-select
                    v-model:value="queryParam.status"
                    code="workorder_status"
                    placeholder="全部"
                    allowClear
                    style="width:100%" />
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left:8px" @click="searchReset">重置</a-button>
                </span>
              </a-col>
            </a-row>
            <!-- 第二行：接车日期范围 -->
            <a-row :gutter="16" style="margin-top:8px">
              <a-col :md="10" :sm="24">
                <a-form-item label="接车日期" :labelCol="{span:4}" :wrapperCol="{span:20}">
                  <a-range-picker v-model:value="dateRange" format="YYYY-MM-DD"
                    @change="onDateRangeChange" style="width:100%" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <!-- 操作按钮区域 -->
        <div class="table-operator" style="margin-top:5px">
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleAdd" type="primary"><template #icon><legacy-icon type="plus" /></template>新增工单</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchDel"><template #icon><legacy-icon type="delete" /></template>删除</a-button>
          <a-button v-if="btnEnableList.indexOf(3)>-1" @click="handleExportXls('工单列表')"><template #icon><legacy-icon type="download" /></template>导出</a-button>
          <!-- 快速状态流转按钮 -->
          <a-divider type="vertical" v-if="selectedRowKeys.length > 0" />
          <template v-if="selectedRowKeys.length === 1">
            <a-button v-if="currentRecord && String(currentRecord.status) === '1'" @click="quickStatus(2)" style="color:#1890ff;border-color:#1890ff"><template #icon><legacy-icon type="tool" /></template>开始维修</a-button>
            <a-button v-if="currentRecord && String(currentRecord.status) === '2'" @click="quickStatus(3)" style="color:#13c2c2;border-color:#13c2c2"><template #icon><legacy-icon type="check-circle" /></template>完工</a-button>
            <a-button v-if="currentRecord && String(currentRecord.status) === '3'" @click="openSettleModal(currentRecord)" style="color:#722ed1;border-color:#722ed1"><template #icon><legacy-icon type="pay-circle" /></template>结算收款</a-button>
            <a-button v-if="currentRecord && String(currentRecord.status) === '4'" @click="openSettleModal(currentRecord)" style="color:#52c41a;border-color:#52c41a"><template #icon><legacy-icon type="dollar" /></template>继续收款</a-button>
            <a-button v-if="currentRecord && ['1','2'].includes(String(currentRecord.status))" @click="quickStatus(6)" style="color:#ff4d4f;border-color:#ff4d4f"><template #icon><legacy-icon type="close-circle" /></template>取消工单</a-button>
          </template>
        </div>

        <!-- 工单列表 -->
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :scroll="scroll"
          :loading="loading"
          :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
          @change="handleTableChange">
          <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.key === 'rowIndex' || column.dataIndex === 'rowIndex'">
            {{ index + 1 }}
          
            </template>
            <template v-else-if="column.dataIndex === 'orderNo'">
            <a @click="handleView(record)" style="font-weight:500">{{ text }}</a>
          
            </template>
            <template v-else-if="column.dataIndex === 'licensePlate'">
            <div>
              <a-tag color="blue">{{ record.licensePlate || '无牌' }}</a-tag>
              <span style="color:#666;font-size:12px;margin-left:4px">{{ record.vehicleInfo }}</span>
            </div>
          
            </template>
            <template v-else-if="column.dataIndex === 'status'">
            <a-tag :color="statusColor(text)">{{ statusLabel(text) }}</a-tag>
          
            </template>
            <template v-else-if="column.dataIndex === 'payableAmount'">
            <span style="color:#f5222d;font-weight:500">￥ {{ text }}</span>
          
            </template>
            <template v-else-if="column.dataIndex === 'action'">
            <a v-if="!isFinished(record.status)" @click="handleEdit(record)">编辑</a>
            <a-divider v-if="!isFinished(record.status)" type="vertical" />
            <a @click="handleView(record)">详情</a>
            <template v-if="String(record.status) === '3' || String(record.status) === '4'">
              <a-divider type="vertical" />
              <a @click="openSettleModal(record)" style="color:#722ed1">结算</a>
            </template>
            <template v-if="btnEnableList.indexOf(1)>-1 && !isFinished(record.status)">
              <a-divider type="vertical" />
              <a-popconfirm title="确定删除此工单?" @confirm="() => handleDelete(record.id)">
                <a style="color:#f5222d">删除</a>
              </a-popconfirm>
            </template>
          
            </template>
            <template v-else>{{ text }}</template>
          </template>
        </a-table>

        <!-- 弹窗 -->
        <work-order-modal ref="modalForm" @ok="modalFormOk"></work-order-modal>

        <!-- 工单结算弹窗 -->
        <a-modal
          title="工单结算"
          :open="settleVisible"
          :confirmLoading="settleLoading"
          @ok="doSettle"
          @cancel="settleVisible = false">
          <div v-if="settleRecord">
            <p>工单号：{{ settleRecord.orderNo }}</p>
            <p>客户：{{ settleRecord.customerName }}（{{ settleRecord.customerPhone }}）</p>
            <p>应收金额：<b style="color:#f5222d">￥ {{ settleRecord.payableAmount }}</b></p>
            <p v-if="settleRecord.receivedAmount > 0">已收金额：<b style="color:#52c41a">￥ {{ settleRecord.receivedAmount }}</b></p>
            <p v-if="settleRecord.receivedAmount > 0">剩余应收：<b style="color:#fa8c16">￥ {{ (settleRecord.payableAmount - settleRecord.receivedAmount).toFixed(2) }}</b></p>
          </div>
          <a-form :labelCol="{span:6}" :wrapperCol="{span:16}">
            <a-form-item label="结算账户" required>
              <a-select
                v-model:value="settleAccountId"
                placeholder="请选择结算账户"
                show-search
                optionFilterProp="children"
                style="width:100%">
                <a-select-option v-for="acc in accountList" :key="acc.id" :value="acc.id">
                  {{ acc.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="结算金额">
              <a-input-number
                v-model:value="settleAmount"
                :min="0"
                :max="settleRecord ? (settleRecord.payableAmount - (settleRecord.receivedAmount || 0)) || settleRecord.payableAmount : 99999999"
                :step="0.01"
                style="width:100%" />
            </a-form-item>
          </a-form>
        </a-modal>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import WorkOrderModal from './modules/WorkOrderModal'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { putAction, postAction } from '@/api/manage'
import DynamicOptionSelect from '@/components/biz/DynamicOptionSelect'
import { getAccount } from '@/api/api'
import { getAction } from '@/api/manage'

const STATUS_COLOR = {
  '1': 'orange', '2': 'blue',
  '3': 'cyan', '4': 'purple', '5': 'green', '6': 'red'
}

export default {
  name: 'WorkOrderList',
  mixins: [JeecgListMixin],
  components: { WorkOrderModal, DynamicOptionSelect },
  data() {
    return {
      urlPath: '/workorder/workOrderList',
      queryParam: {
        orderNo: '', customerName: '', licensePlate: '', status: '',
        beginTime: '', endTime: ''
      },
      dateRange: [],
      currentRecord: null,
      columns: [
        { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 50, align: 'center',
          customRender: ({ text: t, record: r, index, renderIndex }) => (Number.isFinite(Number(index ?? renderIndex)) ? Number(index ?? renderIndex) + 1 : '') },
        { title: '操作', dataIndex: 'action', width: 200, align: 'center' },
        { title: '工单编号', dataIndex: 'orderNo', width: 180, ellipsis: true },
        { title: '状态', dataIndex: 'status', width: 90, align: 'center' },
        { title: '车辆/车牌', dataIndex: 'licensePlate', width: 200 },
        { title: '客户姓名', dataIndex: 'customerName', width: 100 },
        { title: '客户电话', dataIndex: 'customerPhone', width: 120 },
        { title: '故障描述', dataIndex: 'faultDesc', width: 160, ellipsis: true },
        { title: '派工人员', dataIndex: 'handlerName', width: 100 },
        { title: '接车时间', dataIndex: 'intakeTime', width: 150 },
        { title: '预计完工', dataIndex: 'estimatedFinishTime', width: 150 },
        { title: '应收金额', dataIndex: 'payableAmount', width: 110, align: 'right' }
      ],
      url: {
        list: '/workOrder/list',
        delete: '/workOrder/delete',
        deleteBatch: '/workOrder/deleteBatch',
        exportXlsUrl: '/workOrder/exportXls'
      },
      statusMap: {},
      settleVisible: false,
      settleLoading: false,
      settleRecord: null,
      settleAmount: 0,
      settleAccountId: undefined,
      accountList: []
    }
  },
  watch: {
    selectedRowKeys(val) {
      if (val.length === 1) {
        this.currentRecord = this.dataSource.find(r => r.id === val[0])
      } else {
        this.currentRecord = null
      }
    }
  },
  created() {
    this.loadStatusOptions()
  },
  methods: {
    modalFormOk() {
      this.loadData(1)
      this.$nextTick(() => { this.initScroll() })
    },
    loadStatusOptions() {
      getAction('/option/list', { code: 'workorder_status' }).then(res => {
        const rows = (res.data && res.data.rows) || []
        const map = {}
        rows.forEach(r => { map[String(r.value)] = r.label })
        this.statusMap = map
      })
    },
    isFinished(status) {
      const s = String(status == null ? '' : status)
      return s === '5' || s === '6'
    },
    statusLabel(status) {
      const key = String(status == null ? '' : status)
      if (this.statusMap[key]) return this.statusMap[key]
      const fallback = { '1': '待派工', '2': '维修中', '3': '已完工', '4': '待收款', '5': '已收款', '6': '已取消' }
      return fallback[key] || '未知'
    },
    statusColor(status) {
      return STATUS_COLOR[String(status == null ? '' : status)] || 'default'
    },
    onDateRangeChange(dates, dateStrings) {
      this.queryParam.beginTime = dateStrings[0] ? dateStrings[0] + ' 00:00:00' : ''
      this.queryParam.endTime   = dateStrings[1] ? dateStrings[1] + ' 23:59:59' : ''
    },
    handleView(record) {
      this.$refs.modalForm.view(record)
    },
    quickStatus(status) {
      if (!this.currentRecord) return
      putAction('/workOrder/updateStatus?id=' + this.currentRecord.id + '&status=' + status, {}).then(res => {
        if (res.code === 200) {
          this.$message.success('状态更新成功')
          this.queryParam.status = ''
          this.loadData()
          this.selectedRowKeys = []
        } else {
          this.$message.warning(res.data || '操作失败')
        }
      })
    },
    openSettleModal(record) {
      this.settleRecord = record
      const remaining = (record.payableAmount || 0) - (record.receivedAmount || 0)
      this.settleAmount = remaining > 0 ? remaining : (record.payableAmount || 0)
      this.settleAccountId = undefined
      this.settleVisible = true
      const setDefault = () => {
        if (this.accountList.length && !this.settleAccountId) {
          this.settleAccountId = this.accountList[0].id
        }
      }
      if (!this.accountList.length) {
        getAccount({}).then(res => {
          if (res && res.code === 200 && res.data && res.data.accountList) {
            this.accountList = res.data.accountList
            setDefault()
          }
        })
      } else {
        setDefault()
      }
    },
    doSettle() {
      if (!this.settleRecord) return
      if (!this.settleAccountId) {
        this.$message.warning('请选择结算账户')
        return
      }
      if (!this.settleAmount || this.settleAmount <= 0) {
        this.$message.warning('请输入结算金额')
        return
      }
      this.settleLoading = true
      postAction('/workOrder/settle', {
        workOrderId: this.settleRecord.id,
        accountId: this.settleAccountId,
        amount: this.settleAmount
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('结算成功（已计入账户统计）')
          this.settleVisible = false
          this.queryParam.status = ''
          this.loadData()
        } else {
          this.$message.warning(res.data || '结算失败')
        }
      }).finally(() => {
        this.settleLoading = false
      })
    }
  }
}
</script>

<style scoped>
@import '@assets/less/common.less';
</style>






