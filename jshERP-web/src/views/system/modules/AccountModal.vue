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
      style="top:15%;height: 55%;">
      <template #footer>
        <a-button key="back" v-if="isReadOnly" @click="handleCancel">取消</a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="accountModal">
          <a-form-item name="name" :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
            <a-input placeholder="请输入名称" v-model:value="formModel.name" />
          </a-form-item>
          <a-form-item name="serialNo" :labelCol="labelCol" :wrapperCol="wrapperCol" label="编号">
            <a-input placeholder="请输入编号" v-model:value="formModel.serialNo" />
          </a-form-item>
          <a-form-item name="initialAmount" :labelCol="labelCol" :wrapperCol="wrapperCol" label="期初金额">
            <a-input placeholder="请输入期初金额" v-model:value="formModel.initialAmount" />
          </a-form-item>
          <a-form-item name="sort" :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
            <a-input placeholder="请输入排序" v-model:value="formModel.sort" />
          </a-form-item>
          <a-form-item name="remark" :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
            <a-textarea :rows="2" placeholder="请输入备注" v-model:value="formModel.remark" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import {addAccount,editAccount,checkAccount } from '@/api/api'
  import {autoJumpNextInput} from "@/utils/util"
  import {mixinDevice} from '@/utils/mixin'
  export default {
    name: "AccountModal",
    mixins: [mixinDevice],
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        formModel: {},
        isReadOnly: false,
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          name: [
            { required: true, message: '请输入名称!', trigger: 'blur' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
            { validator: this.validateAccountName, trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      add () { this.edit({}); },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model, 'name', 'serialNo', 'initialAmount', 'sort', 'remark')
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
          autoJumpNextInput('accountModal')
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
          if (values.name) values.name = String(values.name).trim()
          that.confirmLoading = true;
          let formData = Object.assign({}, this.model, values);
          let obj = !this.model.id ? addAccount(formData) : editAccount(formData);
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
      validateAccountName(rule, value){
        if (!value) return Promise.resolve()
        return checkAccount({ name: value, id: this.model.id ? this.model.id : 0 }).then((res)=>{
          if(res && res.code===200) {
            return !res.data.status ? Promise.resolve() : Promise.reject('名称已经存在')
          }
          return Promise.reject(res.data)
        });
      }
    }
  }
</script>
