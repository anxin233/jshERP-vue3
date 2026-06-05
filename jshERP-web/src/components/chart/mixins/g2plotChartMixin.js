/**
 * G2Plot 图表生命周期 mixin（Vue 3 Options API）
 */
export const G2PlotChartMixin = {
  data () {
    return {
      _g2plotChart: null
    }
  },
  beforeUnmount () {
    this._destroyG2PlotChart()
  },
  methods: {
    _destroyG2PlotChart () {
      if (this._g2plotChart) {
        this._g2plotChart.destroy()
        this._g2plotChart = null
      }
    },
    _bindG2PlotClick (chart) {
      if (!chart || !this.handleClick) {
        return
      }
      chart.off('element:click')
      chart.on('element:click', (evt) => {
        this.handleClick(evt, chart)
      })
    },
  /**
   * @param {typeof import('@antv/g2plot').Plot} ChartCtor
   * @param {() => object} getOptions
   * @param {{ bindClick?: boolean }} opts
   */
    _syncG2PlotChart (ChartCtor, getOptions, opts = {}) {
      const el = this.$refs.chartContainer
      if (!el || !ChartCtor) {
        return
      }
      const options = getOptions()
      if (this._g2plotChart) {
        this._g2plotChart.update(options)
      } else {
        this._g2plotChart = new ChartCtor(el, options)
        this._g2plotChart.render()
        if (opts.bindClick) {
          this._bindG2PlotClick(this._g2plotChart)
        }
      }
    },
    _resizeG2PlotChart () {
      if (this._g2plotChart && this.$refs.chartContainer) {
        const { clientWidth, clientHeight } = this.$refs.chartContainer
        if (clientWidth > 0 && clientHeight > 0) {
          this._g2plotChart.changeSize(clientWidth, clientHeight)
        }
      }
    }
  }
}
