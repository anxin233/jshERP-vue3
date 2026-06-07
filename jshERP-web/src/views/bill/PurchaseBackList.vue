<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <!-- 搜索区域 -->
          <a-form layout="inline" @keyup.enter="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="24">
                <a-form-item label="单据编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入单据编号" v-model:value="queryParam.number"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="商品信息" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入条码、名称、助记码、规格、型号等信息" v-model:value="queryParam.materialParam"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="单据日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-range-picker
                    style="width:100%"
                    v-model:value="queryParam.createTimeRange"
                    format="YYYY-MM-DD"
                    :placeholder="['开始时间', '结束时间']"
                    @change="onDateChange"
                    @ok="onDateOk"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left: 8px" @click="searchReset">重置</a-button>
                  <a @click="handleToggleSearch" style="margin-left: 8px">
                    {{ toggleSearchStatus ? '收起' : '展开' }}
                    <legacy-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
                  </a>
                </span>
              </a-col>
            </a-row>
            <template v-if="toggleSearchStatus">
              <a-row :gutter="24">
                <a-col :md="6" :sm="24">
                  <a-form-item label="供应商" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-select placeholder="请选择供应商" showSearch allow-clear optionFilterProp="children" v-model:value="queryParam.organId" @search="handleSearchSupplier">
                      <template #dropdownRender="{ menuNode: menu }"><div>
                        <v-nodes :vnodes="menu" />
                        <a-divider style="margin: 4px 0;" />
                        <div class="dropdown-btn" @mousedown="e => e.preventDefault()" @click="initSupplier(0)"><legacy-icon type="reload" /> 刷新列表</div>
                      </div></template>
                      <a-select-option v-for="(item,index) in supList" :key="index" :value="item.id">
                        {{ item.supplier }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="6" :sm="24">
                  <a-form-item label="仓库名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-select placeholder="请选择仓库" showSearch allow-clear optionFilterProp="children" v-model:value="queryParam.depotId">
                      <a-select-option v-for="(depot,index) in depotList" :key="index" :value="depot.id">
                        {{ depot.depotName }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="6" :sm="24">
                  <a-form-item label="操作员" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-select placeholder="请选择操作员" showSearch allow-clear optionFilterProp="children" v-model:value="queryParam.creator">
                      <a-select-option v-for="(item,index) in userList" :key="index" :value="item.id">
                        {{ item.userName }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="6" :sm="24">
                  <a-form-item label="关联单据" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-input placeholder="请输入关联单据" v-model:value="queryParam.linkNumber"></a-input>
                  </a-form-item>
                </a-col>
                <a-col :md="6" :sm="24">
                  <a-form-item label="结算账户" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-select placeholder="请选择结算账户" showSearch allow-clear optionFilterProp="children" v-model:value="queryParam.accountId">
                      <a-select-option v-for="(item,index) in accountList" :key="index" :value="item.id">
                        {{ item.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="6" :sm="24">
                  <a-form-item label="单据状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-select placeholder="请选择单据状态" allow-clear v-model:value="queryParam.status">
                      <a-select-option value="0">未审核</a-select-option>
                      <a-select-option value="9" v-if="!checkFlag">审核中</a-select-option>
                      <a-select-option value="1">已审核</a-select-option>
                      <a-select-option value="3">部分出库</a-select-option>
                      <a-select-option value="2">完成出库</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="6" :sm="24">
                  <a-form-item label="单据备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-input placeholder="请输入单据备注" v-model:value="queryParam.remark"></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </template>
          </a-form>
        </div>
        <!-- 操作按钮区域 -->
        <div class="table-operator"  style="margin-top: 5px">
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="myHandleAdd" type="primary"><template #icon><legacy-icon type="plus" /></template>新增</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchDel"><template #icon><legacy-icon type="delete" /></template>删除</a-button>
          <a-tooltip title="只可将状态是部分出库的单据强制完成">
            <a-button v-if="inOutManageFlag && btnEnableList.indexOf(1)>-1" @click="batchForceClose"><template #icon><legacy-icon type="issues-close" /></template>强制结单</a-button>
          </a-tooltip>
          <a-button v-if="checkFlag && btnEnableList.indexOf(2)>-1" @click="batchSetStatus(1)"><template #icon><legacy-icon type="check" /></template>审核</a-button>
          <a-button v-if="checkFlag && btnEnableList.indexOf(7)>-1" @click="batchSetStatus(0)"><template #icon><legacy-icon type="stop" /></template>反审核</a-button>
          <a-button v-if="isShowExcel && btnEnableList.indexOf(3)>-1" @click="handleExport"><template #icon><legacy-icon type="download" /></template>导出</a-button>
          <a-popover trigger="click" placement="right">
            <template #content>
              <div class="column-setting-panel">

              <a-checkbox-group @change="onColChange" v-model:value="settingDataIndex" :defaultValue="settingDataIndex">
                <a-row class="column-setting-list" style="width: 500px">
                  <template v-for="(item,index) in columnSettingColumns" :key="item.dataIndex || index">
                    <a-col :span="8" class="column-setting-item">
                        <a-checkbox :value="item.dataIndex">
                          <j-ellipsis :value="getColumnSettingTitle(item)" :length="10"></j-ellipsis>
                        </a-checkbox>
                      </a-col>
                  </template>
                </a-row>
              </a-checkbox-group>
              <div class="column-setting-footer">恢复默认列配置：<a-button @click="handleRestDefault" type="link" size="small">恢复默认</a-button></div>
              </div>
            </template>
            <a-button><template #icon><legacy-icon type="setting" /></template>列设置</a-button>
          </a-popover>
          <a-tooltip placement="left" title="用于采购入库单据的退货。采购退货单可以由采购出库单转过来，也可以单独创建。">
            <legacy-icon v-if="btnEnableList.indexOf(1)>-1" type="question-circle" style="font-size:20px;float:right;" />
          </a-tooltip>
        </div>
        <!-- table区域-begin -->
        <div>
          <a-table
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :components="handleDrag(columns)"
            :pagination="ipagination"
            :scroll="scroll"
            :loading="loading"
            :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
            :expandedRowKeys="expandedRowKeys"
            @expand="onExpand"
            @change="handleTableChange">
            <template #action="{ text, record }"><span>
              <a @click="myHandleDetail(record, '采购退货出库', prefixNo)">查看</a>
              <a-divider v-if="btnEnableList.indexOf(1)>-1" type="vertical" />
              <a v-if="btnEnableList.indexOf(1)>-1" @click="myHandleEdit(record)">编辑</a>
              <a-divider v-if="btnEnableList.indexOf(1)>-1" type="vertical" />
              <a v-if="btnEnableList.indexOf(1)>-1" @click="myHandleCopyAdd(record)">复制</a>
              <a-divider v-if="btnEnableList.indexOf(1)>-1" type="vertical" />
              <a-popconfirm v-if="btnEnableList.indexOf(1)>-1" title="确定删除吗?" @confirm="() => myHandleDelete(record)">
                <a>删除</a>
              </a-popconfirm>
            </span></template>
            <template #customRenderStatus="{ text: status }">
              <a-tag v-if="status == '0'" color="red">未审核</a-tag>
              <a-tag v-if="status == '1'" color="green">已审核</a-tag>
              <a-tag v-if="status == '2'" color="cyan">完成出库</a-tag>
              <a-tag v-if="status == '3'" color="blue">部分出库</a-tag>
              <a-tag v-if="status == '9'" color="orange">审核中</a-tag>
            </template>
            <template #expandedRowRender="{ record: record }"><a-table bordered
              size="small"
              :loading="record.loading"
              :columns="detailColumns"
              :dataSource="record.childrens"
              :row-key="record => record.id"
              :pagination="false">
            </a-table></template>
          </a-table>
        </div>
        <!-- table区域-end -->
        <!-- 表单区域 -->
        <purchase-back-modal ref="modalForm" @ok="modalFormOk" @close="modalFormClose"></purchase-back-modal>
        <bill-detail ref="modalDetail" @ok="modalFormOk" @close="modalFormClose"></bill-detail>
        <bill-excel-iframe ref="billExcelIframe" @ok="modalFormOk" @close="modalFormClose"></bill-excel-iframe>
      </a-card>
    </a-col>
  </a-row>
</template>
<!-- by jisheng hua-->
<script>
  import PurchaseBackModal from './modules/PurchaseBackModal'
  import BillDetail from './dialog/BillDetail'
  import BillExcelIframe from '@/components/tools/BillExcelIframe'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { BillListMixin } from './mixins/BillListMixin'
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import JDate from '@/components/jeecg/JDate'  export default {
    name: "PurchaseBackList",
    mixins:[JeecgListMixin,BillListMixin],
    components: {
      PurchaseBackModal,
      BillDetail,
      BillExcelIframe,
      JEllipsis,
      JDate,
      VNodes: {
        props: { vnodes: { type: null, default: null } },
        render() { return this.vnodes }
      }
    },
    data () {
      return {
        // 查询条件
        queryParam: {
          number: "",
          materialParam: "",
          type: "出库",
          subType: "采购退货",
          organId: undefined,
          depotId: undefined,
          creator: undefined,
          linkNumber: "",
          accountId: undefined,
          status: undefined,
          remark: ""
        },
        prefixNo: 'CGTH',
        urlPath: '/bill/purchase_back',
        //出入库管理开关，适合独立仓管场景
        inOutManageFlag: false,
        labelCol: {
          span: 5
        },
        wrapperCol: {
          span: 18,
          offset: 1
        },
        // 默认索引
        defDataIndex:['action','organName','number','materialsList','operTimeStr','userName','materialCount','totalPrice','totalTaxLastMoney',
          'needBackMoney','changeAmount','debt','status'],
        // 默认列
        defColumns: [
          {
            title: '操作',
            dataIndex: 'action',
            align:"center", width: 180,
            customRender: (cell) => this.$renderColumnSlot('action', cell),
          },
          { title: '供应商', dataIndex: 'organName',width:120, ellipsis:true},
          { title: '单据编号', dataIndex: 'number',width:160,
            customRender: ({ text, record, index, renderIndex }) => {
              text = record.linkNumber?text+"[转]":text
              return text
            }
          },
          { title: '关联单据', dataIndex: 'linkNumber',width:140},
          { title: '商品信息', dataIndex: 'materialsList',width:220, ellipsis:true},
          { title: '单据日期', dataIndex: 'operTimeStr',width:145},
          { title: '操作员', dataIndex: 'userName',width:80, ellipsis:true},
          { title: '数量', dataIndex: 'materialCount',width:60},
          { title: '金额合计', dataIndex: 'totalPrice',width:80},
          { title: '含税合计', dataIndex: 'totalTaxLastMoney',width:80,
            customRender: ({ text, record, index, renderIndex }) => {
              return (record.discountMoney + record.discountLastMoney).toFixed(2);
            }
          },
          { title: '优惠率', dataIndex: 'discount',width:60,
            customRender: ({ text, record, index, renderIndex }) => {
              return text? text + '%':''
            }
          },
          { title: '优惠金额', dataIndex: 'discountMoney',width:80},
          { title: '其它费用', dataIndex: 'otherMoney',width:80},
          { title: '待退金额', dataIndex: 'needBackMoney',width:80,
            customRender: ({ text, record, index, renderIndex }) => {
              let needBackMoney = record.discountLastMoney + record.otherMoney
              return needBackMoney? needBackMoney.toFixed(2):0
            }
          },
          { title: '结算账户', dataIndex: 'accountName',width:80},
          { title: '本次退款', dataIndex: 'changeAmount',width:80},
          { title: '本次欠款', dataIndex: 'debt',width:80},
          { title: '备注', dataIndex: 'remark',width:200},
          { title: '状态', dataIndex: 'status', width: 80, align: "center",
            customRender: (cell) => this.$renderColumnSlot('customRenderStatus', cell)
          }
        ],
        url: {
          list: "/depotHead/list",
          delete: "/depotHead/delete",
          deleteBatch: "/depotHead/deleteBatch",
          forceCloseBatch: "/depotHead/forceCloseBatch",
          batchSetStatusUrl: "/depotHead/batchSetStatus"
        }
      }
    },
    computed: {
    },
    created () {
      this.initSystemConfig()
      this.initSupplier()
      this.getDepotData()
      this.initUser()
      this.initAccount()
    },
    methods: {
    }
  }
</script>
<style scoped>
  @import '@assets/less/common.less'
</style>




