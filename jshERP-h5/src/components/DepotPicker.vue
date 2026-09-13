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
        <span class="picker__title">{{ title || '选择仓库' }}</span>
        <van-icon
          name="cross"
          @click="close"
        />
      </div>
      <van-cell-group>
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.depotName"
          clickable
          @click="choose(item)"
        >
          <template #value>
            <van-tag
              v-if="item.isDefault"
              type="primary"
              plain
            >
              默认
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty
        v-if="loaded && list.length === 0"
        description="暂无仓库"
      />
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { findDepotByCurrentUser } from '@/api/depot'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '选择仓库' }
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

async function load () {
  try {
    const res = await findDepotByCurrentUser()
    if (res && res.code === 200 && Array.isArray(res.data)) {
      list.value = res.data
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
    name: item.depotName,
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
    font-size: 16px;
    font-weight: 600;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
