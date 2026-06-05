<template>
  <div :style="{ padding: '0 0 32px 32px' }">
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { Column } from '@antv/g2plot'
  import { DataSet } from '@antv/data-set'
  import { ChartEventMixins } from './mixins/ChartMixins'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  export default {
    name: 'BarMultid',
    mixins: [ChartEventMixins, G2PlotChartMixin],
    props: {
      title: {
        type: String,
        default: ''
      },
      dataSource: {
        type: Array,
        default: () => [
          { type: 'Jeecg', 'Jan.': 18.9, 'Feb.': 28.8, 'Mar.': 39.3, 'Apr.': 81.4, 'May': 47, 'Jun.': 20.3, 'Jul.': 24, 'Aug.': 35.6 },
          { type: 'Jeebt', 'Jan.': 12.4, 'Feb.': 23.2, 'Mar.': 34.5, 'Apr.': 99.7, 'May': 52.6, 'Jun.': 35.5, 'Jul.': 37.4, 'Aug.': 42.4 }
        ]
      },
      fields: {
        type: Array,
        default: () => ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.']
      },
      aliases: {
        type: Array,
        default: () => []
      },
      height: {
        type: Number,
        default: 254
      }
    },
    computed: {
      chartData () {
        const dv = new DataSet.View().source(this.dataSource)
        dv.transform({
          type: 'fold',
          fields: this.fields,
          key: 'x',
          value: 'y'
        })
        let rows = dv.rows.map(row => {
          const next = { ...row }
          if (typeof next.x === 'string') {
            next.x = next.x.replace(/[-/]/g, '_')
          }
          return next
        })
        rows.forEach(row => {
          for (const item of this.aliases) {
            if (item.field === row.type) {
              row.type = item.alias
              break
            }
          }
        })
        return rows
      }
    },
    watch: {
      chartData: {
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
          data: this.chartData,
          xField: 'x',
          yField: 'y',
          seriesField: 'type',
          isGroup: true,
          height: this.height,
          autoFit: true,
          dodgePadding: 2,
          intervalPadding: 4,
          legend: { position: 'top' }
        }), { bindClick: true })
      }
    }
  }
</script>

<style scoped>

</style>
