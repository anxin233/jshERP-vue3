<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="500"
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
      style="top:30%;height: 35%;">
      <template v-if="isReadOnly" #footer>
        <a-button key="back" @click="handleCancel">
          关闭
        </a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="batchSetDepot">
          <a-form-item name="depotId" :labelCol="labelCol" :wrapperCol="wrapperCol" label="仓库名称">
            <a-select placeholder="请选择仓库" v-model:value="formModel.depotId" showSearch optionFilterProp="children">
              <a-select-option v-for="(depot,index) in depotList" :value="depot.id" :key="index">
                {{ depot.depotName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import { getAction } from '@/api/manage'
  import {mixinDevice} from '@/utils/mixin'
  export default {
    name: "BatchSetDepot",
    mixins: [mixinDevice],
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        depotList: [],
        isReadOnly: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        formModel: {},
        formRules: {
          depotId: [{ required: true, message: '请选择仓库!', trigger: 'change' }]
        },
      }
    },
    created () {
    },
    methods: {
      getDepotData() {
        getAction('/depot/findDepotByCurrentUser').then((res)=>{
          if(res.code === 200){
            this.depotList = res.data;
          }else{
            this.$message.info(res.data);
          }
        })
      },
      add () {
        this.edit({});
        this.getDepotData()
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model, 'depotId');
        this.visible = true;
        this.$nextTick(() => {
          if (this.$refs.formRef) this.$refs.formRef.clearValidate()
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
          that.confirmLoading = true;
          let formData = Object.assign(this.model, this.formModel);
          let depotId = formData.depotId
          that.$emit('ok', depotId);
          that.confirmLoading = false;
          that.close();
        }).catch(() => {})
      },
      handleCancel () {
        this.close()
      }
    }
  }
</script>

<style scoped>

</style>