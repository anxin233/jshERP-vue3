<template>
  <div :style="{ padding: '0 0 32px 32px' }">
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { Column } from '@antv/g2plot'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  export default {
    name: 'TransferBar',
    mixins: [G2PlotChartMixin],
    props: {
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
      data: {
        type: Array,
        default: () => []
      },
      height: {
        type: Number,
        default: 254
      }
    },
    watch: {
      data: {
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
    },
    methods: {
      renderChart () {
        this._syncG2PlotChart(Column, () => ({
          data: this.data || [],
          xField: 'x',
          yField: 'y',
          height: this.height,
          autoFit: true,
          padding: [20, 30, 40, 50],
          meta: {
            x: { alias: this.x },
            y: { alias: this.y }
          },
          legend: false
        }))
      }
    }
  }
</script>
