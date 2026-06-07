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
      style="top:2%;height:95%;">
      <template v-if="isReadOnly" #footer>
        <a-button key="back" @click="handleCancel">
          取消
        </a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="userModal">
          <a-form-item label="登录名称" name="loginName" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入登录名称" v-model:value="formModel.loginName" :readOnly="!!model.id" />
          </a-form-item>
          <a-form-item label="用户密码" name="password" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="!model.id">
            <a-input-password placeholder="请输入用户密码" v-model:value="formModel.password" />
          </a-form-item>
          <a-form-item label="用户姓名" name="username" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入用户姓名" v-model:value="formModel.username" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="角色" name="roleId">
            <a-select v-if="!model.id||model.id!==model.tenantId" placeholder="选择角色" v-model:value="formModel.roleId" :dropdownMatchSelectWidth="false">
              <a-select-option v-for="(item,index) in roleList" :key="index" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-col v-if="model.id===model.tenantId"><a-row>{{ tenantRoleName }}</a-row></a-col>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="部门" name="orgaId">
            <a-tree-select style="width:100%" :dropdownStyle="{maxHeight:'200px',overflow:'auto'}" allow-clear
               :treeData="orgaTree" v-model:value="formModel.orgaId" placeholder="请选择部门">
            </a-tree-select>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="职位" name="position">
            <a-input placeholder="请输入职位" v-model:value="formModel.position" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否经理" name="leaderFlag">
            <a-select placeholder="请选择是否经理" v-model:value="formModel.leaderFlag">
              <a-select-option value="1">是</a-select-option>
              <a-select-option value="0">否</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="电话号码" name="phonenum">
            <a-input placeholder="请输入电话号码" v-model:value="formModel.phonenum" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="电子邮箱" name="email">
            <a-input placeholder="请输入电子邮箱" v-model:value="formModel.email" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序" name="userBlngOrgaDsplSeq">
            <a-input placeholder="请输入排序" v-model:value="formModel.userBlngOrgaDsplSeq" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注" name="description">
            <a-textarea :rows="2" placeholder="请输入备注" v-model:value="formModel.description" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import md5 from 'md5'
  import JSelectPosition from '@/components/jeecgbiz/JSelectPosition'
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import {addUser,editUser,queryOrganizationTreeList,roleAllList} from '@/api/api'
  import {autoJumpNextInput} from "@/utils/util"
  import {mixinDevice} from '@/utils/mixin'
  import JImageUpload from '../../../components/jeecg/JImageUpload'
  import storage from '@/utils/storage'
  export default {
    name: "UserModal",
    mixins: [mixinDevice],
    components: {
      JImageUpload,
      JSelectPosition
    },
    data () {
      return {
        title:"操作",
        visible: false,
        modalWidth:800,
        drawerWidth:700,
        orgaTree: [],
        roleList: [],
        userId:"",
        tenantRoleName: '',
        isReadOnly: false,
        disableSubmit:false,
        dateFormat:"YYYY-MM-DD",
        formModel: {},
        formRules: {
          loginName: [
            { required: true, message: '请输入登录名称!', trigger: 'blur' }
          ],
          password: [
            { validator: this.validatePassword, trigger: 'blur' }
          ],
          username: [
            { required: true, message: '请输入用户姓名!', trigger: 'blur' }
          ],
          roleId: [
            { required: true, message: '请选择角色!', trigger: 'change' }
          ]
        },
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        uploadLoading:false,
        confirmLoading: false,
        headers:{},
      }
    },
    created () {
      const token = storage.get(ACCESS_TOKEN);
      this.headers = {"X-Access-Token":token}
    },
    methods: {
      validatePassword(rule, value) {
        if (this.model.id) {
          return Promise.resolve()
        }
        if (!value) {
          return Promise.reject('请输入用户密码!')
        }
        if (!/^(?=.*[a-z])(?=.*\d).{6,}$/.test(value)) {
          return Promise.reject('用户密码至少要有数字和小写字母，并且长度至少6位!')
        }
        return Promise.resolve()
      },
      add () {
        this.edit({});
      },
      edit (record) {
        this.loadOrgaData()
        this.loadRoleData()
        this.userId = record.id;
        this.visible = true;
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model, 'loginName', 'username', 'roleId', 'orgaId', 'position', 'leaderFlag',
          'phonenum', 'email', 'userBlngOrgaDsplSeq', 'description', 'password')
        if (!this.formModel.password) {
          this.formModel.password = ''
        }
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate()
          }
          this.tenantRoleName = this.model.roleName
          autoJumpNextInput('userModal')
        });
      },
      close() {
        this.$emit('close');
        this.visible = false;
        this.disableSubmit = false;
      },
      handleOk() {
        const that = this;
        const formRef = this.$refs.formRef
        if (!formRef) {
          return
        }
        formRef.validate().then(() => {
          const values = { ...that.formModel }
          if (values.loginName) {
            values.loginName = String(values.loginName).trim()
          }
          if (values.username) {
            values.username = String(values.username).trim()
          }
          that.confirmLoading = true;
          let formData = Object.assign({}, this.model, values);
          let obj;
          if(!this.model.id){
            formData.id = this.userId;
            formData.password = md5(values.password);
            obj=addUser(formData);
          }else{
            obj=editUser(formData);
          }
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
      handleCancel() {
        this.close()
      },
      loadOrgaData(){
        let that = this;
        let params = {};
        params.id='';
        queryOrganizationTreeList(params).then((res)=>{
          if(res){
            that.orgaTree = res
          }
        })
      },
      loadRoleData(){
        roleAllList({}).then((res)=>{
          if(res){
            this.roleList = res
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
