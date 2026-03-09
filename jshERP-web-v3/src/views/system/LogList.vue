<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="操作模块">
          <el-input v-model="queryParam.operation" placeholder="请输入操作模块" clearable />
        </el-form-item>
        <el-form-item label="操作详情">
          <el-input v-model="queryParam.content" placeholder="请输入操作详情" clearable />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="createTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="onDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchQuery">查询</el-button>
          <el-button @click="handleSearchReset">重置</el-button>
          <el-button link type="primary" @click="handleToggleSearch">
            {{ toggleSearchStatus ? '收起' : '展开' }}
            <el-icon><ArrowUp v-if="toggleSearchStatus" /><ArrowDown v-else /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
      <!-- 展开区域 -->
      <el-form v-if="toggleSearchStatus" :inline="true">
        <el-form-item label="操作员">
          <el-input v-model="queryParam.userInfo" placeholder="请输入操作员账号或姓名" clearable />
        </el-form-item>
        <el-form-item label="操作IP">
          <el-input v-model="queryParam.clientIp" placeholder="请输入操作IP" clearable />
        </el-form-item>
        <el-form-item v-if="isManage" label="租户账号">
          <el-input v-model="queryParam.tenantLoginName" placeholder="请输入租户账号" clearable />
        </el-form-item>
        <el-form-item v-if="isManage" label="租户类型">
          <el-select v-model="queryParam.tenantType" placeholder="请选择租户类型" clearable>
            <el-option label="请选择" value="" />
            <el-option label="试用租户" value="0" />
            <el-option label="付费租户" value="1" />
          </el-select>
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
      :scroll="{ y: 540 }"
      @change="handleTableChange"
    >
      <!-- 序号列 -->
      <template #rowIndex="{ index }">{{ index + 1 }}</template>
      <!-- 操作详情列（超长截取） -->
      <template #content="{ text }">
        <el-tooltip v-if="text && text.length > 40" :content="text" placement="top">
          <span>{{ text.substring(0, 40) + '...' }}</span>
        </el-tooltip>
        <span v-else>{{ text }}</span>
      </template>
    </pro-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import ProTable from '@/components/table/ProTable.vue'
import { useList } from '@/composables/useList'
import { getAction } from '@/api/http'
import dayjs from 'dayjs'

const isManage = ref(false)

/** 获取上个月日期 */
function getPrevMonthFormatDate(months: number): string {
  return dayjs().subtract(months, 'month').format('YYYY-MM-DD')
}

/** 获取当前日期 */
function getFormatDate(): string {
  return dayjs().format('YYYY-MM-DD')
}

const createTimeRange = ref<[string, string] | null>([getPrevMonthFormatDate(1), getFormatDate()])

const {
  loading,
  dataSource,
  columns,
  queryParam,
  ipagination,
  toggleSearchStatus,
  loadData,
  searchQuery,
  handleTableChange,
  handleToggleSearch,
} = useList({
  url: {
    list: '/log/list',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作模块', dataIndex: 'operation', width: 120, align: 'left' },
    { title: '操作详情', dataIndex: 'content', width: 360, align: 'left', customRender: 'content' },
    { title: '操作员账号', dataIndex: 'loginName', width: 80, align: 'left' },
    { title: '操作员姓名', dataIndex: 'userName', width: 80, align: 'left' },
    { title: '操作IP', dataIndex: 'clientIp', width: 100, align: 'left' },
    { title: '操作时间', dataIndex: 'createTimeStr', width: 110, align: 'left' },
  ],
  queryParam: {
    operation: '',
    content: '',
    userInfo: '',
    clientIp: '',
    tenantLoginName: '',
    tenantType: '',
    beginTime: getPrevMonthFormatDate(1),
    endTime: getFormatDate(),
  },
  urlPath: '/system/log',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

function onDateChange(val: [string, string] | null) {
  if (val) {
    queryParam.beginTime = val[0]
    queryParam.endTime = val[1]
    createTimeRange.value = val
  } else {
    queryParam.beginTime = ''
    queryParam.endTime = ''
    createTimeRange.value = null
  }
}

function handleSearchReset() {
  queryParam.operation = ''
  queryParam.content = ''
  queryParam.userInfo = ''
  queryParam.clientIp = ''
  queryParam.tenantLoginName = ''
  queryParam.tenantType = ''
  queryParam.beginTime = getPrevMonthFormatDate(1)
  queryParam.endTime = getFormatDate()
  createTimeRange.value = [getPrevMonthFormatDate(1), getFormatDate()]
  loadData(1)
}

function initUserInfo() {
  getAction('/user/getUserSession').then((res: any) => {
    if (res.code === 200) {
      const user = res.data.user
      if (user.tenantId === 0) {
        isManage.value = true
      }
    } else {
      ElMessage.warning(res.data)
    }
  })
}

onMounted(() => {
  initUserInfo()
})
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 16px;
}
</style>
