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
        <span class="picker__title">{{ title || '选择经手人' }}</span>
        <van-icon
          name="cross"
          @click="close"
        />
      </div>
      <van-cell-group>
        <van-cell
          v-for="item in list"
          :key="item.value"
          :title="item.text"
          clickable
          @click="choose(item)"
        >
          <template #right-icon>
            <van-icon
              v-if="multiple && selected.indexOf(item.value) !== -1"
              name="success"
              color="#1890ff"
            />
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty
        v-if="loaded && list.length === 0"
        description="暂无人选"
      />
      <div
        v-if="multiple && selected.length"
        class="picker__footer"
      >
        <van-button
          round
          block
          type="primary"
          @click="confirmMultiple"
        >
          确定（已选 {{ selected.length }}）
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getPersonByNumType } from '@/api/depot'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '选择经手人' },
  // 1-销售员 2-仓管员 3-财务员
  type: { type: [String, Number], default: 1 },
  multiple: { type: Boolean, default: false }
})
const emit = defineEmits(['update:show', 'select'])

const list = ref([])
const loaded = ref(false)
const selected = ref([])

watch(
  () => props.show,
  (val) => {
    if (val) {
      selected.value = []
      if (!loaded.value) {
        load()
      }
    }
  }
)

async function load () {
  try {
    const res = await getPersonByNumType(props.type)
    if (Array.isArray(res)) {
      list.value = res
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
  if (props.multiple) {
    const idx = selected.value.indexOf(item.value)
    if (idx === -1) {
      selected.value.push(item.value)
    } else {
      selected.value.splice(idx, 1)
    }
    return
  }
  emit('select', { value: item.value, text: item.text })
  close()
}

function confirmMultiple () {
  const items = list.value.filter(item => selected.value.indexOf(item.value) !== -1)
  emit('select', items.map(item => ({ value: item.value, text: item.text })))
  close()
}
</script>

<style lang="less" scoped>
.picker {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 12px;

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

  &__footer {
    padding: 12px 16px 0;
  }
}
</style>
