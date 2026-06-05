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
      style="top:10%;height: 80%;">
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules">
          <a-form-item name="dictType" :labelCol="labelCol" :wrapperCol="wrapperCol" label="字典类型">
            <a-input placeholder="请输入字典类型" v-model:value="formModel.dictType" :readOnly="true" />
          </a-form-item>
          <a-form-item name="dictLabel" :labelCol="labelCol" :wrapperCol="wrapperCol" label="字典标签">
            <a-input placeholder="请输入字典标签" v-model:value="formModel.dictLabel" />
          </a-form-item>
          <a-form-item name="dictValue" :labelCol="labelCol" :wrapperCol="wrapperCol" label="字典键值">
            <a-input placeholder="请输入字典键值" v-model:value="formModel.dictValue" />
          </a-form-item>
          <a-form-item name="dictSort" :labelCol="labelCol" :wrapperCol="wrapperCol" label="字典排序">
            <a-input-number style="width: 100%" placeholder="请输入字典排序" v-model:value="formModel.dictSort" />
          </a-form-item>
          <a-form-item name="cssClass" :labelCol="labelCol" :wrapperCol="wrapperCol" label="样式属性">
            <a-input placeholder="请输入样式属性" v-model:value="formModel.cssClass" />
          </a-form-item>
          <a-form-item name="listClass" :labelCol="labelCol" :wrapperCol="wrapperCol" label="回显样式">
            <a-select placeholder="请选择回显样式" showSearch allow-clear optionFilterProp="children" v-model:value="formModel.listClass">
              <a-select-option v-for="(item,index) in listClassOptions" :key="index" :value="item.value">
                {{ item.label + '(' + item.value + ')' }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="status" :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态">
            <a-select style="width:100%" placeholder="请选择状态" v-model:value="formModel.status">
              <a-select-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </a-select-option>
            </a-select>
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
  import { addDictData, editDictData } from '@/api/api'
  import { mixinDevice } from '@/utils/mixin'
  export default {
    name: "DictDataModal",
    dicts: ['sys_normal_disable'],
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
          dictLabel: [{ required: true, message: '请输入字典标签!', trigger: 'blur' }],
          dictValue: [{ required: true, message: '请输入字典键值!', trigger: 'blur' }],
          dictSort: [{ required: true, message: '请输入字典排序!', trigger: 'blur' }]
        },
        listClassOptions: [
          { value: "default", label: "默认" },
          { value: "blue", label: "主要" },
          { value: "green", label: "成功" },
          { value: "grey", label: "信息" },
          { value: "orange", label: "警告" },
          { value: "red", label: "危险" }
        ],
      }
    },
    methods: {
      add (dictType) {
        this.edit({});
        this.model.dictType = dictType
        this.model.dictSort = 0
        this.model.listClass = 'default'
        this.model.status = '0'
        this.formModel = pick(this.model, 'dictType', 'dictSort', 'listClass', 'status')
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model, 'dictType', 'dictLabel', 'dictValue', 'cssClass', 'dictSort', 'listClass', 'status', 'remark')
        this.visible = true;
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
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
          let obj = !this.model.dictCode ? addDictData(formData) : editDictData(formData)
          obj.then((res)=>{
            if(res.code === 200){
              that.$emit('ok');
              that.close();
            }else{
              that.$message.warning(res.data.message);
            }
          }).finally(() => {
            that.confirmLoading = false;
          })
        }).catch(() => {})
      },
      handleCancel () { this.close() }
    }
  }
</script>
