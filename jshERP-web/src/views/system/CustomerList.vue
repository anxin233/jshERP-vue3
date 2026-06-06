<!-- f r o m 7 5  2 7 1  8 9 2 0 -->
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
                <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入名称查询" v-model:value="queryParam.supplier"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="联系人" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入联系人查询" v-model:value="queryParam.contacts"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="手机号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入手机号码查询" v-model:value="queryParam.telephone"></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left: 8px" @click="searchReset">重置</a-button>
                  <a @click="handleToggleSearch" style="margin-left: 8px">
                    {{ toggleSearchStatus ? '收起' : '展开' }}
                    <legacy-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
                  </a>
                </span>
              </a-col>
            </a-row>
            <template v-if="toggleSearchStatus">
              <a-row :gutter="24">
                <a-col :md="6" :sm="24">
                  <a-form-item label="联系电话" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-input placeholder="请输入联系电话查询" v-model:value="queryParam.phonenum"></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </template>
          </a-form>
        </div>
        <!-- 操作按钮区域 -->
        <div class="table-operator"  style="margin-top: 5px">
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleAdd" type="primary" icon="plus">新增</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchDel" icon="delete">删除</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchSetStatus(true)" icon="check-square">启用</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="batchSetStatus(false)" icon="close-square">禁用</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleImportXls()" icon="import">导入</a-button>
          <a-button v-if="btnEnableList.indexOf(3)>-1" @click="客户导入" icon="download">导出</a-button>
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
              <a v-if="btnEnableList.indexOf(1)>-1 && customerFlag === '1' && quickBtn.user.indexOf(1)>-1 " @click="btnSetUser(record)">分配用户</a>
              <a-divider v-if="btnEnableList.indexOf(1)>-1 && customerFlag === '1' && quickBtn.user.indexOf(1)>-1 " type="vertical" />
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
        <customer-modal ref="modalForm" @ok="modalFormOk"></customer-modal>
        <import-file-modal ref="modalImportForm" @ok="modalFormOk"></import-file-modal>
        <customer-user-modal ref="customerUserModal"></customer-user-modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<!-- BY cao_yu_li -->
<script>
  import CustomerModal from './modules/CustomerModal'
  import ImportFileModal from '@/components/tools/ImportFileModal'
  import CustomerUserModal from './modules/CustomerUserModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import { getCurrentSystemConfig } from '@/api/api'
  import storage from '@/utils/storage'
  export default {
    name: "CustomerList",
    mixins:[JeecgListMixin],
    components: {
      CustomerModal,
      ImportFileModal,
      CustomerUserModal,
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
          supplier:'',
          type:'客户',
          contacts:'',
          telephone:'',
          phonenum:''
        },
        urlPath: '/system/customer',
        customerFlag: '0',
        ipagination:{
          pageSizeOptions: ['10', '20', '30', '100', '200']
        },
        quickBtn: {
          user: ''
        },
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function ({ text: t, record: r, index, renderIndex }) {
              return (Number.isFinite(Number(index ?? renderIndex)) ? Number(index ?? renderIndex) + 1 : '');
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 130,
            align:"center",
            customRender: (cell) => this.$renderColumnSlot('action', cell),
          },
          { title: '名称',dataIndex: 'supplier',width:150,align:"left"},
          { title: '联系人', dataIndex: 'contacts',width:70,align:"left"},
          { title: '手机号码', dataIndex: 'telephone',width:100,align:"left"},
          { title: '联系电话', dataIndex: 'phoneNum',width:100,align:"left"},
          { title: '电子邮箱', dataIndex: 'email',width:150,align:"left"},
          { title: '电子邮箱',dataIndex: 'beginNeedGet',width:80,align:"left"},
          { title: '期末应收',dataIndex: 'allNeedGet',width:80,align:"left"},
          { title: '税率(%)', dataIndex: 'taxRate',width:80,align:"left"},
          { title: '排序', dataIndex: 'sort', width: 60,align:"left"},
          { title: '状态', dataIndex: 'enabled',width:60, align:"center",
            customRender: (cell) => this.$renderColumnSlot('customRenderFlag', cell)
          }
        ],
        url: {
          list: "/supplier/list",
          delete: "/supplier/delete",
          deleteBatch: "/supplier/deleteBatch",
          importExcelUrl: "/supplier/importCustomer",
          exportXlsUrl: "/supplier/exportExcel",
          batchSetStatusUrl: "/supplier/batchSetStatus"
        }
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}${this.url.importExcelUrl}`;
      }
    },
    created() {
      this.getSystemConfig()
      this.initQuickBtn()
    },
    methods: {
      getSystemConfig() {
        getCurrentSystemConfig().then((res) => {
          if(res.code === 200 && res.data){
            this.customerFlag = res.data.customerFlag
          }
        })
      },
      //加载快捷按钮：分配用户
      initQuickBtn() {
        let btnStrList = storage.get('winBtnStrList') //按钮功能列表 JSON字符串
        if (btnStrList) {
          for (let i = 0; i < btnStrList.length; i++) {
            if (btnStrList[i].btnStr) {
              this.quickBtn.user = btnStrList[i].url === '/system/user'?btnStrList[i].btnStr:this.quickBtn.user
            }
          }
        }
      },
      searchQuery() {
        this.loadData(1);
        this.getSystemConfig()
      },
      searchReset() {
        this.queryParam = {
          type:'客户',
        }
        this.loadData(1)
        this.getSystemConfig()
      },
      handleImportXls() {
        let importExcelUrl = this.url.importExcelUrl
        let templateUrl = '/doc/customer_template.xls'
        let templateName = '客户Excel模板[下载]'
        this.$refs.modalImportForm.initModal(importExcelUrl, templateUrl, templateName);
      },
      handleEdit: function (record) {
        this.$refs.modalForm.edit(record);
        this.$refs.modalForm.title = "编辑";
        this.$refs.modalForm.disableSubmit = false;
        if(this.btnEnableList.indexOf(1)===-1) {
          this.$refs.modalForm.isReadOnly = true
        }
      },
      btnSetUser(record) {
        this.$refs.customerUserModal.edit(record);
        this.$refs.customerUserModal.title = "分配用户给：" + record.supplier
        this.$refs.customerUserModal.disableSubmit = false;
      }
    }
  }
</script>
<style scoped>
  @import '@assets/less/common.less'
</style>

