<!-- f r o m 7 5  2 7 1  8 9 2 0 -->
<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <!-- 搜索区域 -->
          <a-form layout="inline" @keyup.enter.native="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="24">
                <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input placeholder="请输入名称查询" v-model="queryParam.name"></a-input>
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
          <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
          <a-button @click="batchDel" icon="delete">删除</a-button>
          <a-button-group style="margin-left: 8px">
            <a-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="switchViewMode('list')">
              <a-icon type="unordered-list" />列表
            </a-button>
            <a-button :type="viewMode === 'tree' ? 'primary' : 'default'" @click="switchViewMode('tree')">
              <a-icon type="apartment" />树形
            </a-button>
          </a-button-group>
        </div>
        <!-- table区域-begin -->
        <div>
          <!-- 列表视图 -->
          <a-table
            v-if="viewMode === 'list'"
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
            <span slot="action" slot-scope="text, record">
              <a @click="handleAddChild(record)" style="color: #52c41a;">新增</a>
              <a-divider type="vertical" />
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                <a style="color: #f5222d;">删除</a>
              </a-popconfirm>
            </span>
            <!-- 状态渲染模板 -->
            <template slot="customRenderFlag" slot-scope="enabled">
              <a-tag v-if="enabled==1" color="green">启用</a-tag>
              <a-tag v-if="enabled==0" color="orange">禁用</a-tag>
            </template>
          </a-table>

          <!-- 树形视图 -->
          <a-table
            v-if="viewMode === 'tree'"
            ref="treeTable"
            size="middle"
            bordered
            rowKey="id"
            :columns="treeColumns"
            :dataSource="treeData"
            :pagination="false"
            :scroll="scroll"
            :loading="loading"
            :defaultExpandAllRows="true"
            :childrenColumnName="'children'"
            :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}">
            <span slot="action" slot-scope="text, record">
              <a @click="handleAddChild(record)" style="color: #52c41a;">新增</a>
              <a-divider type="vertical" />
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                <a style="color: #f5222d;">删除</a>
              </a-popconfirm>
            </span>
            <!-- 状态渲染模板 -->
            <template slot="customRenderFlag" slot-scope="enabled">
              <a-tag v-if="enabled==1" color="green">启用</a-tag>
              <a-tag v-if="enabled==0" color="orange">禁用</a-tag>
            </template>
          </a-table>
        </div>
        <!-- table区域-end -->
        <!-- 表单区域 -->
        <function-modal ref="modalForm" @ok="modalFormOk"></function-modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
  import FunctionModal from './modules/FunctionModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import { getAction } from '@/api/manage'

  export default {
    name: "FunctionList",
    mixins:[JeecgListMixin],
    components: {
      FunctionModal,
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
        // 视图模式：list=列表，tree=树形
        viewMode: 'list',
        // 树形数据
        treeData: [],
        // 查询条件
        queryParam: {name:'',type:''},
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
            width: 200,
            align:"center",
            scopedSlots: { customRender: 'action' },
          },
          {title: '编号 ', dataIndex: 'number', width: 80},
          {title: '名称', dataIndex: 'name', width: 120, ellipsis:true},
          {title: '上级编号', dataIndex: 'parentNumber', width: 80},
          {title: '上级名称', dataIndex: 'parentName', width: 120, ellipsis:true},
          {title: '链接', dataIndex: 'url', width: 250, ellipsis:true},
          {title: '组件', dataIndex: 'component', width: 250, ellipsis:true},
          {title: '排序', dataIndex: 'sort', width: 60},
          {
            title: '是否启用', dataIndex: 'enabled', width: 80, align: "center",
            scopedSlots: { customRender: 'customRenderFlag' }
          },
          {title: '图标', dataIndex: 'icon', width: 120}
        ],
        // 树形表头（去掉上级编号和上级名称列）
        treeColumns: [
          {
            title: '操作',
            dataIndex: 'action',
            width: 200,
            align:"center",
            scopedSlots: { customRender: 'action' },
          },
          {title: '编号 ', dataIndex: 'number', width: 100},
          {title: '名称', dataIndex: 'name', width: 200, ellipsis:true},
          {title: '链接', dataIndex: 'url', width: 250, ellipsis:true},
          {title: '组件', dataIndex: 'component', width: 250, ellipsis:true},
          {title: '排序', dataIndex: 'sort', width: 80},
          {
            title: '是否启用', dataIndex: 'enabled', width: 100, align: "center",
            scopedSlots: { customRender: 'customRenderFlag' }
          },
          {title: '图标', dataIndex: 'icon', width: 120}
        ],
        url: {
          list: "/function/list",
          delete: "/function/delete",
          deleteBatch: "/function/deleteBatch"
        }
      }
    },
    computed: {

    },
    watch: {
      // 监听数据源变化，如果是树形模式则重新构建树形数据
      dataSource: {
        handler(newVal) {
          if (this.viewMode === 'tree' && newVal && newVal.length > 0) {
            this.buildTreeData()
          }
        },
        deep: true
      }
    },
    methods: {
      // 切换视图模式
      switchViewMode(mode) {
        this.viewMode = mode
        if (mode === 'tree') {
          // 树形模式需要加载所有数据
          this.loadAllDataForTree()
        }
      },
      // 加载所有数据用于树形显示
      loadAllDataForTree() {
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }

        this.loading = true
        // 构建查询参数，设置一个很大的 pageSize 来获取所有数据
        let params = {
          search: JSON.stringify(this.queryParam),
          currentPage: 1,
          pageSize: 9999  // 设置一个很大的数字获取所有数据
        }

        // 使用 getAction 获取所有数据
        getAction(this.url.list, params).then((res) => {
          if (res.code === 200) {
            // 使用所有数据构建树形结构
            const allData = res.data.rows
            this.buildTreeData(allData)
          } else {
            this.$message.warning(res.data.message || '加载数据失败')
          }
          this.loading = false
        }).catch(err => {
          this.$message.error('加载数据失败')
          this.loading = false
        })
      },
      // 构建树形数据
      buildTreeData(sourceData) {
        // 使用传入的数据或当前 dataSource
        const list = JSON.parse(JSON.stringify(sourceData || this.dataSource))
        const map = {}
        const roots = []

        // 先建立 number -> item 的映射
        list.forEach(item => {
          map[item.number] = item
          item.children = []
        })

        // 构建树形结构
        list.forEach(item => {
          const parentNumber = item.parentNumber
          // parentNumber 为 '0' 或 null 或 undefined 表示根节点
          if (parentNumber && parentNumber !== '0' && map[parentNumber]) {
            map[parentNumber].children.push(item)
          } else {
            // 没有父节点或父节点为0的是根节点
            roots.push(item)
          }
        })

        // 移除空的 children 数组
        const removeEmptyChildren = (nodes) => {
          nodes.forEach(node => {
            if (node.children && node.children.length === 0) {
              delete node.children
            } else if (node.children && node.children.length > 0) {
              // 按排序字段排序子节点
              node.children.sort((a, b) => {
                const sortA = a.sort || '0'
                const sortB = b.sort || '0'
                return sortA.localeCompare(sortB)
              })
              removeEmptyChildren(node.children)
            }
          })
        }

        // 对根节点排序
        roots.sort((a, b) => {
          const sortA = a.sort || '0'
          const sortB = b.sort || '0'
          return sortA.localeCompare(sortB)
        })

        removeEmptyChildren(roots)

        this.treeData = roots
        console.log('树形数据:', this.treeData)
      },
      // 覆盖 mixin 的 modalFormOk：树形模式下重新加载全量数据，避免分页截断导致节点消失
      modalFormOk() {
        if (this.viewMode === 'tree') {
          this.loadAllDataForTree()
        } else {
          this.loadData()
        }
      },
      // 新增子菜单（树形视图专用）
      handleAddChild(record) {
        this.$refs.modalForm.add()
        // 用 setTimeout(0) 确保 Modal 完成渲染后再赋值，避免 setFieldsValue 警告
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.modalForm.form.setFieldsValue({
              parentNumber: record.number,
              parentName: record.name
            })
          }, 0)
        })
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>