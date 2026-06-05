<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="600"
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
      style="top:15%;height: 60%;">
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules">
          <a-form-item name="loginName" :labelCol="labelCol" :wrapperCol="wrapperCol" label="登录名称">
            <a-input placeholder="请输入登录名称" v-model:value="formModel.loginName" :readOnly="!!model.id"
                     suffix="初始密码：123456" />
          </a-form-item>
          <a-form-item name="userNumLimit" :labelCol="labelCol" :wrapperCol="wrapperCol" label="用户数量限制">
            <a-input-number style="width:100%" placeholder="请输入用户数量限制" v-model:value="formModel.userNumLimit" />
          </a-form-item>
          <a-form-item name="roleId" :labelCol="labelCol" :wrapperCol="wrapperCol" label="租户角色" v-if="model.id">
            <a-select style="width:100%" placeholder="请选择租户角色" v-model:value="formModel.roleId">
              <a-select-option v-for="(item,index) in tenantRoleList" :key="index" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="type" :labelCol="labelCol" :wrapperCol="wrapperCol" label="租户类型" v-if="model.id">
            <a-select style="width:100%" placeholder="请选择租户类型" v-model:value="formModel.type">
              <a-select-option value="0">试用租户</a-select-option>
              <a-select-option value="1">付费租户</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="expireTime" :labelCol="labelCol" :wrapperCol="wrapperCol" label="到期时间">
            <j-date style="width:100%" placeholder="请选择到期时间" v-model:value="formModel.expireTime" :show-time="true"/>
          </a-form-item>
          <a-form-item name="remark" :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
            <a-textarea :rows="2" placeholder="请输入备注（微信号）" v-model:value="formModel.remark" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import {mixinDevice} from '@/utils/mixin'
  import {addTenant,editTenant,checkTenant, getTenantRoleList } from '@/api/api'
  import JDate from '@/components/jeecg/JDate'
  import md5 from 'md5'
  export default {
    name: "TenantModal",
    mixins: [mixinDevice],
    components: {
      JDate
    },
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        formModel: {},
        tenantRoleList: [],
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        formRules:{
          loginName: [
            { required: true, message: '请输入登录名称!', trigger: 'blur' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
            { validator: this.validateLoginName, trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.model.expireTime = this.model.expireTimeStr
        this.formModel = pick(this.model, 'loginName', 'userNumLimit', 'type', 'roleId', 'expireTime', 'remark')
        this.visible = true;
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate()
          }
        })
        this.getTenantRoleList()
      },
      getTenantRoleList() {
        getTenantRoleList().then((res)=>{
          if(res) {
            this.tenantRoleList = res
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
        if (!formRef) {
          return
        }
        formRef.validate().then(() => {
          const values = { ...that.formModel }
          if (values.loginName) {
            values.loginName = String(values.loginName).trim()
          }
          if (values.remark) {
            values.remark = String(values.remark).trim()
          }
          that.confirmLoading = true;
          let formData = Object.assign({}, this.model, values);
          let obj;
          if(!this.model.id){
            formData.password = md5('123456')
            obj=addTenant(formData);
          }else{
            obj=editTenant(formData);
          }
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
      handleCancel () {
        this.close()
      },
      validateLoginName(rule, value){
        if (!value) {
          return Promise.resolve()
        }
        let params = {
          name: value,
          id: this.model.id?this.model.id:0
        };
        return checkTenant(params).then((res)=>{
          if(res && res.code===200) {
            if(!res.data.status){
              return Promise.resolve()
            }
            return Promise.reject('登录名称已经存在')
          }
          return Promise.reject(res.data)
        });
      }
    }
  }
</script>
<style scoped>

</style>
