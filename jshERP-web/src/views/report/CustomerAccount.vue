<!-- from 7 5 2 7 1 8 9 2 0 -->
<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @keyup.enter="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="24">
                <a-form-item label="客户" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-select placeholder="请选择客户" v-model:value="queryParam.organId"
                    :dropdownMatchSelectWidth="false" showSearch allow-clear optionFilterProp="children" @search="handleSearchCustomer">
                    <template #dropdownRender="{ menuNode: menu }"><div>
                      <v-nodes :vnodes="menu" />
                      <a-divider style="margin: 4px 0;" />
                      <div class="dropdown-btn" @mousedown="e => e.preventDefault()" @click="initCustomer"><legacy-icon type="reload" /> 刷新列表</div>
                    </div></template>
                    <a-select-option v-for="(item,index) in cusList" :key="index" :value="item.id">
                      {{ item.supplier }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="账单周期" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-range-picker
                    style="width: 100%"
                    v-model:value="queryParam.createTimeRange"
                    format="YYYY-MM-DD"
                    :placeholder="['开始时间', '结束时间']"
                    @change="onDateChange"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left: 8px" v-print="'#reportPrint'"><template #icon><legacy-icon type="printer" /></template>打印</a-button>
                  <a-button style="margin-left: 8px" @click="exportExcel"><template #icon><legacy-icon type="download" /></template>导出</a-button>
                  <a @click="handleToggleSearch" style="margin-left: 8px">
                    {{ toggleSearchStatus ? '收起' : '展开' }}
                    <legacy-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
                  </a>
                </span>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item>
                  {{firstTotal}} {{lastTotal}}
                </a-form-item>
              </a-col>
            </a-row>
            <template v-if="toggleSearchStatus">
              <a-row :gutter="24">
                <a-col :md="6" :sm="24">
                  <a-form-item label="欠款情况" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-select v-model:value="queryParam.hasDebt">
                      <a-select-option value="1">有欠款</a-select-option>
                      <a-select-option value="0">无欠款</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </template>
          </a-form>
        </div>
        <!-- table区域-begin -->
        <section ref="print" id="reportPrint">
          <a-table
            bordered
            ref="table"
            size="middle"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :components="handleDrag(columns)"
            :pagination="false"
            :scroll="scroll"
            :loading="loading"
            @change="handleTableChange">
            <template #headerCell="{ column }">
              <template v-if="column.dataIndex === 'rowIndex'"><span>
              <a-popover trigger="click" placement="right">
                <template #content>
                  <div class="column-setting-panel">

                  <a-checkbox-group @change="onColChange" v-model:value="settingDataIndex" :defaultValue="settingDataIndex">
                    <a-row class="column-setting-list" style="width: 600px">
                      <template v-for="(item,index) in columnSettingColumns" :key="item.dataIndex || index">
                        <a-col :span="6" class="column-setting-item">
                            <a-checkbox :value="item.dataIndex">
                              <j-ellipsis :value="getColumnSettingTitle(item)" v-if="item.dataIndex!=='allNeed'" :length="10"></j-ellipsis>
                              <j-ellipsis value="期末应收" v-if="item.dataIndex==='allNeed'" :length="10"></j-ellipsis>
                            </a-checkbox>
                        </a-col>
                      </template>
                    </a-row>
                  </a-checkbox-group>
                  <div class="column-setting-footer">恢复默认列配置：<a-button @click="handleRestDefault" type="link" size="small">恢复默认</a-button></div>
                  </div>
                </template>
                <legacy-icon type="setting" />
              </a-popover>
            </span></template>
              <template v-else-if="column.dataIndex === 'allNeed'"><span>
              期末应收
              <a-tooltip title="期末应收=期初应收+本期欠款-本期收款">
                <legacy-icon type="question-circle" />
              </a-tooltip>
            </span></template>
              <template v-else>{{ column.title }}</template>
            </template>
            <template #action="{ text, record }"><span>
              <a @click="showDebtAccountList(record)">{{record.id?'详情':''}}</a>
            </span></template>
            </a-table>
          <a-row :gutter="24" style="margin-top: 8px;text-align:right;">
            <a-col :md="24" :sm="24">
              <a-pagination @change="paginationChange" @showSizeChange="paginationShowSizeChange"
                size="small"
                show-size-changer
                :showQuickJumper="true"
                :current="ipagination.current"
                :page-size="ipagination.pageSize"
                :page-size-options="ipagination.pageSizeOptions"
                :total="ipagination.total"
                :show-total="(total, range) => `共 ${total-Math.ceil(total/ipagination.pageSize)} 条`">
                <template #buildOptionText="{ value }">
                  <span>{{ Number(value) - 1 }}条/页</span>
                </template>
              </a-pagination>
            </a-col>
          </a-row>
        </section>
        <!-- table区域-end -->
        <!-- 表单区域 -->
        <debt-account-list ref="debtAccountList"></debt-account-list>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
  import DebtAccountList from './modules/DebtAccountList'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { getFormatDate, getPrevMonthFormatDate, buildStatementAccountQueryParams } from '@/utils/util'
  import { getAction } from '@/api/manage'
  import {findBySelectCus} from '@/api/api'
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import moment from 'moment'
  export default {
    name: "CustomerAccount",
    mixins:[JeecgListMixin],
    components: {
      DebtAccountList,
      JEllipsis,
      VNodes: {
        props: { vnodes: { type: null, default: null } },
        render() { return this.vnodes }
      }
    },
    data () {
      return {
        labelCol: {
          span: 5
        },
        wrapperCol: {
          span: 18,
          offset: 1
        },
        // 查询条件
        queryParam: {
          supplierType: "客户",
          organId: undefined,
          hasDebt: '1',
          beginTime: getPrevMonthFormatDate(3),
          endTime: getFormatDate(),
          createTimeRange: [moment(getPrevMonthFormatDate(3)), moment(getFormatDate())],
        },
        ipagination:{
          pageSize: 11,
          pageSizeOptions: ['11', '21', '31', '101', '201']
        },
        cusList: [],
        firstTotal: '',
        lastTotal: '',
        setTimeFlag: null,
        tabKey: "1",
        pageName: 'customerAccount',
        // 默认索引
        defDataIndex:['rowIndex','action','supplier','contacts','telephone','phoneNum','email','preNeed','debtMoney','backMoney','allNeed'],
        // 默认列
        defColumns: [
          {
            title: '#', dataIndex: 'rowIndex', hideInColumnSetting: true, width:40, align:"center",
            customRender:function (t,r,index) {
              return (t !== '合计') ? (parseInt(index) + 1) : t
            }
          },
          {title: '欠款详情', dataIndex: 'action', align:"center", width: 80,
            customRender: (cell) => this.$renderColumnSlot('action', cell)
          },
          {title: '客户', dataIndex: 'supplier', width: 150, ellipsis:true},
          {title: '联系人', dataIndex: 'contacts', width: 100, ellipsis:true},
          {title: '手机号码', dataIndex: 'telephone', width: 100},
          {title: '联系电话', dataIndex: 'phoneNum', width: 100},
          {title: '电子邮箱', dataIndex: 'email', width: 100},
          {title: '电子邮箱', dataIndex: 'preNeed', sorter: (a, b) => a.preNeed - b.preNeed, width: 80},
          {title: '本期欠款', dataIndex: 'debtMoney', sorter: (a, b) => a.debtMoney - b.debtMoney, width: 80},
          {title: '本期收款', dataIndex: 'backMoney', sorter: (a, b) => a.backMoney - b.backMoney, width: 80},
          {title: '期末应收', dataIndex: 'allNeed', sorter: (a, b) => a.allNeed - b.allNeed, width: 80}
        ],
        url: {
          list: "/depotHead/getStatementAccount",
        }
      }
    },
    created () {
      this.initCustomer()
      this.initColumnsSetting()
    },
    methods: {
      getQueryParams() {
        return buildStatementAccountQueryParams(this.queryParam, this.ipagination)
      },
      initCustomer() {
        let that = this;
        findBySelectCus({limit:1}).then((res)=>{
          if(res) {
            that.cusList = res;
          }
        });
      },
      handleSearchCustomer(value) {
        let that = this
        if(this.setTimeFlag != null){
          clearTimeout(this.setTimeFlag);
        }
        this.setTimeFlag = setTimeout(()=>{
          findBySelectCus({key: value, limit:1}).then((res) => {
            if(res) {
              that.cusList = res;
            }
          })
        },500)
      },
      onDateChange: function (value, dateString) {
        this.queryParam.beginTime = dateString[0]
        this.queryParam.endTime = dateString[1]
        if (dateString[0] && dateString[1]) {
          this.queryParam.createTimeRange = [moment(dateString[0]), moment(dateString[1])]
        } else {
          this.queryParam.createTimeRange = []
        }
      },
      loadData(arg) {
        if (!this.queryParam.beginTime || !this.queryParam.endTime) {
          this.loading = false
          return
        }
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        let params = this.getQueryParams();//查询条件
        this.loading = true;
        getAction(this.url.list, params).then((res) => {
          if (res.code===200) {
            this.dataSource = res.data.rows;
            this.ipagination.total = res.data.total;
            this.tableAddTotalRow(this.columns, this.dataSource)
            this.firstTotal = '期初应收：' + res.data.firstMoney + '元'
            this.lastTotal = '期末应收：' + res.data.lastMoney
          } else if(res.code===510){
            this.$message.warning(res.data)
          } else {
            this.$message.warning(res.data && res.data.message ? res.data.message : res.data)
          }
        }).catch(() => {
          this.$message.error('加载数据失败')
        }).finally(() => {
          this.loading = false;
        })
      },
      searchQuery() {
        if(this.queryParam.beginTime === '' || this.queryParam.endTime === ''){
          this.$message.warning('请选择单据日期：')
        } else {
          this.loadData(1);
        }
      },
      exportExcel() {
        let list = []
        let head = '客户,联系人,手机号码,联系电话,电子邮箱,期初应收,本期欠款,本期收款,期末应收'
        for (let i = 0; i < this.dataSource.length; i++) {
          let item = []
          let ds = this.dataSource[i]
          item.push(ds.supplier, ds.contacts, ds.telephone, ds.phoneNum, ds.email, ds.preNeed, ds.debtMoney, ds.backMoney, ds.allNeed)
          list.push(item)
        }
        let tip = '单据日期：' + this.queryParam.beginTime + '~' + this.queryParam.endTime
        this.handleExportXlsPost('客户对账', '客户对账', head, tip, list)
      },
      showDebtAccountList(record) {
        this.$refs.debtAccountList.show(record.id, '出库', '销售', '客户', "", this.queryParam.beginTime, this.queryParam.endTime)
        this.$refs.debtAccountList.title = "欠款详情"
        this.$refs.debtAccountList.disableSubmit = false
      }
    }
  }
</script>
<style scoped>
  @import '@assets/less/common.less'
</style>
