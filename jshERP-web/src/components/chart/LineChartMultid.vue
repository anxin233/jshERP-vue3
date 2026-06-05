<template>
  <div :style="{ padding: '0 0 32px 32px' }">
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { Line } from '@antv/g2plot'
  import { DataSet } from '@antv/data-set'
  import { ChartEventMixins } from './mixins/ChartMixins'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  export default {
    name: 'LineChartMultid',
    mixins: [ChartEventMixins, G2PlotChartMixin],
    props: {
      title: {
        type: String,
        default: ''
      },
      dataSource: {
        type: Array,
        default: () => [
          { type: 'Jan', jeecg: 7.0, jeebt: 3.9 },
          { type: 'Feb', jeecg: 6.9, jeebt: 4.2 },
          { type: 'Mar', jeecg: 9.5, jeebt: 5.7 },
          { type: 'Apr', jeecg: 14.5, jeebt: 8.5 },
          { type: 'May', jeecg: 18.4, jeebt: 11.9 },
          { type: 'Jun', jeecg: 21.5, jeebt: 15.2 },
          { type: 'Jul', jeecg: 25.2, jeebt: 17.0 },
          { type: 'Aug', jeecg: 26.5, jeebt: 16.6 },
          { type: 'Sep', jeecg: 23.3, jeebt: 14.2 },
          { type: 'Oct', jeecg: 18.3, jeebt: 10.3 },
          { type: 'Nov', jeecg: 13.9, jeebt: 6.6 },
          { type: 'Dec', jeecg: 9.6, jeebt: 4.8 }
        ]
      },
      fields: {
        type: Array,
        default: () => ['jeecg', 'jeebt']
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
        const rows = dv.rows.map(row => ({ ...row }))
        rows.forEach(row => {
          for (const item of this.aliases) {
            if (item.field === row.x) {
              row.x = item.alias
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
        this._syncG2PlotChart(Line, () => ({
          data: this.chartData,
          xField: 'type',
          yField: 'y',
          seriesField: 'x',
          height: this.height,
          autoFit: true,
          point: {
            size: 4,
            shape: 'circle',
            style: { stroke: '#fff', lineWidth: 1 }
          },
          legend: { position: 'top' }
        }), { bindClick: true })
      }
    }
  }
</script>

<style scoped>

</style>
