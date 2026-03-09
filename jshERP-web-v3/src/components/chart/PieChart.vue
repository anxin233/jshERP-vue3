<script setup lang="ts">
/**
 * PieChart - 饼图组件
 * 基于 vue-echarts + echarts，支持自适应容器宽度
 */
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { PieSeriesOption } from 'echarts/charts'
import type {
  TitleComponentOption,
  TooltipComponentOption,
  LegendComponentOption
} from 'echarts/components'

// 注册 ECharts 组件
use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

type ECOption = ComposeOption<
  PieSeriesOption | TitleComponentOption | TooltipComponentOption | LegendComponentOption
>

const props = withDefaults(
  defineProps<{
    option?: ECOption
    height?: string
    loading?: boolean
  }>(),
  {
    option: () => ({}),
    height: '350px',
    loading: false
  }
)

/** 合并默认配置和传入配置 */
const chartOption = computed<ECOption>(() => {
  const defaultOption: ECOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%'
    }
  }
  return { ...defaultOption, ...props.option }
})
</script>

<template>
  <div class="pie-chart" :style="{ height }">
    <v-chart
      :option="chartOption"
      :loading="loading"
      autoresize
      class="chart-instance"
    />
  </div>
</template>

<style scoped>
.pie-chart {
  width: 100%;
}

.chart-instance {
  width: 100%;
  height: 100%;
}
</style>
