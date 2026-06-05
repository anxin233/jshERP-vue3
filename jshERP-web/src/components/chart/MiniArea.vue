<template>
  <div class="antv-chart-mini">
    <div class="chart-wrapper" :style="{ height: height + 'px' }">
      <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
    </div>
  </div>
</template>

<script>
  import { Area } from '@antv/g2plot'
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
    name: 'MiniArea',
    mixins: [G2PlotChartMixin],
    props: {
      dataSource: {
        type: Array,
        default: () => []
      },
      x: {
        type: String,
        default: 'x'
      },
      y: {
        type: String,
        default: 'y'
      }
    },
    data () {
      return {
        chartData: [],
        height: 100
      }
    },
    watch: {
      dataSource: {
        deep: true,
        handler () {
          this.applyData()
          this.renderChart()
        }
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
        this._syncG2PlotChart(Area, () => ({
          data: this.chartData,
          xField: 'x',
          yField: 'y',
          height: this.height,
          autoFit: true,
          smooth: true,
          padding: [36, 0, 18, 0],
          meta: {
            x: { alias: this.x },
            y: { alias: this.y }
          },
          xAxis: false,
          yAxis: false,
          legend: false,
          tooltip: { showMarkers: false }
        }))
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "chart";
</style>
