<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="1400"
      :open="visible"
      :destroyOnClose="true"
      :getContainer="getModalContainer"
      :maskStyle="{'top':'93px','left':'154px'}"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      @cancel="handleCancel"
      cancelText="关闭"
      style="top:20px;height: 95%;">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
      </template>
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <!-- 搜索区域 -->
        <a-form layout="inline" @keyup.enter="searchQuery">
          <a-row :gutter="24">
            <a-col :md="8" :sm="24">
              <a-form-item label="单据编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-input placeholder="请输入单据编号" v-model:value="queryParam.number"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="单据日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-range-picker
                  style="width:100%"
                  v-model:value="queryParam.createTimeRange"
                  format="YYYY-MM-DD"
                  :placeholder="['开始时间', '结束时间']"
                  @change="onDateChange"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="searchReset">重置</a-button>
              <a-button style="margin-left: 8px" @click="exportExcel"><template #icon><legacy-icon type="download" /></template>导出</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- table区域-begin -->
      <a-table
        bordered
        ref="table"
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :components="handleDrag(columns)"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">
        <template #numberCustomRender="{ text, record }"><span>
          <a @click="myHandleDetail(record)">{{record.number}}</a>
        </span></template>
      </a-table>
      <!-- table区域-end -->
      <!-- 表单区域 -->
      <bill-detail v-if="billDetailVisible" ref="billDetail"></bill-detail>
    </a-modal>
  </div>
</template>
<script>
  import BillDetail from '../../bill/dialog/BillDetail'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import { findBillDetailByNumber } from '@/api/api'
  import { mixinDevice } from '@/utils/mixin'

  export default {
    name: "MaterialInOutList",
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      BillDetail,
      JEllipsis
    },
    data () {
      return {
        title:"操作",
        visible: false,
        disableMixinCreated: true,
        billDetailVisible: false,
        toFromType: '',
        currentMaterialId: '',
        // 查询条件
        queryParam: {
          depotIds: '',
          materialId:'',
          number: '',
          beginTime: '',
          endTime: '',
        },
        ipagination:{
          pageSizeOptions: ['10', '20', '30', '100', '200']
        },
        tabKey: "1",
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:40,
            align:"center",
            customRender:function ({ text: t, record: r, index, renderIndex }) {
              return (Number.isFinite(Number(index ?? renderIndex)) ? Number(index ?? renderIndex) + 1 : '');
            }
          },
          {
            title: '单据编号', dataIndex: 'number', width: 120,
            customRender: (cell) => this.$renderColumnSlot('numberCustomRender', cell),
          },
          { title: '类型', dataIndex: 'type', width: 80},
          { title: '条码', dataIndex: 'barCode', width: 100},
          { title: '名称', dataIndex: 'materialName', width: 200},
          { title: '仓库名称', dataIndex: 'depotName', width: 80},
          { title: '数量', dataIndex: 'basicNumber', width: 70},
          { title: '单价', dataIndex: 'unitPrice', width: 70},
          { title: '金额', dataIndex: 'allPrice', width: 70},
          { title: '日期', dataIndex: 'operTime', width: 110}
        ],
        labelCol: {
          xs: { span: 1 },
          sm: { span: 2 },
        },
        wrapperCol: {
          xs: { span: 10 },
          sm: { span: 16 },
        },
        url: {
          list: "/depotItem/findDetailByDepotIdsAndMaterialId"
        }
      }
    },
    created() {
    },
    methods: {
      getModalContainer() {
        return this.$refs.container || document.body
      },
      getQueryParams() {
        let param = Object.assign({}, this.queryParam, this.isorter)
        param.field = this.getQueryField()
        param.materialId = this.currentMaterialId
        param.currentPage = this.ipagination.current
        param.pageSize = this.ipagination.pageSize
        return param
      },
      show(record, depotIds) {
        this.model = Object.assign({}, record);
        this.currentMaterialId = record.id
        this.visible = true;
        this.queryParam.depotIds = depotIds
        this.queryParam.materialId = record.id
        this.loadData(1)
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.billDetailVisible = false;
      },
      handleCancel () {
        this.close()
      },
      onDateChange: function (value, dateString) {
        this.queryParam.beginTime=dateString[0];
        this.queryParam.endTime=dateString[1];
      },
      myHandleDetail(record) {
        let that = this
        this.toFromType = record.fromType
        this.billDetailVisible = true
        findBillDetailByNumber({ number: record.number }).then((res) => {
          if (res && res.code === 200) {
            that.$nextTick(() => {
              if (!that.$refs.billDetail) return
              that.$refs.billDetail.isCanBackCheck = false
              that.$refs.billDetail.show(res.data, record.type);
              that.$refs.billDetail.title = "详情";
            })
          } else {
            that.billDetailVisible = false
          }
        }).catch(() => {
          that.billDetailVisible = false
        })
      },
      exportExcel() {
        let list = []
        let head = '单据编号,类型,条码,名称,仓库名称,数量,单价,金额,日期'
        for (let i = 0; i < this.dataSource.length; i++) {
          let item = []
          let ds = this.dataSource[i]
          item.push(ds.number, ds.type, ds.barCode, ds.materialName, ds.depotName, ds.basicNumber, ds.unitPrice, ds.allPrice, ds.operTime)
          list.push(item)
        }
        let tip = '商品库存流水查询'
        this.handleExportXlsPost('商品库存流水', '商品库存流水', head, tip, list)
      }
    }
  }
</script>
<style scoped>
  @import '@assets/less/common.less'
</style>
