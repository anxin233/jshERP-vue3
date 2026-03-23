<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="1100"
      :visible="visible"
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
      style="top:3%;height:94%;">
      <a-spin :spinning="confirmLoading">
        <a-form :form="form" id="vehicleModal">

          <!-- ===== 车辆信息 ===== -->
          <a-divider orientation="left">车辆信息</a-divider>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车辆用途">
            <dynamic-option-select
              v-decorator="['vehiclePurpose']"
              code="vehicle_purpose"
              placeholder="请选择车辆用途"
              allowClear />
          </a-form-item>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车牌号">
                <a-input-group compact>
                  <a-select v-decorator="['licensePlateProvince']" style="width:70px" placeholder="省">
                    <a-select-option v-for="p in provinces" :key="p" :value="p">{{ p }}</a-select-option>
                  </a-select>
                  <a-input
                    v-decorator="['licensePlateNo', validatorRules.licensePlateNo]"
                    placeholder="最多7个字符"
                    :maxLength="7"
                    style="width:calc(100% - 130px)" />
                  <a-checkbox
                    :checked="noPlate"
                    @change="e => { noPlate = e.target.checked; onNoPlateChange(e.target.checked) }"
                    style="margin-left:8px; line-height:32px">无牌</a-checkbox>
                </a-input-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="VIN码">
                <a-input-group compact>
                  <a-input
                    v-decorator="['vin', validatorRules.vin]"
                    placeholder="17位VIN码"
                    :maxLength="17"
                    style="width:calc(100% - 70px)" />
                  <a-checkbox
                    :checked="noVin"
                    @change="e => { noVin = e.target.checked; onNoVinChange(e.target.checked) }"
                    style="margin-left:8px; line-height:32px">暂无</a-checkbox>
                </a-input-group>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车型">
                <a-input placeholder="请输入车型" v-decorator="['vehicleType']" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="生产年份">
                <a-select placeholder="请选择" v-decorator="['productionYear']" allowClear>
                  <a-select-option v-for="y in productionYears" :key="y" :value="String(y)">{{ y }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="燃料类型">
                <a-select placeholder="请选择" v-decorator="['fuelType']" allowClear>
                  <a-select-option value="汽油">汽油</a-select-option>
                  <a-select-option value="柴油">柴油</a-select-option>
                  <a-select-option value="电动">电动</a-select-option>
                  <a-select-option value="混合动力">混合动力</a-select-option>
                  <a-select-option value="天然气">天然气</a-select-option>
                  <a-select-option value="氢燃料">氢燃料</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车辆一级类型">
                <a-select placeholder="请选择" v-decorator="['vehicleCategory']" allowClear>
                  <a-select-option value="轿车">轿车</a-select-option>
                  <a-select-option value="SUV">SUV</a-select-option>
                  <a-select-option value="MPV">MPV</a-select-option>
                  <a-select-option value="卡车">卡车</a-select-option>
                  <a-select-option value="客车">客车</a-select-option>
                  <a-select-option value="面包车">面包车</a-select-option>
                  <a-select-option value="皮卡">皮卡</a-select-option>
                  <a-select-option value="其他">其他</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车身颜色">
                <a-input placeholder="请输入车身颜色" v-decorator="['bodyColor']" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户来源">
                <dynamic-option-select
                  v-decorator="['vehicleSource']"
                  code="customer_source"
                  placeholder="请选择客户来源"
                  allowClear />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- ===== 客户信息 ===== -->
          <a-divider orientation="left">客户信息</a-divider>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="手机号码">
                <a-input placeholder="支持手机号搜索" v-decorator="['customerPhone', validatorRules.customerPhone]" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户姓名">
                <a-input placeholder="请输入客户姓名" v-decorator="['customerName', validatorRules.customerName]" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户等级">
                <a-select v-decorator="['customerLevel', {initialValue: '默认客户'}]">
                  <a-select-option value="默认客户">默认客户</a-select-option>
                  <a-select-option value="VIP客户">VIP客户</a-select-option>
                  <a-select-option value="重要客户">重要客户</a-select-option>
                  <a-select-option value="普通客户">普通客户</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="性别">
                <a-select v-decorator="['customerGender', {initialValue: '先生'}]">
                  <a-select-option value="先生">先生</a-select-option>
                  <a-select-option value="女士">女士</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="地址信息">
                <a-input placeholder="请输入省/市/区" v-decorator="['customerAddress']" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="详细地址">
                <a-input placeholder="请输入详细地址" v-decorator="['customerDetailAddress']" />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 更多联系人 -->
          <a-form-item :labelCol="labelColFull" :wrapperCol="wrapperColFull" label="更多联系人">
            <div v-for="(contact, idx) in contacts" :key="idx" style="display:flex;align-items:center;margin-bottom:8px">
              <a-input v-model="contact.contactName" placeholder="姓名" style="width:200px;margin-right:8px" />
              <a-input v-model="contact.contactPhone" placeholder="手机号" style="width:200px;margin-right:8px" />
              <a-icon type="delete" @click="removeContact(idx)" style="color:#f5222d;cursor:pointer;font-size:16px" />
            </div>
            <a @click="addContact" style="color:#1890ff">
              <a-icon type="plus" /> 添加新联系人
            </a>
          </a-form-item>

          <!-- ===== 行驶证信息 ===== -->
          <a-divider orientation="left">行驶证信息</a-divider>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="车辆所有人">
                <a-input placeholder="输入行驶证上所有人信息" v-decorator="['vehicleOwner']" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="品牌型号">
                <a-input placeholder="输入行驶证上的品牌型号" v-decorator="['brandModel']" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="发动机号">
                <a-input placeholder="请输入发动机号" v-decorator="['engineNo']" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="注册日期">
                <a-date-picker style="width:100%" v-decorator="['registerDate']" placeholder="点击选择日期" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="发证日期">
                <a-date-picker style="width:100%" v-decorator="['issueDate']" placeholder="点击选择日期" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="使用性质">
                <a-select placeholder="请选择" v-decorator="['usageNature']" allowClear>
                  <a-select-option value="非营运">非营运</a-select-option>
                  <a-select-option value="营运">营运</a-select-option>
                  <a-select-option value="租赁">租赁</a-select-option>
                  <a-select-option value="教练">教练</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- ===== 年检与保险 ===== -->
          <a-divider orientation="left">年检与保险</a-divider>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="年检日期">
                <a-date-picker style="width:100%" v-decorator="['annualCheckDate']" placeholder="点击选择日期" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="交强险到期">
                <a-date-picker style="width:100%" v-decorator="['trafficInsuranceExpire']" placeholder="点击选择日期" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="商业险到期">
                <a-date-picker style="width:100%" v-decorator="['commercialInsuranceExpire']" placeholder="点击选择日期" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="未投保">
                <a-checkbox :checked="noInsurance" @change="e => noInsurance = e.target.checked">未投保</a-checkbox>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="保险公司">
                <a-input placeholder="请输入保险公司" v-decorator="['insuranceCompany']" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="保险联系人">
                <a-input placeholder="请输入保险联系人" v-decorator="['insuranceContact']" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="保险联系电话">
                <a-input placeholder="请输入保险联系电话" v-decorator="['insurancePhone']" />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- ===== 送修人信息 ===== -->
          <a-divider orientation="left">送修人信息</a-divider>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="姓名">
                <a-input placeholder="请输入送修人姓名" v-decorator="['repairerName']" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="联系方式">
                <a-input placeholder="请输入联系方式" v-decorator="['repairerContact']" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="性别">
                <a-select v-decorator="['repairerGender', {initialValue: '先生'}]">
                  <a-select-option value="先生">先生</a-select-option>
                  <a-select-option value="女士">女士</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="证件号码">
                <a-input placeholder="最多输入20位字母数字" v-decorator="['repairerIdNo']" :maxLength="20" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="所在地区">
                <a-input placeholder="请输入省/市/区" v-decorator="['repairerRegion']" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="详细地址">
                <a-input placeholder="请输入详细地址" v-decorator="['repairerAddress']" />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 备注 -->
          <a-form-item :labelCol="labelColFull" :wrapperCol="wrapperColFull" label="备注">
            <a-textarea :rows="3" placeholder="请输入备注" v-decorator="['remark']" />
          </a-form-item>

        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import { addVehicle, editVehicle } from '@/api/api'
  import { getAction } from '@/api/manage'
  import { mixinDevice } from '@/utils/mixin'
  import moment from 'moment'
  import DynamicOptionSelect from '@/components/biz/DynamicOptionSelect'

  const PLATE_FIELDS = [
    'vehiclePurpose', 'licensePlateProvince', 'licensePlateNo',
    'vin', 'vehicleType', 'productionYear', 'fuelType',
    'vehicleCategory', 'bodyColor', 'vehicleSource',
    'customerPhone', 'customerName', 'customerLevel', 'customerGender',
    'customerAddress', 'customerDetailAddress',
    'vehicleOwner', 'brandModel', 'engineNo',
    'registerDate', 'issueDate', 'usageNature',
    'annualCheckDate', 'trafficInsuranceExpire', 'commercialInsuranceExpire',
    'insuranceCompany', 'insuranceContact', 'insurancePhone',
    'repairerName', 'repairerContact', 'repairerGender', 'repairerIdNo',
    'repairerRegion', 'repairerAddress', 'remark'
  ]

  export default {
    name: 'VehicleModal',
    mixins: [mixinDevice],
    components: { DynamicOptionSelect },
    props: {
      // 是否在本弹窗内立即保存到“客户车辆”模块
      // WorkOrder 中会传入 false，仅用于采集更多信息
      immediateSave: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        confirmLoading: false,
        noPlate: false,
        noVin: false,
        noInsurance: false,
        contacts: [],
        form: this.$form.createForm(this),
        labelCol: { xs: { span: 24 }, sm: { span: 6 } },
        wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
        labelColFull: { xs: { span: 24 }, sm: { span: 3 } },
        wrapperColFull: { xs: { span: 24 }, sm: { span: 21 } },
        provinces: ['京','津','沪','渝','冀','豫','云','辽','黑','湘','皖','鲁','新',
                    '苏','浙','赣','鄂','桂','甘','晋','蒙','陕','吉','闽','贵',
                    '粤','川','青','琼','宁','琼','藏'],
        productionYears: Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i),
        validatorRules: {
          customerName: {
            rules: [{ required: true, message: '请输入客户姓名!' }]
          },
          customerPhone: {
            rules: [
              { required: true, message: '请输入手机号码!' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!', trigger: 'blur' }
            ]
          },
          licensePlateNo: {
            rules: [{ max: 7, message: '车牌号最多7位!' }]
          },
          vin: {
            rules: [
              { len: 17, message: 'VIN码必须为17位!', trigger: 'blur' },
              { pattern: /^[A-HJ-NPR-Z0-9]{17}$/i, message: 'VIN码格式不正确!', trigger: 'blur' }
            ]
          }
        }
      }
    },
    methods: {
      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        this.noPlate = !!record.noPlate
        this.noVin = !!record.noVin
        this.noInsurance = !!record.noInsurance
        this.contacts = []
        this.visible = true

        if (record.id) {
          getAction('/vehicle/info', { id: record.id }).then(res => {
            if (res.code === 200) {
              this.contacts = (res.data.contacts || []).map(c => ({
                contactName: c.contactName || '',
                contactPhone: c.contactPhone || ''
              }))
            }
          })
        }

        this.$nextTick(() => {
          const dateFields = ['registerDate', 'issueDate', 'annualCheckDate',
                              'trafficInsuranceExpire', 'commercialInsuranceExpire']
          const values = pick(this.model, PLATE_FIELDS)
          dateFields.forEach(f => {
            if (values[f]) values[f] = moment(values[f])
          })
          this.form.setFieldsValue(values)
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      onNoPlateChange(checked) {
        if (checked) {
          this.form.setFieldsValue({ licensePlateProvince: undefined, licensePlateNo: '' })
        }
      },
      onNoVinChange(checked) {
        if (checked) {
          this.form.setFieldsValue({ vin: '' })
        }
      },
      addContact() {
        this.contacts.push({ contactName: '', contactPhone: '' })
      },
      removeContact(idx) {
        this.contacts.splice(idx, 1)
      },
      handleOk() {
        const that = this
        this.form.validateFields((err, values) => {
          if (!err) {
            // 处理日期格式
            const dateFields = ['registerDate', 'issueDate', 'annualCheckDate',
                                'trafficInsuranceExpire', 'commercialInsuranceExpire']
            dateFields.forEach(f => {
              if (values[f] && values[f].format) {
                values[f] = values[f].format('YYYY-MM-DD')
              }
            })
            let formData = Object.assign({}, this.model, values, {
              noPlate: this.noPlate,
              noVin: this.noVin,
              noInsurance: this.noInsurance,
              contacts: this.contacts.filter(c => c.contactName || c.contactPhone)
            })

            // 非立即保存场景（如工单中“完善更多信息”），只回传数据给父组件
            if (!this.immediateSave) {
              this.$emit('ok', formData)
              this.close()
              return
            }

            that.confirmLoading = true
            const req = this.model.id ? editVehicle(formData) : addVehicle(formData)
            req.then(res => {
              if (res.code === 200) {
                that.$message.success('保存成功')
                that.$emit('ok', formData)
                that.close()
              } else {
                that.$message.warning(res.data && res.data.message ? res.data.message : '保存失败')
              }
            }).finally(() => {
              that.confirmLoading = false
            })
          }
        })
      },
      handleCancel() {
        this.close()
      }
    }
  }
</script>

<style scoped>
.ant-divider-inner-text {
  font-weight: 600;
  font-size: 14px;
}
</style>
