<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="800"
      :ok=false
      :open="visible"
      :confirmLoading="confirmLoading"
      :okButtonProps="{ props: {disabled: disableSubmit} }"
      :getContainer="() => $refs.container"
      :maskStyle="{'top':'93px','left':'154px'}"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      @ok="handleOk"
      @cancel="handleCancel"
      style="top:100px;height: 50%;"
      cancelText="取消"
      okText="保存">
      <a-spin :spinning="confirmLoading">
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
                 :treeData="categoryTree" v-model:value="formModel.parentId" placeholder="请选择上级目录">
            </a-tree-select>
          </a-form-item>
          <a-form-item name="sort" :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
            <a-input v-model:value="formModel.sort"/>
          </a-form-item>
          <a-form-item name="remark" :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
            <a-textarea placeholder="请输入备注" :rows="2" v-model:value="formModel.remark" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import {mixinDevice} from '@/utils/mixin'
  import { queryMaterialCategoryTreeList, checkMaterialCategory } from '@/api/api'
  import pick from 'lodash.pick'
  export default {
    name: "MaterialCategoryModal",
    mixins: [mixinDevice],
    data () {
      return {
        categoryTree:[],
        title:"操作",
        visible: false,
        disableSubmit:false,
        model: {},
        formModel: {},
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          name: [
            { required: true, message: '请输入名称!', trigger: 'blur' },
            { validator: this.validateName, trigger: 'blur' }
          ],
          serialNo: [{ required: true, message: '请输入编号!', trigger: 'blur' }]
        },
        url: { add: "/materialCategory/add" }
      }
    },
    methods: {
      loadTreeData(){
        let params = { id:'' };
        queryMaterialCategoryTreeList(params).then((res)=>{
          if(res){
            this.categoryTree = [];
            for (let i = 0; i < res.length; i++) {
              this.categoryTree.push(res[i]);
            }
          }
        })
      },
      add () { this.edit({}); },
      edit (record) {
        this.model = Object.assign({}, record || {});
        this.formModel = pick(record || {}, 'name','serialNo', 'parentId', 'sort', 'remark')
        this.visible = true;
        this.loadTreeData();
      },
      close () {
        this.$emit('close');
        this.disableSubmit = false;
        this.visible = false;
      },
      handleOk () {
        const that = this;
        const formRef = this.$refs.formRef
        if (!formRef) return
        formRef.validate().then(() => {
          that.confirmLoading = true;
          let formData = Object.assign({}, this.model, { ...that.formModel });
          httpAction(this.url.add,formData,"post").then((res)=>{
            if(res.code == 200){
              that.$message.success(res.data.message);
              that.loadTreeData();
              that.$emit('ok');
            }else{
              that.$message.warning(res.data.message);
            }
          }).finally(() => {
            that.confirmLoading = false;
            that.close();
          })
        }).catch(() => {})
      },
      handleCancel () { this.close() },
      validateName(rule, value){
        if (!value) return Promise.resolve()
        let params = {
          name: value,
          parentId: this.formModel.parentId,
          id: this.model.id?this.model.id:0
        };
        return checkMaterialCategory(params).then((res)=>{
          if(res && res.code===200) {
            return !res.data.status ? Promise.resolve() : Promise.reject('名称已经存在')
          }
          return Promise.reject(res.data)
        });
      }
    }
  }
</script>

<style scoped>
</style>
