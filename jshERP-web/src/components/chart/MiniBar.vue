<template>
  <div :style="{ width: width == null ? 'auto' : width + 'px' }">
    <div ref="chartContainer" :style="chartStyle"></div>
  </div>
</template>

<script>
  import { Column } from '@antv/g2plot'
  import dayjs from 'dayjs'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  const sourceData = []
  const beginDay = new Date().getTime()

  for (let i = 0; i < 10; i++) {
    sourceData.push({
      x: dayjs(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format('YYYY-MM-DD'),
      y: Math.round(Math.random() * 10)
    })
  }

  export default {
    name: 'MiniBar',
    mixins: [G2PlotChartMixin],
    props: {
      dataSource: {
        type: Array,
        default: () => []
      },
      width: {
        type: Number,
        default: null
      },
      height: {
        type: Number,
        default: 200
      }
    },
    data () {
      return {
        chartData: []
      }
    },
    computed: {
      chartStyle () {
        const style = { height: this.height + 'px' }
        if (this.width != null) {
          style.width = this.width + 'px'
        } else {
          style.width = '100%'
        }
        return style
      }
    },
    watch: {
      dataSource: {
        deep: true,
        handler () {
          this.applyData()
          this.renderChart()
        }
      },
      height () {
        this.$nextTick(() => this._resizeG2PlotChart())
      }
    },
    created () {
      this.applyData()
    },
    mounted () {
      this.renderChart()
    },
    methods: {
      applyData () {
        this.chartData = this.dataSource.length === 0 ? sourceData : this.dataSource
      },
      renderChart () {
        this._syncG2PlotChart(Column, () => ({
          data: this.chartData,
          xField: 'x',
          yField: 'y',
          height: this.height,
          autoFit: this.width == null,
          width: this.width == null ? undefined : this.width,
          padding: [0, 0, 0, 0],
          xAxis: false,
          yAxis: false,
          legend: false,
          label: false,
          meta: {
            y: { alias: '时间', min: 1, max: 30 }
          }
        }))
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "chart";
</style>
