<template>
  <div :style="{ padding: '0 50px 32px 0' }">
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { DualAxes } from '@antv/g2plot'
  import { ChartEventMixins } from './mixins/ChartMixins'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  export default {
    name: 'BarAndLine',
    mixins: [ChartEventMixins, G2PlotChartMixin],
    props: {
      title: {
        type: String,
        default: ''
      },
      dataSource: {
        type: Array,
        default: () => [
          { type: '10:10', bar: 200, line: 1000 },
          { type: '10:15', bar: 600, line: 1000 },
          { type: '10:20', bar: 200, line: 1000 },
          { type: '10:25', bar: 900, line: 1000 },
          { type: '10:30', bar: 200, line: 1000 },
          { type: '10:35', bar: 200, line: 1000 },
          { type: '10:40', bar: 100, line: 1000 }
        ]
      },
      height: {
        type: Number,
        default: 400
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
    },
    methods: {
      renderChart () {
        const data = this.dataSource || []
        this._syncG2PlotChart(DualAxes, () => ({
          data: [data, data],
          xField: 'type',
          yField: ['bar', 'line'],
          height: this.height,
          autoFit: true,
          padding: [50, 50, 100, 50],
          geometryOptions: [
            { geometry: 'column' },
            {
              geometry: 'line',
              color: '#2fc25b',
              lineStyle: { lineWidth: 3 }
            }
          ],
          legend: { position: 'top' },
          meta: {
            bar: { min: 0 },
            line: { min: 0 }
          }
        }), { bindClick: true })
      }
    }
  }
</script>
