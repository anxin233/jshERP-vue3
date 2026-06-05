<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="1200"
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
      <template #footer>
        <a-button key="back" v-if="isReadOnly" @click="handleCancel">取消</a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="memberModal">
          <a-row class="form-row" :gutter="24">
            <a-col :span="12">
              <a-form-item name="supplier" :labelCol="labelCol" :wrapperCol="wrapperCol" label="会员卡号">
                <a-input placeholder="请输入会员卡号" v-model:value="formModel.supplier" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="contacts" :labelCol="labelCol" :wrapperCol="wrapperCol" label="联系人">
                <a-input placeholder="请输入联系人" v-model:value="formModel.contacts" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="24">
            <a-col :span="12">
              <a-form-item name="telephone" :labelCol="labelCol" :wrapperCol="wrapperCol" label="手机号码">
                <a-input placeholder="请输入手机号码" v-model:value="formModel.telephone" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="phoneNum" :labelCol="labelCol" :wrapperCol="wrapperCol" label="联系电话">
                <a-input placeholder="请输入联系电话" v-model:value="formModel.phoneNum" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="email" :labelCol="labelCol" :wrapperCol="wrapperCol" label="电子邮箱">
                <a-input placeholder="请输入电子邮箱" v-model:value="formModel.email" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="sort" :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
                <a-input placeholder="请输入排序" v-model:value="formModel.sort" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="description" :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
                <a-textarea :rows="2" placeholder="请输入备注" v-model:value="formModel.description" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import {addSupplier,editSupplier,checkSupplier } from '@/api/api'
  import {autoJumpNextInput} from "@/utils/util"
  import {mixinDevice} from '@/utils/mixin'
  export default {
    name: "MemberModal",
    mixins: [mixinDevice],
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        formModel: {},
        isReadOnly: false,
        labelCol: { xs: { span: 24 }, sm: { span: 4 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 20 } },
        confirmLoading: false,
        formRules:{
          supplier: [
            { required: true, message: '请输入会员卡号!', trigger: 'blur' },
            { min: 2, max: 60, message: '长度在 2 到 60 个字符', trigger: 'blur' },
            { validator: this.validateSupplierName, trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      add () { this.edit({}); },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model, 'supplier', 'contacts', 'telephone', 'email', 'phoneNum', 'sort', 'description')
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
          autoJumpNextInput('memberModal')
        });
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
          const values = { ...that.formModel }
          if (values.supplier) values.supplier = String(values.supplier).trim()
          that.confirmLoading = true;
          let formData = Object.assign({}, this.model, values);
          if(this.model.beginNeedGet && this.model.beginNeedPay) {
            that.$message.warn("期初应收和期初应付不能同时输入");
            that.confirmLoading = false;
            return;
          }
          formData.type = "会员";
          let obj = !this.model.id ? addSupplier(formData) : editSupplier(formData);
          obj.then((res)=>{
            if(res.code === 200){ that.$emit('ok'); }
            else { that.$message.warning(res.data.message); }
          }).finally(() => {
            that.confirmLoading = false;
            that.close();
          })
        }).catch(() => {})
      },
      handleCancel () { this.close() },
      validateSupplierName(rule, value){
        if (!value) return Promise.resolve()
        return checkSupplier({ name: value, type: '会员', id: this.model.id ? this.model.id : 0 }).then((res)=>{
          if(res && res.code===200) {
            return !res.data.status ? Promise.resolve() : Promise.reject('会员卡号已经存在')
          }
          return Promise.reject(res.data)
        });
      }
    }
  }
</script>
