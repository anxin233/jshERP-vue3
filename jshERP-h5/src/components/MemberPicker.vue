<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ height: '70%' }"
    @update:show="onUpdateShow"
  >
    <div class="picker">
      <div class="picker__head">
        <span class="picker__title">{{ title }}</span>
        <van-icon
          name="cross"
          @click="close"
        />
      </div>
      <van-search
        v-model="keyword"
        :placeholder="searchPlaceholder"
        @update:model-value="onSearch"
      />
      <div class="picker__list">
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.supplier"
          clickable
          @click="choose(item)"
        >
          <template #value>
            <span
              v-if="type === 'member' && item.advanceIn != null"
              class="picker__balance"
            >
              预付款 ¥{{ Number(item.advanceIn).toFixed(2) }}
            </span>
          </template>
        </van-cell>
        <van-empty
          v-if="loaded && list.length === 0"
          :description="emptyText"
        />
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { findBySelectCus, findBySelectRetail, findBySelectSup } from '@/api/supplier'

const props = defineProps({
  show: { type: Boolean, default: false },
  // member-会员 customer-客户 supplier-供应商
  type: { type: String, default: 'member' }
})
const emit = defineEmits(['update:show', 'select'])

const API_MAP = {
  member: findBySelectRetail,
  customer: findBySelectCus,
  supplier: findBySelectSup
}
const TITLE_MAP = {
  member: '选择会员',
  customer: '选择客户',
  supplier: '选择供应商'
}
const PLACEHOLDER_MAP = {
  member: '搜索会员姓名/电话',
  customer: '搜索客户名称',
  supplier: '搜索供应商名称'
}
const EMPTY_MAP = {
  member: '暂无会员',
  customer: '暂无客户',
  supplier: '暂无供应商'
}

const keyword = ref('')
const list = ref([])
const loaded = ref(false)
let searchTimer = null

const title = computed(() => TITLE_MAP[props.type] || '选择往来单位')
const searchPlaceholder = computed(() => PLACEHOLDER_MAP[props.type] || '输入关键词搜索')
const emptyText = computed(() => EMPTY_MAP[props.type] || '暂无数据')

watch(
  () => props.show,
  (val) => {
    if (val) {
      keyword.value = ''
      load('')
    }
  }
)

async function load (key) {
  const fn = API_MAP[props.type] || findBySelectRetail
  try {
    const res = await fn(key, 50)
    if (Array.isArray(res)) {
      list.value = res
    }
  } finally {
    loaded.value = true
  }
}

function onSearch (val) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => load((val || '').trim()), 300)
}

function onUpdateShow (val) {
  emit('update:show', val)
}

function close () {
  emit('update:show', false)
}

function choose (item) {
  emit('select', {
    id: item.id,
    name: item.supplier,
    advanceIn: item.advanceIn
  })
  close()
}
</script>

<style lang="less" scoped>
.picker {
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

  &__balance {
    font-size: 12px;
    color: #ee0a24;
  }
}
</style>
