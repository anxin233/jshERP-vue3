<template>
  <a-row :gutter="10">
    <a-col :md="12" :sm="24">
      <a-card :bordered="false">
        <!-- 按钮操作区域 -->
        <a-row style="margin-left: 14px">
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="handleAddCategory" type="primary">添加类别</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" title="删除多条数据" @click="batchDel" type="default">批量删除</a-button>
          <a-button @click="refresh" type="default"><template #icon><legacy-icon type="reload" /></template>刷新</a-button>
        </a-row>
        <div style="background: #fff;padding-left:16px;height: 100%; margin-top: 5px">
          <a-alert type="info" :showIcon="true">
            <template #message><div>
              当前选择：<span v-if="this.currSelected.title">{{ getCurrSelectedTitle() }}</span>
              <a v-if="this.currSelected.title" style="margin-left: 10px" @click="onClearSelected">取消选择</a>
            </div></template>
          </a-alert>
          <!-- 树-->
          <a-col :md="10" :sm="24">
            <a-tree
              checkable
              @select="onSelect"
              @check="onCheck"
              @rightClick="rightHandle"
              :selectedKeys="selectedKeys"
              :checkedKeys="checkedKeys"
              :treeData="categoryTree"
              :checkStrictly="checkStrictly"
              :expandedKeys="iExpandedKeys"
              :autoExpandParent="true"
              @expand="onExpand"/>
            <ul v-show="contextMenuVisible"
                :style="{position: 'fixed', left: contextMenuX + 'px', top: contextMenuY + 'px', zIndex: 1000}"
                class="context-menu">
              <li v-if="btnEnableList.indexOf(1)>-1" @click="handleAddChild">
                <legacy-icon type="plus" /> 新增子类别
              </li>
            </ul>
          </a-col>
        </div>
      </a-card>
    </a-col>
    <a-col :md="12" :sm="24">
      <a-card :bordered="false" v-if="selectedKeys.length>0">
        <a-form ref="formRef" :model="formModel" :rules="formRules">
          <a-form-item name="name" :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
            <a-input placeholder="请输入名称" v-model:value="formModel.name"/>
          </a-form-item>
          <a-form-item name="serialNo" :labelCol="labelCol" :wrapperCol="wrapperCol" label="编号">
            <a-input placeholder="请输入编号" v-model:value="formModel.serialNo"/>
          </a-form-item>
          <a-form-item name="parentId" :labelCol="labelCol" :wrapperCol="wrapperCol" label="上级目录">
            <a-tree-select style="width:100%" :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
                           allow-clear :treeDefaultExpandAll="true"
                           :treeData="treeData" v-model:value="formModel.parentId" placeholder="请选择上级目录">
            </a-tree-select>
          </a-form-item>
          <a-form-item name="sort" :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
            <a-input v-model:value="formModel.sort"/>
          </a-form-item>
          <a-form-item name="remark" :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
            <a-textarea placeholder="请输入备注" :rows="2" v-model:value="formModel.remark" />
          </a-form-item>
        </a-form>
        <div class="anty-form-btn">
          <a-button @click="emptyCurrForm" type="default" htmlType="button"><template #icon><legacy-icon type="sync" /></template>重置</a-button>
          <a-button v-if="btnEnableList.indexOf(1)>-1" @click="submitCurrForm" type="primary" htmlType="button"><template #icon><legacy-icon type="form" /></template>保存</a-button>
        </div>
      </a-card>
      <a-card v-else >
        <a-empty>
          <template #description><span> 请先选择一个类别! </span></template>
        </a-empty>
      </a-card>
    </a-col>
    <project-category-modal ref="projectCategoryModal" @ok="loadTree"></project-category-modal>
  </a-row>
</template>
<script>
import ProjectCategoryModal from './modules/ProjectCategoryModal'
import pick from 'lodash.pick'
import {getProjectCategoryTree, queryProjectCategoryById, checkProjectCategory} from '@/api/api'
import {httpAction} from '@/api/manage'
import {JeecgListMixin} from '@/mixins/JeecgListMixin'
export default {
  name: 'ProjectCategoryList',
  mixins: [JeecgListMixin],
  components: {
    ProjectCategoryModal
  },
  data() {
    return {
      disableMixinCreated: false,
      iExpandedKeys: [],
      loading: false,
      treeData: [],
      categoryTree: [],
      model: {},
      selectedKeys: [],
      currSelected: {},
      rightClickSelectedNode: null,
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
      checkedKeys: [],
      checkStrictly: true,
      formModel: {},
      formRules: {
        name: [
          { required: true, message: '请输入名称!', trigger: 'blur' },
          { validator: this.validateName, trigger: 'blur' }
        ],
        serialNo: [{ required: true, message: '请输入编号!', trigger: 'blur' }]
      },
      labelCol: {
        xs: {span: 24},
        sm: {span: 5}
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16}
      },
      urlPath: '/project/category',
      url: {
        delete: '/projectCategory/delete',
        edit: '/projectCategory/update',
        deleteBatch: '/projectCategory/deleteBatch'
      }
    }
  },
  methods: {
    loadData() {
      this.refresh();
    },
    loadTree() {
      let that = this
      that.treeData = []
      that.categoryTree = []
      let params = {};
      params.id='';
      getProjectCategoryTree(params).then((res) => {
        if (res && res.code == 200) {
          for (let i = 0; i < res.data.length; i++) {
            let temp = res.data[i]
            that.categoryTree.push(temp)
            that.setThisExpandedKeys(temp)
          }
          this.loading = false
        }
      })
    },
    setThisExpandedKeys(node) {
      if (node.children && node.children.length > 0) {
        this.iExpandedKeys.push(node.key)
        for (let a = 0; a < node.children.length; a++) {
          this.setThisExpandedKeys(node.children[a])
        }
      }
    },
    refresh() {
      this.loading = true
      this.loadTree()
    },
    onExpand(expandedKeys) {
      this.iExpandedKeys = expandedKeys
    },
    onCheck(checkedKeys, info) {
      if(this.checkStrictly){
        this.checkedKeys = checkedKeys.checked;
      }else{
        this.checkedKeys = checkedKeys
      }
    },
    onSelect(selectedKeys, e) {
      let record = e.node.dataRef
      let params = {};
      params.id=record.id;
      this.getTreeByParams(params)
      queryProjectCategoryById(params).then((res) => {
        if (res && res.code == 200) {
          if(res.data.info){
            let data = res.data.info
            record.name = data.name;
            record.serialNo = data.serialNo;
            record.parentId = data.parentId;
            record.sort = data.sort;
            record.remark = data.remark;
            this.currSelected = Object.assign({}, record)
            this.model = this.currSelected
            this.selectedKeys = [record.key]
            this.model.parentId = record.parentId
            this.setValuesToForm(record)
          }
        }
      })
    },
    getTreeByParams(params) {
      getProjectCategoryTree(params).then((res) => {
        if (res && res.code == 200) {
          this.treeData = []
          for (let i = 0; i < res.data.length; i++) {
            this.treeData.push(res.data[i])
          }
        }
      })
    },
    setValuesToForm(record) {
      this.$nextTick(() => {
        this.formModel = pick(record, 'name','serialNo', 'parentId', 'sort', 'remark')
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },
    getCurrSelectedTitle() {
      return !this.currSelected.title ? '' : this.currSelected.title
    },
    onClearSelected() {
      this.currSelected = {}
      this.formModel = {}
      this.selectedKeys = []
    },
    rightHandle(e) {
      this.rightClickSelectedNode = e.node.dataRef
      this.contextMenuVisible = true
      this.contextMenuX = e.event.clientX
      this.contextMenuY = e.event.clientY
      // 点击其他地方关闭菜单
      document.addEventListener('click', this.closeContextMenu)
    },
    closeContextMenu() {
      this.contextMenuVisible = false
      document.removeEventListener('click', this.closeContextMenu)
    },
    batchDel() {
      if (this.checkedKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
      } else {
        const ids = this.checkedKeys.join(',')
        let that = this
        this.$confirm({
          title: '确认删除',
          content: '确定要删除所选中的 ' + this.checkedKeys.length + ' 条数据吗?',
          onOk: function () {
            httpAction(that.url.deleteBatch + '?ids=' + ids, null, 'delete').then((res) => {
              if (res.code == 200) {
                that.$message.success(res.data.message)
                that.loadTree()
                that.checkedKeys = []
                that.onClearSelected()
              } else {
                that.$message.warning(res.data.message)
              }
            })
          }
        })
      }
    },
    submitCurrForm() {
      const formRef = this.$refs.formRef
      if (!formRef) return
      formRef.validate().then(() => {
        if (!this.currSelected.id) {
          this.$message.warning('请点击选择要修改类别!')
          return
        }
        let formData = Object.assign({}, this.currSelected, { ...this.formModel })
        httpAction(this.url.edit, formData, 'put').then((res) => {
          if (res.code == 200) {
            this.$message.success('保存成功!')
            this.loadTree()
            let params = {}
            params.id = formData.id
            this.getTreeByParams(params)
          } else {
            this.$message.warning(res.data.message)
          }
        })
      }).catch(() => {})
    },
    emptyCurrForm() {
      this.formModel = {}
      this.$refs.formRef && this.$refs.formRef.resetFields()
    },
    validateName(rule, value){
      if (!value) return Promise.resolve()
      return checkProjectCategory({ name: value, id: this.model.id ? this.model.id : 0 }).then((res)=>{
        if(res && res.code===200) {
          return !res.data.status ? Promise.resolve() : Promise.reject('名称已经存在')
        }
        return Promise.reject(res.data)
      });
    },
    handleAdd() {
      this.$refs.projectCategoryModal.add()
      this.$refs.projectCategoryModal.title = '新增'
    },
    handleAddCategory() {
      this.$refs.projectCategoryModal.add()
      this.$refs.projectCategoryModal.title = '添加类别'
    },
    handleAddChild() {
      this.contextMenuVisible = false
      if (this.rightClickSelectedNode) {
        const node = this.rightClickSelectedNode
        const parentId = node.id !== undefined && node.id !== null
          ? node.id
          : (node.key !== undefined && node.key !== null ? node.key : node.value)
        this.$refs.projectCategoryModal.add({ parentId })
        this.$refs.projectCategoryModal.title = '新增子类别'
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  }
}
</script>
<style scoped>
.ant-card-body .table-operator {
  margin: 15px;
}

.anty-form-btn {
  width: 100%;
  text-align: center;
}

.anty-form-btn button {
  margin: 0 5px;
}

.ant-btn {
  margin-left: 3px
}

.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  list-style: none;
  margin: 0;
  min-width: 120px;
}

.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.context-menu li:hover {
  background: #f5f5f5;
}
</style>
