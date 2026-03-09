<template>
  <el-card shadow="never" :style="cardStyle">
    <el-form
      ref="formRef"
      :model="formModel"
      label-width="120px"
      v-loading="confirmLoading"
    >
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="公司名称">
            <el-input v-model="formModel.companyName" placeholder="请输入公司名称" @change="handleCompanyName" />
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="联系人">
            <el-input v-model="formModel.companyContacts" placeholder="请输入联系人" @change="handleChange" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="公司地址">
            <el-input v-model="formModel.companyAddress" placeholder="请输入公司地址" @change="handleChange" />
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="公司电话">
            <el-input v-model="formModel.companyTel" placeholder="请输入公司电话" @change="handleChange" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="公司传真">
            <el-input v-model="formModel.companyFax" placeholder="请输入公司传真" @change="handleChange" />
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="公司邮编">
            <el-input v-model="formModel.companyPostCode" placeholder="请输入公司邮编" @change="handleChange" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="销售协议">
            <el-input v-model="formModel.saleAgreement" placeholder="请输入销售协议" @change="handleSaleAgreement" />
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24" />
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="分配仓库权限">
            <el-switch
              v-model="depotFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('depotFlag', val)"
            />
            <span class="config-tip">（启用后，需要到<b>用户管理</b>进行<b>分配仓库</b>，针对专人管理仓库的场景）</span>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="分配客户权限">
            <el-switch
              v-model="customerFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('customerFlag', val)"
            />
            <span class="config-tip">（启用后，需要到<b>用户管理</b>进行<b>分配客户</b>，针对销售员只能看自己客户的场景）</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="支持负库存">
            <el-switch
              v-model="minusStockFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('minusStockFlag', val)"
            />
            <span class="config-tip">（启用后，单据<b>支持负库存</b>录入，不会再提示库存不足）</span>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="以销定购">
            <el-switch
              v-model="purchaseBySaleFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('purchaseBySaleFlag', val)"
            />
            <span class="config-tip">（启用后，根据<b>销售订单</b>来定制<b>采购订单</b>，进货后再发给客户）</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="超出关联单据">
            <el-switch
              v-model="overLinkBillFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('overLinkBillFlag', val)"
            />
            <span class="config-tip">（启用后，允许当前单据<b>超出关联单据</b>的商品数量进行出入库）</span>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="更新单价">
            <el-switch
              v-model="updateUnitPriceFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('updateUnitPriceFlag', val)"
            />
            <span class="config-tip">（启用后，会根据单据录入自动更新商品单价，默认是启用状态）</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="强审核">
            <el-switch
              v-model="forceApprovalFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('forceApprovalFlag', val)"
            />
            <span class="config-tip">（启用后，只有<b>已审核</b>的单据才能产生库存，涉及库存查询的相关报表。启用或关闭后需到<b>商品管理</b>批量<b>修正库存</b>，请按实际业务谨慎操作）</span>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="出入库管理">
            <el-switch
              v-model="inOutManageFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('inOutManageFlag', val)"
            />
            <span class="config-tip">（启用后，采购销售相关单据都需经过<b>其它出入库</b>单据，才能产生库存。启用或关闭后需到<b>商品管理</b>批量<b>修正库存</b>，请按实际业务谨慎操作）</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="多账户">
            <el-switch
              v-model="multiAccountFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('multiAccountFlag', val)"
            />
            <span class="config-tip">（启用后，采购订单、采购入库、采购退货、销售订单、销售出库、销售退货等单据的结算账户可以进行多账户选择）</span>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="移动平均价">
            <el-switch
              v-model="moveAvgPriceFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('moveAvgPriceFlag', val)"
            />
            <span class="config-tip">（默认为关闭状态，代表成本价等于商品信息页面录入的采购价。开启之后将通过移动平均来计算成本价，需到<b>商品管理</b>批量<b>修正成本</b>，请按实际业务谨慎操作）</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="先审核后打印">
            <el-switch
              v-model="auditPrintFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('auditPrintFlag', val)"
            />
            <span class="config-tip">（启用后，零售管理、采购管理、销售管理和仓库管理下的单据，都需要先审核之后才能进行打印）</span>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="零收付款">
            <el-switch
              v-model="zeroChangeAmountFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('zeroChangeAmountFlag', val)"
            />
            <span class="config-tip">（启用后，销售出库单据新建时默认<b>本次收款</b>为0，采购入库单据同理）</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :lg="12" :md="12" :sm="24">
          <el-form-item label="客户静态单价">
            <el-switch
              v-model="customerStaticPriceFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="(val: boolean) => onSwitchChange('customerStaticPriceFlag', val)"
            />
            <span class="config-tip">（启用后，客户的销售出库的单价不会从该客户历史单据的单价获取，而是只从商品信息获取）</span>
          </el-form-item>
        </el-col>
        <el-col v-if="isShowApproval" :lg="12" :md="12" :sm="24">
          <el-form-item label="多级审核">
            <el-switch
              v-model="multiLevelApprovalFlagSwitch"
              active-text="启用"
              inactive-text="关闭"
              @change="onMultiLevelApprovalChange"
            />
            <el-select
              v-model="multiBillTypeSelect"
              placeholder="请选择流程类型"
              multiple
              :max-collapse-tags="6"
              collapse-tags
              filterable
              clearable
              style="width: 400px; padding-left: 10px"
              @change="onMultiBillTypeChange"
            >
              <el-option v-for="item in billTypeList" :key="item.key" :label="item.value" :value="item.key" />
            </el-select>
            <div class="config-tip">
              （启用后，多级审核需配置流程，开启后需刷新浏览器才能看到效果）
              <el-button link type="primary" @click="handleReload">点此刷新</el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { addSystemConfig, editSystemConfig } from '@/api/system'
import { getAction } from '@/api/http'

const formRef = ref<FormInstance>()
const confirmLoading = ref(false)
const cardStyle = ref('')

const formModel = reactive<Record<string, any>>({
  id: undefined,
  companyName: '',
  companyContacts: '',
  companyAddress: '',
  companyTel: '',
  companyFax: '',
  companyPostCode: '',
  saleAgreement: '',
})

// Switch states
const depotFlagSwitch = ref(false)
const customerFlagSwitch = ref(false)
const minusStockFlagSwitch = ref(false)
const purchaseBySaleFlagSwitch = ref(false)
const overLinkBillFlagSwitch = ref(false)
const updateUnitPriceFlagSwitch = ref(true)
const forceApprovalFlagSwitch = ref(false)
const inOutManageFlagSwitch = ref(false)
const multiLevelApprovalFlagSwitch = ref(false)
const multiAccountFlagSwitch = ref(false)
const moveAvgPriceFlagSwitch = ref(false)
const auditPrintFlagSwitch = ref(false)
const zeroChangeAmountFlagSwitch = ref(false)
const customerStaticPriceFlagSwitch = ref(false)

const isShowApproval = ref(false)
const multiBillTypeSelect = ref<string[]>([])

const billTypeList = reactive([
  { key: 'LSCK', value: '零售出库' },
  { key: 'LSTH', value: '零售退货' },
  { key: 'QGD', value: '请购单' },
  { key: 'CGDD', value: '采购订单' },
  { key: 'CGRK', value: '采购入库' },
  { key: 'CGTH', value: '采购退货' },
  { key: 'XSDD', value: '销售订单' },
  { key: 'XSCK', value: '销售出库' },
  { key: 'XSTH', value: '销售退货' },
  { key: 'QTRK', value: '其它入库单' },
  { key: 'QTCK', value: '其它出库单' },
  { key: 'DBCK', value: '调拨出库' },
  { key: 'ZZD', value: '组装单' },
  { key: 'CXD', value: '拆卸单' },
  { key: 'SR', value: '收入单' },
  { key: 'ZC', value: '支出单' },
  { key: 'SK', value: '收款单' },
  { key: 'FK', value: '付款单' },
  { key: 'ZZ', value: '转账单' },
  { key: 'SYF', value: '收预付款单' },
])

/** 初始化加载系统配置 */
function init() {
  const param = {
    search: JSON.stringify({ companyName: '' }),
    currentPage: 1,
    pageSize: 10,
  }
  getAction('/systemConfig/list', param).then((res: any) => {
    if (res.code === 200) {
      const record = res.data.rows[0]
      if (!record) return
      // 回填文本字段
      formModel.id = record.id
      formModel.companyName = record.companyName || ''
      formModel.companyContacts = record.companyContacts || ''
      formModel.companyAddress = record.companyAddress || ''
      formModel.companyTel = record.companyTel || ''
      formModel.companyFax = record.companyFax || ''
      formModel.companyPostCode = record.companyPostCode || ''
      formModel.saleAgreement = record.saleAgreement || ''
      // 回填开关字段
      if (record.id) {
        depotFlagSwitch.value = record.depotFlag === '1'
        customerFlagSwitch.value = record.customerFlag === '1'
        minusStockFlagSwitch.value = record.minusStockFlag === '1'
        purchaseBySaleFlagSwitch.value = record.purchaseBySaleFlag === '1'
        overLinkBillFlagSwitch.value = record.overLinkBillFlag === '1'
        updateUnitPriceFlagSwitch.value = record.updateUnitPriceFlag !== '0'
        forceApprovalFlagSwitch.value = record.forceApprovalFlag === '1'
        inOutManageFlagSwitch.value = record.inOutManageFlag === '1'
        multiLevelApprovalFlagSwitch.value = record.multiLevelApprovalFlag === '1'
        multiAccountFlagSwitch.value = record.multiAccountFlag === '1'
        moveAvgPriceFlagSwitch.value = record.moveAvgPriceFlag === '1'
        auditPrintFlagSwitch.value = record.auditPrintFlag === '1'
        zeroChangeAmountFlagSwitch.value = record.zeroChangeAmountFlag === '1'
        customerStaticPriceFlagSwitch.value = record.customerStaticPriceFlag === '1'
        if (record.multiBillType) {
          multiBillTypeSelect.value = record.multiBillType.split(',')
        }
        // 同步 flag 字段到 formModel
        formModel.depotFlag = record.depotFlag
        formModel.customerFlag = record.customerFlag
        formModel.minusStockFlag = record.minusStockFlag
        formModel.purchaseBySaleFlag = record.purchaseBySaleFlag
        formModel.overLinkBillFlag = record.overLinkBillFlag
        formModel.updateUnitPriceFlag = record.updateUnitPriceFlag
        formModel.forceApprovalFlag = record.forceApprovalFlag
        formModel.inOutManageFlag = record.inOutManageFlag
        formModel.multiLevelApprovalFlag = record.multiLevelApprovalFlag
        formModel.multiBillType = record.multiBillType
        formModel.multiAccountFlag = record.multiAccountFlag
        formModel.moveAvgPriceFlag = record.moveAvgPriceFlag
        formModel.auditPrintFlag = record.auditPrintFlag
        formModel.zeroChangeAmountFlag = record.zeroChangeAmountFlag
        formModel.customerStaticPriceFlag = record.customerStaticPriceFlag
      }
    } else {
      ElMessage.info(res.data)
    }
  })
}

/** 加载插件配置 */
function loadPlugins() {
  // 校验多级审批插件
  getAction('/plugin/checkByPluginId', { pluginIds: 'workflow' }).then((res: any) => {
    if (res.code === 200 && res.data) {
      isShowApproval.value = true
    }
  })
  // 校验盘点插件
  getAction('/plugin/checkByPluginId', { pluginIds: 'stock-check' }).then((res: any) => {
    if (res.code === 200 && res.data) {
      billTypeList.push({ key: 'PDLR', value: '盘点录入' }, { key: 'PDFP', value: '盘点复盘' })
      // 校验生产插件
      getAction('/plugin/checkByPluginId', { pluginIds: 'produce' }).then((res2: any) => {
        if (res2.code === 200 && res2.data) {
          billTypeList.push({ key: 'SC', value: '生产任务' }, { key: 'WW', value: '委外任务' })
        }
      })
    }
  })
}

function handleCompanyName() {
  if (formModel.companyName && formModel.companyName.length > 30) {
    ElMessage.warning('公司名称长度超过30个字符')
  } else {
    handleChange()
  }
}

function handleSaleAgreement() {
  if (formModel.saleAgreement && formModel.saleAgreement.length > 400) {
    ElMessage.warning('销售协议长度超过400个字符')
  } else {
    handleChange()
  }
}

/** 开关变化统一处理 */
function onSwitchChange(field: string, checked: boolean) {
  formModel[field] = checked ? '1' : '0'
  handleChange()
}

function onMultiLevelApprovalChange(checked: boolean) {
  formModel.multiLevelApprovalFlag = checked ? '1' : '0'
  if (!checked) {
    multiBillTypeSelect.value = []
    formModel.multiBillType = ''
  }
  handleChange()
}

function onMultiBillTypeChange() {
  formModel.multiBillType = multiBillTypeSelect.value.join(',')
  handleChange()
}

/** 保存配置变更 */
function handleChange() {
  confirmLoading.value = true
  const obj = !formModel.id ? addSystemConfig(formModel) : editSystemConfig(formModel)
  obj.then((res: any) => {
    if (res.code === 200) {
      init()
    } else {
      ElMessage.warning(res.data?.message || '操作失败')
    }
  }).finally(() => {
    confirmLoading.value = false
  })
}

/** 刷新浏览器 */
function handleReload() {
  location.reload()
}

onMounted(() => {
  init()
  loadPlugins()
  cardStyle.value = 'min-height:' + (document.documentElement.clientHeight - 52) + 'px'
})
</script>

<style scoped lang="scss">
.config-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}
</style>
