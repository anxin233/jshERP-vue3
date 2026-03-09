<script setup lang="ts">
/**
 * LineChart - 折线图组件
 * 基于 vue-echarts + echarts，支持自适应容器宽度
 */
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { LineSeriesOption } from 'echarts/charts'
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption
} from 'echarts/components'

// 注册 ECharts 组件
use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
])

type ECOption = ComposeOption<
  LineSeriesOption | TitleComponentOption | TooltipComponentOption | GridComponentOption | LegendComponentOption
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
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  return { ...defaultOption, ...props.option }
})
</script>

<template>
  <div class="line-chart" :style="{ height }">
    <v-chart
      :option="chartOption"
      :loading="loading"
      autoresize
      class="chart-instance"
    />
  </div>
</template>

<style scoped>
.line-chart {
  width: 100%;
}

.chart-instance {
  width: 100%;
  height: 100%;
}
</style>
