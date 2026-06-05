<template>
  <j-modal
    :title="title"
    :width="width"
    :open="visible"
    :maskClosable="false"
    :forceRender="true"
    :style="modalStyle"
    fullscreen
    switchFullscreen
    @cancel="handleCancel"
    wrapClassName="ant-modal-cust-warp">
    <template #footer>
      <a-button key="back" @click="handleCancel">取消(ESC)</a-button>
    </template>
    <a-form>
      <template>
        <iframe :src="billPrintUrl" :height="height" style="width: 100%; border: none;"></iframe>
      </template>
      <template>
        <a-row>
          <a-col>
            <a-form-item>
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </a-form>
  </j-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import {mixinDevice} from '@/utils/mixin'
  export default {
    name: 'BillPrintProIframe',
    mixins: [mixinDevice],
    data () {
      return {
        title: "三联打印预览",
        width: '1500px',
        visible: false,
        modalStyle: '',
        billPrintUrl: '',
        height: "",
        model: {},
        loading: false
      }
    },
    created () {
    },
    methods: {
      show(record, billPrintUrl, billPrintHeight) {
        this.height = billPrintHeight
        this.billPrintUrl = billPrintUrl
        this.visible = true
        this.modalStyle = 'top:20px;height: 95%;'
        this.model = Object.assign({}, record)
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'id'))
        });
      },
      handleCancel() {
        this.close()
      },
      close() {
        this.billPrintUrl = ''
        this.$emit('close')
        this.visible = false
        this.modalStyle = ''
      }
    }
  }
</script>

<style scoped>

</style>