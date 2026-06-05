<template>
  <a-modal
    title="从项目库导入"
    :width="800"
    :open="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="导入所选">
    <!-- 搜索 -->
    <a-row :gutter="12" style="margin-bottom:12px">
      <a-col :span="10">
        <a-input v-model:value="searchName" placeholder="项目名称搜索" allowClear @pressEnter="doSearch" />
      </a-col>
      <a-col :span="14">
        <a-button type="primary" @click="doSearch"><template #icon><legacy-icon type="search" /></template>查询</a-button>
        <a-button style="margin-left:8px" @click="resetSearch">重置</a-button>
        <span style="margin-left:16px;color:#999;font-size:12px">已选 {{ selectedRowKeys.length }} 项</span>
      </a-col>
    </a-row>

    <a-table
      :columns="columns"
      :dataSource="projectList"
      :pagination="pagination"
      :loading="loading"
      :rowSelection="{selectedRowKeys, onChange: onSelectChange, type:'checkbox'}"
      rowKey="id"
      size="middle"
      bordered
      :scroll="{y:340}"
      @change="handleTableChange">
      <template #bodyCell="{ column, text }">
        <span v-if="column.dataIndex === 'totalPrice'" style="color:#f5222d">? {{ text }}</span>
        <template v-else>{{ text }}</template>
      </template>
    </a-table>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'ProjectSelectModal',
  emits: ['ok'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      loading: false,
      searchName: '',
      projectList: [],
      selectedRowKeys: [],
      selectedRows: [],
      pagination: { current: 1, pageSize: 10, total: 0,
        showTotal: (t) => `共 ${t} 条` },
      columns: [
        { title: '项目名称', dataIndex: 'name', ellipsis: true },
        { title: '类别',     dataIndex: 'categoryName', width: 120 },
        { title: '参考价格', dataIndex: 'totalPrice', width: 110, align: 'right' },
        { title: '说明',     dataIndex: 'description', ellipsis: true }
      ]
    }
  },
  methods: {
    show() {
      this.visible = true
      this.selectedRowKeys = []
      this.selectedRows = []
      this.resetSearch()
    },
    doSearch() {
      this.pagination.current = 1
      this.loadList()
    },
    resetSearch() {
      this.searchName = ''
      this.pagination.current = 1
      this.loadList()
    },
    loadList() {
      this.loading = true
      const searchObj = {}
      if (this.searchName) searchObj.name = this.searchName
      getAction('/project/list', {
        currentPage: this.pagination.current,
        pageSize: this.pagination.pageSize,
        search: JSON.stringify(searchObj)
      }).then(res => {
        if (res.code === 200) {
          this.projectList = res.data.rows || []
          this.pagination.total = res.data.total || 0
        }
      }).finally(() => { this.loading = false })
    },
    handleTableChange(pager) {
      this.pagination.current = pager.current
      this.loadList()
    },
    onSelectChange(keys, rows) {
      this.selectedRowKeys = keys
      this.selectedRows = rows
    },
    handleOk() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一个项目')
        return
      }
      this.$emit('ok', this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.visible = false
      this.selectedRowKeys = []
      this.selectedRows = []
    }
  }
}
</script>
