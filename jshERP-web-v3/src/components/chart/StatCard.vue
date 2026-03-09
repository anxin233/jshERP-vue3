<script setup lang="ts">
/**
 * StatCard - 统计卡片组件
 * 基于 el-card + el-statistic，支持图标和加载状态
 */

const props = withDefaults(
  defineProps<{
    title?: string
    value?: number | string
    prefix?: string
    suffix?: string
    icon?: string
    color?: string
    loading?: boolean
  }>(),
  {
    title: '',
    value: 0,
    prefix: '',
    suffix: '',
    icon: '',
    color: '#409eff',
    loading: false
  }
)
</script>

<template>
  <el-card class="stat-card" shadow="hover" v-loading="loading">
    <div class="stat-card__content">
      <div class="stat-card__info">
        <div class="stat-card__title">{{ title }}</div>
        <div class="stat-card__value">
          <el-statistic :value="typeof value === 'number' ? value : 0">
            <template v-if="prefix" #prefix>
              <span class="stat-card__prefix">{{ prefix }}</span>
            </template>
            <template v-if="suffix" #suffix>
              <span class="stat-card__suffix">{{ suffix }}</span>
            </template>
            <template v-if="typeof value === 'string'" #default>
              <span>{{ value }}</span>
            </template>
          </el-statistic>
        </div>
      </div>
      <div v-if="icon" class="stat-card__icon" :style="{ backgroundColor: color }">
        <el-icon :size="28" color="#fff">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.stat-card {
  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__info {
    flex: 1;
  }

  &__title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }

  &__value {
    font-size: 24px;
    font-weight: 600;
  }

  &__prefix,
  &__suffix {
    font-size: 16px;
    font-weight: normal;
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    margin-left: 16px;
  }
}
</style>
