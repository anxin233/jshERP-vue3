<template>
  <el-card shadow="never">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <el-form :inline="true" @submit.prevent="searchQuery">
        <el-form-item label="名称">
          <el-input v-model="queryParam.name" placeholder="请输入名称查询" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchQuery">查询</el-button>
          <el-button @click="searchReset">重置</el-button>
          <el-button type="primary" @click="writeCode">填写插件激活码</el-button>
          <el-button type="primary" @click="writeAppCode">填写手机端激活码</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <el-upload
        :action="importUrl"
        :headers="uploadHeaders"
        :show-file-list="false"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        accept=".jar"
      >
        <el-tooltip content="请选择需要导入的插件jar包" placement="top">
          <el-button type="primary" :icon="Upload">上传插件包</el-button>
        </el-tooltip>
      </el-upload>
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
      <!-- 操作列 -->
      <template #action="{ record }">
        <el-button link type="primary" @click="uploadTemplate(record)">上传页面</el-button>
        <el-popconfirm title="确定要开启该插件吗?" @confirm="startPlugin(record.pluginDescriptor.pluginId)">
          <template #reference>
            <el-button link type="primary">开启</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm title="确定要停止该插件吗?" @confirm="stopPlugin(record.pluginDescriptor.pluginId)">
          <template #reference>
            <el-button link type="warning">停止</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm title="确定要卸载该插件吗?" @confirm="uninstallPlugin(record.pluginDescriptor.pluginId)">
          <template #reference>
            <el-button link type="danger">卸载</el-button>
          </template>
        </el-popconfirm>
      </template>
      <!-- 页面链接列 -->
      <template #linkInfo="{ record }">
        <a :href="getLinkUrl(record)" target="_blank" :title="getLinkUrl(record)">{{ getLinkUrl(record) }}</a>
      </template>
      <!-- 状态列 -->
      <template #customRenderFlag="{ text }">
        <el-tag v-if="text === 'STARTED'" type="success">启用</el-tag>
        <el-tag v-if="text === 'STOPPED'" type="warning">停止</el-tag>
      </template>
    </pro-table>

    <!-- 弹窗组件 -->
    <plugin-modal ref="modalFormRef" @ok="modalFormOk" />
    <plugin-app-modal ref="appModalFormRef" @ok="modalFormOk" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ProTable from '@/components/table/ProTable.vue'
import PluginModal from './components/PluginModal.vue'
import PluginAppModal from './components/PluginAppModal.vue'
import { useList } from '@/composables/useList'
import { postAction } from '@/api/http'
import { getToken } from '@/utils/auth'
import { filterObj } from '@/utils/index'

const modalFormRef = ref()
const appModalFormRef = ref()

const {
  loading,
  dataSource,
  columns,
  queryParam,
  ipagination,
  searchQuery,
  searchReset,
  loadData,
  handleTableChange,
  modalFormOk,
} = useList({
  url: {
    list: '/plugin/list',
    delete: '/plugin/delete',
    deleteBatch: '/plugin/deleteBatch',
  },
  defColumns: [
    { title: '#', dataIndex: 'rowIndex', key: 'rowIndex', width: 40, align: 'center', customRender: 'rowIndex' },
    { title: '操作', dataIndex: 'action', key: 'action', width: 200, align: 'center', customRender: 'action' },
    { title: '名称', dataIndex: 'pluginName', width: 120 },
    { title: '标识', dataIndex: 'pluginId', width: 180 },
    { title: '版本', dataIndex: 'pluginVersion', width: 120 },
    { title: '作者', dataIndex: 'pluginProvider', width: 100 },
    { title: '页面链接', dataIndex: 'linkUrl', width: 250, ellipsis: true, customRender: 'linkInfo' },
    { title: '状态', dataIndex: 'pluginState', width: 60, align: 'center', customRender: 'customRenderFlag' },
  ],
  urlPath: '/system/plugin',
})

const tablePagination = computed(() => ({
  current: ipagination.current,
  pageSize: ipagination.pageSize,
  total: ipagination.total,
}))

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/jshERP-boot'
const importUrl = computed(() => `${apiBaseUrl}/plugin/uploadInstallPluginJar`)

const uploadHeaders = computed(() => ({
  'X-Access-Token': getToken() || '',
}))

/** 获取页面链接 */
function getLinkUrl(record: any): string {
  if (!record.pluginDescriptor) return ''
  const desc = record.pluginDescriptor.pluginDescription
  if (desc && desc.indexOf('|') > -1) {
    const arr = desc.split('|')
    return arr[1] || ''
  }
  return ''
}

function writeCode() {
  modalFormRef.value?.edit()
  modalFormRef.value.title = '填写插件激活码'
}

function writeAppCode() {
  appModalFormRef.value?.edit()
  appModalFormRef.value.title = '填写手机端激活码'
}

function uploadTemplate(record: any) {
  ElMessage.info('请将页面上传到服务器目录： /前端根目录/plugins/')
}

function startPlugin(pluginId: string) {
  postAction('/plugin/start/' + pluginId).then((res: any) => {
    if (res && res.code === 200) {
      loadData()
    }
  })
}

function stopPlugin(pluginId: string) {
  postAction('/plugin/stop/' + pluginId).then((res: any) => {
    if (res && res.code === 200) {
      loadData()
    }
  })
}

function uninstallPlugin(pluginId: string) {
  postAction('/plugin/uninstall/' + pluginId).then((res: any) => {
    if (res && res.code === 200) {
      loadData()
    }
  })
}

function handleImportSuccess(response: any) {
  if (response.code === 200) {
    ElMessage.success(response.data)
    loadData()
  } else {
    ElMessage.error(response.data)
  }
}

function handleImportError() {
  ElMessage.error('文件上传失败')
}
</script>

<style scoped lang="scss">
.table-page-search-wrapper {
  margin-bottom: 16px;
}
.table-operator {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}
</style>
