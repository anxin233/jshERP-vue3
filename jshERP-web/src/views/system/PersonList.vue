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
                <a-form-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入姓名查询" v-model:value="queryParam.name"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-select v-model:value="queryParam.type" placeholder="请选择类型">
                    <a-select-option value="">请选择</a-select-option>
                    <a-select-option value="销售员">销售员</a-select-option>
                    <a-select-option value="财务人员">财务人员</a-select-option>
                  </a-select>
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
        <div class="table-operator"  style="margin-top: 5px">
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleAdd" type="primary"><template #icon><legacy-icon type="plus" /></template>新增</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchDel"><template #icon><legacy-icon type="delete" /></template>删除</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchSetStatus(true)"><template #icon><legacy-icon type="check-square" /></template>启用</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchSetStatus(false)"><template #icon><legacy-icon type="close-square" /></template>禁用</a-button>
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
            :pagination="ipagination"
            :scroll="scroll"
            :loading="loading"
            :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
            @change="handleTableChange">
            <template #action="{ text, record }"><span>
              <a @click="handleEdit(record)">编辑</a>
              <a-divider v-if="btnEnableList.indexOf(1)>-1" type="vertical" />
              <a-popconfirm v-if="btnEnableList.indexOf(1)>-1" title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                <a>删除</a>
              </a-popconfirm>
            </span></template>
            <!-- 状态渲染模板 -->
            <template #customRenderFlag="{ text: enabled }">
              <a-tag v-if="enabled" color="green">启用</a-tag>
              <a-tag v-if="!enabled" color="orange">禁用</a-tag>
            </template>
          </a-table>
        </div>
        <!-- table区域-end -->
        <!-- 表单区域 -->
        <person-modal ref="modalForm" @ok="modalFormOk"></person-modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<!-- f r o m 7 5  2 7 1  8 9 2 0 -->
<script>
  import PersonModal from './modules/PersonModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  export default {
    name: "PersonList",
    mixins:[JeecgListMixin],
    components: {
      PersonModal,
      JDate
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
        queryParam: {name:'',type:''},
        urlPath: '/system/person',
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
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width: 100,
            customRender: (cell) => this.$renderColumnSlot('action', cell),
          },
          { title: '姓名', align:"left", dataIndex: 'name', width: 200, },
          { title: '类型', align:"left", dataIndex: 'type', width: 150, },
          { title: '排序', dataIndex: 'sort', width: 60},
          { title: '状态', dataIndex: 'enabled',width:60,align:"center",
            customRender: (cell) => this.$renderColumnSlot('customRenderFlag', cell)
          }
        ],
        url: {
          list: "/person/list",
          delete: "/person/delete",
          deleteBatch: "/person/deleteBatch",
          batchSetStatusUrl: "/person/batchSetStatus"
        }
      }
    },
    computed: {

    },
    methods: {
      handleEdit: function (record) {
        this.$refs.modalForm.edit(record);
        this.$refs.modalForm.title = "编辑";
        this.$refs.modalForm.disableSubmit = false;
        if(this.btnEnableList.indexOf(1)===-1) {
          this.$refs.modalForm.isReadOnly = true
        }
      }
    }
  }
</script>
<style scoped>
  @import '@assets/less/common.less'
</style>
