<template>
  <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
</template>

<script>
  import { Radar } from '@antv/g2plot'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  const sourceData = [
    { item: '示例一', score: 40, user: '用户A' },
    { item: '示例二', score: 20, user: '用户A' },
    { item: '示例三', score: 67, user: '用户A' },
    { item: '示例四', score: 43, user: '用户A' },
    { item: '示例五', score: 90, user: '用户A' }
  ]

  export default {
    name: 'Radar',
    mixins: [G2PlotChartMixin],
    props: {
      height: {
        type: Number,
        default: 254
      },
      dataSource: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        chartData: sourceData
      }
    },
    watch: {
      dataSource: {
        deep: true,
        handler (newVal) {
          if (!newVal || newVal.length === 0) {
            this.chartData = sourceData
          } else {
            this.chartData = newVal.map(row => ({
              ...row,
              user: row.user || 'default'
            }))
          }
          this.renderChart()
        }
      },
      height () {
        this.$nextTick(() => this._resizeG2PlotChart())
      }
    },
    mounted () {
      if (this.dataSource && this.dataSource.length > 0) {
        this.chartData = this.dataSource.map(row => ({
          ...row,
          user: row.user || 'default'
        }))
      }
      this.renderChart()
    },
    methods: {
      renderChart () {
        this._syncG2PlotChart(Radar, () => ({
          data: this.chartData,
          xField: 'item',
          yField: 'score',
          seriesField: 'user',
          height: this.height,
          autoFit: true,
          padding: [20, 20, 95, 20],
          meta: {
            score: { min: 0, max: 100 },
            user: { alias: '类型' }
          },
          xAxis: {
            line: null,
            tickLine: null,
            grid: { line: { style: { lineDash: null } } }
          },
          yAxis: {
            line: null,
            tickLine: null,
            grid: { line: { style: { lineDash: null } } }
          },
          point: { size: 4, shape: 'circle' },
          area: {},
          legend: { position: 'bottom', offsetY: 30 }
        }))
      }
    }
  }
</script>

<style scoped>

</style>
