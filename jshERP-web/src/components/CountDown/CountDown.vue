<template>
  <span>{{ formatTime(lastTime) }}</span>
</template>

<script>
  function fixedZero(val) {
    return val * 1 < 10 ? `0${val}` : val
  }

  export default {
    name: 'CountDown',
    props: {
      format: {
        type: Function,
        default: undefined
      },
      target: {
        type: [Date, Number],
        required: true
      },
      onEnd: {
        type: Function,
        default: () => {}
      }
    },
    data() {
      return {
        dateTime: '0',
        originTargetTime: 0,
        lastTime: 0,
        timer: 0,
        interval: 1000
      }
    },
    created() {
      this.initTime()
      this.tick()
    },
    methods: {
      formatTime(time) {
        if (typeof this.format === 'function') {
          return this.format(time)
        }
        const hours = 60 * 60 * 1000
        const minutes = 60 * 1000
        const h = Math.floor(time / hours)
        const m = Math.floor((time - h * hours) / minutes)
        const s = Math.floor((time - h * hours - m * minutes) / 1000)
        return `${fixedZero(h)}:${fixedZero(m)}:${fixedZero(s)}`
      },
      initTime() {
        let targetTime = 0
        this.originTargetTime = this.target
        try {
          if (Object.prototype.toString.call(this.target) === '[object Date]') {
            targetTime = this.target
          } else {
            targetTime = new Date(this.target).getTime()
          }
        } catch (e) {
          throw new Error('invalid target prop')
        }
        const lastTime = targetTime - new Date().getTime()
        this.lastTime = lastTime < 0 ? 0 : lastTime
      },
      tick() {
        const { onEnd } = this
        this.timer = setTimeout(() => {
          if (this.lastTime < this.interval) {
            clearTimeout(this.timer)
            this.lastTime = 0
            if (typeof onEnd === 'function') {
              onEnd()
            }
          } else {
            this.lastTime -= this.interval
            this.tick()
          }
        }, this.interval)
      },
      clearTimer() {
        clearTimeout(this.timer)
      }
    },
    beforeUpdate() {
      if (this.originTargetTime !== this.target) {
        this.initTime()
      }
    },
    beforeUnmount() {
      this.clearTimer()
    },
    beforeUnmount() {
      this.clearTimer()
    }
  }
</script>
