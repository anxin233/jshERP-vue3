<template>
  <a-checkbox-group :options="options" :value="checkboxArray" v-bind="$attrs" @change="onChange" />
</template>

<script>
  export default {
    name: 'JCheckbox',
    props: {
      value:{
        type: String,
        required: false
      },
      /*label value*/
      options:{
        type: Array,
        required: true
      }
    },
    data(){
      return {
        checkboxArray:!this.value?[]:this.value.split(",")
      }
    },
    watch:{
      value (val) {
        if(!val){
          this.checkboxArray = []
        }else{
          this.checkboxArray = this.value.split(",")
        }
      }
    },
    methods:{
      onChange (checkedValues) {
        const value = checkedValues.join(",")
        this.$emit('change', value)
        this.$emit('input', value)
        this.$emit('update:value', value)
        this.$emit('update:modelValue', value)
      },
    }
  }
</script>
