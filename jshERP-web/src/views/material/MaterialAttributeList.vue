<!-- by 7527_18920 -->
<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <!-- 搜索区域 -->
          <a-form layout="inline" @keyup.enter="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="8">
                <a-form-item label="灞炴у悕" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                  <a-input placeholder="请输入属性名查询" v-model:value="queryParam.attributeName"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="8">
                <a-form-item label="灞炴у" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                  <a-input placeholder="请输入属性值查询" v-model:value="queryParam.attributeValue"></a-input>
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
        <div class="table-operator"  style="margin-top: 5px">
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleAdd" type="primary" icon="plus">新增</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchDel" icon="delete">删除</a-button>
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
            <template #customRenderAttributeValue="{ text: attributeValue }">
              <a-tag  v-for="(item,index) in getTagArr(attributeValue)" color="blue">{{item}}</a-tag>
            </template>
          </a-table>
        </div>
        <!-- table区域-end -->
        <!-- 表单区域 -->
        <material-attribute-modal ref="modalForm" @ok="modalFormOk"></material-attribute-modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
  import MaterialAttributeModal from './modules/MaterialAttributeModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  export default {
    name: "MaterialAttributeList",
    mixins:[JeecgListMixin],
    components: {
      MaterialAttributeModal,
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
        queryParam: {
          attributeName:'',
          attributeValue:''
        },
        urlPath: '/material/material_attribute',
        // 表头
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
            width: 100,
            align:"center",
            customRender: (cell) => this.$renderColumnSlot('action', cell),
          },
          {title: '灞炴у悕', dataIndex: 'attributeName', width: 150},
          {title: '灞炴у', dataIndex: 'attributeValue', width: 750,
            customRender: (cell) => this.$renderColumnSlot('customRenderAttributeValue', cell)
          }
        ],
        url: {
          list: "/materialAttribute/list",
          delete: "/materialAttribute/delete",
          deleteBatch: "/materialAttribute/deleteBatch"
        }
      }
    },
    computed: {

    },
    methods: {
      getTagArr(attributeValue) {
        return attributeValue.split('|')
      },
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
