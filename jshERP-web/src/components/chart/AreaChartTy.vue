<template>
  <div :style="{ padding: '0' }">
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { Area } from '@antv/g2plot'
  import { triggerWindowResizeEvent } from '@/utils/util'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  export default {
    name: 'AreaChartTy',
    mixins: [G2PlotChartMixin],
    props: {
      dataSource: {
        type: Array,
        required: true
      },
      title: {
        type: String,
        default: ''
      },
      x: {
        type: String,
        default: 'x'
      },
      y: {
        type: String,
        default: 'y'
      },
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: null
      },
      height: {
        type: Number,
        default: 254
      },
      lineSize: {
        type: Number,
        default: 2
      },
      color: {
        type: String,
        default: ''
      },
      lineColor: {
        type: String,
        default: ''
      }
    },
    watch: {
      dataSource: {
        deep: true,
        handler () {
          this.renderChart()
        }
      },
      height () {
        this.$nextTick(() => this._resizeG2PlotChart())
      }
    },
    mounted () {
      this.renderChart()
      triggerWindowResizeEvent()
    },
    methods: {
      renderChart () {
        const yMeta = { alias: this.y, min: this.min }
        if (this.max != null) {
          yMeta.max = this.max
        }
        const areaColor = this.color || undefined
        const lineStyle = {
          lineWidth: this.lineSize,
          stroke: this.lineColor || areaColor
        }
        this._syncG2PlotChart(Area, () => ({
          data: this.dataSource,
          xField: 'x',
          yField: 'y',
          height: this.height,
          autoFit: true,
          smooth: false,
          areaStyle: areaColor ? { fill: areaColor, fillOpacity: 0.35 } : { fillOpacity: 0.35 },
          line: lineStyle,
          meta: {
            x: { alias: this.x },
            y: yMeta
          }
        }))
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "chart";
</style>
