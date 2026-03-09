<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="标题">
          <el-input v-model="queryParam.name" placeholder="请输入标题" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchQuery">查询</el-button>
          <el-button @click="handleSearchReset">重置</el-button>
          <el-button type="primary" @click="readAll">全部标注已读</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <pro-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="tablePagination"
      row-key="id"
      @change="handleTableChange"
    >
      <!-- 标题列 -->
      <template #customRenderTitle="{ text, record }">
        <span v-if="record.status === '1'" style="font-weight: bold">{{ text }}</span>
        <span v-else>{{ text }}</span>
      </template>
      <!-- 操作列 -->
      <template #action="{ record }">
        <el-button link type="primary" @click="showAnnouncement(record)">查看</el-button>
      </template>
    </pro-table>

    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProTable from '@/components/table/ProTable.vue'
import { useList } from '@/composables/useList'
import { postAction } from '@/api/http'

const visible = ref(false)
const title = ref('通知')

const url = {
  list: '/msg/list',
  batchUpdateStatus: '/msg/batchUpdateStatus',
  readAllMsg: '/msg/readAllMsg',
}

const {
  loading,
  dataSource,
  columns,
  queryParam,
  ipagination,
  loadData,
  searchQuery,
  handleTableChange,
} = useList({
  url: {
    list: url.list,
  },
  defColumns: [
    { title: '标题', dataIndex: 'msgTitle', width: 200, customRender: 'customRenderTitle' },
    { title: '消息类型', dataIndex: 'type', width: 80 },
    { title: '通知日期', dataIndex: 'createTimeStr', width: 90 },
    { title: '操作', dataIndex: 'action', align: 'center', width: 50, customRender: 'action' },
  ],
  pageSize: 5,
  disableCreatedLoad: true,
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

/** 打开消息列表弹窗 */
function handleDetail() {
  visible.value = true
  loadData(1)
}

/** 查看消息 */
function showAnnouncement(record: any) {
  // 标记为已读
  postAction(url.batchUpdateStatus, { ids: record.id, status: '2' }).then((res: any) => {
    if (res && res.code === 200) {
      loadData()
    }
  })
  // 显示消息内容
  ElMessageBox.alert(record.msgContent || record.msgTitle, '消息详情', {
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: true,
  })
}

/** 全部标注已读 */
function readAll() {
  ElMessageBox.confirm('是否全部标注已读?', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    postAction(url.readAllMsg).then((res: any) => {
      if (res && res.code === 200) {
        ElMessage.success(res.data)
        loadData()
      }
    })
  }).catch(() => {})
}

/** 重置搜索 */
function handleSearchReset() {
  queryParam.name = ''
  loadData(1)
}

function close() {
  visible.value = false
}

function handleCancel() {
  close()
}

defineExpose({ handleDetail, title })
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 12px;
}
</style>
