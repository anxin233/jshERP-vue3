<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="700"
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
      style="top:100px; height:55%;">
      <template #footer>
        <a-button key="back" v-if="isReadOnly" @click="handleCancel">取消</a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="unitModal">
          <a-form-item name="basicUnit" :labelCol="labelCol" :wrapperCol="wrapperCol" label="基本单位">
            <a-input placeholder="请输入基本单位(小单位)" v-model:value="formModel.basicUnit" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="副单位">
            <a-input placeholder="请输入副单位(大单位)" style="width:48%" v-model:value="formModel.otherUnit" />
            =
            <a-input suffix="基本单位" placeholder="请输入比例" style="width:48%" v-model:value="formModel.ratio" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="副单位2">
            <a-input placeholder="请输入副单位2(大单位)" style="width:48%" v-model:value="formModel.otherUnitTwo" />
            =
            <a-input suffix="基本单位" placeholder="请输入比例2" style="width:48%" v-model:value="formModel.ratioTwo" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="副单位3">
            <a-input placeholder="请输入副单位3(大单位)" style="width:48%" v-model:value="formModel.otherUnitThree" />
            =
            <a-input suffix="基本单位" placeholder="请输入比例3" style="width:48%" v-model:value="formModel.ratioThree" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import {addUnit,editUnit } from '@/api/api'
  import {autoJumpNextInput} from "@/utils/util"
  import {isDecimalThree} from "@/utils/validate"
  import {mixinDevice} from '@/utils/mixin'
  export default {
    name: "UnitModal",
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
          basicUnit: [
            { required: true, message: '请输入基本单位!', trigger: 'blur' },
            { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      add () { this.edit({}); },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model, 'basicUnit','otherUnit','ratio','otherUnitTwo','ratioTwo','otherUnitThree','ratioThree')
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
          autoJumpNextInput('unitModal')
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
          if (values.basicUnit) values.basicUnit = String(values.basicUnit).trim()
          let formData = Object.assign({}, this.model, values);
          if(!formData.otherUnit) {
            that.$message.warning('抱歉，副单位不能为空！');
            return;
          }
          if(formData.otherUnit) {
            if(!formData.ratio) {
              that.$message.warning('抱歉，比例不能为空！');
              return;
            }
            if(!isDecimalThree(formData.ratio)) {
              that.$message.warning('抱歉，比例只能为数字，最多三位小数！')
              return
            }
          }
          if(formData.otherUnitTwo) {
            if(!formData.ratioTwo) {
              that.$message.warning('抱歉，比例2不能为空！');
              return;
            }
            if(!isDecimalThree(formData.ratioTwo)) {
              that.$message.warning('抱歉，比例2只能为数字，最多三位小数！')
              return
            }
          }
          if(formData.otherUnitThree) {
            if(!formData.ratioThree) {
              that.$message.warning('抱歉，比例3不能为空！');
              return;
            }
            if(!isDecimalThree(formData.ratioThree)) {
              that.$message.warning('抱歉，比例3只能为数字，最多三位小数！')
              return
            }
          }
          if(!formData.otherUnitTwo && formData.otherUnitThree) {
            that.$message.warning('抱歉，需要先输入副单位2再输入副单位3！');
            return;
          }
          if(formData.basicUnit === formData.otherUnit) {
            that.$message.warning('抱歉，基本单位与副单位不能相同！');
            return;
          }
          if(formData.basicUnit === formData.otherUnitTwo) {
            that.$message.warning('抱歉，基本单位与副单位2不能相同！');
            return;
          }
          if(formData.basicUnit === formData.otherUnitThree) {
            that.$message.warning('抱歉，基本单位与副单位3不能相同！');
            return;
          }
          that.confirmLoading = true;
          let obj = !this.model.id ? addUnit(formData) : editUnit(formData);
          obj.then((res)=>{
            if(res.code === 200){ that.$emit('ok'); }
            else { that.$message.warning(res.data.message); }
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
