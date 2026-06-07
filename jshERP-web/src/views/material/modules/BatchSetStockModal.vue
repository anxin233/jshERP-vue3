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
          <a-form-item name="number" :labelCol="labelCol" :wrapperCol="wrapperCol" label="数量">
            <a-input placeholder="请输入数量" v-model:value="formModel.number" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  export default {
    name: 'BatchSetStockModal',
    data () {
      return {
        title:"批量设置",
        visible: false,
        isReadOnly: false,
        batchType: '',
        model: {},
        formModel: { number: '' },
        labelCol: { xs: { span: 24 }, sm: { span: 5 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
        confirmLoading: false,
        formRules:{
          number: [{ required: true, message: '请输入数量!', trigger: 'blur' }]
        }
      }
    },
    methods: {
      add (type) {
        this.batchType = type
        if(type === 'initStock') {
          this.title = '期初库存-批量设置'
        } else if(type === 'lowSafeStock') {
          this.title = '最低安全库存-批量设置'
        } else if(type === 'highSafeStock') {
          this.title = '最高安全库存-批量设置'
        }
        this.edit({});
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = { number: '' }
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
          this.$emit('ok', this.formModel.number, this.batchType);
          this.visible = false
        }).catch(() => {})
      },
      handleCancel () { this.close() }
    }
  }
</script>
