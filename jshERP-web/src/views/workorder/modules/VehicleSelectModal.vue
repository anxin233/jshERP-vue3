<template>
  <a-modal
    title="选择客户车辆"
    :width="860"
    :open="visible"
    @cancel="handleCancel"
    :footer="null">
    <!-- 搜索条件 -->
    <a-row :gutter="12" style="margin-bottom:12px">
      <a-col :span="8">
        <a-input v-model:value="searchPlate" placeholder="车牌号搜索" allowClear @pressEnter="doSearch" />
      </a-col>
      <a-col :span="8">
        <a-input v-model:value="searchName" placeholder="客户姓名搜索" allowClear @pressEnter="doSearch" />
      </a-col>
      <a-col :span="8">
        <a-button type="primary" @click="doSearch"><template #icon><legacy-icon type="search" /></template>查询</a-button>
        <a-button style="margin-left:8px" @click="resetSearch">重置</a-button>
      </a-col>
    </a-row>

    <!-- 车辆列表 -->
    <a-table
      :columns="columns"
      :dataSource="vehicleList"
      :pagination="pagination"
      :loading="loading"
      rowKey="id"
      size="middle"
      bordered
      :scroll="{y:340}"
      @change="handleTableChange">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'licensePlateNo'">
        <a-tag color="blue" v-if="!record.noPlate">
          {{ record.licensePlateProvince }}{{ record.licensePlateNo }}
        </a-tag>
        <a-tag color="orange" v-else>无牌</a-tag>
      </template>
        <template v-else-if="column.dataIndex === 'action'">
        <a-button type="primary" size="small" @click="selectVehicle(record)">选择</a-button>
      </template>
        <template v-else>{{ text }}</template>
      </template>
    </a-table>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'VehicleSelectModal',
  data() {
    return {
      visible: false,
      loading: false,
      searchPlate: '',
      searchName: '',
      vehicleList: [],
      pagination: { current: 1, pageSize: 8, total: 0,
        showTotal: (t) => `共 ${t} 条` },
      columns: [
        { title: '车牌号', dataIndex: 'licensePlateNo', width: 120 },
        { title: '车辆信息', dataIndex: 'brandModel', width: 140 },
        { title: 'VIN码',  dataIndex: 'vin', width: 160, ellipsis: true },
        { title: '客户姓名', dataIndex: 'customerName', width: 100 },
        { title: '手机号码', dataIndex: 'customerPhone', width: 120 },
        { title: '操作', dataIndex: 'action', width: 70, align: 'center' }
      ]
    }
  },
  methods: {
    show() {
      this.visible = true
      this.resetSearch()
    },
    doSearch() {
      this.pagination.current = 1
      this.loadList()
    },
    resetSearch() {
      this.searchPlate = ''
      this.searchName = ''
      this.pagination.current = 1
      this.loadList()
    },
    loadList() {
      this.loading = true
      const searchObj = {}
      if (this.searchPlate) searchObj.licensePlateNo = this.searchPlate
      if (this.searchName) searchObj.customerName = this.searchName
      searchObj.enabled = '1'
      getAction('/vehicle/list', {
        currentPage: this.pagination.current,
        pageSize: this.pagination.pageSize,
        search: JSON.stringify(searchObj)
      }).then(res => {
        if (res.code === 200) {
          this.vehicleList = res.data.rows || []
          this.pagination.total = res.data.total || 0
        }
      }).finally(() => { this.loading = false })
    },
    handleTableChange(pager) {
      this.pagination.current = pager.current
      this.loadList()
    },
    selectVehicle(record) {
      this.$emit('select', record)
      this.handleCancel()
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>
