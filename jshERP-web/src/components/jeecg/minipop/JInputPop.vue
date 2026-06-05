<template>
  <a-popover trigger="contextmenu" v-model:open="visible" :placement="position">
    <!--"(node) => node.parentNode.parentNode"-->
    <template #title><div>
      <span>{{ title }}</span>
      <span style="float: right" title="关闭">
        <legacy-icon type="close" @click="visible=false"/>
      </span>
    </div></template>
    <a-input :value="inputContent" @change="handleInputChange" :placeholder="placeholder">
      <template #suffix><legacy-icon type="fullscreen" @click.stop="pop" /></template>
    </a-input>
    <template #content><div>
      <textarea :value="inputContent" @input="handleInputChange" :placeholder="placeholder" :style="{ height: height + 'px', width: width + 'px' }"></textarea>
    </div></template>
  </a-popover>
</template>

<script>
  export default {
    name: 'JInputPop',
    props:{
      title:{
        type:String,
        default:'',
        required:false
      },
      position:{
        type:String,
        default:'right',
        required:false
      },
      height:{
        type:Number,
        default:200,
        required:false
      },
      width:{
        type:Number,
        default:150,
        required:false
      },
      value:{
        type:String,
        required:false
      },
      popContainer:{
        type:String,
        default:'',
        required:false
      },
      placeholder:{
        type:String,
        required:false
      },
    },
    data(){
      return {
        visible:false,
        inputContent:''

      }
    },

    watch:{
      value:{
        immediate:true,
        handler:function(){
          if(this.value && this.value.length>0){
            this.inputContent = this.value;
          }
        }
      },
    },
    methods:{
      handleInputChange(event){
        this.inputContent = event.target.value
        this.$emit('change', this.inputContent)
        this.$emit('input', this.inputContent)
        this.$emit('update:value', this.inputContent)
        this.$emit('update:modelValue', this.inputContent)
      },
      pop(){
        this.visible=true
      },
      getPopupContainer(node){
        if(!this.popContainer){
          return node.parentNode
        }else{
          return document.getElementById(this.popContainer)
        }

      }
    }
  }
</script>

<style scoped>

</style>