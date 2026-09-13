<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ height: '60%' }"
    @update:show="onUpdateShow"
  >
    <div class="picker">
      <div class="picker__head">
        <span class="picker__title">{{ title || '选择结算账户' }}</span>
        <van-icon
          name="cross"
          @click="close"
        />
      </div>
      <van-cell-group>
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.name"
          clickable
          @click="choose(item)"
        >
          <template #value>
            <span class="picker__value">
              <van-tag
                v-if="item.isDefault"
                type="primary"
                plain
              >默认</van-tag>
              <span v-if="item.currentAmount != null">余额 ¥{{ formatAmount(item.currentAmount) }}</span>
            </span>
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty
        v-if="loaded && list.length === 0"
        description="暂无账户"
      />
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getAccount } from '@/api/depot'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '选择结算账户' }
})
const emit = defineEmits(['update:show', 'select'])

const list = ref([])
const loaded = ref(false)

watch(
  () => props.show,
  (val) => {
    if (val && !loaded.value) {
      load()
    }
  }
)

function formatAmount (val) {
  const num = Number(val)
  if (Number.isNaN(num)) return val
  return num.toFixed(2)
}

async function load () {
  try {
    const res = await getAccount()
    if (res && res.code === 200 && res.data && Array.isArray(res.data.accountList)) {
      list.value = res.data.accountList
    }
  } finally {
    loaded.value = true
  }
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
    name: item.name,
    currentAmount: item.currentAmount,
    isDefault: !!item.isDefault
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

  &__value {
    display: flex;
    gap: 8px;
    align-items: center;
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
