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
      style="top:10%;height: 70%;">
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules">
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
            {{model.nativeName}}
          </a-form-item>
          <a-form-item name="anotherName" :labelCol="labelCol" :wrapperCol="wrapperCol" label="别名">
            <a-input placeholder="请输入别名" v-model:value="formModel.anotherName" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import {mixinDevice} from '@/utils/mixin'
  import {addOrUpdateMaterialProperty } from '@/api/api'
  export default {
    name: "MaterialPropertyModal",
    mixins: [mixinDevice],
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        formModel: {},
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          anotherName: [
            { required: true, message: '请输入别名!', trigger: 'blur' },
            { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      add () { this.edit({}); },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model, 'nativeName', 'anotherName')
        this.visible = true;
        this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
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
          let obj;
          if(this.model.id){
            obj=addOrUpdateMaterialProperty(formData);
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
      handleCancel () { this.close() }
    }
  }
</script>
