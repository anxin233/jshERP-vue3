<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="650"
      :open="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskStyle="{'top':'93px','left':'154px'}"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="关闭"
      style="top:20%;height: 60%;">
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel">
          <a-row class="form-row" :gutter="24">
            <a-col :lg="12" :md="12" :sm="24">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结算账户1">
                <a-select style="width:185px;" placeholder="请选择结算账户" v-model:value="formModel.oneAccountId" :dropdownMatchSelectWidth="false" allowClear>
                  <a-select-option v-for="(item,index) in accountList" :key="index" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :lg="12" :md="12" :sm="24">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结算金额">
                <a-input-number placeholder="请输入金额" v-model:value="formModel.oneAccountPrice" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="24">
            <a-col :lg="12" :md="12" :sm="24">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结算账户2">
                <a-select style="width:185px;" placeholder="请选择结算账户" v-model:value="formModel.twoAccountId" :dropdownMatchSelectWidth="false" allowClear>
                  <a-select-option v-for="(item,index) in accountList" :key="index" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :lg="12" :md="12" :sm="24">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结算金额">
                <a-input-number placeholder="请输入金额" v-model:value="formModel.twoAccountPrice" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="24">
            <a-col :lg="12" :md="12" :sm="24">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结算账户3">
                <a-select style="width:185px;" placeholder="请选择结算账户" v-model:value="formModel.threeAccountId" :dropdownMatchSelectWidth="false" allowClear>
                  <a-select-option v-for="(item,index) in accountList" :key="index" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :lg="12" :md="12" :sm="24">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结算金额">
                <a-input-number placeholder="请输入金额" v-model:value="formModel.threeAccountPrice" />
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
  import {getAccount} from '@/api/api'
  import {mixinDevice} from '@/utils/mixin'
  export default {
    name: 'ManyAccountModal',
    mixins: [mixinDevice],
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        accountList: [],
        accountIdList: [],
        accountMoneyList: [],
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        formModel: {}
      }
    },
    created () {
    },
    methods: {
      edit (idStr, moneyStr) {
        this.initAccount()
        this.formModel = {};
        this.model = Object.assign({}, {});
        let idList = [], moneyList = []
        if(idStr && idStr.indexOf(',')>-1) {
          idList = idStr.split(",")
          moneyList = moneyStr.split(",")
        } else {
          idList = idStr
          moneyList = moneyStr
        }
        if(idList[0]) {this.model.oneAccountId = idList[0]-0}
        if(idList[1]) {this.model.twoAccountId = idList[1]-0}
        if(idList[2]) {this.model.threeAccountId = idList[2]-0}
        if(moneyList[0]) {this.model.oneAccountPrice = Math.abs(moneyList[0])}
        if(moneyList[1]) {this.model.twoAccountPrice = Math.abs(moneyList[1])}
        if(moneyList[2]) {this.model.threeAccountPrice = Math.abs(moneyList[2])}
        this.visible = true;
        this.$nextTick(() => {
          Object.assign(this.formModel, pick(this.model,'oneAccountId','oneAccountPrice',
            'twoAccountId','twoAccountPrice','threeAccountId','threeAccountPrice'))
        });
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        const formRef = this.$refs.formRef
        if (!formRef) return
        formRef.validate().then(() => {
          const values = { ...this.formModel }
          let allPrice = 0
          that.confirmLoading = true;
          that.accountIdList = []
          that.accountMoneyList = []
          let formData = Object.assign(this.model, values);
          if(formData.oneAccountId!==undefined) {
            that.accountIdList.push(formData.oneAccountId)
          }
          if(formData.twoAccountId!==undefined) {
            that.accountIdList.push(formData.twoAccountId)
          }
          if(formData.threeAccountId!==undefined) {
            that.accountIdList.push(formData.threeAccountId)
          }
          if(formData.oneAccountPrice!==undefined) {
            that.accountMoneyList.push(formData.oneAccountPrice)
            allPrice = allPrice + formData.oneAccountPrice
          }
          if(formData.twoAccountPrice!==undefined) {
            that.accountMoneyList.push(formData.twoAccountPrice)
            allPrice = allPrice + formData.twoAccountPrice
          }
          if(formData.threeAccountPrice!==undefined) {
            that.accountMoneyList.push(formData.threeAccountPrice)
            allPrice = allPrice + formData.threeAccountPrice
          }
          if(that.accountIdList.length<2 || that.accountMoneyList.length<2) {
            this.$message.warning('抱歉，多账户结算必须选择两个以上账户和金额！');
            that.confirmLoading = false;
            return;
          }
          if((formData.oneAccountId && !formData.oneAccountPrice)||
            (formData.twoAccountId && !formData.twoAccountPrice)||
            (formData.threeAccountId && !formData.threeAccountPrice)) {
            this.$message.warning('抱歉，请填写结算金额！');
            that.confirmLoading = false;
            return;
          }
          that.$emit('ok', that.accountIdList, that.accountMoneyList, allPrice);
          that.confirmLoading = false;
          that.close();
        }).catch(() => {})
      },
      handleCancel () {
        this.close()
      },
      initAccount(){
        let that = this;
        getAccount({}).then((res)=>{
          if(res && res.code === 200) {
            that.accountList = res.data.accountList
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>