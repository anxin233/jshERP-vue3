<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @keyup.enter.native="searchQuery">
            <a-row :gutter="16">
              <a-col :md="5" :sm="24">
                <a-form-item label="工单号" :labelCol="{span:6}" :wrapperCol="{span:18}">
                  <a-input placeholder="请输入工单号" v-model="queryParam.orderNo" allowClear />
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="24">
                <a-form-item label="客户姓名" :labelCol="{span:7}" :wrapperCol="{span:17}">
                  <a-input placeholder="请输入客户姓名" v-model="queryParam.customerName" allowClear />
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="24">
                <a-form-item label="车牌号" :labelCol="{span:6}" :wrapperCol="{span:18}">
                  <a-input placeholder="请输入车牌号" v-model="queryParam.licensePlate" allowClear />
                </a-form-item>
              </a-col>
              <a-col :md="4" :sm="24">
                <a-form-item label="状态" :labelCol="{span:6}" :wrapperCol="{span:18}">
                  <dynamic-option-select
                    v-model="queryParam.status"
                    code="workorder_status"
                    placeholder="全部"
                    allowClear
                    style="width:100%" />
                </a-form-item>
              </a-col>
              <a-col :md="5" :sm="24">
                <span style="float:left;overflow:hidden" class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left:8px" @click="searchReset">重置</a-button>
                </span>
              </a-col>
            </a-row>
            <!-- 第二行：接车日期范围 -->
            <a-row :gutter="16" style="margin-top:8px">
              <a-col :md="10" :sm="24">
                <a-form-item label="接车日期" :labelCol="{span:4}" :wrapperCol="{span:20}">
                  <a-range-picker v-model="dateRange" format="YYYY-MM-DD"
                    @change="onDateRangeChange" style="width:100%" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <!-- 操作按钮区域 -->
        <div class="table-operator" style="margin-top:5px">
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleAdd" type="primary" icon="plus">新增工单</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchDel" icon="delete">删除</a-button>
          <a-button v-if="btnEnableList.indexOf(3)>-1" @click="handleExportXls('工单列表')" icon="download">导出</a-button>
          <!-- 快速状态流转按钮 -->
          <a-divider type="vertical" v-if="selectedRowKeys.length > 0" />
          <template v-if="selectedRowKeys.length === 1">
            <a-button v-if="currentRecord && currentRecord.status === 0" @click="quickStatus(1)" icon="schedule" style="color:#fa8c16;border-color:#fa8c16">待派工</a-button>
            <a-button v-if="currentRecord && currentRecord.status === 1" @click="quickStatus(2)" icon="tool" style="color:#1890ff;border-color:#1890ff">开始维修</a-button>
            <a-button v-if="currentRecord && currentRecord.status === 2" @click="quickStatus(3)" icon="check-circle" style="color:#52c41a;border-color:#52c41a">完工结算</a-button>
            <a-button v-if="currentRecord && currentRecord.status === 3" @click="quickStatus(4)" icon="pay-circle" style="color:#722ed1;border-color:#722ed1">确认收款</a-button>
            <a-button v-if="currentRecord && [0,1,2].includes(currentRecord.status)" @click="quickStatus(5)" icon="close-circle" style="color:#ff4d4f;border-color:#ff4d4f">取消工单</a-button>
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

          <!-- 工单号列 -->
          <template slot="orderNo" slot-scope="text, record">
            <a @click="handleView(record)" style="font-weight:500">{{ text }}</a>
          </template>

          <!-- 车辆信息 -->
          <template slot="vehicleCol" slot-scope="text, record">
            <div>
              <a-tag color="blue">{{ record.licensePlate || '无牌' }}</a-tag>
              <span style="color:#666;font-size:12px;margin-left:4px">{{ record.vehicleInfo }}</span>
            </div>
          </template>

          <!-- 状态列 -->
          <template slot="statusCol" slot-scope="status">
            <a-tag :color="statusColor(status)">{{ statusLabel(status) }}</a-tag>
          </template>

          <!-- 付款状态 -->
          <template slot="paymentStatusCol" slot-scope="ps">
            <a-tag :color="ps===2?'green':ps===1?'orange':'red'">
              {{ ps===2?'已付清':ps===1?'部分付款':'未付款' }}
            </a-tag>
          </template>

          <!-- 金额 -->
          <template slot="amountCol" slot-scope="text">
            <span style="color:#f5222d;font-weight:500">¥ {{ text }}</span>
          </template>

          <!-- 操作列 -->
          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleView(record)" style="color:#1890ff">详情</a>
            <a-divider type="vertical" />
            <a v-if="record.status === 3" @click="openSettleModal(record)" style="color:#722ed1">结算</a>
            <a-divider v-if="btnEnableList.indexOf(1)>-1" type="vertical" />
            <a-popconfirm v-if="btnEnableList.indexOf(1)>-1" title="确定删除此工单?" @confirm="() => handleDelete(record.id)">
              <a style="color:#f5222d">删除</a>
            </a-popconfirm>
          </span>
        </a-table>

        <!-- 弹窗 -->
        <work-order-modal ref="modalForm" @ok="modalFormOk"></work-order-modal>

        <!-- 工单结算弹窗 -->
        <a-modal
          title="工单结算"
          :visible="settleVisible"
          :confirmLoading="settleLoading"
          @ok="doSettle"
          @cancel="settleVisible = false">
          <div v-if="settleRecord">
            <p>工单号：{{ settleRecord.orderNo }}</p>
            <p>客户：{{ settleRecord.customerName }}（{{ settleRecord.customerPhone }}）</p>
            <p>应收金额：<b style="color:#f5222d">¥ {{ settleRecord.payableAmount }}</b></p>
          </div>
          <a-form :labelCol="{span:6}" :wrapperCol="{span:16}">
            <a-form-item label="结算账户">
              <a-select
                v-model="settleAccountId"
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
                v-model="settleAmount"
                :min="0"
                :max="settleRecord ? settleRecord.payableAmount : 99999999"
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

const STATUS_MAP = {
  0: { label: '草稿',   color: 'default' },
  1: { label: '待派工', color: 'orange' },
  2: { label: '维修中', color: 'blue' },
  3: { label: '待结算', color: 'purple' },
  4: { label: '已结算', color: 'green' },
  5: { label: '已取消', color: 'red' }
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
        { title: '#', dataIndex: '', key: 'rowIndex', width: 50, align: 'center',
          customRender: (t, r, index) => parseInt(index) + 1 },
        { title: '操作', dataIndex: 'action', width: 130, align: 'center',
          scopedSlots: { customRender: 'action' } },
        { title: '工单编号', dataIndex: 'orderNo', width: 180, ellipsis: true,
          scopedSlots: { customRender: 'orderNo' } },
        { title: '车辆/车牌', dataIndex: 'licensePlate', width: 200,
          scopedSlots: { customRender: 'vehicleCol' } },
        { title: '客户姓名', dataIndex: 'customerName', width: 100 },
        { title: '客户电话', dataIndex: 'customerPhone', width: 120 },
        { title: '故障描述', dataIndex: 'faultDesc', width: 160, ellipsis: true },
        { title: '经手人', dataIndex: 'handlerName', width: 90 },
        { title: '接车时间', dataIndex: 'intakeTime', width: 150 },
        { title: '预计完工', dataIndex: 'estimatedFinishTime', width: 150 },
        { title: '应收金额', dataIndex: 'payableAmount', width: 110, align: 'right',
          scopedSlots: { customRender: 'amountCol' } },
        { title: '状态', dataIndex: 'status', width: 80, align: 'center',
          scopedSlots: { customRender: 'statusCol' } },
        { title: '付款状态', dataIndex: 'paymentStatus', width: 90, align: 'center',
          scopedSlots: { customRender: 'paymentStatusCol' } }
      ],
      url: {
        list: '/workOrder/list',
        delete: '/workOrder/delete',
        deleteBatch: '/workOrder/deleteBatch',
        exportXlsUrl: '/workOrder/exportXls'
      },
      // 结算相关
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
  methods: {
    statusLabel(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].label : '未知'
    },
    statusColor(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].color : 'default'
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
      putAction('/workOrder/updateStatus', null, {
        params: { id: this.currentRecord.id, status }
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('状态更新成功')
          this.loadData()
          this.selectedRowKeys = []
        } else {
          this.$message.warning(res.data || '操作失败')
        }
      })
    },
    openSettleModal(record) {
      this.settleRecord = record
      this.settleAmount = record.payableAmount || 0
      this.settleAccountId = undefined
      this.settleVisible = true
      if (!this.accountList.length) {
        getAccount({}).then(res => {
          if (res && res.code === 200 && res.data && res.data.accountList) {
            this.accountList = res.data.accountList
          }
        })
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
          this.$message.success('结算成功，已纳入账户统计')
          this.settleVisible = false
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
@import '~@assets/less/common.less';
</style>
