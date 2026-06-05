<template>
  <div :style="{ padding: '0 0 32px 32px' }">
    <div ref="chartContainer" :style="{ height: '300px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { Gauge } from '@antv/g2plot'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  const defaultData = [{ value: 7.0 }]

  export default {
    name: 'DashChartDemo',
    mixins: [G2PlotChartMixin],
    props: {
      datasource: {
        type: Number,
        default: 7
      },
      title: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        chartValue: 7,
        displayPercent: 70
      }
    },
    watch: {
      datasource (val) {
        this.chartValue = val || 0
        this.displayPercent = Math.round((this.chartValue || 0) * 10)
        this.renderChart()
      }
    },
    created () {
      this.chartValue = this.datasource || defaultData[0].value
      this.displayPercent = Math.round(this.chartValue * 10)
    },
    mounted () {
      this.renderChart()
    },
    methods: {
      renderChart () {
        const percent = Math.min(Math.max(this.chartValue / 9, 0), 1)
        this._syncG2PlotChart(Gauge, () => ({
          percent,
          height: 300,
          autoFit: true,
          range: {
            color: ['#CBCBCB', '#1890FF']
          },
          indicator: {
            pointer: { style: { stroke: '#1890FF', lineWidth: 5 } },
            pin: { style: { stroke: '#1890FF', lineWidth: 4, fill: '#fff', r: 9.75 } }
          },
          axis: {
            label: {
              formatter: (v) => Number(v) * 10,
              style: { fontSize: 12 }
            },
            subTickLine: { count: 4 },
            tickLine: { length: -8 }
          },
          statistic: {
            title: {
              offsetY: -12,
              style: { fontSize: 14, color: '#545454' },
              formatter: () => this.title
            },
            content: {
              offsetY: 8,
              style: { fontSize: 36, color: '#545454' },
              formatter: () => `${this.displayPercent}%`
            }
          }
        }))
      }
    }
  }
</script>
