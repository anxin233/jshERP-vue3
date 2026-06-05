<template>
  <div>
    <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { Bar } from '@antv/g2plot'
  import { DataSet } from '@antv/data-set'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  export default {
    name: 'StackBar',
    mixins: [G2PlotChartMixin],
    props: {
      dataSource: {
        type: Array,
        required: true,
        default: () => [
          { State: '请假', 流转中: 25, 已归档: 18 },
          { State: '出差', 流转中: 30, 已归档: 20 },
          { State: '加班', 流转中: 38, 已归档: 42 },
          { State: '用车', 流转中: 51, 已归档: 67 }
        ]
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
          fields: ['流转中', '已归档'],
          key: '流程状态',
          value: '流程数量',
          retains: ['State']
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
        this._syncG2PlotChart(Bar, () => ({
          data: this.chartData,
          xField: '流程数量',
          yField: 'State',
          seriesField: '流程状态',
          isStack: true,
          height: this.height,
          autoFit: true,
          legend: { position: 'top' },
          yAxis: {
            label: {
              offset: 12
            }
          }
        }))
      }
    }
  }
</script>
