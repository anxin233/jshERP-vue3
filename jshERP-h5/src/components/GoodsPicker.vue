<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ height: '85%' }"
    @update:show="onUpdateShow"
  >
    <div class="goods-picker">
      <div class="goods-picker__head">
        <span class="goods-picker__title">{{ title || '选择商品' }}</span>
        <van-icon
          name="cross"
          @click="close"
        />
      </div>

      <ScanInput
        placeholder="扫描或输入条码后回车"
        @scan="handleScan"
      />

      <van-search
        v-model="keyword"
        placeholder="搜索商品名称/条码/规格"
        @update:model-value="onSearch"
      />

      <div class="goods-picker__list">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadMore"
        >
          <van-cell
            v-for="item in list"
            :key="item.id"
            clickable
            @click="choose(item)"
          >
            <template #title>
              <div class="goods-picker__name">
                {{ item.name }}
              </div>
              <div class="goods-picker__spec">
                {{ specText(item) }}
                <span v-if="item.stock != null"> · 库存 {{ formatStock(item.stock) }} {{ item.unit || '' }}</span>
              </div>
            </template>
            <template #value>
              <span
                v-if="displayPrice(item) != null"
                class="goods-picker__price"
              >
                ¥{{ displayPrice(item) }}
              </span>
            </template>
          </van-cell>
        </van-list>
        <van-empty
          v-if="!loading && finished && list.length === 0"
          description="未找到商品"
        />
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { getMaterialByBarCode, getMaterialBySelect } from '@/api/material'
import { BILL_PRICE_FIELD } from '@/constants/business'
import ScanInput from './ScanInput.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '选择商品' },
  // 单据前缀：LSCK 零售出库 / XSCK 销售出库 / CGRK 采购入库 等，决定取价字段
  prefixNo: { type: String, default: 'LSCK' },
  depotId: { type: [String, Number], default: '' },
  organId: { type: [String, Number], default: '' }
})
const emit = defineEmits(['update:show', 'select'])

const keyword = ref('')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const PAGE_SIZE = 20
let searchTimer = null

watch(
  () => props.show,
  (val) => {
    if (val) {
      keyword.value = ''
      reset()
    }
  }
)

function reset () {
  list.value = []
  page.value = 1
  finished.value = false
  loading.value = false
  loadMore()
}

function onSearch (val) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    keyword.value = val || ''
    reset()
  }, 300)
}

async function loadMore () {
  if (loading.value) return
  loading.value = true
  try {
    const res = await getMaterialBySelect({
      q: keyword.value.trim(),
      depotId: props.depotId,
      mpList: '',
      page: page.value,
      rows: PAGE_SIZE
    })
    const rows = (res && res.rows) || []
    list.value = page.value === 1 ? rows : list.value.concat(rows)
    if (list.value.length >= (res && res.total ? res.total : 0) || rows.length < PAGE_SIZE) {
      finished.value = true
    } else {
      page.value += 1
    }
  } catch {
    finished.value = true
  } finally {
    loading.value = false
  }
}

function priceField (item) {
  const field = BILL_PRICE_FIELD[props.prefixNo]
  return field ? item[field] : null
}

function displayPrice (item) {
  const val = priceField(item)
  if (val == null || val === '') return null
  return Number(val).toFixed(2)
}

function specText (item) {
  return [item.standard, item.model, item.color].filter(Boolean).join(' / ') || '-'
}

function formatStock (val) {
  const num = Number(val)
  return Number.isNaN(num) ? val : String(num)
}

async function enrichByBarCode (barCode) {
  const res = await getMaterialByBarCode({
    barCode,
    depotId: props.depotId,
    prefixNo: props.prefixNo,
    mpList: '',
    organId: props.organId
  })
  if (res && res.code === 200 && Array.isArray(res.data) && res.data.length) {
    return res.data[0]
  }
  return null
}

function buildItem (raw) {
  if (!raw) return null
  const price = raw.billPrice != null ? raw.billPrice : priceField(raw)
  return {
    materialId: raw.id,
    meId: raw.meId,
    name: raw.name,
    mBarCode: raw.mBarCode,
    unit: raw.unit || raw.commodityUnit || '',
    sku: raw.sku || '',
    stock: raw.stock,
    depotId: raw.depotId != null ? raw.depotId : props.depotId,
    unitPrice: price != null ? Number(price) : null,
    purchaseDecimal: raw.purchaseDecimal,
    commodityDecimal: raw.commodityDecimal,
    wholesaleDecimal: raw.wholesaleDecimal,
    lowDecimal: raw.lowDecimal,
    standard: raw.standard || '',
    model: raw.model || '',
    color: raw.color || '',
    brand: raw.brand || '',
    mfrs: raw.mfrs || '',
    otherField1: raw.otherField1 || '',
    otherField2: raw.otherField2 || '',
    otherField3: raw.otherField3 || '',
    enableSerialNumber: raw.enableSerialNumber || '0',
    enableBatchNumber: raw.enableBatchNumber || '0'
  }
}

async function handleScan (code) {
  const raw = await enrichByBarCode(code)
  if (!raw) {
    showToast(`未找到商品：${code}`)
    return
  }
  pick(raw)
}

async function choose (item) {
  if (!item.mBarCode) {
    pick(item)
    return
  }
  const raw = await enrichByBarCode(item.mBarCode)
  pick(raw || item)
}

function pick (raw) {
  const item = buildItem(raw)
  if (!item) return
  emit('select', item)
  close()
}

function onUpdateShow (val) {
  emit('update:show', val)
}

function close () {
  emit('update:show', false)
}
</script>

<style lang="less" scoped>
.goods-picker {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
  }

  &__list {
    flex: 1;
    overflow-y: auto;
  }

  &__name {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
  }

  &__spec {
    margin-top: 2px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }

  &__price {
    font-size: 14px;
    color: #ee0a24;
  }
}
</style>
