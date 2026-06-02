<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="800"
      :visible="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :maskStyle="{ top: '93px', left: '154px' }"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      cancelText="取消"
      okText="保存"
      style="top:15%;height: 60%;"
      @ok="handleOk"
      @cancel="handleCancel">
      <template v-if="isReadOnly" #footer>
        <a-button key="back" @click="handleCancel">
          取消
        </a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form-model ref="formRef" id="roleModal" :model="formModel" :rules="formRules">
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="角色名称" prop="name" name="name">
            <a-input
              placeholder="请输入角色名称"
              :value="formModel.name"
              @change="handleFieldChange('name', $event)" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="数据类型" prop="type" name="type">
            <a-select
              placeholder="请选择数据类型"
              style="width:94%"
              :value="formModel.type"
              @change="handleFieldChange('type', $event)">
              <a-select-option value="全部数据">全部数据</a-select-option>
              <a-select-option value="本部门数据">本部门数据</a-select-option>
              <a-select-option value="个人数据">个人数据</a-select-option>
            </a-select>
            <a-tooltip title="1、全部数据：该角色对应的用户可以看到全部单据；2、本部门数据：该角色对应的用户可以看到自己所在部门的全部单据；3、个人数据：该角色对应的用户只可以看到自己的单据。单据是指采购入库、销售出库等">
              <legacy-icon type="question-circle" style="width:6%; padding-left: 5px; font-size: 18px;" />
            </a-tooltip>
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="价格屏蔽">
            <j-select-multiple
              v-model="priceLimitList.value"
              style="width:94%"
              placeholder="请选择价格屏蔽"
              :options="priceLimitList.options" />
            <a-tooltip title="价格屏蔽支持多选，主要用于控制首页界面和物料的价格屏蔽">
              <legacy-icon type="question-circle" style="width:6%; padding-left: 5px; font-size: 18px;" />
            </a-tooltip>
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注" prop="description" name="description">
            <a-textarea
              :rows="1"
              placeholder="请输入备注"
              :value="formModel.description"
              @change="handleFieldChange('description', $event)" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="排序" prop="sort" name="sort">
            <a-input
              placeholder="请输入排序"
              :value="formModel.sort"
              @change="handleFieldChange('sort', $event)" />
          </a-form-model-item>
        </a-form-model>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import JSelectMultiple from '@/components/jeecg/JSelectMultiple'
  import { addRole, editRole, checkRole } from '@/api/api'
  import { autoJumpNextInput } from '@/utils/util'
  import { mixinDevice } from '@/utils/mixin'

  export default {
    name: 'RoleModal',
    mixins: [mixinDevice],
    components: {
      JSelectMultiple
    },
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        formModel: this.createEmptyFormModel(),
        isReadOnly: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        priceLimitList: {
          options: [
            { value: '1', text: '屏蔽首页采购价' },
            { value: '2', text: '屏蔽首页零售价' },
            { value: '3', text: '屏蔽首页销售价' },
            { value: '4', text: '屏蔽单据采购价' },
            { value: '5', text: '屏蔽单据零售价' },
            { value: '6', text: '屏蔽单据销售价' }
          ],
          value: ''
        },
        confirmLoading: false,
        formRules: {
          name: [
            { required: true, message: '请输入角色名称' },
            { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
            { validator: this.validateRoleName, trigger: 'blur' }
          ],
          type: [
            { required: true, message: '请选择数据类型!' }
          ],
          description: [
            { min: 0, max: 126, message: '长度不超过 126 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      createEmptyFormModel() {
        return {
          name: '',
          type: undefined,
          sort: '',
          description: ''
        }
      },
      add() {
        this.edit({})
      },
      edit(record) {
        this.model = Object.assign({}, record)
        this.priceLimitList.value = this.model.priceLimit
        this.formModel = Object.assign(this.createEmptyFormModel(), pick(this.model, 'name', 'type', 'sort', 'description'))
        this.visible = true
        this.$nextTick(() => {
          this.clearValidate()
          autoJumpNextInput('roleModal')
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        this.validateForm((valid) => {
          if (!valid) {
            return
          }
          this.confirmLoading = true
          const formData = Object.assign({}, this.model, this.formModel, {
            priceLimit: this.priceLimitList.value
          })
          const request = this.model.id ? editRole(formData) : addRole(formData)
          request.then((res) => {
            if (res.code === 200) {
              this.$emit('ok')
            } else {
              this.$message.warning(res.data.message)
            }
          }).finally(() => {
            this.confirmLoading = false
            this.close()
          })
        })
      },
      handleCancel() {
        this.close()
      },
      handleFieldChange(field, event) {
        this.formModel[field] = event && event.target ? event.target.value : event
      },
      validateForm(callback) {
        const formRef = this.$refs.formRef
        if (!formRef || !formRef.validate) {
          callback(true)
          return
        }
        formRef.validate(callback)
      },
      clearValidate() {
        const formRef = this.$refs.formRef
        if (formRef && formRef.clearValidate) {
          formRef.clearValidate()
        }
      },
      validateRoleName(rule, value, callback) {
        if (!value) {
          callback()
          return
        }
        const params = {
          name: value,
          id: this.model.id ? this.model.id : 0
        }
        checkRole(params).then((res) => {
          if (res && res.code === 200) {
            if (!res.data.status) {
              callback()
            } else {
              callback('名称已经存在')
            }
          } else {
            callback(res.data)
          }
        })
      }
    }
  }
</script>

<style scoped>
</style>
