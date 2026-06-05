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
      style="top:10%;height: 70%;">
      <template #footer>
        <a-button key="back" v-if="isReadOnly" @click="handleCancel">
          取消
        </a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="depotModal">
          <a-form-item name="name" :labelCol="labelCol" :wrapperCol="wrapperCol" label="仓库名称">
            <a-input placeholder="请输入仓库名称" v-model:value="formModel.name" />
          </a-form-item>
          <a-form-item name="address" :labelCol="labelCol" :wrapperCol="wrapperCol" label="仓库地址">
            <a-input placeholder="请输入仓库地址" v-model:value="formModel.address" />
          </a-form-item>
          <a-form-item name="warehousing" :labelCol="labelCol" :wrapperCol="wrapperCol" label="仓储费">
            <a-input placeholder="请输入仓储费" v-model:value="formModel.warehousing" suffix="元/天/KG"/>
          </a-form-item>
          <a-form-item name="truckage" :labelCol="labelCol" :wrapperCol="wrapperCol" label="搬运费">
            <a-input placeholder="请输入搬运费" v-model:value="formModel.truckage" suffix="元"/>
          </a-form-item>
          <a-form-item name="principal" :labelCol="labelCol" :wrapperCol="wrapperCol" label="负责人">
            <a-select placeholder="选择负责人" v-model:value="formModel.principal" :dropdownMatchSelectWidth="false">
              <a-select-option v-for="(item,index) in userList" :key="index" :value="item.id">
                {{ item.userName }}
              </a-select-option>
            </a-select>
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
  import {addDepot,editDepot,checkDepot,getUserList } from '@/api/api'
  import {autoJumpNextInput} from "@/utils/util"
  import {mixinDevice} from '@/utils/mixin'
  export default {
    name: "DepotModal",
    mixins: [mixinDevice],
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        formModel: {},
        maskStyle: '',
        userList: [],
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
        formRules:{
          name: [
            { required: true, message: '请输入仓库名称!', trigger: 'blur' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
            { validator: this.validateDepotName, trigger: 'blur' }
          ]
        },
      }
    },
    created () {
      this.initUser()
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model, 'name', 'address', 'warehousing', 'truckage', 'principal', 'sort', 'remark')
        this.visible = true;
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate()
          }
          autoJumpNextInput('depotModal')
        });
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        const formRef = this.$refs.formRef
        if (!formRef) {
          return
        }
        formRef.validate().then(() => {
          const values = { ...that.formModel }
          if (values.name) {
            values.name = String(values.name).trim()
          }
          that.confirmLoading = true;
          let formData = Object.assign({}, this.model, values);
          let obj;
          if(!this.model.id){
            obj=addDepot(formData);
          }else{
            obj=editDepot(formData);
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
      handleCancel () {
        this.close()
      },
      validateDepotName(rule, value){
        if (!value) {
          return Promise.resolve()
        }
        let params = {
          name: value,
          id: this.model.id?this.model.id:0
        };
        return checkDepot(params).then((res)=>{
          if(res && res.code===200) {
            if(!res.data.status){
              return Promise.resolve()
            }
            return Promise.reject('名称已经存在')
          }
          return Promise.reject(res.data)
        });
      },
      initUser() {
        getUserList({}).then((res)=>{
          if(res) {
            this.userList = res;
          }
        });
      }
    }
  }
</script>
<style scoped>

</style>
