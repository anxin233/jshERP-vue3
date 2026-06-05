<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="1200"
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
      <a-spin :spinning="confirmLoading">
        <a-form ref="formRef" :model="formModel" :rules="formRules" id="projectModal">
          <a-form-item name="name" :labelCol="labelCol" :wrapperCol="wrapperCol" label="项目名称">
            <a-input placeholder="请输入项目名称" v-model:value="formModel.name" />
          </a-form-item>
          <a-form-item name="categoryId" :labelCol="labelCol" :wrapperCol="wrapperCol" label="项目类别">
            <a-select placeholder="请选择项目类别" v-model:value="formModel.categoryId">
              <a-select-option v-for="item in categoryList" :key="item.id" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="hourlyRate" :labelCol="labelCol" :wrapperCol="wrapperCol" label="工时单价">
            <a-input-number
              placeholder="请输入工时单价(元/小时)"
              v-model:value="formModel.hourlyRate"
              :min="0"
              :precision="2"
              @change="onHourlyRateChange"
              style="width: 100%" />
          </a-form-item>
          <a-form-item name="defaultHours" :labelCol="labelCol" :wrapperCol="wrapperCol" label="默认工时">
            <a-input-number
              placeholder="请输入默认工时(小时)"
              v-model:value="formModel.defaultHours"
              :min="0"
              :precision="2"
              @change="onDefaultHoursChange"
              style="width: 100%" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否启用">
            <a-switch checked-children="启用" un-checked-children="禁用" v-model:checked="enabledSwitch" @change="onChange"/>
          </a-form-item>
          <a-form-item name="remark" :labelCol="labelCol" :wrapperCol="wrapperCol" label="备注">
            <a-textarea placeholder="请输入备注" v-model:value="formModel.remark" :rows="4" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="关联商品">
            <a-button type="primary" @click="openMaterialSelectModal"><template #icon><legacy-icon type="plus" /></template>添加商品</a-button>
            <!-- 已选商品表格 -->
            <a-table
              v-if="selectedMaterials.length > 0"
              :columns="materialColumns"
              :dataSource="selectedMaterials"
              :pagination="false"
              size="small"
              style="margin-top: 10px"
              rowKey="id"
              bordered>
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'quantity'">
                  <a-input-number
                    :value="record.quantity"
                    :min="1"
                    :precision="0"
                    style="width: 100px"
                    @change="(val) => onQuantityChange(record, val)" />
                </template>
                <template v-else-if="column.dataIndex === 'action'">
                  <a @click="removeMaterial(record.id)" style="color: #f5222d;">删除</a>
                </template>
              </template>
            </a-table>
            <div v-else style="margin-top: 10px; color: #999; text-align: center; padding: 20px; border: 1px dashed #d9d9d9;">
              暂无关联商品，请点击"添加商品"按钮选择
            </div>
            <!-- 总价计算 -->
            <div style="margin-top: 20px; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #fff; font-size: 16px; font-weight: 500;">
                  <div style="margin-bottom: 8px;">
                    <span style="opacity: 0.9;">商品总价：</span>
                    <span style="font-size: 18px; font-weight: 600;">¥{{ materialsTotalPrice }}</span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="opacity: 0.9;">工时费用：</span>
                    <span style="font-size: 18px; font-weight: 600;">¥{{ laborCost }}</span>
                    <span style="opacity: 0.8; font-size: 14px; margin-left: 8px;">({{ currentHourlyRate }} 元/小时 × {{ currentDefaultHours }} 小时)</span>
                  </div>
                </div>
                <div style="text-align: right; color: #fff;">
                  <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">项目总价</div>
                  <div style="font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">¥{{ totalPrice }}</div>
                </div>
              </div>
            </div>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
    <!-- 商品选择弹窗 -->
    <material-select-modal ref="materialSelectModal" @ok="onMaterialSelected"></material-select-modal>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import {addProject, editProject} from '@/api/api'
  import {getAction} from '@/api/manage'
  import {autoJumpNextInput} from "@/utils/util"
  import {mixinDevice} from '@/utils/mixin'
  import MaterialSelectModal from './MaterialSelectModal'

  export default {
    name: "ProjectModal",
    mixins: [mixinDevice],
    components: {
      MaterialSelectModal
    },
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        enabledSwitch: true,
        categoryList: [],
        selectedMaterials: [],
        formHourlyRate: 0,
        formDefaultHours: 0,
        materialColumns: [
          {
            title: '商品名称',
            dataIndex: 'name',
            width: '20%'
          },
          {
            title: '商品类别',
            dataIndex: 'categoryName',
            width: '12%'
          },
          {
            title: '规格',
            dataIndex: 'standard',
            width: '10%'
          },
          {
            title: '型号',
            dataIndex: 'model',
            width: '10%'
          },
          {
            title: '销售价格',
            dataIndex: 'commodityDecimal',
            width: '12%',
            customRender: (text) => text ? `¥${parseFloat(text).toFixed(2)}` : '-'
          },
          {
            title: '数量',
            dataIndex: 'quantity',
            width: '12%'
          },
          {
            title: '小计',
            dataIndex: 'subtotal',
            width: '12%',
            customRender: (text, record) => {
              const price = parseFloat(record.commodityDecimal || 0);
              const quantity = parseInt(record.quantity || 1);
              return `¥${(price * quantity).toFixed(2)}`;
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: '12%'
          }
        ],
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
        formRules:{
          name: [
            { required: true, message: '请输入项目名称!', trigger: 'blur' },
            { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
          ],
          categoryId: [{ required: true, message: '请选择项目类别!', trigger: 'change' }],
          hourlyRate: [{ required: true, message: '请输入工时单价!', trigger: 'blur' }],
          defaultHours: [{ required: true, message: '请输入默认工时!', trigger: 'blur' }]
        },
      }
    },
    created() {
      this.loadCategoryList();
    },
    computed: {
      // 商品总价
      materialsTotalPrice() {
        return this.selectedMaterials.reduce((total, item) => {
          const price = parseFloat(item.commodityDecimal || 0);
          const quantity = parseInt(item.quantity || 1);
          return total + (price * quantity);
        }, 0).toFixed(2);
      },
      // 当前工时单价
      currentHourlyRate() {
        return parseFloat(this.formHourlyRate || 0).toFixed(2);
      },
      // 当前默认工时
      currentDefaultHours() {
        return parseFloat(this.formDefaultHours || 0).toFixed(2);
      },
      // 工时费用
      laborCost() {
        const rate = parseFloat(this.formHourlyRate || 0);
        const hours = parseFloat(this.formDefaultHours || 0);
        return (rate * hours).toFixed(2);
      },
      // 项目总价
      totalPrice() {
        const materialsTotal = parseFloat(this.materialsTotalPrice);
        const labor = parseFloat(this.laborCost);
        return (materialsTotal + labor).toFixed(2);
      }
    },
    methods: {
      onChange(checked) {
        this.model.enabled = checked
      },
      onHourlyRateChange(value) {
        this.formHourlyRate = value || 0;
      },
      onDefaultHoursChange(value) {
        this.formDefaultHours = value || 0;
      },
      loadCategoryList() {
        getAction("/projectCategory/getAllList", {}).then((res) => {
          if (res.code === 200) {
            this.categoryList = res.data || [];
          }
        });
      },
      openMaterialSelectModal() {
        const selectedIds = this.selectedMaterials.map(m => m.id);
        this.$refs.materialSelectModal.show(selectedIds);
      },
      onMaterialSelected(materials) {
        // 为新选择的商品添加数量和价格字段
        materials.forEach(material => {
          if (!material.quantity) {
            material.quantity = 1;
          }
        });
        this.selectedMaterials = materials;
      },
      onQuantityChange(record, value) {
        const idx = this.selectedMaterials.findIndex(m => m.id === record.id);
        if (idx !== -1) {
          (this.selectedMaterials[idx] = { ...this.selectedMaterials[idx], quantity: value });
        }
      },
      removeMaterial(materialId) {
        this.selectedMaterials = this.selectedMaterials.filter(m => m.id !== materialId);
      },
      add () {
        this.edit({});
        this.model.enabled = true
        this.enabledSwitch = true
        this.selectedMaterials = []
        this.formModel = { defaultHours: 1 }
        this.formHourlyRate = 0
        this.formDefaultHours = 1
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.formModel = pick(this.model,'name', 'categoryId', 'hourlyRate', 'defaultHours', 'remark')
        this.visible = true;
        this.selectedMaterials = []
        if(record.enabled!=null){
          this.enabledSwitch = record.enabled?true:false;
        }
        if (record.id) {
          getAction("/project/info", {id: record.id}).then((res) => {
            if (res.code === 200 && res.data.projectMaterials) {
              this.selectedMaterials = (res.data.projectMaterials || []).map(pm => ({
                id: pm.materialId,
                name: pm.name,
                categoryName: pm.categoryName,
                standard: pm.standard,
                model: pm.model,
                commodityDecimal: pm.commodityDecimal,
                quantity: pm.quantity || 1
              }));
            }
          });
        }
        this.$nextTick(() => {
          this.formHourlyRate = this.model.hourlyRate || 0
          this.formDefaultHours = this.model.defaultHours || 0
          autoJumpNextInput('projectModal')
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
            // 计算并设置项目总价
            const materialsTotal = parseFloat(this.materialsTotalPrice);
            const labor = parseFloat(this.laborCost);
            formData.totalPrice = materialsTotal + labor;
            // 添加商品信息列表（包含ID、数量和价格）
            formData.materials = this.selectedMaterials.map(m => ({
              materialId: m.id,
              quantity: m.quantity || 1,
              price: m.commodityDecimal || 0
            }));
            let obj;
            if(!this.model.id){
              obj=addProject(formData);
            }else{
              obj=editProject(formData);
            }
            obj.then((res)=>{
              if(res.code === 200){
                that.$message.success('保存成功');
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
      handleCancel () {
        this.close()
      }
    }
  }
</script>
<style scoped>

</style>
