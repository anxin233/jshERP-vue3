<template>
  <tooltip v-if="tips !== ''">
    <template #title>{{ tips }}</template>
    <avatar :size="avatarSize" :src="src" />
  </tooltip>
  <avatar v-else :size="avatarSize" :src="src" />
</template>

<script>
  import Avatar from 'ant-design-vue/es/avatar'
  import Tooltip from 'ant-design-vue/es/tooltip'

  export default {
    name: "AvatarItem",
    components: {
      Avatar,
      Tooltip
    },
    props: {
      tips: {
        type: String,
        default: '',
        required: false
      },
      src: {
        type: String,
        default: ''
      }
    },
    inject: {
      avatarListSize: {
        default: 'default'
      }
    },
    computed: {
      avatarSize () {
        const size = this.avatarListSize && this.avatarListSize.value !== undefined
          ? this.avatarListSize.value
          : this.avatarListSize
        return size !== 'mini' && size || 20
      }
    }
  }
</script>
