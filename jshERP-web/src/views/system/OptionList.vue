<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :bordered="false">
        <!-- 查询区域：按选项组筛选 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @keyup.enter="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="24">
                <a-form-item label="选项组编码" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input v-model="queryParam.code" placeholder="如 customer_source"/>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="组名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input v-model="queryParam.name" placeholder="按名称模糊查询"/>
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

        <div class="table-operator" style="margin-top:5px">
          <a-button type="primary" icon="plus" @click="handleAddGroup">新增选项组</a-button>
        </div>

        <!-- 选项组列表 -->
        <a-table
          ref="table"
          bordered
          size="middle"
          rowKey="id"
          :columns="groupColumns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          @change="handleTableChange">
          <span slot="action" slot-scope="text, record">
            <a @click="handleManageOptions(record)">管理选项</a>
            <a-divider type="vertical"/>
            <a @click="handleEditGroup(record)">编辑</a>
            <a-divider type="vertical"/>
            <a-popconfirm
              v-if="isTenantGroup(record)"
              title="确定删除该选项组？其下选项将无法通过本组展示。"
              @confirm="() => handleDeleteGroup(record.id)">
              <a style="color:#f5222d">删除</a>
            </a-popconfirm>
            <a v-else style="color: rgba(0,0,0,0.25)" :title="'系统级选项组不可删除'">删除</a>
          </span>
          <template slot="scopeRender" slot-scope="scope">
            <a-tag v-if="scope === 'system'" color="blue">系统级</a-tag>
            <a-tag v-else color="green">租户级</a-tag>
          </template>
          <template slot="customRenderEnabled" slot-scope="enabled">
            <a-tag v-if="enabled" color="green">启用</a-tag>
            <a-tag v-else color="red">禁用</a-tag>
          </template>
        </a-table>

        <!-- 新增/编辑选项组弹窗 -->
        <a-modal
          :title="groupModalTitle"
          :visible="groupModalVisible"
          :confirmLoading="groupConfirmLoading"
          @ok="handleGroupModalOk"
          @cancel="handleGroupModalCancel">
          <a-form :form="groupForm" :labelCol="{span:6}" :wrapperCol="{span:16}">
            <a-form-item label="组编码">
              <a-input
                v-decorator="['code',{rules:[{required:true,message:'请输入组编码!'}],initialValue:editingGroup.code}]"
                placeholder="如 customer_source"
                :disabled="!!editingGroup.id"/>
            </a-form-item>
            <a-form-item label="组名称">
              <a-input v-decorator="['name',{rules:[{required:true,message:'请输入组名称!'}],initialValue:editingGroup.name}]" placeholder="如 客户来源"/>
            </a-form-item>
            <a-form-item label="备注">
              <a-input v-decorator="['remark',{initialValue:editingGroup.remark}]" placeholder="选填"/>
            </a-form-item>
            <a-form-item label="是否启用">
              <a-switch v-decorator="['enabled',{valuePropName:'checked',initialValue:editingGroup.enabled !== false}]"/>
            </a-form-item>
          </a-form>
        </a-modal>

        <!-- 组内选项管理弹窗 -->
        <a-modal
          :title="(currentGroup && currentGroup.name) ? currentGroup.name + ' - 选项维护' : '选项维护'"
          :visible="optionModalVisible"
          width="900px"
          :footer="null"
          @cancel="optionModalVisible = false">
          <div class="table-page-search-wrapper" style="margin-bottom:12px">
            <a-form layout="inline">
              <a-form-item label="名称">
                <a-input v-model="optionQueryLabel" placeholder="按显示名称模糊查询" style="width:180px" allow-clear/>
              </a-form-item>
              <a-button type="primary" @click="loadOptionData(1)">查询</a-button>
              <a-button style="margin-left:8px" @click="optionQueryLabel=''; loadOptionData(1)">重置</a-button>
            </a-form>
          </div>
          <div style="margin-bottom:8px">
            <a-button type="primary" size="small" icon="plus" @click="handleAddOption">新增选项</a-button>
          </div>
          <a-table
            bordered
            size="small"
            rowKey="id"
            :columns="optionColumns"
            :dataSource="optionDataSource"
            :pagination="optionPagination"
            :loading="optionLoading"
            @change="handleOptionTableChange">
            <span slot="action" slot-scope="text, record">
              <a @click="handleEditOption(record)">编辑</a>
              <a-divider type="vertical"/>
              <a-popconfirm title="确定删除该选项？" @confirm="() => handleDeleteOption(record.id)">
                <a style="color:#f5222d">删除</a>
              </a-popconfirm>
            </span>
            <template slot="customRenderEnabled" slot-scope="enabled">
              <a-tag v-if="enabled" color="green">启用</a-tag>
              <a-tag v-else color="red">禁用</a-tag>
            </template>
            <template slot="customRenderDefault" slot-scope="isDefault">
              <a-tag v-if="isDefault" color="blue">默认</a-tag>
            </template>
          </a-table>

          <!-- 新增/编辑选项 内嵌表单 -->
          <a-modal
            :title="optionFormTitle"
            :visible="optionFormVisible"
            :confirmLoading="optionFormLoading"
            @ok="handleOptionFormOk"
            @cancel="optionFormVisible = false">
            <a-form :form="optionForm" :labelCol="{span:6}" :wrapperCol="{span:16}">
              <a-form-item label="选项值">
                <a-input
                  v-decorator="['value',{rules:[{required:true,message:'请输入选项值!'}],initialValue:editingOption.value}]"
                  placeholder="建议英文/简码，存入业务表"/>
              </a-form-item>
              <a-form-item label="显示名称">
                <a-input v-decorator="['label',{rules:[{required:true,message:'请输入显示名称!'}],initialValue:editingOption.label}]"/>
              </a-form-item>
              <a-form-item label="排序号">
                <a-input-number v-decorator="['sort',{initialValue:editingOption.sort != null ? editingOption.sort : 0}]" :min="0" style="width:100%"/>
              </a-form-item>
              <a-form-item label="是否启用">
                <a-switch v-decorator="['enabled',{valuePropName:'checked',initialValue:editingOption.enabled !== false}]"/>
              </a-form-item>
              <a-form-item label="默认选中">
                <a-switch v-decorator="['isDefault',{valuePropName:'checked',initialValue:!!editingOption.isDefault}]"/>
              </a-form-item>
            </a-form>
          </a-modal>
        </a-modal>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction, postAction, putAction, deleteAction } from '@/api/manage'

export default {
  name: 'OptionList',
  mixins: [JeecgListMixin],
  data () {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
      queryParam: { code: '', name: '' },
      groupColumns: [
        { title: '组编码', dataIndex: 'code', width: 160 },
        { title: '组名称', dataIndex: 'name', width: 140 },
        { title: '作用范围', dataIndex: 'scope', width: 100, scopedSlots: { customRender: 'scopeRender' } },
        { title: '备注', dataIndex: 'remark', ellipsis: true },
        { title: '状态', dataIndex: 'enabled', width: 90, scopedSlots: { customRender: 'customRenderEnabled' } },
        { title: '操作', dataIndex: 'action', width: 220, scopedSlots: { customRender: 'action' } }
      ],
      url: {
        list: '/option/group/manage/list'
      },
      groupModalVisible: false,
      groupModalTitle: '新增选项组',
      groupForm: this.$form.createForm(this),
      editingGroup: {},
      groupConfirmLoading: false,

      currentGroup: null,
      optionModalVisible: false,
      optionQueryLabel: '',
      optionDataSource: [],
      optionLoading: false,
      optionPagination: { current: 1, pageSize: 10, total: 0, showSizeChanger: true, showTotal: t => `共 ${t} 条` },
      optionColumns: [
        { title: '选项值', dataIndex: 'value', width: 120 },
        { title: '显示名称', dataIndex: 'label' },
        { title: '排序', dataIndex: 'sort', width: 80 },
        { title: '默认', dataIndex: 'isDefault', width: 80, scopedSlots: { customRender: 'customRenderDefault' } },
        { title: '状态', dataIndex: 'enabled', width: 80, scopedSlots: { customRender: 'customRenderEnabled' } },
        { title: '操作', dataIndex: 'action', width: 160, scopedSlots: { customRender: 'action' } }
      ],
      optionFormVisible: false,
      optionFormTitle: '新增选项',
      optionForm: this.$form.createForm(this),
      editingOption: {},
      optionFormLoading: false
    }
  },
  methods: {
    getQueryParams () {
      return { search: JSON.stringify(this.queryParam) }
    },
    searchReset () {
      this.queryParam = { code: '', name: '' }
      this.loadData(1)
    },
    isTenantGroup (record) {
      return record.tenantId != null
    },
    handleAddGroup () {
      this.groupModalTitle = '新增选项组'
      this.editingGroup = { enabled: true }
      this.groupModalVisible = true
      this.$nextTick(() => this.groupForm.resetFields())
    },
    handleEditGroup (record) {
      if (!this.isTenantGroup(record)) {
        this.$message.warning('系统级选项组不可编辑')
        return
      }
      this.groupModalTitle = '编辑选项组'
      this.editingGroup = { ...record }
      this.groupModalVisible = true
      this.$nextTick(() => {
        this.groupForm.resetFields()
        this.groupForm.setFieldsValue({
          code: record.code,
          name: record.name,
          remark: record.remark,
          enabled: record.enabled
        })
      })
    },
    handleGroupModalOk () {
      this.groupForm.validateFields((err, values) => {
        if (err) return
        const payload = { ...this.editingGroup, ...values }
        this.groupConfirmLoading = true
        const req = payload.id ? putAction('/option/group/update', payload) : postAction('/option/group/add', payload)
        req.then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.groupModalVisible = false
            this.loadData()
          } else {
            this.$message.warning(res.data || res.message || '保存失败')
          }
        }).finally(() => { this.groupConfirmLoading = false })
      })
    },
    handleGroupModalCancel () {
      this.groupModalVisible = false
    },
    handleDeleteGroup (id) {
      deleteAction('/option/group/delete', { id }).then(res => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.loadData()
        } else {
          this.$message.warning(res.data || res.message || '删除失败')
        }
      })
    },
    handleManageOptions (record) {
      this.currentGroup = { code: record.code, name: record.name }
      this.optionModalVisible = true
      this.optionQueryLabel = ''
      this.optionDataSource = []
      this.optionPagination.current = 1
      this.optionPagination.total = 0
      this.$nextTick(() => this.loadOptionData(1))
    },
    loadOptionData (page) {
      if (!this.currentGroup || !this.currentGroup.code) return
      const params = {
        search: JSON.stringify({
          groupCode: this.currentGroup.code,
          label: this.optionQueryLabel || undefined
        }),
        currentPage: page || this.optionPagination.current,
        pageSize: this.optionPagination.pageSize
      }
      this.optionLoading = true
      getAction('/option/manage/list', params).then(res => {
        if (res.code === 200 && res.data) {
          this.optionDataSource = (res.data.rows || [])
          this.optionPagination.total = res.data.total || 0
          this.optionPagination.current = page || 1
        }
      }).finally(() => { this.optionLoading = false })
    },
    handleAddOption () {
      this.optionFormTitle = '新增选项'
      this.editingOption = { groupCode: this.currentGroup.code, enabled: true, sort: 0, isDefault: false }
      this.optionFormVisible = true
      this.$nextTick(() => this.optionForm.resetFields())
    },
    handleEditOption (record) {
      this.optionFormTitle = '编辑选项'
      this.editingOption = { ...record }
      this.optionFormVisible = true
      this.$nextTick(() => {
        this.optionForm.resetFields()
        this.optionForm.setFieldsValue({
          value: record.value,
          label: record.label,
          sort: record.sort,
          enabled: record.enabled,
          isDefault: record.isDefault
        })
      })
    },
    handleOptionFormOk () {
      this.optionForm.validateFields((err, values) => {
        if (err) return
        const payload = { ...this.editingOption, ...values }
        if (!payload.groupCode && this.currentGroup) payload.groupCode = this.currentGroup.code
        this.optionFormLoading = true
        const req = payload.id ? putAction('/option/update', payload) : postAction('/option/add', payload)
        req.then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.optionFormVisible = false
            this.loadOptionData(this.optionPagination.current)
          } else {
            this.$message.warning(res.data || res.message || '保存失败')
          }
        }).finally(() => { this.optionFormLoading = false })
      })
    },
    handleDeleteOption (id) {
      deleteAction('/option/delete', { id }).then(res => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.loadOptionData(this.optionPagination.current)
        } else {
          this.$message.warning(res.data || res.message || '删除失败')
        }
      })
    },
    handleOptionTableChange (pag) {
      this.optionPagination.current = pag.current
      this.optionPagination.pageSize = pag.pageSize
      this.loadOptionData(pag.current)
    }
  }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
</style>
