<template>
  <a-modal
    title="选择商品"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="确定">
    <div style="display: flex; gap: 16px; height: 500px;">
      <!-- 左侧：商品类别树 -->
      <div style="width: 250px; border: 1px solid #d9d9d9; padding: 8px; overflow-y: auto;">
        <div style="margin-bottom: 8px; font-weight: bold; padding: 8px; background: #fafafa;">
          商品类别
        </div>
        <a-tree
          :treeData="categoryTreeData"
          :selectedKeys="[selectedCategoryId]"
          @select="onTreeSelect"
          :defaultExpandAll="true">
        </a-tree>
      </div>

      <!-- 右侧：商品列表 -->
      <div style="flex: 1; display: flex; flex-direction: column;">
        <!-- 搜索区域 -->
        <a-row :gutter="16" style="margin-bottom: 16px">
          <a-col :span="16">
            <a-input
              placeholder="请输入商品名称搜索"
              v-model="searchName"
              @pressEnter="loadMaterialList"
              allowClear>
            </a-input>
          </a-col>
          <a-col :span="8">
            <a-button type="primary" @click="loadMaterialList" icon="search">查询</a-button>
            <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
          </a-col>
        </a-row>

        <!-- 商品表格 -->
        <a-table
          :columns="columns"
          :dataSource="materialList"
          :pagination="pagination"
          :loading="loading"
          :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange, type: 'checkbox'}"
          @change="handleTableChange"
          rowKey="id"
          size="middle"
          bordered
          :scroll="{y: 350}">
          <span slot="enabled" slot-scope="enabled">
            <a-tag v-if="enabled" color="green">启用</a-tag>
            <a-tag v-else color="red">禁用</a-tag>
          </span>
        </a-table>
      </div>
    </div>
  </a-modal>
</template>

<script>
import {queryMaterialCategoryTreeList} from '@/api/api'
import {getAction} from '@/api/manage'

export default {
  name: "MaterialSelectModal",
  data() {
    return {
      visible: false,
      confirmLoading: false,
      loading: false,
      categoryTreeData: [],
      materialList: [],
      selectedCategoryId: '',
      searchName: '',
      selectedRowKeys: [],
      selectedRows: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: (total) => `共 ${total} 条`
      },
      columns: [
        {
          title: '商品名称',
          dataIndex: 'name',
          width: '30%'
        },
        {
          title: '商品类别',
          dataIndex: 'categoryName',
          width: '20%'
        },
        {
          title: '规格',
          dataIndex: 'standard',
          width: '15%'
        },
        {
          title: '型号',
          dataIndex: 'model',
          width: '15%'
        },
        {
          title: '状态',
          dataIndex: 'enabled',
          width: '10%',
          scopedSlots: { customRender: 'enabled' }
        }
      ]
    }
  },
  created() {
    this.loadMaterialCategoryList();
  },
  methods: {
    show(alreadySelectedIds = []) {
      this.visible = true;
      this.selectedRowKeys = [...alreadySelectedIds];
      this.selectedRows = [];
      this.resetSearch();
      this.loadMaterialList();
    },
    loadMaterialCategoryList() {
      queryMaterialCategoryTreeList({id: ''}).then((res) => {
        if (res) {
          // 添加"全部"节点
          this.categoryTreeData = [
            {
              id: '',
              key: '',
              title: '全部商品',
              children: this.buildTreeData(res)
            }
          ];
        }
      });
    },
    buildTreeData(tree) {
      return tree.map(node => ({
        id: node.id,
        key: node.id,
        title: node.title,
        children: node.children && node.children.length > 0 ? this.buildTreeData(node.children) : []
      }));
    },
    onTreeSelect(selectedKeys) {
      if (selectedKeys.length > 0) {
        this.selectedCategoryId = selectedKeys[0];
      } else {
        this.selectedCategoryId = '';
      }
      this.pagination.current = 1;
      this.loadMaterialList();
    },
    loadMaterialList() {
      this.loading = true;
      const params = {
        currentPage: this.pagination.current,
        pageSize: this.pagination.pageSize
      };

      // 构建 JSON 格式的 search 参数
      let searchObj = {};
      if (this.selectedCategoryId) {
        searchObj.categoryId = this.selectedCategoryId;
      }
      if (this.searchName) {
        searchObj.name = this.searchName;
      }
      if (Object.keys(searchObj).length > 0) {
        params.search = JSON.stringify(searchObj);
      }

      getAction("/material/list", params).then((res) => {
        if (res.code === 200) {
          this.materialList = res.data.rows || [];
          this.pagination.total = res.data.total || 0;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.loadMaterialList();
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = selectedRows;
    },
    resetSearch() {
      this.selectedCategoryId = '';
      this.searchName = '';
      this.pagination.current = 1;
      this.loadMaterialList();
    },
    handleOk() {
      // 获取所有已选商品的完整信息
      const allSelectedMaterials = [];

      // 从当前页面的selectedRows获取
      this.selectedRows.forEach(row => {
        if (!allSelectedMaterials.find(m => m.id === row.id)) {
          allSelectedMaterials.push({
            id: row.id,
            name: row.name,
            categoryName: row.categoryName,
            standard: row.standard,
            model: row.model,
            commodityDecimal: row.commodityDecimal,
            quantity: 1
          });
        }
      });

      // 如果有之前选中但不在当前页的，需要额外获取
      const missingIds = this.selectedRowKeys.filter(id =>
        !allSelectedMaterials.find(m => m.id === id)
      );

      if (missingIds.length > 0) {
        // 批量获取缺失的商品信息
        getAction("/material/list", {}).then((res) => {
          if (res.code === 200) {
            const allMaterials = res.data.rows || [];
            missingIds.forEach(id => {
              const material = allMaterials.find(m => m.id === id);
              if (material) {
                allSelectedMaterials.push({
                  id: material.id,
                  name: material.name,
                  categoryName: material.categoryName,
                  standard: material.standard,
                  model: material.model,
                  commodityDecimal: material.commodityDecimal,
                  quantity: 1
                });
              }
            });
            this.$emit('ok', allSelectedMaterials);
            this.handleCancel();
          }
        });
      } else {
        this.$emit('ok', allSelectedMaterials);
        this.handleCancel();
      }
    },
    handleCancel() {
      this.visible = false;
      this.selectedRowKeys = [];
      this.selectedRows = [];
    }
  }
}
</script>

<style scoped>
</style>
