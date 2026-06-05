<template>
  <span
    class="column-resize-handle"
    @mousedown.stop.prevent="handleMouseDown"
  />
</template>

<script>
  export default {
    name: 'ColumnResizeHandle',
    props: {
      x: {
        type: Number,
        default: 0
      }
    },
    emits: ['dragging'],
    data() {
      return {
        startClientX: 0,
        startX: 0
      }
    },
    beforeUnmount() {
      this.removeListeners()
    },
    methods: {
      handleMouseDown(event) {
        this.startClientX = event.clientX
        this.startX = Number(this.x) || 0
        document.addEventListener('mousemove', this.handleMouseMove)
        document.addEventListener('mouseup', this.handleMouseUp)
      },
      handleMouseMove(event) {
        const nextX = Math.max(this.startX + event.clientX - this.startClientX, 1)
        this.$emit('dragging', nextX, 0)
      },
      handleMouseUp() {
        this.removeListeners()
      },
      removeListeners() {
        document.removeEventListener('mousemove', this.handleMouseMove)
        document.removeEventListener('mouseup', this.handleMouseUp)
      }
    }
  }
</script>

<style scoped>
  .column-resize-handle {
    position: absolute;
    top: 0;
    right: -5px;
    z-index: 1;
    width: 10px;
    height: 100%;
    cursor: col-resize;
    user-select: none;
  }
</style>
