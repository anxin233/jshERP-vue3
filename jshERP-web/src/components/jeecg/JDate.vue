<template>
  <a-date-picker
    :disabled="disabled || readOnly"
    :placeholder="placeholder"
    @change="handleDateChange"
    :value="momVal"
    :showTime="showTime"
    :format="dateFormat"
    :getPopupContainer="getPopupContainer"
    style="width:100%"
  />
</template>
<script>
  import dayjs from 'dayjs'
  import customParseFormat from 'dayjs/plugin/customParseFormat'

  dayjs.extend(customParseFormat)

  export default {
    name: 'JDate',
    props: {
      placeholder:{
        type: String,
        default: '',
        required: false
      },
      value:{
        type: [String, Object],
        required: false
      },
      modelValue:{
        type: [String, Object],
        required: false
      },
      dateFormat:{
        type: String,
        default: 'YYYY-MM-DD HH:mm:ss',
        required: false
      },
      //此属性可以被废弃了
      triggerChange:{
        type: Boolean,
        required: false,
        default: false
      },
      readOnly:{
        type: Boolean,
        required: false,
        default: false
      },
      disabled:{
        type: Boolean,
        required: false,
        default: false
      },
      showTime:{
        type: Boolean,
        required: false,
        default: false
      },
      getPopupContainer: {
        type: Function,
        default: (node) => node.parentNode
      }
    },
    data () {
      return {
        decorator:"",
        momVal: this.toDayjs(this.modelValue !== undefined ? this.modelValue : this.value)
      }
    },
    watch: {
      value (val) {
        if (this.modelValue === undefined) {
          this.momVal = this.toDayjs(val)
        }
      },
      modelValue (val) {
        this.momVal = this.toDayjs(val)
      }
    },
    methods: {
      dayjs,
      toDayjs(val) {
        if (!val) {
          return null
        }
        if (dayjs.isDayjs(val)) {
          return val
        }
        if (val && typeof val.valueOf === 'function' && (val._isAMomentObject || val._isAMomentObject === true)) {
          return dayjs(val.valueOf())
        }
        if (val instanceof Date) {
          return dayjs(val)
        }
        if (typeof val === 'string') {
          const parsed = dayjs(val, this.dateFormat, true)
          return parsed.isValid() ? parsed : dayjs(val)
        }
        return val
      },
      handleDateChange(mom,dateStr){
        this.momVal = mom
        this.$emit('change', dateStr)
        this.$emit('input', dateStr)
        this.$emit('update:value', dateStr)
        this.$emit('update:modelValue', dateStr)
      }
    }
  }
</script>
