<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="width"
      :open="visible"
      :getContainer="() => $refs.container"
      :maskStyle="{'top':'93px','left':'154px'}"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      :style="modalStyle"
      @cancel="handleCancel"
      cancelText="关闭">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消(ESC)</a-button>
      </template>
      <a-form>
        <template>
          <iframe :src="billPrintUrl" width="100%" :height="height" frameborder="0" scrolling="no"></iframe>
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
    </a-modal>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import {mixinDevice} from '@/utils/mixin'
  export default {
    name: 'BillPrintIframe',
    mixins: [mixinDevice],
    data () {
      return {
        title: "三联打印预览",
        width: '1000px',
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