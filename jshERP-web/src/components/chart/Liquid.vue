<template>
  <div ref="chartContainer" :style="containerStyle"></div>
</template>

<script>
  import { Liquid } from '@antv/g2plot'
  import { G2PlotChartMixin } from './mixins/g2plotChartMixin'

  const sourceDataConst = [
    { transfer: '一月', value: 0.813 },
    { transfer: '二月', value: 0.233 },
    { transfer: '三月', value: 0.561 }
  ]

  export default {
    name: 'Liquid',
    mixins: [G2PlotChartMixin],
    props: {
      height: {
        type: Number,
        default: 200
      },
      width: {
        type: Number,
        default: 0
      },
      dataSource: {
        type: Array,
        default: null
      }
    },
    computed: {
      chartData () {
        const raw = this.dataSource || sourceDataConst
        return raw.map(item => ({
          ...item,
          value: item.value > 1 ? item.value / 100 : item.value
        }))
      },
      containerStyle () {
        const style = { width: '100%' }
        if (this.width > 0) {
          style.width = this.width + 'px'
        }
        style.height = (this.height > 0 ? this.height : 200) + 'px'
        return style
      }
    },
    watch: {
      chartData: {
        deep: true,
        handler () {
          this.renderCharts()
        }
      }
    },
    mounted () {
      this.renderCharts()
    },
    methods: {
      renderCharts () {
        this._destroyG2PlotChart()
        const el = this.$refs.chartContainer
        if (!el) {
          return
        }
        el.innerHTML = ''
        const h = this.height > 0 ? this.height : 200
        const w = this.width > 0 ? this.width : el.clientWidth || 200
        const itemHeight = Math.floor(h / Math.max(this.chartData.length, 1))
        this._g2plotCharts = this.chartData.map((row, index) => {
          const holder = document.createElement('div')
          holder.style.cssText = `display:inline-block;width:${Math.floor(w / this.chartData.length)}px;height:${itemHeight}px;vertical-align:top;`
          el.appendChild(holder)
          const chart = new Liquid(holder, {
            percent: row.value,
            height: itemHeight,
            width: Math.floor(w / this.chartData.length),
            outline: { border: 4, distance: 4 },
            wave: { length: 128 },
            statistic: {
              title: { content: row.transfer, style: { fontSize: 12 } },
              content: {
                style: { fontSize: 18 },
                formatter: () => `${Math.round(row.value * 100)}%`
              }
            }
          })
          chart.render()
          return chart
        })
      },
      _destroyG2PlotChart () {
        if (this._g2plotCharts) {
          this._g2plotCharts.forEach(c => c.destroy())
          this._g2plotCharts = null
        }
        if (this._g2plotChart) {
          this._g2plotChart.destroy()
          this._g2plotChart = null
        }
      }
    }
  }
</script>

<style scoped>

</style>
