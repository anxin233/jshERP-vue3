<template>
  <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
</template>

<script>
  import { Pie } from '@antv/g2plot'
  import { DataSet } from '@antv/data-set'
  import { ChartEventMixins } from './mixins/ChartMixins'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  export default {
    name: 'Pie',
    mixins: [ChartEventMixins, G2PlotChartMixin],
    props: {
      title: {
        type: String,
        default: ''
      },
      height: {
        type: Number,
        default: 254
      },
      dataSource: {
        type: Array,
        default: () => [
          { item: '示例一', count: 40 },
          { item: '示例二', count: 21 },
          { item: '示例三', count: 17 },
          { item: '示例四', count: 13 },
          { item: '示例五', count: 9 }
        ]
      }
    },
    computed: {
      chartData () {
        const dv = new DataSet.View().source(this.dataSource)
        dv.transform({
          type: 'percent',
          field: 'count',
          dimension: 'item',
          as: 'percent'
        })
        return dv.rows
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
        this._syncG2PlotChart(Pie, () => ({
          data: this.chartData,
          angleField: 'percent',
          colorField: 'item',
          height: this.height,
          autoFit: true,
          radius: 0.8,
          label: {
            type: 'outer',
            formatter: (datum) => `${datum.item}: ${(datum.percent * 100).toFixed(0)}%`
          },
          legend: { position: 'bottom' },
          tooltip: {
            formatter: (datum) => ({
              name: datum.item,
              value: `${(datum.percent * 100).toFixed(1)}%`
            })
          },
          interactions: [{ type: 'element-active' }]
        }), { bindClick: true })
      }
    }
  }
</script>
