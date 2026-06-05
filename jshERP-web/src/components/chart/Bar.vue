<template>
  <div :style="{ padding: '0 0 32px 32px' }">
    <h3 :style="{ marginBottom: '20px' }">{{ title }}</h3>
    <div ref="chartContainer" :style="{ height: height + 'px', width: '100%' }"></div>
  </div>
</template>

<script>
  import { Column } from '@antv/g2plot'
  import { triggerWindowResizeEvent } from '@/utils/util'
  import { DEFAULT_COLOR } from '@/store/mutation-types'
  import storage from '@/utils/storage'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  export default {
    name: 'Bar',
    mixins: [G2PlotChartMixin],
    props: {
      dataSource: {
        type: Array,
        default: () => []
      },
      yaxisText: {
        type: String,
        default: 'y'
      },
      title: {
        type: String,
        default: ''
      },
      height: {
        type: Number,
        default: 254
      }
    },
    data () {
      return {
        color: storage.get(DEFAULT_COLOR) || '#1890ff'
      }
    },
    watch: {
      dataSource: {
        deep: true,
        handler () {
          this.renderChart()
        }
      },
      yaxisText () {
        this.renderChart()
      },
      height () {
        this.$nextTick(() => {
          this._resizeG2PlotChart()
        })
      }
    },
    mounted () {
      this.renderChart()
      triggerWindowResizeEvent()
    },
    methods: {
      renderChart () {
        const data = this.dataSource || []
        this._syncG2PlotChart(Column, () => ({
          data,
          xField: 'x',
          yField: 'y',
          height: this.height,
          autoFit: true,
          padding: [20, 30, 50, 50],
          color: this.color,
          meta: {
            y: { alias: this.yaxisText }
          },
          xAxis: { label: { autoRotate: true } },
          legend: false
        }))
      }
    }
  }
</script>
