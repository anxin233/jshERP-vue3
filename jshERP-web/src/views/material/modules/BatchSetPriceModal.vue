<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="500"
      :open="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskClosable="false"
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="取消"
      okText="保存">
      <template v-if="isReadOnly" #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules">
          <a-form-item name="price" :labelCol="labelCol" :wrapperCol="wrapperCol" label="价格">
            <a-input placeholder="请输入价格" v-model:value="formModel.price" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  export default {
    name: 'BatchSetPriceModal',
    data () {
      return {
        title:"批量设置",
        visible: false,
        isReadOnly: false,
        batchType: '',
        model: {},
        formModel: { price: '' },
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          price: [{ required: true, message: '请输入价格!', trigger: 'blur' }]
        }
      }
    },
    methods: {
      add (type) {
        this.batchType = type
        if(type === 'purchase') {
          this.title = '采购价-批量设置'
        } else if(type === 'commodity') {
          this.title = '零售价-批量设置'
        } else if(type === 'wholesale') {
          this.title = '销售价-批量设置'
        } else if(type === 'low') {
          this.title = '最低售价-批量设置'
        }
        this.edit({});
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = { price: '' }
        this.visible = true;
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const formRef = this.$refs.formRef
        if (!formRef) return
        formRef.validate().then(() => {
          this.$emit('ok', this.formModel.price, this.batchType);
          this.visible = false
        }).catch(() => {})
      },
      handleCancel () { this.close() }
    }
  }
</script>
