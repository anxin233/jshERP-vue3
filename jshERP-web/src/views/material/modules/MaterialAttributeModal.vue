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
      style="top:100px;height: 60%;">
      <template #footer>
        <a-button key="back" v-if="isReadOnly" @click="handleCancel">取消</a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules">
          <a-form-item name="attributeName" :labelCol="labelCol" :wrapperCol="wrapperCol" label="属性名">
            <a-input placeholder="请输入属性名" v-model:value="formModel.attributeName" />
          </a-form-item>
          <a-form-item name="attributeValue" :labelCol="labelCol" :wrapperCol="wrapperCol" label="属性值">
            <a-tabs v-model:activeKey="activeKey" size="small">
              <a-tab-pane key="1" tab="标签模式" forceRender>
                <template v-for="tag in tags" :key="tag">
                  <a-tag color="blue" style="margin-bottom: 10px" :closable="true" @close="() => handleClose(tag)">
                    {{ tag }}
                  </a-tag>
                </template>
                <a-input
                  v-if="inputVisible"
                  ref="input"
                  type="text"
                  size="small"
                  :style="{ width: '150px' }"
                  v-model:value="inputValue"
                  @blur="handleInputConfirm"
                  @keyup.enter="handleInputConfirm"
                />
                <a-tag v-else style="background: #fff; borderStyle: dashed;" @click="showInput">
                  <legacy-icon type="plus" /> 请输入属性值
                </a-tag>
              </a-tab-pane>
              <a-tab-pane key="2" tab="文字模式" forceRender>
                <a-textarea :rows="8" placeholder="请输入属性值" v-model:value="formModel.attributeValue" @change="handleValueChange" />
                注意：属性值请用竖线隔开，比如：红色|橙色|黄色|绿色
              </a-tab-pane>
            </a-tabs>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import { addMaterialAttribute, checkMaterialAttribute, editMaterialAttribute } from '@/api/api'
  import { mixinDevice } from '@/utils/mixin'

  export default {
    name: "MaterialAttributeModal",
    mixins: [mixinDevice],
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        formModel: {},
        isReadOnly: false,
        activeKey: '1',
        tags: [],
        inputVisible: false,
        inputValue: '',
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          attributeName: [
            { required: true, message: '请输入属性名!', trigger: 'blur' },
            { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' },
            { validator: this.validateAttributeName, trigger: 'blur' }
          ],
          attributeValue: [
            { required: true, message: '请输入属性值!', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      syncAttributeValue() {
        this.formModel.attributeValue = this.tags.join('|')
      },
      add () { this.edit({}); },
      edit (record) {
        this.model = Object.assign({}, record);
        this.activeKey = '1'
        this.visible = true;
        if(this.model.attributeValue) {
          this.tags = this.model.attributeValue.split('|')
        } else {
          this.tags = []
        }
        this.formModel = pick(this.model, 'attributeName', 'attributeValue')
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
          let formData = Object.assign(this.model, { ...that.formModel });
          let obj = !this.model.id ? addMaterialAttribute(formData) : editMaterialAttribute(formData);
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
      validateAttributeName(rule, value){
        if(!value) return Promise.resolve()
        let params = { name: value, id: this.model.id?this.model.id:0 }
        return checkMaterialAttribute(params).then((res)=>{
          if(res && res.code===200) {
            return !res.data.status ? Promise.resolve() : Promise.reject('名称已经存在')
          }
          return Promise.reject(res.data)
        })
      },
      handleValueChange(e) {
        let attributeValue = e.target.value
        if(attributeValue) {
          this.tags = attributeValue.split('|')
        } else {
          this.tags = []
        }
      },
      handleClose(removedTag) {
        this.tags = this.tags.filter(tag => tag !== removedTag)
        this.syncAttributeValue()
      },
      showInput() {
        this.inputVisible = true
        this.$nextTick(function() {
          this.$refs.input.focus()
        });
      },
      handleInputConfirm() {
        const inputValue = this.inputValue
        let tags = this.tags
        if (inputValue && tags.indexOf(inputValue) === -1) {
          tags = [...tags, inputValue]
        }
        this.tags = tags
        this.inputVisible = false
        this.inputValue = ''
        this.syncAttributeValue()
      }
    }
  }
</script>
<style scoped>
</style>
