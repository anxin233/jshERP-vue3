<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="800"
      :ok=false
      :open="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskStyle="{'top':'93px','left':'154px'}"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      :okButtonProps="{ props: {disabled: disableSubmit} }"
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="取消"
      okText="保存"
      style="top:50px;height: 80%;">
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="organizationModal">
          <a-form-item name="orgAbr" :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
            <a-input placeholder="请输入名称" v-model:value="formModel.orgAbr"/>
          </a-form-item>
          <a-form-item name="orgNo" :labelCol="labelCol" :wrapperCol="wrapperCol" label="编号">
            <a-input placeholder="请输入编号" v-model:value="formModel.orgNo"/>
          </a-form-item>
          <a-form-item name="parentId" :labelCol="labelCol" :wrapperCol="wrapperCol" label="上级部门">
            <a-tree-select style="width:100%" :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
                           allow-clear :treeDefaultExpandAll="true"
                           :treeData="departTree" v-model:value="formModel.parentId" placeholder="请选择上级部门">
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
  import { queryOrganizationTreeList, checkOrganization } from '@/api/api'
  import {autoJumpNextInput} from "@/utils/util"
  import {mixinDevice} from '@/utils/mixin'
  import pick from 'lodash.pick'
  export default {
    name: "OrganizationModal",
    mixins: [mixinDevice],
    data () {
      return {
        departTree:[],
        title:"操作",
        visible: false,
        disableSubmit:false,
        model: {},
        formModel: {},
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          orgAbr: [
            { required: true, message: '请输入名称!', trigger: 'blur' },
            { validator: this.validateName, trigger: 'blur' }
          ],
          orgNo: [{ required: true, message: '请输入编码!', trigger: 'blur' }]
        },
        url: { add: "/organization/add" }
      }
    },
    methods: {
      loadTreeData(){
        let params = { id: '' };
        queryOrganizationTreeList(params).then((res)=>{
          if(res){
            this.departTree = res
          }
        })
      },
      add () { this.edit(); },
      edit (record) {
        this.model = Object.assign({}, {});
        this.formModel = record ? pick(record, 'orgAbr', 'orgNo', 'parentId', 'sort', 'remark') : {}
        this.visible = true;
        this.loadTreeData();
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
          autoJumpNextInput('organizationModal')
        });
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
          httpAction(this.url.add, formData, "post").then((res)=>{
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
        return checkOrganization({ name: value, id: this.model.id ? this.model.id : 0 }).then((res)=>{
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
  @import '@assets/less/common.less'
</style>








































