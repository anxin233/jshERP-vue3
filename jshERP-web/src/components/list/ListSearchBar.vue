<template>
  <div class="table-page-search-wrapper list-search-bar">
    <a-form layout="horizontal" @keyup.enter="onSearch">
      <slot />
      <div v-if="$slots.actions" class="list-search-bar__actions table-page-search-submitButtons">
        <slot name="actions" />
      </div>
    </a-form>
  </div>
</template>

<script>
/**
 * 列表搜索区统一容器（文档 24 阶段 3）
 * - 统一 horizontal 表单布局，避免 inline + 栅格 + labelCol 三套叠加
 * - 查询/重置放在 #actions 插槽
 * - 不改动业务 queryParam / searchQuery 逻辑
 */
export default {
  name: 'ListSearchBar',
  emits: ['search'],
  methods: {
    onSearch () {
      this.$emit('search')
    }
  }
}
</script>

<style lang="less">
.list-search-bar {
  .list-search-bar__actions {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    min-height: 32px;
  }

  /* 组件根下明确规则，减少对全局 !important 的依赖 */
  .ant-form-item {
    margin-bottom: 12px;
  }

  .ant-form-item-label {
    width: var(--jsh-search-label-width, 82px);
    max-width: var(--jsh-search-label-width, 82px);
    text-align: right;
  }

  .ant-input,
  .ant-input-number,
  .ant-select,
  .ant-picker {
    width: 100%;
  }
}
</style>
