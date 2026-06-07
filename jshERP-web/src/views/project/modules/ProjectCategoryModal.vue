<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="800"
      :open="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskStyle="{'top':'93px','left':'154px'}"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="取消"
      okText="保存"
      style="top:5%;height: 90%;">
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="projectCategoryModal">
          <a-form-item name="name" :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
            <a-input placeholder="请输入名称" v-model:value="formModel.name" />
          </a-form-item>
          <a-form-item name="serialNo" :labelCol="labelCol" :wrapperCol="wrapperCol" label="编号">
            <a-input placeholder="请输入编号" v-model:value="formModel.serialNo" />
          </a-form-item>
          <a-form-item name="parentId" :labelCol="labelCol" :wrapperCol="wrapperCol" label="上级目录">
            <a-tree-select
              style="width:100%"
              :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
              allow-clear
              :treeDefaultExpandAll="true"
              :treeData="treeData"
              v-model:value="formModel.parentId"
              placeholder="请选择上级目录（不选则为顶级类别）">
            </a-tree-select>
          </a-form-item>
          <a-form-item name="sort" :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
            <a-input placeholder="请输入排序" v-model:value="formModel.sort" />
          </a-form-item>
          <a-form-item name="remark" :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
            <a-textarea placeholder="请输入备注" v-model:value="formModel.remark" :rows="4" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import {addProjectCategory, editProjectCategory, checkProjectCategory, getProjectCategoryTree} from '@/api/api'
  import {autoJumpNextInput} from "@/utils/util"
  import {mixinDevice} from '@/utils/mixin'

  export default {
    name: "ProjectCategoryModal",
    mixins: [mixinDevice],
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        formModel: {},
        treeData: [],
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          name: [
            { required: true, message: '请输入名称!', trigger: 'blur' },
            { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
            { validator: this.validateName, trigger: 'blur' }
          ],
          serialNo: [{ required: true, message: '请输入编号!', trigger: 'blur' }]
        },
      }
    },
    methods: {
      add (defaultModel = {}) { this.edit(defaultModel); },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model,'name', 'serialNo', 'sort', 'remark', 'parentId')
        this.visible = true;
        this.loadTree();
        this.$nextTick(() => {
          autoJumpNextInput('projectCategoryModal')
        });
      },
      loadTree() {
        let params = { id: this.model.id || '' };
        getProjectCategoryTree(params).then((res) => {
          if (res && res.code == 200) {
            this.treeData = res.data || [];
          }
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        const formRef = this.$refs.formRef
        if (!formRef) return
        formRef.validate().then(() => {
          that.confirmLoading = true;
          let formData = Object.assign({}, this.model, { ...that.formModel });
          let obj = !this.model.id ? addProjectCategory(formData) : editProjectCategory(formData);
          obj.then((res)=>{
            if(res.code === 200){
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
        let params = { name: value, id: this.model.id?this.model.id:0 };
        return checkProjectCategory(params).then((res)=>{
          if(res && res.code===200) {
            return !res.data.status ? Promise.resolve() : Promise.reject('名称已经存在！')
          }
          return Promise.reject(res.data)
        });
      }
    }
  }
</script>
<style scoped>
</style>
