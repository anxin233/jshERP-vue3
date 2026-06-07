<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @keyup.enter="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="24">
                <a-form-item label="车牌号" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入车牌号查询" v-model:value="queryParam.licensePlateNo"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="客户姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入客户姓名查询" v-model:value="queryParam.customerName"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="手机号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入手机号码查询" v-model:value="queryParam.customerPhone"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left: 8px" @click="searchReset">重置</a-button>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <!-- 操作按钮区域 -->
        <div class="table-operator" style="margin-top: 5px">
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleAdd" type="primary"><template #icon><legacy-icon type="plus" /></template>新增</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchDel"><template #icon><legacy-icon type="delete" /></template>删除</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchSetStatus(true)"><template #icon><legacy-icon type="check-square" /></template>启用</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchSetStatus(false)"><template #icon><legacy-icon type="close-square" /></template>禁用</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleImportXls()"><template #icon><legacy-icon type="import" /></template>导入</a-button>
          <a-button v-if="btnEnableList.indexOf(3)>-1" @click="handleExportXls('客户车辆')"><template #icon><legacy-icon type="download" /></template>导出</a-button>
        </div>
        <!-- 列表 -->
        <div>
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
            <!-- 操作列 -->
                      <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.key === 'rowIndex' || column.dataIndex === 'rowIndex'">
              {{ index + 1 }}
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <a @click="handleEdit(record)">编辑</a>
              <a-divider v-if="btnEnableList.indexOf(1)>-1" type="vertical" />
              <a-popconfirm v-if="btnEnableList.indexOf(1)>-1" title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                <a style="color: #f5222d;">删除</a>
              </a-popconfirm>
            
            </template>
            <template v-else-if="column.dataIndex === 'licensePlateNo'">
              <span v-if="record.noPlate">
                <a-tag color="orange">无牌</a-tag>
              </span>
              <span v-else>
                {{ record.licensePlateProvince }}{{ record.licensePlateNo }}
              </span>
            
            </template>
            <template v-else-if="column.dataIndex === 'enabled'">
              <a-tag v-if="text" color="green">启用</a-tag>
              <a-tag v-if="!text" color="orange">禁用</a-tag>
            
            </template>
            <template v-else-if="column.dataIndex === 'trafficInsuranceExpire'">
              <span v-if="record.trafficInsuranceExpire">
                <a-tag :color="isExpireSoon(record.trafficInsuranceExpire) ? 'red' : 'green'">
                  交强险：{{ formatDate(record.trafficInsuranceExpire) }}
                </a-tag>
              </span>
              <span v-if="record.commercialInsuranceExpire">
                <a-tag :color="isExpireSoon(record.commercialInsuranceExpire) ? 'red' : 'green'">
                  商业险：{{ formatDate(record.commercialInsuranceExpire) }}
                </a-tag>
              </span>
              <span v-if="record.noInsurance"><a-tag color="orange">未投保</a-tag></span>
            
            </template>
            <template v-else>{{ text }}</template>
          </template>
          </a-table>
        </div>
        <!-- 弹窗 -->
        <vehicle-modal ref="modalForm" @ok="modalFormOk"></vehicle-modal>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
  import VehicleModal from './modules/VehicleModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { putAction } from '@/api/manage'

  export default {
    name: 'VehicleList',
    mixins: [JeecgListMixin],
    components: { VehicleModal },
    data() {
      return {
        labelCol: { span: 5 },
        wrapperCol: { span: 18, offset: 1 },
        queryParam: { licensePlateNo: '', customerName: '', customerPhone: '', enabled: '' },
        columns: [
          {
            title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 50, align: 'center',
            customRender: ({ text: t, record: r, index, renderIndex }) => (Number.isFinite(Number(index ?? renderIndex)) ? Number(index ?? renderIndex) + 1 : '')
          },
          {
            title: '操作', dataIndex: 'action', width: 120, align: 'center'
          },
          {
            title: '车牌号', dataIndex: 'licensePlateNo', width: 120, align: 'center'
          },
          { title: '车辆用途', dataIndex: 'vehiclePurpose', width: 90, align: 'center' },
          { title: '车型', dataIndex: 'vehicleType', width: 120 },
          { title: 'VIN鐮', dataIndex: 'vin', width: 160, ellipsis: true },
          { title: '客户姓名', dataIndex: 'customerName', width: 100 },
          { title: '手机号码', dataIndex: 'customerPhone', width: 120 },
          { title: '客户等级', dataIndex: 'customerLevel', width: 90, align: 'center' },
          {
            title: '保险到期', dataIndex: 'trafficInsuranceExpire', width: 200
          },
          {
            title: '状态', dataIndex: 'enabled', width: 70, align: 'center'
          }
        ],
        urlPath: '/vehicle/vehicleList',
        url: {
          list: '/vehicle/list',
          delete: '/vehicle/delete',
          deleteBatch: '/vehicle/deleteBatch',
          batchSetStatusUrl: '/vehicle/batchSetStatus'
        }
      }
    },
    methods: {
      batchSetStatus(enabled) {
        if (this.selectedRowKeys.length === 0) {
          this.$message.warning('请选择至少一条记录！')
          return
        }
        const ids = this.selectedRowKeys.join(',')
        putAction(this.url.batchSetStatusUrl + `?enabled=${enabled}&ids=${ids}`).then(res => {
          if (res.code === 200) {
            this.$message.success('操作成功')
            this.loadData()
            this.selectedRowKeys = []
          } else {
            this.$message.warning(res.data || '操作失败')
          }
        })
      },
      formatDate(dateStr) {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('zh-CN')
      },
      isExpireSoon(dateStr) {
        if (!dateStr) return false
        const diff = new Date(dateStr) - new Date()
        return diff < 30 * 24 * 60 * 60 * 1000
      }
    }
  }
</script>

<style scoped>
  @import '@assets/less/common.less';
</style>
