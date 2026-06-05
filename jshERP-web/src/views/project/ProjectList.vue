<!-- 项目信息管理页面 -->
<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @keyup.enter="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="24">
                <a-form-item label="项目名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入项目名称查询" v-model:value="queryParam.name"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="项目类别" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-select placeholder="全部类别" v-model:value="queryParam.categoryId" allowClear>
                    <a-select-option v-for="item in categoryList" :key="item.id" :value="item.id">
                      {{ item.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="是否启用" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-select placeholder="请选择" v-model:value="queryParam.enabled">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="1">启用</a-select-option>
                    <a-select-option value="0">禁用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                <a-col :md="6" :sm="24">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left: 8px" @click="searchReset">重置</a-button>
                </a-col>
              </span>
            </a-row>
          </a-form>
        </div>
        <!-- 操作按钮区域 -->
        <div class="table-operator" style="margin-top: 5px">
          <a-button @click="handleAdd" type="primary"><template #icon><legacy-icon type="plus" /></template>新增</a-button>
          <a-button @click="batchDel"><template #icon><legacy-icon type="delete" /></template>删除</a-button>
        </div>
        <!-- table区域 -->
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
                      <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'action'">
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                <a style="color: #f5222d;">删除</a>
              </a-popconfirm>
            
            </template>
            <template v-else-if="column.dataIndex === 'enabled'">
              <a-tag v-if="text==1" color="green">启用</a-tag>
              <a-tag v-if="text==0" color="orange">禁用</a-tag>
            
            </template>
            <template v-else>{{ text }}</template>
          </template>
          </a-table>
        </div>
        <!-- 表单区域 -->
        <project-modal ref="modalForm" @ok="modalFormOk"></project-modal>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
  import ProjectModal from './modules/ProjectModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { getAction } from '@/api/manage'

  export default {
    name: "ProjectList",
    mixins:[JeecgListMixin],
    components: {
      ProjectModal
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
        categoryList: [],
        queryParam: {name:'', categoryId: undefined, enabled:''},
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:40,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 150,
            align:"center",
          },
          {title: '默认工时(小时)', dataIndex: 'defaultHours', width: 150, align: 'right'},
          {title: '项目类别', dataIndex: 'categoryName', width: 150},
          {title: '工时单价(元/小时)', dataIndex: 'hourlyRate', width: 150, align: 'right', customRender: (text) => text ? `￥${parseFloat(text).toFixed(2)}` : '-'},
          {title: '项目总价(元)', dataIndex: 'defaultHours', width: 150, align: 'right'},
          {title: '项目总价(元)', dataIndex: 'totalPrice', width: 150, align: 'right', customRender: (text) => text ? `￥${parseFloat(text).toFixed(2)}` : '-'},
          {
            title: '是否启用', dataIndex: 'enabled', width: 100, align: "center"
          },
          {title: '备注', dataIndex: 'remark', width: 200, ellipsis:true}
        ],
        url: {
          list: "/project/list",
          delete: "/project/delete",
          deleteBatch: "/project/deleteBatch"
        }
      }
    },
    created() {
      this.loadCategoryList();
    },
    methods: {
      loadCategoryList() {
        getAction('/projectCategory/getAllList', {}).then(res => {
          if (res.code === 200) {
            this.categoryList = res.data || [];
          }
        });
      }
    }
  }
</script>
<style scoped>
  @import '@assets/less/common.less'
</style>

