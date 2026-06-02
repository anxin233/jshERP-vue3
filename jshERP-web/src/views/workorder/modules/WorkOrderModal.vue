<template>
  <j-modal
    :title="title"
    :width="1100"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :keyboard="false"
    :forceRender="true"
    fullscreen
    switchFullscreen
    @cancel="close"
    :footer="isViewMode ? null : undefined"
    @ok="handleSubmit"
    style="top:20px;height:95%;">

    <a-spin :spinning="confirmLoading">
      <!-- ======== 基本信息 ======== -->
      <a-divider orientation="left" style="margin-top:0">基本信息</a-divider>
      <a-form :form="form" :labelCol="{span:7}" :wrapperCol="{span:17}">
        <!-- 选择车辆独占一行 -->
        <a-row :gutter="16">
          <a-col :span="24">
            <!-- ===== 智能车辆搜索 ===== -->
            <a-form-item
              label="选择车辆"
              :labelCol="{span:3}"
              :wrapperCol="{span:21}">
              <!-- 已选中状态：只读标签 + 重新选择 -->
              <template v-if="orderForm.vehicleId && !isViewMode">
                <div class="vehicle-selected-bar">
                  <a-tag color="blue" style="font-size:13px;padding:2px 8px">
                    <legacy-icon type="car" /> {{ orderForm.licensePlate || '无牌' }}
                  </a-tag>
                  <span style="margin-left:6px;color:#333">{{ orderForm.customerName }}</span>
                  <a @click="clearVehicleSelection" style="margin-left:8px;color:#f5222d;font-size:12px">
                    <legacy-icon type="close-circle" /> 重新选择
                  </a>
                </div>
              </template>
              <!-- 查看模式：只读展示 -->
              <template v-else-if="isViewMode">
                <a-tag color="blue">{{ orderForm.licensePlate || '无牌' }}</a-tag>
                <span style="margin-left:6px">{{ orderForm.customerName }}</span>
              </template>
              <!-- 搜索输入框 -->
              <template v-else>
                <a-select
                  show-search
                  :filter-option="false"
                  :not-found-content="vehicleSearchLoading ? undefined : null"
                  :value="vehicleSelectValue"
                  placeholder="请输入车牌号/姓名/手机号/VIN码搜索"
                  style="width:100%"
                  @search="onVehicleSearch"
                  @select="onVehicleSelect"
                  @change="onVehicleSelectChange"
                  allow-clear>
                  <a-spin v-if="vehicleSearchLoading" slot="notFoundContent" size="small" />
                  <a-select-option
                    v-for="v in vehicleOptions"
                    :key="String(v.id)"
                    :title="(v.licensePlateProvince||'')+(v.noPlate?'无牌':(v.licensePlateNo||''))+' '+v.customerName">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <span>
                        <a-tag color="blue" style="font-size:11px">
                          {{ (v.licensePlateProvince||'') + (v.noPlate ? '无牌' : (v.licensePlateNo||'')) }}
                        </a-tag>
                        <span style="font-weight:500">{{ v.customerName }}</span>
                        <span style="color:#999;margin-left:4px;font-size:12px">{{ v.customerPhone }}</span>
                      </span>
                      <span style="color:#1890ff;font-size:11px">{{ v.brandModel }}</span>
                    </div>
                  </a-select-option>
                </a-select>
              </template>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <!-- 左列 -->
          <a-col :span="8">
            <a-form-item label="车牌号">
              <div style="display:flex;align-items:center">
                <a-input
                  v-model="orderForm.licensePlate"
                  :disabled="isViewMode || orderForm.noPlate"
                  @change="onVehicleFieldEdited"
                  placeholder="如：粤A12345"
                  style="flex:1;margin-right:8px" />
                <a-checkbox
                  v-model="orderForm.noPlate"
                  :disabled="isViewMode"
                  @change="onNoPlateChange">
                  无牌
                </a-checkbox>
              </div>
            </a-form-item>

            <a-form-item label="客户姓名">
              <a-input v-model="orderForm.customerName"
                :disabled="isViewMode"
                @change="onVehicleFieldEdited" />
            </a-form-item>
            <a-form-item label="客户电话">
              <a-input v-model="orderForm.customerPhone"
                :disabled="isViewMode"
                @change="onVehicleFieldEdited" />
            </a-form-item>
            <a-form-item label="车辆信息">
              <a-input v-model="orderForm.vehicleInfo"
                :disabled="isViewMode"
                @change="onVehicleFieldEdited"
                placeholder="品牌车型，如：大众速腾" />
            </a-form-item>
            <a-form-item label="VIN码">
              <a-input v-model="orderForm.vin"
                :disabled="isViewMode"
                @change="onVehicleFieldEdited" />
            </a-form-item>
            <a-form-item>
              <a-button type="link" @click="openVehicleDetailModal" :disabled="isViewMode">
                完善更多信息
              </a-button>
            </a-form-item>
          </a-col>

          <!-- 中列 -->
          <a-col :span="8">
            <a-form-item label="工单编号">
              <a-input :value="form.getFieldValue('orderNo') || '保存后自动生成'" :disabled="true" />
            </a-form-item>
            <a-form-item label="工单状态">
              <dynamic-option-select
                v-decorator="['status']"
                code="workorder_status"
                :disabled="isViewMode"
                placeholder="请选择工单状态"
                style="width:100%" />
            </a-form-item>
            <a-form-item label="接车时间">
              <a-date-picker
                v-decorator="['intakeTime']"
                show-time
                format="YYYY-MM-DD HH:mm"
                placeholder="请选择接车时间"
                style="width:100%"
                :disabled="isViewMode" />
            </a-form-item>
            <a-form-item label="预计完工">
              <a-date-picker
                v-decorator="['estimatedFinishTime']"
                show-time
                format="YYYY-MM-DD HH:mm"
                placeholder="请选择预计完工时间"
                style="width:100%"
                :disabled="isViewMode" />
            </a-form-item>
            <a-form-item label="进厂里程">
              <a-input-number
                v-decorator="['mileage']"
                :min="0"
                :max="9999999"
                style="width:100%"
                placeholder="km"
                :disabled="isViewMode" />
            </a-form-item>
            <a-form-item label="派工人员">
              <dynamic-option-select
                v-decorator="['handlerName']"
                code="dispatch_staff"
                placeholder="请选择派工人员"
                :disabled="isViewMode"
                style="width:100%" />
            </a-form-item>
          </a-col>

          <!-- 右列 -->
          <a-col :span="8">
            <a-form-item label="故障描述" :labelCol="{span:7}" :wrapperCol="{span:17}">
              <a-textarea
                v-decorator="['faultDesc']"
                placeholder="请填写客户主诉及故障描述"
                :rows="5"
                :disabled="isViewMode" />
            </a-form-item>
            <a-form-item label="备注" :labelCol="{span:7}" :wrapperCol="{span:17}">
              <a-textarea
                v-decorator="['remark']"
                placeholder="备注信息"
                :rows="3"
                :disabled="isViewMode" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <!-- ======== 服务项目 ======== -->
      <a-divider orientation="left">
        服务项目（工时）
        <a-button v-if="!isViewMode" size="small" type="dashed" icon="plus" @click="addProjectRow" style="margin-left:12px">添加项目</a-button>
        <a-button v-if="!isViewMode" size="small" icon="import" @click="openProjectSelect" style="margin-left:8px">从项目库导入</a-button>
      </a-divider>
      <a-table
        :columns="projectColumns"
        :dataSource="projectItems"
        :pagination="false"
        size="small"
        bordered
        rowKey="rowKey"
        :scroll="{x: 900}">
        <!-- 项目名称（仅从项目库选择） -->
        <template slot="projectName" slot-scope="text, record">
          <template v-if="isViewMode">
            <span>{{ text }}</span>
          </template>
          <template v-else-if="isLegacyProjectRow(record)">
            <div>
              <span>{{ record.projectName }}</span>
              <a-tag color="orange" style="margin-left:6px">未关联项目库</a-tag>
              <a @click="clearProjectRowForReselect(record)" style="margin-left:6px;font-size:12px">清空并重选</a>
            </div>
          </template>
          <a-select
            v-else
            show-search
            :filter-option="false"
            :not-found-content="record._projectLoading ? undefined : null"
            :get-popup-container="getSelectPopupContainer"
            placeholder="搜索并选择服务项目"
            style="width:100%;min-width:160px"
            :value="record.projectId != null ? record.projectId : undefined"
            allow-clear
            size="small"
            @dropdownVisibleChange="(open) => onProjectDropdownVisible(record, open)"
            @search="(q) => onProjectNameSearch(record, q)"
            @change="(v) => onProjectSelectChange(record, v)">
            <a-spin v-if="record._projectLoading" slot="notFoundContent" size="small" />
            <a-select-option v-for="opt in record._projectOptions || []" :key="'pj_'+opt.id" :value="opt.id">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:500">{{ opt.name }}</div>
                  <div v-if="opt.categoryName" style="font-size:11px;color:#999;margin-top:2px">类别 {{ opt.categoryName }}</div>
                </div>
                <span v-if="opt.totalPrice != null" style="color:#f5222d;font-size:12px;white-space:nowrap">¥{{ opt.totalPrice }}</span>
              </div>
            </a-select-option>
          </a-select>
        </template>
        <!-- 单价 -->
        <template slot="unitPrice" slot-scope="text, record">
          <a-input-number v-if="!isViewMode" v-model="record.unitPrice" :min="0" :precision="2" size="small"
            style="width:80px" @change="() => recalcProject(record)" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 数量 -->
        <template slot="quantity" slot-scope="text, record">
          <a-input-number v-if="!isViewMode" v-model="record.quantity" :min="0" :precision="2" size="small"
            style="width:70px" @change="() => recalcProject(record)" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 折扣 -->
        <template slot="discountRate" slot-scope="text, record">
          <a-input-number v-if="!isViewMode" v-model="record.discountRate" :min="0" :max="100" :precision="1" size="small"
            style="width:70px" @change="() => recalcProject(record)" />
          <span v-else>{{ text }}%</span>
        </template>
        <!-- 金额（只读，自动计算） -->
        <template slot="amount" slot-scope="text, record">
          <span style="color:#f5222d;font-weight:500">{{ record.amount }}</span>
        </template>
        <!-- 施工人员 -->
        <template slot="workerName" slot-scope="text, record">
          <a-input v-if="!isViewMode" v-model="record.workerName" placeholder="施工人员" size="small" style="width:90px" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 备注 -->
        <template slot="remark" slot-scope="text, record">
          <a-input v-if="!isViewMode" v-model="record.remark" placeholder="备注" size="small" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 操作 -->
        <template slot="projectAction" slot-scope="text, record">
          <a v-if="!isViewMode" @click="removeProjectRow(record)" style="color:#f5222d">删除</a>
        </template>
      </a-table>

      <!-- ======== 维修材料 ======== -->
      <a-divider orientation="left" style="margin-top:16px">
        维修材料（配件）
        <a-button v-if="!isViewMode" size="small" type="dashed" icon="plus" @click="addMaterialRow" style="margin-left:12px">手动添加</a-button>
        <a-button v-if="!isViewMode" size="small" icon="database" @click="openMaterialSelect" style="margin-left:8px">从商品库选择</a-button>
      </a-divider>
      <a-table
        :columns="materialColumns"
        :dataSource="materialItems"
        :pagination="false"
        size="small"
        bordered
        rowKey="rowKey"
        :scroll="{x: 980}">
        <!-- 商品名称（仅从商品库选择） -->
        <template slot="materialName" slot-scope="text, record">
          <template v-if="isViewMode">
            <span>{{ text }}</span>
          </template>
          <template v-else-if="isLegacyMaterialRow(record)">
            <div>
              <span>{{ record.materialName }}</span>
              <a-tag color="orange" style="margin-left:6px">未关联商品库</a-tag>
              <a @click="clearMaterialRowForReselect(record)" style="margin-left:6px;font-size:12px">清空并重选</a>
            </div>
          </template>
          <a-select
            v-else
            show-search
            :filter-option="false"
            :not-found-content="record._materialLoading ? undefined : null"
            :get-popup-container="getSelectPopupContainer"
            placeholder="搜索并选择商品"
            style="width:100%;min-width:160px"
            :value="materialSelectValue(record)"
            allow-clear
            size="small"
            @dropdownVisibleChange="(open) => onMaterialDropdownVisible(record, open)"
            @search="(q) => onMaterialNameSearch(record, q)"
            @change="(v) => onMaterialSelectChange(record, v)">
            <a-spin v-if="record._materialLoading" slot="notFoundContent" size="small" />
            <a-select-option
              v-for="opt in record._materialOptions || []"
              :key="'mat_' + record.rowKey + '_' + materialOptionKey(opt)"
              :value="materialOptionValue(opt)">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                  <div style="flex:1;min-width:0">
                    <div style="font-weight:500;overflow:hidden;text-overflow:ellipsis">{{ opt.name }}</div>
                    <div v-if="opt.categoryName" style="font-size:11px;color:#999;margin-top:2px">类别 {{ opt.categoryName }}</div>
                  </div>
                  <span style="color:#999;font-size:12px;white-space:nowrap">库存 {{ formatStock(opt.stock) }}</span>
                </div>
                <div v-if="opt.standard || opt.model" style="font-size:11px;color:#999;margin-top:2px">
                  {{ opt.standard || '' }} {{ opt.model || '' }}
                </div>
              </div>
            </a-select-option>
          </a-select>
        </template>
        <!-- 规格 -->
        <template slot="standard" slot-scope="text, record">
          <a-input v-if="!isViewMode" v-model="record.standard" placeholder="规格" size="small" style="width:80px" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 单位 -->
        <template slot="unit" slot-scope="text, record">
          <a-input v-if="!isViewMode" v-model="record.unit" placeholder="单位" size="small" style="width:60px" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 单价 -->
        <template slot="unitPrice" slot-scope="text, record">
          <a-input-number v-if="!isViewMode" v-model="record.unitPrice" :min="0" :precision="2" size="small"
            style="width:80px" @change="() => recalcMaterial(record)" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 数量 -->
        <template slot="quantity" slot-scope="text, record">
          <a-input-number v-if="!isViewMode" v-model="record.quantity" :min="0" :precision="2" size="small"
            style="width:70px" @change="() => recalcMaterial(record)" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 折扣 -->
        <template slot="discountRate" slot-scope="text, record">
          <a-input-number v-if="!isViewMode" v-model="record.discountRate" :min="0" :max="100" :precision="1" size="small"
            style="width:70px" @change="() => recalcMaterial(record)" />
          <span v-else>{{ text }}%</span>
        </template>
        <!-- 金额 -->
        <template slot="amount" slot-scope="text, record">
          <span style="color:#f5222d;font-weight:500">{{ record.amount }}</span>
        </template>
        <!-- 备注 -->
        <template slot="remark" slot-scope="text, record">
          <a-input v-if="!isViewMode" v-model="record.remark" placeholder="备注" size="small" />
          <span v-else>{{ text }}</span>
        </template>
        <!-- 操作 -->
        <template slot="materialAction" slot-scope="text, record">
          <a v-if="!isViewMode" @click="removeMaterialRow(record)" style="color:#f5222d">删除</a>
        </template>
      </a-table>

      <!-- ======== 费用汇总 ======== -->
      <a-divider orientation="left" style="margin-top:16px">费用汇总</a-divider>
      <a-row :gutter="24">
        <a-col :span="14">
          <!-- 占位，保持右侧对齐 -->
        </a-col>
        <a-col :span="10">
          <table class="fee-summary-table">
            <tr>
              <td class="fee-label">工时费合计：</td>
              <td class="fee-value">¥ {{ laborAmount }}</td>
            </tr>
            <tr>
              <td class="fee-label">材料费合计：</td>
              <td class="fee-value">¥ {{ materialAmount }}</td>
            </tr>
            <tr>
              <td class="fee-label">其他费用：</td>
              <td class="fee-value">
                <a-input-number v-if="!isViewMode" v-model="otherAmount" :min="0" :precision="2"
                  size="small" style="width:120px" @change="recalcTotal" />
                <span v-else>¥ {{ otherAmount }}</span>
              </td>
            </tr>
            <tr class="fee-total-row">
              <td class="fee-label">合计：</td>
              <td class="fee-value fee-total">¥ {{ totalAmount }}</td>
            </tr>
            <tr>
              <td class="fee-label">优惠金额：</td>
              <td class="fee-value">
                <a-input-number v-if="!isViewMode" v-model="discountAmount" :min="0" :precision="2"
                  size="small" style="width:120px" @change="recalcTotal" />
                <span v-else>¥ {{ discountAmount }}</span>
              </td>
            </tr>
            <tr class="fee-payable-row">
              <td class="fee-label">应收金额：</td>
              <td class="fee-value fee-payable">¥ {{ payableAmount }}</td>
            </tr>
          </table>
        </a-col>
      </a-row>
    </a-spin>

    <!-- 子弹窗 -->
    <material-select-modal ref="materialModal" @ok="onMaterialsSelected" />
    <project-select-modal ref="projectModal" @ok="onProjectsSelected" />
    <vehicle-modal ref="vehicleModal" :immediateSave="false" @ok="onVehicleDetailOk" />
  </j-modal>
</template>

<script>
import moment from 'moment'
import Vue from 'vue'
import { postAction, putAction, getAction } from '@/api/manage'
import { getMaterialBySelect } from '@/api/api'
import { getMpListShort } from '@/utils/util'
import MaterialSelectModal from '@/views/project/modules/MaterialSelectModal'
import ProjectSelectModal from './ProjectSelectModal'
import VehicleModal from '@/views/vehicle/modules/VehicleModal'
import DynamicOptionSelect from '@/components/biz/DynamicOptionSelect'
import storage from '@/utils/storage'

export default {
  name: 'WorkOrderModal',
  components: { MaterialSelectModal, ProjectSelectModal, VehicleModal, DynamicOptionSelect },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      isViewMode: false,
      title: '新增工单',
      form: this.$form.createForm(this),
      editId: null,

      // 车辆信息（选择后回填 / 手动录入）
      orderForm: {
        vehicleId: null,
        licensePlate: '',
        noPlate: false,
        customerName: '',
        customerPhone: '',
        vehicleInfo: '',
        vin: '',
        // “完善更多信息”中补充的字段
        vehiclePurpose: '',
        vehicleType: '',
        customerLevel: '',
        customerAddress: '',
        customerDetailAddress: ''
      },
      // 车辆搜索相关
      vehicleSelectValue: undefined,
      vehicleOptions: [],
      vehicleSearchLoading: false,
      vehicleSearchTimer: null,
      isManualEntry: false,

      /** 商品远程搜索用的默认仓库（库存展示），取当前用户首个仓库 */
      materialDepotId: null,

      // 服务项目列表
      projectItems: [],
      // 材料列表
      materialItems: [],

      // 金额汇总字段
      otherAmount: 0,
      discountAmount: 0,

      // 列定义
      projectColumns: [
        { title: '服务项目名称', dataIndex: 'projectName', width: 180, scopedSlots: { customRender: 'projectName' } },
        { title: '单价(元)', dataIndex: 'unitPrice', width: 90, align: 'right', scopedSlots: { customRender: 'unitPrice' } },
        { title: '数量', dataIndex: 'quantity', width: 80, align: 'center', scopedSlots: { customRender: 'quantity' } },
        { title: '折扣(%)', dataIndex: 'discountRate', width: 80, align: 'center', scopedSlots: { customRender: 'discountRate' } },
        { title: '金额(元)', dataIndex: 'amount', width: 90, align: 'right', scopedSlots: { customRender: 'amount' } },
        { title: '施工人员', dataIndex: 'workerName', width: 100, scopedSlots: { customRender: 'workerName' } },
        { title: '备注', dataIndex: 'remark', scopedSlots: { customRender: 'remark' } },
        { title: '操作', dataIndex: 'action', width: 60, align: 'center', scopedSlots: { customRender: 'projectAction' } }
      ],
      materialColumns: [
        { title: '商品名称', dataIndex: 'materialName', width: 160, scopedSlots: { customRender: 'materialName' } },
        { title: '规格', dataIndex: 'standard', width: 90, scopedSlots: { customRender: 'standard' } },
        { title: '单位', dataIndex: 'unit', width: 60, scopedSlots: { customRender: 'unit' } },
        { title: '单价(元)', dataIndex: 'unitPrice', width: 90, align: 'right', scopedSlots: { customRender: 'unitPrice' } },
        { title: '数量', dataIndex: 'quantity', width: 80, align: 'center', scopedSlots: { customRender: 'quantity' } },
        { title: '折扣(%)', dataIndex: 'discountRate', width: 80, align: 'center', scopedSlots: { customRender: 'discountRate' } },
        { title: '金额(元)', dataIndex: 'amount', width: 90, align: 'right', scopedSlots: { customRender: 'amount' } },
        { title: '备注', dataIndex: 'remark', scopedSlots: { customRender: 'remark' } },
        { title: '操作', dataIndex: 'action', width: 60, align: 'center', scopedSlots: { customRender: 'materialAction' } }
      ]
    }
  },
  computed: {
    laborAmount() {
      return this.sumAmount(this.projectItems)
    },
    materialAmount() {
      return this.sumAmount(this.materialItems)
    },
    totalAmount() {
      const t = this.toNum(this.laborAmount) + this.toNum(this.materialAmount) + this.toNum(this.otherAmount)
      return t.toFixed(2)
    },
    payableAmount() {
      const p = this.toNum(this.totalAmount) - this.toNum(this.discountAmount)
      return Math.max(0, p).toFixed(2)
    }
  },
  methods: {
    // ——— 开启方式 ——————————————————————————————
    add() {
      this.reset()
      this.isViewMode = false
      this.title = '新增工单'
      this.visible = true
      // 不在这里 set status，由工单状态下拉（DynamicOptionSelect）加载选项后自动设默认值，避免先显示 "0"
      this.$nextTick(() => {
        setTimeout(() => {
          this.form.setFieldsValue({})
        }, 0)
      })
    },
    edit(record) {
      this.reset()
      this.isViewMode = false
      this.title = '编辑工单'
      this.editId = record.id
      this.visible = true
      this.loadDetail(record.id)
    },
    view(record) {
      this.reset()
      this.isViewMode = true
      this.title = '工单详情'
      this.editId = record.id
      this.visible = true
      this.loadDetail(record.id)
    },

    loadDetail(id) {
      this.confirmLoading = true
      getAction('/workOrder/info', { id }).then(res => {
        if (res.code === 200) {
          const info = res.data.info
          const projects  = res.data.projects  || []
          const materials = res.data.materials || []

          // 回填基本信息
          this.orderForm.vehicleId    = info.vehicleId
          this.orderForm.licensePlate = info.licensePlate
          this.orderForm.customerName = info.customerName
          this.orderForm.customerPhone= info.customerPhone
          this.orderForm.vehicleInfo  = info.vehicleInfo
          this.orderForm.vin          = info.vin
          this.otherAmount            = info.otherAmount || 0
          this.discountAmount         = info.discountAmount || 0

          this.$nextTick(() => {
            setTimeout(() => {
              this.form.setFieldsValue({
                status:              info.status,
                mileage:             info.mileage,
                handlerName:         info.handlerName,
                faultDesc:           info.faultDesc,
                remark:              info.remark,
                intakeTime:          info.intakeTime ? moment(info.intakeTime) : null,
                estimatedFinishTime: info.estimatedFinishTime ? moment(info.estimatedFinishTime) : null
              })
            }, 0)
          })

          // 回填项目行
          this.projectItems = projects.map((p, i) => ({
            rowKey: 'p_' + i,
            projectId:   p.projectId,
            projectName: p.projectName,
            unitPrice:   p.unitPrice,
            quantity:    p.quantity,
            discountRate:p.discountRate,
            amount:      p.amount,
            workerName:  p.workerName,
            remark:      p.remark,
            _projectOptions: (p.projectId != null)
              ? [{ id: p.projectId, name: p.projectName, totalPrice: p.unitPrice, categoryName: p.categoryName }]
              : [],
            _projectLoading: false
          }))

          // 回填材料行
          this.materialItems = materials.map((m, i) => ({
            rowKey: 'm_' + i,
            materialId:   m.materialId,
            materialExtendId: null,
            materialName: m.materialName,
            standard:     m.standard,
            model:        m.model,
            unit:         m.unit,
            unitPrice:    m.unitPrice,
            quantity:     m.quantity,
            discountRate: m.discountRate,
            amount:       m.amount,
            remark:       m.remark,
            _materialOptions: (m.materialId != null)
              ? [{
                id: null,
                materialId: m.materialId,
                name: m.materialName,
                standard: m.standard,
                model: m.model,
                stock: null
              }]
              : [],
            _materialLoading: false
          }))
        }
      }).finally(() => { this.confirmLoading = false })
    },

    // ——— 智能车辆搜索 ——————————————————————————————
    onVehicleSearch(value) {
      if (!value || value.trim().length === 0) {
        this.vehicleOptions = []
        return
      }
      // 防抖：300ms 后才触发请求
      if (this.vehicleSearchTimer) clearTimeout(this.vehicleSearchTimer)
      this.vehicleSearchLoading = true
      this.vehicleSearchTimer = setTimeout(() => {
        getAction('/vehicle/search', { keyword: value.trim() }).then(res => {
          if (res.code === 200) {
            this.vehicleOptions = (res.data && res.data.rows) || []
          }
        }).finally(() => {
          this.vehicleSearchLoading = false
        })
      }, 300)
    },
    onVehicleSelect(value) {
      const vehicle = this.vehicleOptions.find(v => String(v.id) === String(value))
      if (!vehicle) return
      const province = vehicle.licensePlateProvince || ''
      const plateNo  = vehicle.licensePlateNo || ''
      this.orderForm.vehicleId     = vehicle.id
      this.orderForm.noPlate       = !!vehicle.noPlate
      this.orderForm.licensePlate  = vehicle.noPlate ? '' : (province + plateNo)
      this.orderForm.customerName  = vehicle.customerName
      this.orderForm.customerPhone = vehicle.customerPhone
      this.orderForm.vehicleInfo   = vehicle.brandModel
      this.orderForm.vin           = vehicle.vin
      this.vehicleSelectValue      = undefined
      this.vehicleOptions          = []
      this.isManualEntry           = false
    },
    onVehicleSelectChange(value) {
      // 用户清空搜索框时重置
      if (!value) {
        this.vehicleSelectValue = undefined
        this.vehicleOptions = []
      }
    },
    clearVehicleSelection() {
      this.orderForm.vehicleId     = null
      this.orderForm.licensePlate  = ''
      this.orderForm.noPlate       = false
      this.orderForm.customerName  = ''
      this.orderForm.customerPhone = ''
      this.orderForm.vehicleInfo   = ''
      this.orderForm.vin           = ''
      this.vehicleSelectValue      = undefined
      this.vehicleOptions          = []
      this.isManualEntry           = false
    },
    switchToManualEntry() {
      this.isManualEntry          = true
      this.vehicleSelectValue     = undefined
      this.orderForm.vehicleId    = null
    },
    cancelManualEntry() {
      this.isManualEntry = false
      this.orderForm.licensePlate  = ''
      this.orderForm.customerName  = ''
      this.orderForm.customerPhone = ''
      this.orderForm.vehicleInfo   = ''
      this.orderForm.vin           = ''
    },
    // 任意车辆字段被手动修改后，视为新车辆录入，清除原 vehicleId
    onVehicleFieldEdited() {
      if (this.isViewMode) return
      this.orderForm.vehicleId = null
      this.isManualEntry = true
    },
    onNoPlateChange(e) {
      if (e && e.target && e.target.checked) {
        this.orderForm.licensePlate = ''
      }
      this.onVehicleFieldEdited()
    },
    // 打开“完善更多信息”弹窗（复用客户车辆模块的大弹窗，仅采集信息）
    openVehicleDetailModal() {
      if (this.isViewMode) return
      const plate = this.orderForm.licensePlate || ''
      const hasPlate = plate && plate !== '无牌'
      const record = {
        customerName: this.orderForm.customerName,
        customerPhone: this.orderForm.customerPhone,
        brandModel: this.orderForm.vehicleInfo,
        vin: this.orderForm.vin
      }
      if (hasPlate && plate.length > 1) {
        record.licensePlateProvince = plate.substring(0, 1)
        record.licensePlateNo = plate.substring(1)
      }
      this.$refs.vehicleModal && this.$refs.vehicleModal.edit(record)
    },
    // 客户车辆弹窗保存后的回调：把详细信息回填到当前工单的车辆区域
    onVehicleDetailOk(formData) {
      this.isManualEntry = true
      this.orderForm.vehicleId = null
      const prov = formData.licensePlateProvince || ''
      const plateNo = formData.licensePlateNo || ''
      this.orderForm.noPlate = !!formData.noPlate
      this.orderForm.licensePlate = formData.noPlate ? '' : (prov + plateNo)
      this.orderForm.customerName = formData.customerName || ''
      this.orderForm.customerPhone = formData.customerPhone || ''
      this.orderForm.vehicleInfo = formData.brandModel || ''
      this.orderForm.vin = formData.vin || ''
      this.orderForm.vehiclePurpose = formData.vehiclePurpose || ''
      this.orderForm.vehicleType = formData.vehicleType || ''
      this.orderForm.customerLevel = formData.customerLevel || ''
      this.orderForm.customerAddress = formData.customerAddress || ''
      this.orderForm.customerDetailAddress = formData.customerDetailAddress || ''
    },

    // ——— 项目行操作 ————————————————————————————
    openProjectSelect() {
      this.$refs.projectModal.show()
    },
    onProjectsSelected(projects) {
      projects.forEach(p => {
        if (this.projectItems.find(i => i.projectId === p.id)) return
        this.projectItems.push({
          rowKey: 'p_' + Date.now() + Math.random(),
          projectId:   p.id,
          projectName: p.name,
          unitPrice:   p.totalPrice || 0,
          quantity:    1,
          discountRate:100,
          amount:      p.totalPrice || 0,
          workerName:  '',
          remark:      '',
          _projectOptions: [{ id: p.id, name: p.name, totalPrice: p.totalPrice, categoryName: p.categoryName }],
          _projectLoading: false
        })
      })
    },
    addProjectRow() {
      this.projectItems.push({
        rowKey: 'p_' + Date.now(),
        projectId: null, projectName: '', unitPrice: 0,
        quantity: 1, discountRate: 100, amount: '0.00',
        workerName: '', remark: '',
        _projectOptions: [],
        _projectLoading: false
      })
    },
    removeProjectRow(record) {
      this.projectItems = this.projectItems.filter(r => r.rowKey !== record.rowKey)
    },
    recalcProject(record) {
      record.amount = this.calcAmount(record.unitPrice, record.quantity, record.discountRate)
    },

    // ——— 材料行操作 ————————————————————————————
    openMaterialSelect() {
      const existingIds = this.materialItems.filter(m => m.materialId).map(m => m.materialId)
      this.$refs.materialModal.show(existingIds)
    },
    onMaterialsSelected(materials) {
      materials.forEach(m => {
        if (!this.materialItems.find(i => i.materialId === m.id)) {
          this.materialItems.push({
            rowKey: 'm_' + Date.now() + Math.random(),
            materialId:   m.id,
            materialExtendId: null,
            materialName: m.name,
            standard:     m.standard || '',
            model:        m.model || '',
            unit:         m.commodityUnit || m.unit || '',
            unitPrice:    m.commodityDecimal || 0,
            quantity:     1,
            discountRate: 100,
            amount:       this.calcAmount(m.commodityDecimal || 0, 1, 100),
            remark:       '',
            _materialOptions: [{
              id: null,
              materialId: m.id,
              name: m.name,
              categoryName: m.categoryName,
              standard: m.standard,
              model: m.model,
              stock: null
            }],
            _materialLoading: false
          })
        }
      })
    },
    addMaterialRow() {
      this.materialItems.push({
        rowKey: 'm_' + Date.now(),
        materialId: null, materialExtendId: null, materialName: '', standard: '', model: '',
        unit: '', unitPrice: 0, quantity: 1, discountRate: 100,
        amount: '0.00', remark: '',
        _materialOptions: [],
        _materialLoading: false
      })
    },
    removeMaterialRow(record) {
      this.materialItems = this.materialItems.filter(r => r.rowKey !== record.rowKey)
    },
    recalcMaterial(record) {
      record.amount = this.calcAmount(record.unitPrice, record.quantity, record.discountRate)
    },

    // ——— 金额计算 ——————————————————————————————
    calcAmount(unitPrice, quantity, discountRate) {
      const p = this.toNum(unitPrice)
      const q = this.toNum(quantity)
      const d = this.toNum(discountRate)
      return (p * q * d / 100).toFixed(2)
    },
    sumAmount(items) {
      return items.reduce((sum, r) => sum + this.toNum(r.amount), 0).toFixed(2)
    },
    recalcTotal() { /* 由 computed 自动处理 */ },
    toNum(v) { return parseFloat(v) || 0 },

    /** 表格/弹窗内下拉挂到 body，避免被 overflow 裁剪或点击无法触发 */
    getSelectPopupContainer() {
      return document.body
    },
    /** 接口主表商品 id（兼容 snake_case） */
    pickMaterialMainId(row) {
      if (!row) return null
      if (row.materialId != null) return row.materialId
      if (row.material_id != null) return row.material_id
      return null
    },
    /** 与 a-select-option :value 一致：优先扩展表 meId，否则仅种子项时有主表 id */
    materialOptionValue(opt) {
      if (!opt) return undefined
      if (opt.id != null) return opt.id
      const mid = this.pickMaterialMainId(opt)
      return mid != null ? mid : undefined
    },
    materialOptionKey(opt) {
      const v = this.materialOptionValue(opt)
      return v != null ? String(v) : '0'
    },
    findMaterialOptionByValue(record, val) {
      if (val === undefined || val === null) return null
      return (record._materialOptions || []).find(o => {
        const ov = this.materialOptionValue(o)
        return ov != null && String(ov) === String(val)
      })
    },
    /** 商品名称下拉绑定值：有扩展行 id 时用 meId，否则用主表 materialId（详情回填种子选项） */
    materialSelectValue(record) {
      if (!record) return undefined
      if (record.materialExtendId != null) return record.materialExtendId
      if (record.materialId != null) return record.materialId
      return undefined
    },
    formatStock(s) {
      if (s === null || s === undefined || s === '') return '-'
      const n = parseFloat(s)
      return isNaN(n) ? '-' : n
    },
    ensureMaterialDepot() {
      if (this.materialDepotId != null) return Promise.resolve()
      return getAction('/depot/findDepotByCurrentUser').then(res => {
        if (res.code === 200 && res.data && res.data.length) {
          this.materialDepotId = res.data[0].id
        }
      })
    },
    isLegacyProjectRow(record) {
      const n = (record.projectName || '').trim()
      return !!n && record.projectId == null
    },
    isLegacyMaterialRow(record) {
      const n = (record.materialName || '').trim()
      return !!n && record.materialId == null
    },
    clearProjectRowForReselect(record) {
      record.projectId = null
      record.projectName = ''
      record.unitPrice = 0
      record.amount = this.calcAmount(0, record.quantity, record.discountRate)
      record._projectOptions = []
    },
    clearMaterialRowForReselect(record) {
      record.materialId = null
      record.materialExtendId = null
      record.materialName = ''
      record.standard = ''
      record.model = ''
      record.unit = ''
      record.unitPrice = 0
      record.amount = this.calcAmount(0, record.quantity, record.discountRate)
      record._materialOptions = []
    },
    onProjectDropdownVisible(record, open) {
      if (!open || this.isViewMode) return
      if (!record._projectOptions || record._projectOptions.length === 0) {
        this.fetchProjectOptions(record, '')
      }
    },
    onProjectNameSearch(record, q) {
      if (record._projSearchTimer) clearTimeout(record._projSearchTimer)
      record._projSearchTimer = setTimeout(() => {
        this.fetchProjectOptions(record, (q || '').trim())
      }, 300)
    },
    fetchProjectOptions(record, nameQuery) {
      record._projectLoading = true
      const searchObj = {}
      if (nameQuery) searchObj.name = nameQuery
      // 注意：enabled 字段在数据库中是 bit(1) 类型，不传或传空字符串表示不筛选
      // 如需筛选启用项目，后端 SQL 会直接比较 bit 值
      getAction('/project/list', {
        currentPage: 1,
        pageSize: 50,
        search: JSON.stringify(searchObj)
      }).then(res => {
        if (res.code === 200) {
          this.$set(record, '_projectOptions', res.data.rows || [])
        }
      }).finally(() => {
        record._projectLoading = false
      })
    },
    onProjectSelectChange(record, val) {
      if (val === undefined || val === null) {
        record.projectId = null
        record.projectName = ''
        record.unitPrice = 0
        record.amount = this.calcAmount(0, record.quantity, record.discountRate)
        return
      }
      const opt = (record._projectOptions || []).find(r => r.id != null && String(r.id) === String(val))
      if (!opt) return
      record.projectId = opt.id
      record.projectName = opt.name
      record.unitPrice = opt.totalPrice != null ? opt.totalPrice : 0
      this.recalcProject(record)
    },
    onMaterialDropdownVisible(record, open) {
      if (!open || this.isViewMode) return
      if (!record._materialOptions || record._materialOptions.length === 0) {
        this.fetchMaterialOptions(record, '')
      }
    },
    onMaterialNameSearch(record, q) {
      if (record._matSearchTimer) clearTimeout(record._matSearchTimer)
      record._matSearchTimer = setTimeout(() => {
        this.fetchMaterialOptions(record, (q || '').trim())
      }, 300)
    },
    fetchMaterialOptions(record, q) {
      record._materialLoading = true
      this.ensureMaterialDepot().then(() => {
        const mpList = getMpListShort(storage.get('materialPropertyList'))
        const params = { page: 1, rows: 50, mpList }
        if (q) params.q = q
        if (this.materialDepotId != null) params.depotId = this.materialDepotId
        return getMaterialBySelect(params)
      }).then(res => {
        const raw = (res && res.rows) || (res && res.data && res.data.rows) || []
        const seen = {}
        const rows = []
        for (const row of raw) {
          const r = { ...row }
          if (r.materialId == null && r.material_id != null) r.materialId = r.material_id
          const mid = this.pickMaterialMainId(r)
          if (mid != null && seen[mid]) continue
          if (mid != null) seen[mid] = true
          rows.push(r)
        }
        this.$set(record, '_materialOptions', rows)
      }).finally(() => {
        record._materialLoading = false
      })
    },
    onMaterialSelectChange(record, val) {
      if (val === undefined || val === null) {
        record.materialId = null
        record.materialExtendId = null
        record.materialName = ''
        record.standard = ''
        record.model = ''
        record.unit = ''
        record.unitPrice = 0
        record.amount = this.calcAmount(0, record.quantity, record.discountRate)
        return
      }
      const opt = this.findMaterialOptionByValue(record, val)
      if (!opt) return
      const mainId = this.pickMaterialMainId(opt)
      if (mainId == null) {
        this.$message.warning('商品数据缺少主表 id（materialId），请确认已部署含 /material/findBySelect 扩展字段的后端版本')
        return
      }
      record.materialId = mainId
      record.materialExtendId = opt.id != null ? opt.id : null
      record.materialName = opt.name || ''
      record.standard = opt.standard || ''
      record.model = opt.model || ''
      record.unit = opt.unit || ''
      const price = opt.commodityDecimal != null ? opt.commodityDecimal : (opt.commodity_decimal != null ? opt.commodity_decimal : 0)
      record.unitPrice = price
      this.recalcMaterial(record)
    },

    // ——— 提交 —————————————————————————————————
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (err) return
        // 校验客户姓名、电话必填
        if (!this.orderForm.customerName || !this.orderForm.customerPhone) {
          this.$message.warning('客户姓名和联系电话为必填项')
          return
        }
        // 车牌号必填，除非勾选“无牌”
        if (!this.orderForm.noPlate && !this.orderForm.licensePlate) {
          this.$message.warning('车牌号为必填，或勾选“无牌”')
          return
        }
        // 若勾选无牌且未填写车牌，在入库时统一用“无牌”占位
        if (this.orderForm.noPlate && !this.orderForm.licensePlate) {
          this.orderForm.licensePlate = '无牌'
        }
        for (const p of this.projectItems) {
          const n = (p.projectName || '').trim()
          if (n && p.projectId == null) {
            this.$message.warning('存在未关联项目库的服务项目，请在「服务项目名称」中重新选择或清空该行')
            return
          }
        }
        for (const m of this.materialItems) {
          const n = (m.materialName || '').trim()
          if (n && m.materialId == null) {
            this.$message.warning('存在未关联商品库的维修材料，请在「商品名称」中重新选择或清空该行')
            return
          }
        }
        const payload = {
          ...values,
          id:              this.editId,
          vehicleId:       this.orderForm.vehicleId,
          licensePlate:    this.orderForm.licensePlate,
          customerName:    this.orderForm.customerName,
          customerPhone:   this.orderForm.customerPhone,
          vehicleInfo:     this.orderForm.vehicleInfo,
          vin:             this.orderForm.vin,
          vehiclePurpose:  this.orderForm.vehiclePurpose,
          vehicleType:     this.orderForm.vehicleType,
          customerLevel:   this.orderForm.customerLevel,
          customerAddress: this.orderForm.customerAddress,
          customerDetailAddress: this.orderForm.customerDetailAddress,
          // 手动录入标志：无 vehicleId 且处于手动录入模式时，后端将同步创建车辆档案
          isManualVehicle: this.isManualEntry && !this.orderForm.vehicleId,
          otherAmount:     this.otherAmount,
          discountAmount:  this.discountAmount,
          laborAmount:     this.laborAmount,
          materialAmount:  this.materialAmount,
          totalAmount:     this.totalAmount,
          payableAmount:   this.payableAmount,
          intakeTime:      values.intakeTime ? values.intakeTime.format('YYYY-MM-DD HH:mm:ss') : null,
          estimatedFinishTime: values.estimatedFinishTime
            ? values.estimatedFinishTime.format('YYYY-MM-DD HH:mm:ss') : null,
          projects:        this.projectItems,
          materials:       this.materialItems
        }

        this.confirmLoading = true
        const api = this.editId
          ? putAction('/workOrder/update', payload)
          : postAction('/workOrder/add', payload)

        api.then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.$emit('ok')
            this.close()
          } else {
            this.$message.warning(res.data || '保存失败')
          }
        }).finally(() => { this.confirmLoading = false })
      })
    },

    close() {
      this.visible = false
      this.reset()
    },
    reset() {
      this.editId = null
      this.orderForm = {
        vehicleId: null,
        licensePlate: '',
        noPlate: false,
        customerName: '',
        customerPhone: '',
        vehicleInfo: '',
        vin: '',
        vehiclePurpose: '',
        vehicleType: '',
        customerLevel: '',
        customerAddress: '',
        customerDetailAddress: ''
      }
      this.vehicleSelectValue  = undefined
      this.vehicleOptions      = []
      this.vehicleSearchLoading= false
      this.isManualEntry       = false
      if (this.vehicleSearchTimer) {
        clearTimeout(this.vehicleSearchTimer)
        this.vehicleSearchTimer = null
      }
      this.materialDepotId = null
      this.projectItems  = []
      this.materialItems = []
      this.otherAmount   = 0
      this.discountAmount= 0
      this.$nextTick(() => {
        if (this.form) this.form.resetFields()
      })
    }
  }
}
</script>

<style scoped>
@import '~@assets/less/common.less';

.fee-summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.fee-summary-table tr td {
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
}
.fee-label {
  text-align: right;
  color: #666;
  width: 120px;
}
.fee-value {
  text-align: right;
  font-weight: 500;
}
.fee-total-row {
  background: #fafafa;
}
.fee-total {
  font-size: 15px;
  color: #333;
}
.fee-payable-row {
  background: #fff7e6;
}
.fee-payable {
  font-size: 18px;
  color: #f5222d;
  font-weight: bold;
}
.vehicle-selected-bar {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
}
</style>
