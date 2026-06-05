<template>
  <div :style="{ padding: '0 0 32px 32px' }">
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <div ref="chartContainer" :style="{ height: '254px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { Column } from '@antv/g2plot'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  const mockData = []
  for (let i = 0; i < 12; i += 1) {
    mockData.push({
      x: `${i + 1}月`,
      y: Math.floor(Math.random() * 1000) + 200
    })
  }

  export default {
    name: 'IndexBar',
    mixins: [G2PlotChartMixin],
    props: {
      title: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        datasource: []
      }
    },
    mounted () {
      this.datasource = mockData
      this.renderChart()
    },
    methods: {
      renderChart () {
        this._syncG2PlotChart(Column, () => ({
          data: this.datasource,
          xField: 'x',
          yField: 'y',
          height: 254,
          autoFit: true,
          padding: [20, 30, 40, 50],
          meta: {
            x: { min: 2 },
            y: { alias: '时间', min: 1, max: 22 }
          },
          legend: false
        }))
      }
    }
  }
</script>
