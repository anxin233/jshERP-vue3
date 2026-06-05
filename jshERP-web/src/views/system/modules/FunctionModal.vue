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
      <template #footer>
        <a-button key="back" v-if="isReadOnly" @click="handleCancel">取消</a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="functionModal">
          <a-form-item name="number" :labelCol="labelCol" :wrapperCol="wrapperCol" label="编号">
            <a-input placeholder="请输入编号" v-model:value="formModel.number" />
          </a-form-item>
          <a-form-item name="name" :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
            <a-input placeholder="请输入名称" v-model:value="formModel.name" />
          </a-form-item>
          <a-form-item name="parentNumber" :labelCol="labelCol" :wrapperCol="wrapperCol" label="上级编号">
            <a-input-search placeholder="请选择上级编号" v-model:value="formModel.parentNumber"
                            @search="onSearchParentNumber" :readOnly="true" />
          </a-form-item>
          <a-form-item name="parentName" :labelCol="labelCol" :wrapperCol="wrapperCol" label="上级名称">
            <a-input v-model:value="formModel.parentName" :readOnly="true" />
          </a-form-item>
          <a-form-item name="url" :labelCol="labelCol" :wrapperCol="wrapperCol" label="链接">
            <a-input placeholder="请输入链接" v-model:value="formModel.url" />
          </a-form-item>
          <a-form-item name="component" :labelCol="labelCol" :wrapperCol="wrapperCol" label="组件">
            <a-input placeholder="请输入组件" v-model:value="formModel.component" />
          </a-form-item>
          <a-form-item name="sort" :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序">
            <a-input placeholder="请输入排序" v-model:value="formModel.sort" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="功能按钮">
            <j-select-multiple placeholder="请选择功能按钮" v-model:value="jselectMultiple.value" :options="jselectMultiple.options"/>
          </a-form-item>
          <a-form-item name="icon" :labelCol="labelCol" :wrapperCol="wrapperCol" label="图标">
            <a-input placeholder="请输入图标" v-model:value="formModel.icon" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否启用">
            <a-switch checked-children="启用" un-checked-children="禁用" v-model:checked="enabledSwitch" @change="onChange"/>
          </a-form-item>
        </a-form>
      </a-spin>
      <function-tree-modal ref="functionTreeModal" @ok="functionTreeModalOk"></function-tree-modal>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import FunctionTreeModal from './FunctionTreeModal'
  import {addFunction,editFunction,checkFunction, checkNumber } from '@/api/api'
  import {autoJumpNextInput} from "@/utils/util"
  import {mixinDevice} from '@/utils/mixin'
  import JSelectMultiple from '@/components/jeecg/JSelectMultiple'
  export default {
    name: "FunctionModal",
    mixins: [mixinDevice],
    components: { FunctionTreeModal, JSelectMultiple },
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        formModel: {},
        enabledSwitch: true,
        isReadOnly: false,
        jselectMultiple: {
          options: [
            { text: '编辑', value: '1' },
            { text: '审核', value: '2' },
            { text: '反审核', value: '7' },
            { text: '导出', value: '3' },
            { text: '启用禁用', value: '4' },
            { text: '打印', value: '5' },
            { text: '作废', value: '6' }
          ],
          value: ''
        },
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          number: [
            { required: true, message: '请输入编号!', trigger: 'blur' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
            { validator: this.validateNumber, trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请输入名称!', trigger: 'blur' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
            { validator: this.validateName, trigger: 'blur' }
          ],
          parentNumber: [{ required: true, message: '请输入上级编号!', trigger: 'blur' }],
          url: [{ required: true, message: '请输入链接!', trigger: 'blur' }],
          component: [{ required: true, message: '请输入组件!', trigger: 'blur' }],
          sort: [{ required: true, message: '请输入排序!', trigger: 'blur' }],
          icon: [{ required: true, message: '请输入图标!', trigger: 'blur' }],
        },
      }
    },
    methods: {
      onChange(checked) {
        this.model.enabled = checked
      },
      add () {
        this.edit({});
        this.model.enabled = true
        this.enabledSwitch = true
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.visible = true;
        if(record.enabled!=null){
          this.enabledSwitch = !!record.enabled;
        }
        if(this.model.id){
          this.jselectMultiple.value = record.pushBtn
        } else {
          this.jselectMultiple.value = ''
        }
        this.formModel = pick(this.model,'number', 'name', 'parentNumber', 'parentName', 'url', 'component', 'sort', 'icon')
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
          autoJumpNextInput('functionModal')
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
          that.confirmLoading = true;
          let formData = Object.assign({}, this.model, { ...that.formModel });
          formData.pushBtn = this.jselectMultiple.value
          let obj = !this.model.id ? addFunction(formData) : editFunction(formData);
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
      validateNumber(rule, value){
        if (!value) return Promise.resolve()
        return checkNumber({ number: value, id: this.model.id ? this.model.id : 0 }).then((res)=>{
          if(res && res.code===200) {
            return !res.data.status ? Promise.resolve() : Promise.reject('编号已经存在！')
          }
          return Promise.reject(res.data)
        });
      },
      validateName(rule, value){
        if (!value) return Promise.resolve()
        return checkFunction({ name: value, id: this.model.id ? this.model.id : 0 }).then((res)=>{
          if(res && res.code===200) {
            return !res.data.status ? Promise.resolve() : Promise.reject('名称已经存在！')
          }
          return Promise.reject(res.data)
        });
      },
      onSearchParentNumber() {
        this.$refs.functionTreeModal.edit(this.model.id);
        this.$refs.functionTreeModal.title = "选择上级编号";
        this.$refs.functionTreeModal.disableSubmit = false;
      },
      functionTreeModalOk(number, name) {
        this.formModel.parentNumber = number
        this.formModel.parentName = name
      }
    }
  }
</script>
