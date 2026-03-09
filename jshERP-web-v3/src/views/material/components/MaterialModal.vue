<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="dialogWidth"
    :close-on-click-modal="false"
    fullscreen
    @close="handleCancel"
    @keydown="handleOkKey"
  >
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button v-if="showOkFlag" type="primary" :loading="confirmLoading" @click="handleOk">
        保存（Ctrl+S）
      </el-button>
    </template>

    <div v-loading="confirmLoading">
      <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="100px">
        <el-tabs v-model="activeKey">
          <!-- ======================== Tab 1: 基本信息 ======================== -->
          <el-tab-pane label="基本信息" name="1">
            <el-row :gutter="24">
              <el-col :md="6" :sm="24">
                <el-form-item label="名称" prop="name">
                  <el-input
                    v-model.trim="formModel.name"
                    placeholder="请输入名称"
                    @input="handleNameChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="规格" prop="standard">
                  <el-input v-model.trim="formModel.standard" placeholder="请输入规格" />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="型号" prop="model">
                  <el-input v-model.trim="formModel.model" placeholder="请输入型号" />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="单位" prop="unit">
                  <el-row :gutter="8">
                    <el-col :span="15">
                      <!-- 单单位输入 -->
                      <el-input
                        v-if="!unitChecked"
                        v-model.trim="formModel.unit"
                        placeholder="输入单位"
                        @input="onlyUnitOnChange"
                      />
                      <!-- 多单位选择 -->
                      <el-select
                        v-if="unitChecked"
                        v-model="formModel.unitId"
                        placeholder="选择多单位"
                        filterable
                        style="width: 100%"
                        @change="manyUnitOnChange"
                      >
                        <el-option
                          v-for="item in unitList"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                        />
                        <template #footer>
                          <el-button text type="primary" @click="addUnit">
                            <el-icon><Plus /></el-icon> 新增多单位
                          </el-button>
                        </template>
                      </el-select>
                    </el-col>
                    <el-col :span="9" style="text-align: center">
                      <el-checkbox v-model="unitChecked" @change="unitOnChange">多单位</el-checkbox>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :md="6" :sm="24">
                <el-form-item label="颜色">
                  <el-input v-model.trim="formModel.color" placeholder="请输入颜色" />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="品牌">
                  <el-input v-model.trim="formModel.brand" placeholder="请输入品牌" />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="助记码">
                  <el-input v-model.trim="formModel.mnemonic" placeholder="" readonly />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="类别">
                  <CategorySelect v-model="formModel.categoryId" placeholder="请选择类别" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :md="6" :sm="24">
                <el-form-item label="基础重量">
                  <el-input-number
                    v-model="formModel.weight"
                    :controls="false"
                    placeholder="请输入基础重量(kg)"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="保质期">
                  <el-input-number
                    v-model="formModel.expiryNum"
                    :controls="false"
                    placeholder="请输入保质期(天)"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="仓位货架">
                  <el-input v-model.trim="formModel.position" placeholder="请输入仓位货架" />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="制造商">
                  <el-input v-model.trim="formModel.mfrs" placeholder="请输入制造商" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :md="6" :sm="24">
                <el-form-item :label="mpShort.otherField1.name">
                  <el-input
                    v-model.trim="formModel.otherField1"
                    :placeholder="'请输入' + mpShort.otherField1.name"
                  />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item :label="mpShort.otherField2.name">
                  <el-input
                    v-model.trim="formModel.otherField2"
                    :placeholder="'请输入' + mpShort.otherField2.name"
                  />
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item :label="mpShort.otherField3.name">
                  <el-input
                    v-model.trim="formModel.otherField3"
                    :placeholder="'请输入' + mpShort.otherField3.name"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :md="6" :sm="24">
                <el-form-item label="序列号">
                  <el-tooltip content="如果选择为有，则在采购入库单需要录入该商品的序列号" placement="top">
                    <el-select v-model="formModel.enableSerialNumber" placeholder="有无序列号">
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="批号">
                  <el-tooltip content="如果选择为有，则在采购入库单需要录入该商品的批号和有效期" placement="top">
                    <el-select v-model="formModel.enableBatchNumber" placeholder="有无批号">
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <el-col :md="6" :sm="24">
                <el-form-item label="多属性">
                  <el-tooltip
                    content="多属性针对服装、鞋帽、家纺等行业（注意不要勾选多单位，因为多属性商品不支持多单位，只支持单个的单位）"
                    placement="top"
                  >
                    <el-select
                      v-model="formModel.manySku"
                      multiple
                      filterable
                      placeholder="请选择多属性（可多选）"
                      :disabled="attributeStatus"
                      style="width: 100%"
                      @change="onManySkuChange"
                    >
                      <el-option
                        v-for="item in materialAttributeList"
                        :key="item.value"
                        :label="item.name"
                        :value="item.value"
                        :disabled="item.disabled"
                      />
                      <template #footer>
                        <el-button text type="primary" @click="initMaterialAttribute">
                          <el-icon><Refresh /></el-icon> 没找到？点此刷新列表
                        </el-button>
                      </template>
                    </el-select>
                  </el-tooltip>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- SKU 属性行 -->
            <el-row :gutter="24">
              <el-col v-if="manySkuSelected >= 1" :md="12" :sm="24">
                <el-form-item :label="skuOneTitle" :label-width="'80px'">
                  <el-select
                    v-model="formModel.skuOne"
                    multiple
                    filterable
                    placeholder="请选择（可多选）"
                    style="width: 100%"
                    @change="onSkuChange"
                  >
                    <el-option
                      v-for="item in skuOneList"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col v-if="manySkuSelected >= 2" :md="12" :sm="24">
                <el-form-item :label="skuTwoTitle" :label-width="'80px'">
                  <el-select
                    v-model="formModel.skuTwo"
                    multiple
                    filterable
                    placeholder="请选择（可多选）"
                    style="width: 100%"
                    @change="onSkuChange"
                  >
                    <el-option
                      v-for="item in skuTwoList"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col v-if="manySkuSelected >= 3" :md="12" :sm="24">
                <el-form-item :label="skuThreeTitle" :label-width="'80px'">
                  <el-select
                    v-model="formModel.skuThree"
                    multiple
                    filterable
                    placeholder="请选择（可多选）"
                    style="width: 100%"
                    @change="onSkuChange"
                  >
                    <el-option
                      v-for="item in skuThreeList"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 条码子表 -->
            <div style="margin-top: 8px">
              <EditableTable
                ref="meTableRef"
                :columns="meColumns"
                :data-source="meDataSource"
                :action-button="true"
                :row-number="true"
                :row-selection="true"
                :max-height="300"
                @value-change="onValueChange"
              >
                <template #buttonAfter>
                  <el-button size="small" @click="batchSetPrice('purchase')">采购价-批量</el-button>
                  <el-button size="small" style="margin-left: 8px" @click="batchSetPrice('commodity')">零售价-批量</el-button>
                  <el-button size="small" style="margin-left: 8px" @click="batchSetPrice('wholesale')">销售价-批量</el-button>
                  <el-button size="small" style="margin-left: 8px" @click="batchSetPrice('low')">最低售价-批量</el-button>
                </template>
              </EditableTable>
              <BatchSetPriceModal ref="priceModalRef" @ok="batchSetPriceModalFormOk" />
            </div>

            <!-- 备注 -->
            <el-row :gutter="24" style="margin-top: 8px">
              <el-col :span="24">
                <el-form-item label="">
                  <el-input
                    v-model="formModel.remark"
                    type="textarea"
                    :rows="1"
                    placeholder="请输入备注"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- ======================== Tab 2: 库存数量 ======================== -->
          <el-tab-pane label="库存数量" name="2">
            <EditableTable
              ref="depotTableRef"
              :columns="depotColumns"
              :data-source="depotDataSource"
              :action-button="false"
              :row-number="true"
              :row-selection="false"
              :max-height="300"
            >
              <template #buttonAfter>
                <el-button size="small" style="margin: 0 0 8px 0" @click="batchSetStock('initStock')">期初库存-批量</el-button>
                <el-button size="small" style="margin-left: 8px" @click="batchSetStock('lowSafeStock')">最低安全库存-批量</el-button>
                <el-button size="small" style="margin-left: 8px" @click="batchSetStock('highSafeStock')">最高安全库存-批量</el-button>
              </template>
            </EditableTable>
            <BatchSetStockModal ref="stockModalRef" @ok="batchSetStockModalFormOk" />
          </el-tab-pane>

          <!-- ======================== Tab 3: 图片信息 ======================== -->
          <el-tab-pane label="图片信息" name="3">
            <el-row :gutter="24" style="padding-top: 20px">
              <el-col :md="18" :sm="24">
                <el-form-item label="图片信息" :label-width="'80px'">
                  <el-upload
                    v-model:file-list="uploadFileList"
                    :action="uploadUrl"
                    :headers="uploadHeaders"
                    list-type="picture-card"
                    :limit="4"
                    :on-preview="handlePicturePreview"
                    :on-success="handleUploadSuccess"
                    :on-remove="handleUploadRemove"
                    :on-exceed="handleUploadExceed"
                    :before-upload="beforeUpload"
                    accept="image/*"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :md="18" :sm="24">
                <el-form-item label="上传提示" :label-width="'80px'">
                  图片最多4张，且单张大小不超过1M
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>

    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" title="图片预览" append-to-body>
      <img :src="previewImageUrl" alt="Preview" style="width: 100%" />
    </el-dialog>

    <!-- 新增多单位弹窗 -->
    <UnitModal ref="unitModalRef" @ok="unitModalFormOk" />
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * MaterialModal - 商品新增/编辑弹窗
 * 迁移自 Vue 2 版本 MaterialModal.vue
 * 包含 3 个 Tab: 基本信息、库存数量、图片信息
 */
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile, UploadProps, UploadUserFile } from 'element-plus'

import EditableTable from '@/components/table/EditableTable.vue'
import type { EditableColumn } from '@/components/table/EditableTable.vue'
import CategorySelect from '@/components/form/CategorySelect.vue'
import BatchSetPriceModal from './BatchSetPriceModal.vue'
import BatchSetStockModal from './BatchSetStockModal.vue'
import UnitModal from '@/views/system/components/UnitModal.vue'

import {
  addMaterial,
  editMaterial,
  checkMaterial,
  checkMaterialBarCode,
  getMaxBarCode,
  changeNameToPinYin,
  getMaterialAttributeNameList,
  getMaterialAttributeValueListById,
} from '@/api/material'
import { getAction, httpAction, getFileAccessHttpUrl } from '@/api/http'
import { getStore } from '@/utils/storage'

// ======================== Types ========================
interface UnitItem {
  id: string | number
  name: string
  basicUnit: string
  otherUnit: string
  ratio: number
  otherUnitTwo?: string
  ratioTwo?: number
  otherUnitThree?: string
  ratioThree?: number
}

interface AttributeItem {
  name: string
  value: string | number
  disabled?: boolean
}

interface SkuOptionItem {
  name: string
  value: string
}

interface MeTableRow {
  id?: string | number
  barCode: string
  commodityUnit: string
  sku?: string
  purchaseDecimal?: number | string
  commodityDecimal?: number | string
  wholesaleDecimal?: number | string
  lowDecimal?: number | string
  [key: string]: any
}

// ======================== Emits & Expose ========================
const emit = defineEmits<{
  ok: []
  close: []
}>()

// ======================== Reactive State ========================
const visible = ref(false)
const title = ref('操作')
const dialogWidth = ref('1300px')
const confirmLoading = ref(false)
const activeKey = ref('1')
const action = ref('')
const showOkFlag = ref(true)

const formRef = ref<FormInstance>()
const meTableRef = ref<InstanceType<typeof EditableTable>>()
const depotTableRef = ref<InstanceType<typeof EditableTable>>()
const priceModalRef = ref<InstanceType<typeof BatchSetPriceModal>>()
const stockModalRef = ref<InstanceType<typeof BatchSetStockModal>>()
const unitModalRef = ref<InstanceType<typeof UnitModal>>()

// Model data (the record being edited)
const model = ref<Record<string, any>>({})

// Form model
const formModel = reactive<Record<string, any>>({
  name: '',
  standard: '',
  model: '',
  unit: '',
  unitId: '',
  color: '',
  brand: '',
  mnemonic: '',
  categoryId: null,
  weight: undefined,
  expiryNum: undefined,
  position: '',
  mfrs: '',
  otherField1: '',
  otherField2: '',
  otherField3: '',
  enableSerialNumber: '',
  enableBatchNumber: '',
  manySku: [],
  skuOne: [],
  skuTwo: [],
  skuThree: [],
  remark: '',
})

// ---- Unit related ----
const unitList = ref<UnitItem[]>([])
const unitChecked = ref(false)
const unitStatus = ref(false)
const manyUnitStatus = ref(true)
const switchDisabled = ref(false)

// ---- Barcode ----
const barCodeSwitch = ref(false)
const maxBarCodeInfo = ref('')
const meDeleteIdList = ref<(string | number)[]>([])

// ---- Material Attribute / SKU ----
const attributeStatus = ref(false)
const materialAttributeList = ref<AttributeItem[]>([])
const manySkuSelected = ref(0)
const skuOneTitle = ref('属性1')
const skuTwoTitle = ref('属性2')
const skuThreeTitle = ref('属性3')
const skuOneList = ref<SkuOptionItem[]>([])
const skuTwoList = ref<SkuOptionItem[]>([])
const skuThreeList = ref<SkuOptionItem[]>([])
const meOldDataSource = ref<MeTableRow[]>([])

// ---- Material Property (extended field names) ----
const mpShort = reactive({
  otherField1: { name: '扩展1' },
  otherField2: { name: '扩展2' },
  otherField3: { name: '扩展3' },
})

// ---- Name -> pinyin debounce ----
let nameDebounceTimer: ReturnType<typeof setTimeout> | null = null

// ---- Upload ----
const uploadFileList = ref<UploadUserFile[]>([])
const previewVisible = ref(false)
const previewImageUrl = ref('')
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/jshERP-boot') as string
const uploadUrl = computed(() => apiBaseUrl + '/systemConfig/upload')
const uploadHeaders = computed(() => {
  const token = getStore<string>('token') || ''
  return { 'X-Access-Token': token }
})

// ---- ME Table columns ----
const showSkuColumn = ref(false)

const meColumns = computed<EditableColumn[]>(() => [
  {
    title: '条码',
    key: 'barCode',
    width: '15%',
    type: 'input',
    placeholder: '请输入条码',
    validateRules: [
      { required: true, message: '条码不能为空' },
      { pattern: '^.{4,40}$', message: '长度为4到40位' },
    ],
  },
  {
    title: '单位',
    key: 'commodityUnit',
    width: '8%',
    type: 'input',
    placeholder: '请输入单位',
    validateRules: [{ required: true, message: '单位不能为空' }],
  },
  {
    title: '多属性',
    key: 'sku',
    width: '25%',
    type: showSkuColumn.value ? 'input' : 'hidden',
    placeholder: '请输入多属性',
    disabled: true,
  },
  {
    title: '采购价',
    key: 'purchaseDecimal',
    width: '9%',
    type: 'inputNumber',
    placeholder: '请输入采购价',
  },
  {
    title: '零售价',
    key: 'commodityDecimal',
    width: '9%',
    type: 'inputNumber',
    placeholder: '请输入零售价',
  },
  {
    title: '销售价',
    key: 'wholesaleDecimal',
    width: '9%',
    type: 'inputNumber',
    placeholder: '请输入销售价',
  },
  {
    title: '最低售价',
    key: 'lowDecimal',
    width: '9%',
    type: 'inputNumber',
    placeholder: '请输入最低售价',
  },
])

const meDataSource = ref<any[]>([])

// ---- Depot Table columns ----
const depotColumns: EditableColumn[] = [
  { title: '仓库', key: 'name', width: '15%', type: 'normal' },
  { title: '期初库存数量', key: 'initStock', width: '15%', type: 'inputNumber', placeholder: '请输入期初库存数量' },
  { title: '最低安全库存数量', key: 'lowSafeStock', width: '15%', type: 'inputNumber', placeholder: '请输入最低安全库存数量' },
  { title: '最高安全库存数量', key: 'highSafeStock', width: '15%', type: 'inputNumber', placeholder: '请输入最高安全库存数量' },
]
const depotDataSource = ref<any[]>([])

// ---- Form Rules ----
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称!', trigger: 'blur' },
    { max: 100, message: '长度请小于100个字符', trigger: 'blur' },
  ],
  standard: [{ max: 100, message: '长度请小于100个字符', trigger: 'blur' }],
  model: [{ max: 100, message: '长度请小于100个字符', trigger: 'blur' }],
})

// ---- URL ----
const url = {
  materialsExtendList: '/materialsExtend/getDetailList',
  depotWithStock: '/depot/getAllListWithStock',
}

// ======================== Lifecycle ========================
onMounted(() => {
  loadParseMaterialProperty()
  const realScreenWidth = window.screen.width
  dialogWidth.value = realScreenWidth < 1500 ? '1200px' : '1400px'
})

// ======================== Methods ========================

/** 大数字字符串相加 */
function addBigNumbers(a: string, b: number): string {
  const numA = BigInt(a)
  const numB = BigInt(b)
  return (numA + numB).toString()
}

/** 从数组中移除指定值 */
function removeByVal(arr: any[], val: any) {
  const idx = arr.indexOf(val)
  if (idx > -1) {
    arr.splice(idx, 1)
  }
}

/** Ctrl+S 快捷键保存 */
function handleOkKey(e: KeyboardEvent) {
  if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleOk()
  }
}

// ---- Add / Edit / CopyAdd ----

function add() {
  showSkuColumn.value = false
  edit({})
  // 新增时默认添加一条条码行
  nextTick(() => {
    addDefaultMeRow()
  })
}

function copyAdd(record: Record<string, any>) {
  action.value = 'copyAdd'
  showOkFlag.value = true
  edit(record)
}

function edit(record: Record<string, any>) {
  if (action.value !== 'copyAdd') {
    action.value = record.id ? 'edit' : 'add'
  }
  // Reset form
  resetFormModel()
  model.value = { ...record }

  // Parse attribute JSON for manySku
  const attribute = record.attribute
  if (attribute) {
    try {
      const attrObj = JSON.parse(attribute)
      model.value.manySku = attrObj.manySku
      model.value.skuOne = attrObj.skuOne
      model.value.skuTwo = attrObj.skuTwo
      model.value.skuThree = attrObj.skuThree
    } catch {
      // ignore parse error
    }
  }

  activeKey.value = '1'
  manySkuSelected.value = 0
  barCodeSwitch.value = false
  maxBarCodeInfo.value = ''
  visible.value = true
  meDeleteIdList.value = []

  // 图片处理
  if (JSON.stringify(record) === '{}') {
    uploadFileList.value = []
  } else {
    if (action.value === 'edit' || action.value === 'copyAdd') {
      setTimeout(() => {
        parseImageList(record.imgName)
      }, 5)
    }
  }

  // 设置表单值
  nextTick(() => {
    setFormFromModel()
    formRef.value?.clearValidate()
  })

  initMaterialAttribute()
  loadUnitListData()

  // 加载子表数据
  if (model.value.id) {
    switchDisabled.value = true
    // 判断单位/多单位
    if (model.value.unit) {
      unitChecked.value = false
      unitStatus.value = false
      manyUnitStatus.value = true
    } else {
      unitChecked.value = true
      unitStatus.value = true
      manyUnitStatus.value = false
    }
    // 编辑状态下有多属性，则不允许修改
    if (model.value.manySku && model.value.manySku.length) {
      attributeStatus.value = true
      setTimeout(() => {
        loadSkuList(model.value.manySku)
      }, 1000)
    } else {
      attributeStatus.value = false
    }
    // 加载条码子表
    const params = { materialId: model.value.id }
    requestMeTableData(url.materialsExtendList, params)
    // 加载仓库库存子表
    requestDepotTableData(url.depotWithStock, { mId: model.value.id })
  } else {
    attributeStatus.value = false
    switchDisabled.value = false
    showSkuColumn.value = false
    requestDepotTableData(url.depotWithStock, { mId: 0 })
  }
}

function show(record: Record<string, any>) {
  showOkFlag.value = false
  action.value = 'show'
  edit(record)
}

function resetFormModel() {
  formModel.name = ''
  formModel.standard = ''
  formModel.model = ''
  formModel.unit = ''
  formModel.unitId = ''
  formModel.color = ''
  formModel.brand = ''
  formModel.mnemonic = ''
  formModel.categoryId = null
  formModel.weight = undefined
  formModel.expiryNum = undefined
  formModel.position = ''
  formModel.mfrs = ''
  formModel.otherField1 = ''
  formModel.otherField2 = ''
  formModel.otherField3 = ''
  formModel.enableSerialNumber = ''
  formModel.enableBatchNumber = ''
  formModel.manySku = []
  formModel.skuOne = []
  formModel.skuTwo = []
  formModel.skuThree = []
  formModel.remark = ''
}

function setFormFromModel() {
  const m = model.value
  formModel.name = m.name || ''
  formModel.standard = m.standard || ''
  formModel.model = m.model || ''
  formModel.unit = m.unit || ''
  formModel.unitId = m.unitId || ''
  formModel.color = m.color || ''
  formModel.brand = m.brand || ''
  formModel.mnemonic = m.mnemonic || ''
  formModel.categoryId = m.categoryId || null
  formModel.weight = m.weight ?? undefined
  formModel.expiryNum = m.expiryNum ?? undefined
  formModel.position = m.position || ''
  formModel.mfrs = m.mfrs || ''
  formModel.otherField1 = m.otherField1 || ''
  formModel.otherField2 = m.otherField2 || ''
  formModel.otherField3 = m.otherField3 || ''
  formModel.enableSerialNumber = m.enableSerialNumber || ''
  formModel.enableBatchNumber = m.enableBatchNumber || ''
  formModel.manySku = m.manySku || []
  formModel.skuOne = m.skuOne || []
  formModel.skuTwo = m.skuTwo || []
  formModel.skuThree = m.skuThree || []
  formModel.remark = m.remark || ''
}

/** 新增默认条码行 */
async function addDefaultMeRow() {
  meTableRef.value?.add()
  // 获取最大条码并设置
  try {
    const res = await getMaxBarCode({})
    if (res && res.code === 200) {
      maxBarCodeInfo.value = addBigNumbers(res.data.barCode, 1)
      const values = meTableRef.value?.getValues() || []
      if (values.length > 0) {
        meTableRef.value?.setValues([
          { rowKey: values[0]._id, values: { barCode: maxBarCodeInfo.value, commodityUnit: formModel.unit || '' } },
        ])
      }
    }
  } catch {
    // ignore
  }
}

// ---- Table data loading ----

async function requestMeTableData(urlPath: string, params: Record<string, any>) {
  try {
    const res = await getAction(urlPath, params)
    const rows = res?.data?.rows || []
    let hasSku = false
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].sku) {
        hasSku = true
      }
    }
    showSkuColumn.value = hasSku
    meDataSource.value = rows
    meOldDataSource.value = [...rows]

    // 复制新增 - 初始化条码
    if (action.value === 'copyAdd') {
      try {
        const barRes = await getMaxBarCode({})
        if (barRes && barRes.code === 200) {
          const maxBarCode = barRes.data.barCode
          const newData: MeTableRow[] = []
          for (let i = 0; i < meDataSource.value.length; i++) {
            const meInfo = { ...meDataSource.value[i] }
            meInfo.barCode = addBigNumbers(maxBarCode, i + 1)
            // 复制新增清除id
            delete meInfo.id
            newData.push(meInfo)
          }
          meDataSource.value = newData
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

async function requestDepotTableData(urlPath: string, params: Record<string, any>) {
  try {
    const res = await getAction(urlPath, params)
    depotDataSource.value = res?.data || []
  } catch {
    // ignore
  }
}

// ---- Close / Cancel ----

function close() {
  emit('close')
  visible.value = false
  unitStatus.value = false
  manyUnitStatus.value = true
  unitChecked.value = false
  meDataSource.value = []
  depotDataSource.value = []
}

function handleCancel() {
  close()
}

// ---- Save ----

function handleOk() {
  validateFields()
}

async function validateFields() {
  // Validate main form
  try {
    await formRef.value?.validate()
  } catch {
    activeKey.value = '1'
    return
  }

  // Validate unit: if not multi-unit, unit is required
  if (!unitChecked.value && !formModel.unit) {
    ElMessage.warning('请输入单位!')
    activeKey.value = '1'
    return
  }
  if (unitChecked.value && !formModel.unitId) {
    ElMessage.warning('请选择多单位!')
    activeKey.value = '1'
    return
  }

  // Get table data
  const meValues = meTableRef.value?.getValues() || []
  const depotValues = depotTableRef.value?.getValues() || []
  const deleteIds = meTableRef.value?.getDeleteIds() || []

  // Build form data
  const formData: Record<string, any> = {
    ...model.value,
    ...formModel,
    meList: meValues,
    stock: depotValues,
    sortList: [],
  }

  // Unit logic
  if (formData.unit === undefined) formData.unit = ''
  if (formData.unitId === undefined) formData.unitId = ''
  if (unitChecked.value) {
    formData.unit = ''
  } else {
    formData.unitId = ''
  }

  // Build attribute JSON
  if (formData.manySku && formData.manySku.length > 0) {
    formData.attribute = JSON.stringify({
      manySku: formData.manySku,
      skuOne: formData.skuOne,
      skuTwo: formData.skuTwo,
      skuThree: formData.skuThree,
    })
  }

  await requestAddOrEdit(formData, deleteIds)
}

async function requestAddOrEdit(formData: Record<string, any>, deleteIds: (string | number)[]) {
  // 复制新增 - 清除id
  if (action.value === 'copyAdd') {
    model.value.id = ''
    model.value.tenantId = ''
    formData.id = ''
    formData.tenantId = ''
  }

  if (!formData.meList || formData.meList.length === 0) {
    ElMessage.warning('抱歉，请输入条码信息！')
    return
  }

  if (formData.enableSerialNumber === '1' && formData.enableBatchNumber === '1') {
    ElMessage.warning('抱歉，序列号和批号只能选择一项！')
    return
  }

  if (formData.manySku && formData.manySku.length > 0 && formData.unitId) {
    ElMessage.warning('抱歉，多属性商品不能勾选多单位，请切换为单个单位！')
    return
  }

  // 校验商品是否存在
  const checkParam = {
    id: model.value.id ? model.value.id : 0,
    name: formModel.name,
    model: parseParam(formModel.model),
    color: parseParam(formModel.color),
    standard: parseParam(formModel.standard),
    mfrs: parseParam(formModel.mfrs),
    otherField1: parseParam(formModel.otherField1),
    otherField2: parseParam(formModel.otherField2),
    otherField3: parseParam(formModel.otherField3),
    unit: parseParam(formModel.unit),
    unitId: parseParam(formModel.unitId),
  }

  try {
    const checkRes = await checkMaterial(checkParam)
    if (checkRes && checkRes.code === 200) {
      if (checkRes.data.status) {
        ElMessage.warning('抱歉，该商品已存在！')
        return
      }
    }
  } catch {
    return
  }

  // 校验单位
  let basicUnit = ''
  let otherUnit = ''
  let otherUnitTwo = ''
  let otherUnitThree = ''
  if (formData.unitId) {
    for (let i = 0; i < unitList.value.length; i++) {
      if (unitList.value[i].id == formData.unitId) {
        basicUnit = unitList.value[i].basicUnit
        otherUnit = unitList.value[i].otherUnit
        if (unitList.value[i].otherUnitTwo) otherUnitTwo = unitList.value[i].otherUnitTwo!
        if (unitList.value[i].otherUnitThree) otherUnitThree = unitList.value[i].otherUnitThree!
      }
    }
  }

  if (!formData.unit) {
    // 多单位
    if (formData.meList.length < 2) {
      ElMessage.warning('多单位的商品条码行数至少要有两行，请再新增一行条码信息！')
      return
    }
    if (formData.meList[0].commodityUnit !== basicUnit) {
      ElMessage.warning(`条码之后的单位填写有误，单位【${formData.meList[0].commodityUnit}】请修改为【${basicUnit}】！`)
      return
    }
    if (formData.meList[1].commodityUnit !== otherUnit) {
      ElMessage.warning(`条码之后的单位填写有误，单位【${formData.meList[1].commodityUnit}】请修改为【${otherUnit}】！`)
      return
    }
  }

  let skuCount = 0
  for (let i = 0; i < formData.meList.length; i++) {
    const commodityUnit = formData.meList[i].commodityUnit
    if (formData.unit) {
      if (commodityUnit !== formData.unit) {
        ElMessage.warning(`条码之后的单位填写有误，单位【${commodityUnit}】请修改为【${formData.unit}】！`)
        return
      }
    } else if (formData.unitId) {
      if (
        commodityUnit !== basicUnit &&
        commodityUnit !== otherUnit &&
        commodityUnit !== otherUnitTwo &&
        commodityUnit !== otherUnitThree
      ) {
        let warnInfo = `条码之后的单位填写有误，单位【${commodityUnit}】请修改为【${basicUnit}】或【${otherUnit}】`
        if (otherUnitTwo) warnInfo += `或【${otherUnitTwo}】`
        if (otherUnitThree) warnInfo += `或【${otherUnitThree}】`
        warnInfo += '！'
        ElMessage.warning(warnInfo)
        return
      }
    }
    if (formData.meList[i].sku) {
      skuCount++
    }
  }

  // 校验安全库存
  for (let i = 0; i < formData.stock.length; i++) {
    const depotStockObj = formData.stock[i]
    if (skuCount && depotStockObj.initStock && Number(depotStockObj.initStock)) {
      ElMessage.warning('抱歉，多属性商品不能录入期初库存，建议进行盘点录入！')
      return
    }
    if (formData.enableSerialNumber === '1' && depotStockObj.initStock && Number(depotStockObj.initStock)) {
      ElMessage.warning('抱歉，序列号商品不能录入期初库存，建议进行入库单据录入！')
      return
    }
    if (formData.enableBatchNumber === '1' && depotStockObj.initStock && Number(depotStockObj.initStock)) {
      ElMessage.warning('抱歉，批号商品不能录入期初库存，建议进行入库单据录入！')
      return
    }
    if (depotStockObj.lowSafeStock && depotStockObj.highSafeStock) {
      if (Number(depotStockObj.lowSafeStock) > Number(depotStockObj.highSafeStock)) {
        ElMessage.warning(`抱歉，${depotStockObj.name}的最低安全库存大于最高安全库存！`)
        return
      }
    }
  }

  // 图片校验
  const imgFiles = getImageNames()
  if (imgFiles) {
    const fileArr = imgFiles.split(',')
    if (fileArr.length > 4) {
      ElMessage.warning('抱歉，商品图片不能超过4张！')
      return
    }
    formData.imgName = imgFiles
  } else {
    formData.imgName = ''
  }

  formData.meDeleteIdList = [...meDeleteIdList.value, ...deleteIds]

  // 调用接口
  let reqUrl = '/material/add'
  let method = 'post'
  if (model.value.id) {
    reqUrl = '/material/update'
    method = 'put'
  }

  confirmLoading.value = true
  try {
    const res = await httpAction(reqUrl, formData, method)
    if (res.code === 200) {
      emit('ok')
      confirmLoading.value = false
      close()
    } else {
      ElMessage.warning(res.data?.message || '保存失败')
      confirmLoading.value = false
    }
  } catch {
    confirmLoading.value = false
  }
}

function parseParam(param: any): string {
  return param ? String(param) : ''
}

// ---- Barcode validation ----
// Note: barCode validation is done inline during save since EditableTable in v3
// does not use the same async callback pattern as v2 JEditableTable.

// ---- Tree / Unit data loading ----

async function loadUnitListData() {
  try {
    const res = await getAction('/unit/getAllList', { currentPage: 1, pageSize: 100 })
    if (res) {
      unitList.value = res.data || []
    }
  } catch {
    // ignore
  }
}

// ---- Material Attribute / SKU ----

async function initMaterialAttribute() {
  try {
    const res = await getMaterialAttributeNameList()
    if (res && res.code === 200) {
      materialAttributeList.value = (res.data || []).map((item: any) => ({
        ...item,
        disabled: false,
      }))
    }
  } catch {
    // ignore
  }
}

function onManySkuChange(value: (string | number)[]) {
  manySkuSelected.value = value.length

  // 控制下拉框选择状态
  if (value.length < 3) {
    materialAttributeList.value.forEach((item) => {
      item.disabled = false
    })
  } else {
    materialAttributeList.value.forEach((item) => {
      if (!value.includes(item.value)) {
        item.disabled = true
      }
    })
  }

  // 更新属性标题和下拉框
  if (value.length <= 3) {
    const skuOneId = value[0]
    const skuTwoId = value[1]
    const skuThreeId = value[2]

    materialAttributeList.value.forEach((item) => {
      if (item.value === skuOneId) skuOneTitle.value = item.name
      if (item.value === skuTwoId) skuTwoTitle.value = item.name
      if (item.value === skuThreeId) skuThreeTitle.value = item.name
    })

    if (skuOneId) {
      getMaterialAttributeValueListById({ id: skuOneId }).then((res: any) => {
        skuOneList.value = res && res.code === 200 ? res.data || [] : []
      })
    }
    if (skuTwoId) {
      getMaterialAttributeValueListById({ id: skuTwoId }).then((res: any) => {
        skuTwoList.value = res && res.code === 200 ? res.data || [] : []
      })
    }
    if (skuThreeId) {
      getMaterialAttributeValueListById({ id: skuThreeId }).then((res: any) => {
        skuThreeList.value = res && res.code === 200 ? res.data || [] : []
      })
    }
  }

  // 控制条码列表中的多属性列
  showSkuColumn.value = value.length > 0

  barCodeSwitch.value = false
  meDataSource.value = []
}

function loadSkuList(value: (string | number)[]) {
  manySkuSelected.value = value.length

  if (value.length <= 3) {
    const skuOneId = value[0]
    const skuTwoId = value[1]
    const skuThreeId = value[2]

    materialAttributeList.value.forEach((item) => {
      if (item.value === skuOneId) skuOneTitle.value = item.name
      if (item.value === skuTwoId) skuTwoTitle.value = item.name
      if (item.value === skuThreeId) skuThreeTitle.value = item.name
    })

    if (skuOneId) {
      getMaterialAttributeValueListById({ id: skuOneId }).then((res: any) => {
        skuOneList.value = res && res.code === 200 ? res.data || [] : []
      })
    }
    if (skuTwoId) {
      getMaterialAttributeValueListById({ id: skuTwoId }).then((res: any) => {
        skuTwoList.value = res && res.code === 200 ? res.data || [] : []
      })
    }
    if (skuThreeId) {
      getMaterialAttributeValueListById({ id: skuThreeId }).then((res: any) => {
        skuThreeList.value = res && res.code === 200 ? res.data || [] : []
      })
    }
  }
  barCodeSwitch.value = false
}

function onSkuChange() {
  autoSkuList(formModel.skuOne, formModel.skuTwo, formModel.skuThree)
}

function getNumByField(field: 'skuOne' | 'skuTwo' | 'skuThree'): number {
  const val = formModel[field]
  return val && val.length > 0 ? 1 : 0
}

async function autoSkuList(skuOneData: string[], skuTwoData: string[], skuThreeData: string[]) {
  const unit = formModel.unit

  // 计算多属性已经选择了几个
  const skuArr: string[][] = []
  if (getNumByField('skuOne')) skuArr.push(skuOneData)
  if (getNumByField('skuTwo')) skuArr.push(skuTwoData)
  if (getNumByField('skuThree')) skuArr.push(skuThreeData)

  const skuArrOne = skuArr[0]
  const skuArrTwo = skuArr[1]
  const skuArrThree = skuArr[2]
  const count = getNumByField('skuOne') + getNumByField('skuTwo') + getNumByField('skuThree')

  const barCodeSku: string[] = []
  if (count === 1) {
    let skuArrOnly: string[] = []
    if (getNumByField('skuOne')) skuArrOnly = skuOneData
    else if (getNumByField('skuTwo')) skuArrOnly = skuTwoData
    else if (getNumByField('skuThree')) skuArrOnly = skuThreeData
    for (let i = 0; i < skuArrOnly.length; i++) {
      barCodeSku.push(skuArrOnly[i])
    }
  } else if (count === 2) {
    for (let i = 0; i < skuArrOne.length; i++) {
      for (let j = 0; j < skuArrTwo.length; j++) {
        barCodeSku.push(skuArrOne[i] + '/' + skuArrTwo[j])
      }
    }
  } else if (count === 3) {
    for (let i = 0; i < skuArrOne.length; i++) {
      for (let j = 0; j < skuArrTwo.length; j++) {
        for (let k = 0; k < skuArrThree.length; k++) {
          barCodeSku.push(skuArrOne[i] + '/' + skuArrTwo[j] + '/' + skuArrThree[k])
        }
      }
    }
  }

  try {
    const res = await getMaxBarCode({})
    if (res && res.code === 200) {
      let k = 0
      const maxBarCode = res.data.barCode
      const meTableData: MeTableRow[] = []

      for (let i = 0; i < barCodeSku.length; i++) {
        let currentBarCode = ''
        let currentId: string | number = ''
        let purchaseDecimal: number | string = ''
        let commodityDecimal: number | string = ''
        let wholesaleDecimal: number | string = ''
        let lowDecimal: number | string = ''

        for (let j = 0; j < meOldDataSource.value.length; j++) {
          if (barCodeSku[i] === meOldDataSource.value[j].sku) {
            currentBarCode = meOldDataSource.value[j].barCode
            currentId = meOldDataSource.value[j].id || ''
            purchaseDecimal = meOldDataSource.value[j].purchaseDecimal || ''
            commodityDecimal = meOldDataSource.value[j].commodityDecimal || ''
            wholesaleDecimal = meOldDataSource.value[j].wholesaleDecimal || ''
            lowDecimal = meOldDataSource.value[j].lowDecimal || ''
          }
        }

        if (currentBarCode) {
          meTableData.push({
            id: currentId,
            barCode: currentBarCode,
            commodityUnit: unit,
            sku: barCodeSku[i],
            purchaseDecimal,
            commodityDecimal,
            wholesaleDecimal,
            lowDecimal,
          })
        } else {
          k++
          currentBarCode = addBigNumbers(maxBarCode, k)
          meTableData.push({
            barCode: currentBarCode,
            commodityUnit: unit,
            sku: barCodeSku[i],
          })
        }
      }
      meDataSource.value = meTableData
    }
  } catch {
    // ignore
  }
}

// ---- Value change in ME table ----

function onValueChange(payload: { type: string; row: any; column: EditableColumn; value: any; target: any[] }) {
  const { column, row } = payload
  switch (column.key) {
    case 'purchaseDecimal':
    case 'commodityDecimal':
    case 'wholesaleDecimal':
    case 'lowDecimal':
      changeDecimalByValue(row)
      break
  }
}

function changeDecimalByValue(row: any) {
  let basicUnit = ''
  let otherUnit = ''
  let ratio = 1
  let otherUnitTwo = ''
  let ratioTwo = 1
  let otherUnitThree = ''
  let ratioThree = 1

  for (let i = 0; i < unitList.value.length; i++) {
    if (unitList.value[i].id === formModel.unitId) {
      basicUnit = unitList.value[i].basicUnit
      otherUnit = unitList.value[i].otherUnit
      ratio = unitList.value[i].ratio
      if (unitList.value[i].otherUnitTwo) {
        otherUnitTwo = unitList.value[i].otherUnitTwo!
        ratioTwo = unitList.value[i].ratioTwo || 1
      }
      if (unitList.value[i].otherUnitThree) {
        otherUnitThree = unitList.value[i].otherUnitThree!
        ratioThree = unitList.value[i].ratioThree || 1
      }
    }
  }

  if (row.commodityUnit === basicUnit) {
    const mArr = meTableRef.value?.getValues() || []
    let basicPurchase = ''
    let basicCommodity = ''
    let basicWholesale = ''
    let basicLow = ''

    for (let i = 0; i < mArr.length; i++) {
      const mInfo = mArr[i]
      if (i === 0) {
        basicPurchase = mInfo.purchaseDecimal
        basicCommodity = mInfo.commodityDecimal
        basicWholesale = mInfo.wholesaleDecimal
        basicLow = mInfo.lowDecimal
      } else {
        if (basicPurchase) mInfo.purchaseDecimal = (Number(basicPurchase) * ratio).toFixed(2)
        if (basicCommodity) mInfo.commodityDecimal = (Number(basicCommodity) * ratio).toFixed(2)
        if (basicWholesale) mInfo.wholesaleDecimal = (Number(basicWholesale) * ratio).toFixed(2)
        if (basicLow) mInfo.lowDecimal = (Number(basicLow) * ratio).toFixed(2)

        if (otherUnitTwo && i === 2) {
          if (basicPurchase) mInfo.purchaseDecimal = (Number(basicPurchase) * ratioTwo).toFixed(2)
          if (basicCommodity) mInfo.commodityDecimal = (Number(basicCommodity) * ratioTwo).toFixed(2)
          if (basicWholesale) mInfo.wholesaleDecimal = (Number(basicWholesale) * ratioTwo).toFixed(2)
          if (basicLow) mInfo.lowDecimal = (Number(basicLow) * ratioTwo).toFixed(2)
        }
        if (otherUnitThree && i === 3) {
          if (basicPurchase) mInfo.purchaseDecimal = (Number(basicPurchase) * ratioThree).toFixed(2)
          if (basicCommodity) mInfo.commodityDecimal = (Number(basicCommodity) * ratioThree).toFixed(2)
          if (basicWholesale) mInfo.wholesaleDecimal = (Number(basicWholesale) * ratioThree).toFixed(2)
          if (basicLow) mInfo.lowDecimal = (Number(basicLow) * ratioThree).toFixed(2)
        }
      }
    }
    meDataSource.value = [...mArr]
  }
}

// ---- Batch set price / stock ----

function batchSetPrice(type: 'purchase' | 'commodity' | 'wholesale' | 'low') {
  if (manySkuSelected.value > 0 || model.value.id) {
    priceModalRef.value?.add(type)
  } else {
    ElMessage.warning('抱歉，只有开启多属性才能进行批量操作！')
  }
}

function batchSetStock(type: 'initStock' | 'lowSafeStock' | 'highSafeStock') {
  stockModalRef.value?.add(type)
}

function batchSetPriceModalFormOk(price: string, batchType: string) {
  const arr = meTableRef.value?.getValues() || meDataSource.value
  if (arr.length === 0) {
    ElMessage.warning('请先录入条码、单位等信息！')
    return
  }

  const meTableData: MeTableRow[] = []
  for (let i = 0; i < arr.length; i++) {
    const meInfo: MeTableRow = {
      barCode: arr[i].barCode,
      commodityUnit: arr[i].commodityUnit,
      sku: arr[i].sku,
      purchaseDecimal: arr[i].purchaseDecimal,
      commodityDecimal: arr[i].commodityDecimal,
      wholesaleDecimal: arr[i].wholesaleDecimal,
      lowDecimal: arr[i].lowDecimal,
    }
    if (batchType === 'purchase') meInfo.purchaseDecimal = Number(price)
    else if (batchType === 'commodity') meInfo.commodityDecimal = Number(price)
    else if (batchType === 'wholesale') meInfo.wholesaleDecimal = Number(price)
    else if (batchType === 'low') meInfo.lowDecimal = Number(price)

    if (arr[i].id) meInfo.id = arr[i].id
    meTableData.push(meInfo)
  }
  meDataSource.value = meTableData
}

function batchSetStockModalFormOk(stock: string, batchType: string) {
  const arr = depotTableRef.value?.getValues() || depotDataSource.value
  const depotTableData: any[] = []

  for (let i = 0; i < arr.length; i++) {
    const depotInfo: any = {
      name: arr[i].name,
      initStock: arr[i].initStock,
      lowSafeStock: arr[i].lowSafeStock,
      highSafeStock: arr[i].highSafeStock,
    }
    if (batchType === 'initStock') depotInfo.initStock = Number(stock)
    else if (batchType === 'lowSafeStock') depotInfo.lowSafeStock = Number(stock)
    else if (batchType === 'highSafeStock') depotInfo.highSafeStock = Number(stock)

    if (arr[i].id) depotInfo.id = arr[i].id
    depotTableData.push(depotInfo)
  }
  depotDataSource.value = depotTableData
}

// ---- Material property (extended fields) ----

function loadParseMaterialProperty() {
  const mpList = getStore<any[]>('materialPropertyList') || []
  for (let i = 0; i < mpList.length; i++) {
    if (mpList[i].nativeName === '扩展1') {
      mpShort.otherField1.name = mpList[i].anotherName
    }
    if (mpList[i].nativeName === '扩展2') {
      mpShort.otherField2.name = mpList[i].anotherName
    }
    if (mpList[i].nativeName === '扩展3') {
      mpShort.otherField3.name = mpList[i].anotherName
    }
  }
}

// ---- Name -> PinYin ----

function handleNameChange(val: string) {
  if (val) {
    if (nameDebounceTimer !== null) {
      clearTimeout(nameDebounceTimer)
    }
    nameDebounceTimer = setTimeout(() => {
      changeNameToPinYin({ name: val }).then((res: any) => {
        if (res && res.code === 200) {
          formModel.mnemonic = res.data
        } else {
          ElMessage.warning(res.data)
        }
      })
    }, 500)
  } else {
    formModel.mnemonic = ''
  }
}

// ---- Unit related ----

function onlyUnitOnChange(val: string) {
  const mArr = meTableRef.value?.getValues() || meDataSource.value
  for (let i = 0; i < mArr.length; i++) {
    mArr[i].commodityUnit = val
  }
  meDataSource.value = [...mArr]
}

function manyUnitOnChange(value: string | number) {
  let basicUnit = ''
  let otherUnit = ''
  let ratio = 1
  let otherUnitTwo = ''
  let ratioTwo = 1
  let otherUnitThree = ''
  let ratioThree = 1

  for (let i = 0; i < unitList.value.length; i++) {
    if (unitList.value[i].id === value) {
      basicUnit = unitList.value[i].basicUnit
      otherUnit = unitList.value[i].otherUnit
      ratio = unitList.value[i].ratio
      if (unitList.value[i].otherUnitTwo) {
        otherUnitTwo = unitList.value[i].otherUnitTwo!
        ratioTwo = unitList.value[i].ratioTwo || 1
      }
      if (unitList.value[i].otherUnitThree) {
        otherUnitThree = unitList.value[i].otherUnitThree!
        ratioThree = unitList.value[i].ratioThree || 1
      }
    }
  }

  const mArr = meTableRef.value?.getValues() || meDataSource.value
  let basicPurchaseDecimal = ''
  let basicCommodityDecimal = ''
  let basicWholesaleDecimal = ''
  let basicLowDecimal = ''

  for (let i = 0; i < mArr.length; i++) {
    const mInfo = mArr[i]
    if (i === 0) {
      mInfo.commodityUnit = basicUnit
      basicPurchaseDecimal = mInfo.purchaseDecimal
      basicCommodityDecimal = mInfo.commodityDecimal
      basicWholesaleDecimal = mInfo.wholesaleDecimal
      basicLowDecimal = mInfo.lowDecimal
    } else {
      mInfo.commodityUnit = otherUnit
      if (basicPurchaseDecimal) mInfo.purchaseDecimal = (Number(basicPurchaseDecimal) * ratio).toFixed(2)
      if (basicCommodityDecimal) mInfo.commodityDecimal = (Number(basicCommodityDecimal) * ratio).toFixed(2)
      if (basicWholesaleDecimal) mInfo.wholesaleDecimal = (Number(basicWholesaleDecimal) * ratio).toFixed(2)
      if (basicLowDecimal) mInfo.lowDecimal = (Number(basicLowDecimal) * ratio).toFixed(2)

      if (otherUnitTwo && i === 2) {
        mInfo.commodityUnit = otherUnitTwo
        if (basicPurchaseDecimal) mInfo.purchaseDecimal = (Number(basicPurchaseDecimal) * ratioTwo).toFixed(2)
        if (basicCommodityDecimal) mInfo.commodityDecimal = (Number(basicCommodityDecimal) * ratioTwo).toFixed(2)
        if (basicWholesaleDecimal) mInfo.wholesaleDecimal = (Number(basicWholesaleDecimal) * ratioTwo).toFixed(2)
        if (basicLowDecimal) mInfo.lowDecimal = (Number(basicLowDecimal) * ratioTwo).toFixed(2)
      }
      if (otherUnitThree && i === 3) {
        mInfo.commodityUnit = otherUnitThree
        if (basicPurchaseDecimal) mInfo.purchaseDecimal = (Number(basicPurchaseDecimal) * ratioThree).toFixed(2)
        if (basicCommodityDecimal) mInfo.commodityDecimal = (Number(basicCommodityDecimal) * ratioThree).toFixed(2)
        if (basicWholesaleDecimal) mInfo.wholesaleDecimal = (Number(basicWholesaleDecimal) * ratioThree).toFixed(2)
        if (basicLowDecimal) mInfo.lowDecimal = (Number(basicLowDecimal) * ratioThree).toFixed(2)
      }
    }
  }
  meDataSource.value = [...mArr]
}

function unitOnChange(isChecked: boolean) {
  if (isChecked) {
    unitStatus.value = true
    manyUnitStatus.value = false
    unitChecked.value = true
  } else {
    unitStatus.value = false
    manyUnitStatus.value = true
    unitChecked.value = false
  }
}

function addUnit() {
  unitModalRef.value?.add()
}

function unitModalFormOk() {
  loadUnitListData()
}

// ---- Image upload ----

function parseImageList(imgNameStr: string) {
  if (!imgNameStr) {
    uploadFileList.value = []
    return
  }
  const names = imgNameStr.split(',').filter(Boolean)
  uploadFileList.value = names.map((name, idx) => ({
    name: `image-${idx}`,
    url: getFileAccessHttpUrl(name),
    response: { data: name },
  }))
}

function getImageNames(): string {
  return uploadFileList.value
    .map((f: any) => {
      if (f.response && f.response.data) return f.response.data
      return ''
    })
    .filter(Boolean)
    .join(',')
}

function handlePicturePreview(file: UploadFile) {
  previewImageUrl.value = file.url || ''
  previewVisible.value = true
}

const handleUploadSuccess: UploadProps['onSuccess'] = (response, _file, _fileList) => {
  // response should contain the file path
  // The uploadFileList is auto-managed by v-model:file-list
}

function handleUploadRemove() {
  // The uploadFileList is auto-managed by v-model:file-list
}

function handleUploadExceed() {
  ElMessage.warning('最多上传4张图片！')
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isLt1M = file.size / 1024 / 1024 < 1
  if (!isLt1M) {
    ElMessage.warning('上传图片大小不能超过 1MB!')
    return false
  }
  return true
}

// ======================== Expose ========================
defineExpose({
  add,
  edit,
  copyAdd,
  show,
  title,
  showOkFlag,
})
</script>

<style scoped lang="scss">
.input-table {
  max-width: 100%;
  min-width: 1200px;
}
</style>
