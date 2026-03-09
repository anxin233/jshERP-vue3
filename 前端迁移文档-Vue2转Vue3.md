# jshERP 前端重构迁移文档

# Vue 2 → Vue 3 全面迁移方案

---

## 一、项目背景

### 1.1 现有项目概况

| 项目 | 说明 |
|------|------|
| 项目名 | jshERP-web（管伊佳ERP前端） |
| 框架 | Vue 2.7.16 + Ant Design Vue 1.5.2 |
| 状态管理 | Vuex 3.1.0 |
| 路由 | Vue Router 3.0.1 |
| 构建 | Webpack（Vue CLI 3.3.0） |
| 样式 | Less 3.9 |
| 图表 | Viser Vue 2.4.4（基于 AntV） |
| 模板框架 | Jeecg-Boot 2.2.0 |

### 1.2 现有项目规模统计

| 类别 | 数量 | 说明 |
|------|------|------|
| 页面视图组件 | 145 个 | 分布在 8 个业务模块 |
| 可复用组件 | 110 个 | jeecg/chart/layouts/page/table/tools 等 |
| API 端点 | 100+ 个 | 集中在 api.js 和 manage.js |
| Vuex 模块 | 4 个 | app / user / permission / enhance |
| Mixin 文件 | 8 个 | JeecgListMixin / JEditableTableMixin / BillListMixin / BillModalMixin 等 |
| 工具函数文件 | 18 个 | util.js 最核心（733行） |
| 样式文件 | 11 个 | Less 为主 |

### 1.3 迁移目标

- 使用 Vue 3 现代化技术栈完全重建前端
- **功能与现有前端 100% 一致**
- **复用全部现有后端 API 接口**，后端零改动
- 项目结构优秀，可扩展性强

---

## 二、目标技术栈

| 类别 | 技术 | 版本 | 替代原有 | 选型理由 |
|------|------|------|---------|---------|
| 核心框架 | Vue 3 (`<script setup>` + Composition API) | ^3.4 | Vue 2.7 | 更好的 TS 支持、性能提升、Composition API |
| 构建工具 | Vite | ^5.4 | Webpack (Vue CLI 3) | 冷启动快 10x+、HMR 即时、原生 ESM |
| UI 框架 | Element Plus | ^2.8 | Ant Design Vue 1.5 | Vue 3 生态最成熟的 UI 库、文档完善 |
| 图标 | @element-plus/icons-vue | ^2.3 | a-icon | Element Plus 配套 |
| 状态管理 | Pinia | ^2.2 | Vuex 3 | Vue 3 官方推荐、更简洁的 API、完整 TS 支持 |
| 路由 | Vue Router 4 | ^4.4 | Vue Router 3 | Vue 3 配套版本 |
| TypeScript | TypeScript | ^5.5 | 无 | 类型安全、IDE 智能提示、减少运行时错误 |
| HTTP | Axios | ^1.7 | Axios 0.18 | 修复安全漏洞、更好的 TS 类型 |
| 图表 | ECharts 5 + vue-echarts | ^5.5 / ^7.0 | Viser Vue (AntV) | 社区更活跃、功能更强大、文档更丰富 |
| 日期 | Day.js | ^1.11 | Moment.js | 体积仅 2KB（moment 230KB）、API 兼容 |
| 工具库 | @vueuse/core | ^11.0 | vue-ls / enquire.js | 200+ 组合式工具函数、替代多个小库 |
| 样式 | SCSS + CSS Variables | - | Less | 更强大的功能、与 Element Plus 一致 |
| 拖拽 | vuedraggable 4 | ^4.1 | vuedraggable 2 | Vue 3 兼容版 |
| 打印 | vue3-print-nb | ^0.1 | vue-print-nb-jeecg | Vue 3 兼容版 |
| 图片预览 | viewerjs | ^1.11 | vue-photo-preview | 无框架依赖、功能更强 |
| 代码编辑 | vue-codemirror 6 | ^6.1 | codemirror 5 | Vue 3 兼容、CodeMirror 6 架构 |
| 加密 | crypto-js | ^4.2 | 自定义 AES | 标准库、维护更好 |
| 进度条 | nprogress | ^0.2 | nprogress | 保持不变 |
| 事件总线 | mitt | ^3.0 | Vue.prototype.$bus | Vue 3 推荐方案，体积仅 200B |
| 代码质量 | ESLint 9 + Prettier 3 | ^9 / ^3 | ESLint 5 | Flat Config、更好的 Vue 3 支持 |
| 按需引入 | unplugin-vue-components + unplugin-auto-import | - | 无 | 自动导入 Element Plus 组件和 API |

---

## 三、项目目录结构

```
jshERP-web-v3/
├── index.html                         # HTML 入口
├── vite.config.ts                     # Vite 配置（代理/别名/gzip/按需引入）
├── tsconfig.json                      # TypeScript 配置
├── tsconfig.app.json                  # 应用 TS 配置
├── tsconfig.node.json                 # Node TS 配置
├── .env.development                   # 开发环境变量 VITE_API_BASE_URL=/jshERP-boot
├── .env.production                    # 生产环境变量
├── .eslintrc.cjs                      # ESLint 配置
├── .prettierrc.json                   # Prettier 配置
├── postcss.config.js                  # PostCSS 配置
├── public/
│   ├── favicon.ico
│   └── static/                        # 静态资源（截图等）
│
└── src/
    ├── main.ts                        # 应用入口
    ├── App.vue                        # 根组件
    ├── env.d.ts                       # 环境变量类型声明
    │
    ├── types/                         # ★ TypeScript 类型定义
    │   ├── api.d.ts                   #   API 请求/响应通用类型
    │   ├── router.d.ts                #   路由 meta 类型扩展
    │   ├── bill.d.ts                  #   单据业务类型
    │   ├── material.d.ts              #   商品业务类型
    │   ├── financial.d.ts             #   财务业务类型
    │   └── system.d.ts                #   系统管理业务类型
    │
    ├── styles/                        # ★ 全局样式（SCSS 替代 Less）
    │   ├── variables.scss             #   SCSS 变量（主题色/间距/圆角等）
    │   ├── element-override.scss      #   Element Plus 主题覆盖
    │   ├── global.scss                #   全局通用样式
    │   └── transition.scss            #   过渡动画定义
    │
    ├── router/                        # ★ 路由系统
    │   ├── index.ts                   #   Router 实例创建
    │   ├── constants.ts               #   静态路由定义（login/register/404）
    │   ├── guard.ts                   #   路由守卫（替代 permission.js）
    │   └── helper.ts                  #   动态路由生成器（import.meta.glob）
    │
    ├── stores/                        # ★ Pinia 状态管理（替代 Vuex）
    │   ├── app.ts                     #   应用配置（主题/布局/侧边栏/多页签模式）
    │   ├── user.ts                    #   用户认证（Token/登录/登出/权限菜单/按钮权限）
    │   ├── permission.ts              #   动态路由管理（生成/过滤/添加）
    │   ├── tab.ts                     #   多页签状态（新增，从 TabLayout 提取）
    │   └── enhance.ts                 #   JS 增强（保留原有逻辑）
    │
    ├── api/                           # ★ API 层（按业务模块拆分，原 5 个文件 → 8 个）
    │   ├── http.ts                    #   Axios 实例 + 请求/响应拦截器
    │   ├── auth.ts                    #   认证接口（login/logout/randomImage）
    │   ├── bill.ts                    #   单据接口（depotHead/depotItem 相关）
    │   ├── material.ts                #   商品接口（material/materialCategory 等）
    │   ├── financial.ts               #   财务接口（accountHead/accountItem 等）
    │   ├── report.ts                  #   报表接口（统计/汇总查询）
    │   ├── system.ts                  #   系统管理接口（user/role/function/org 等）
    │   └── common.ts                  #   公共接口（文件上传/下载/导出）
    │
    ├── composables/                   # ★ 组合式函数（替代 Mixin）
    │   ├── useList.ts                 #   列表页通用逻辑（替代 JeecgListMixin）
    │   ├── useEditableTable.ts        #   可编辑表格逻辑（替代 JEditableTableMixin）
    │   ├── useBillList.ts             #   单据列表逻辑（替代 BillListMixin）
    │   ├── useBillModal.ts            #   单据弹窗逻辑（替代 BillModalMixin）
    │   ├── useFinancialList.ts        #   财务列表逻辑
    │   ├── useFinancialModal.ts       #   财务弹窗逻辑
    │   ├── usePermission.ts           #   权限控制（检查按钮/菜单权限）
    │   ├── useDevice.ts               #   设备检测（替代 mixinDevice）
    │   ├── useStorage.ts              #   本地存储（替代 Vue-ls，带过期时间）
    │   └── useEventBus.ts             #   事件总线（mitt 封装，替代 Vue.$bus）
    │
    ├── directives/                    # ★ 自定义指令
    │   ├── index.ts                   #   指令统一注册
    │   └── permission.ts              #   v-has 权限指令
    │
    ├── plugins/                       # ★ 插件配置
    │   └── element.ts                 #   Element Plus 全局配置（中文/大小/z-index）
    │
    ├── utils/                         # ★ 工具函数（TypeScript 重写）
    │   ├── index.ts                   #   通用工具（filterObj/cloneObject/randomUUID 等）
    │   ├── date.ts                    #   日期工具（formatDate/timeFix 等）
    │   ├── validate.ts                #   验证工具（isEmail/isMobile/isURL 等）
    │   ├── auth.ts                    #   Token 读写（getToken/setToken/removeToken）
    │   ├── storage.ts                 #   localStorage 封装（带过期时间机制）
    │   ├── encryption.ts              #   AES 加密工具
    │   ├── file.ts                    #   文件上传/下载辅助函数
    │   └── constants.ts               #   常量定义（Storage Key / 业务常量）
    │
    ├── components/                    # ★ 全局/通用组件
    │   ├── layouts/                   #   布局组件
    │   │   ├── TabLayout.vue          #     多页签布局（el-tabs + keep-alive + 右键菜单）
    │   │   ├── BasicLayout.vue        #     基础内容布局（过渡动画 + keep-alive）
    │   │   ├── UserLayout.vue         #     登录页布局（品牌信息 + 表单 + 页脚）
    │   │   ├── BlankLayout.vue        #     空白布局（仅 router-view）
    │   │   ├── RouteView.vue          #     路由视图容器（条件 keep-alive）
    │   │   └── IframePageView.vue     #     Iframe 页面容器
    │   │
    │   ├── page/                      #   页面框架组件
    │   │   ├── GlobalLayout.vue       #     全局布局（el-container + el-aside + el-main）
    │   │   ├── GlobalHeader.vue       #     头部导航（Logo + 折叠 + 用户菜单 + 通知）
    │   │   └── GlobalFooter.vue       #     页脚
    │   │
    │   ├── menu/                      #   菜单组件
    │   │   ├── SideMenu.vue           #     侧边菜单（el-menu 递归渲染）
    │   │   └── TabContextMenu.vue     #     多页签右键菜单
    │   │
    │   ├── table/                     #   表格增强组件
    │   │   ├── ProTable.vue           #     ★ 增强表格（兼容 columns 配置式 + 分页 + 选择 + 排序 + 合计）
    │   │   └── EditableTable.vue      #     ★ 可编辑表格（替代 JEditableTable）
    │   │
    │   ├── form/                      #   表单增强组件
    │   │   ├── CategorySelect.vue     #     分类树选择（替代 JCategorySelect）
    │   │   ├── TreeSelect.vue         #     通用树选择（替代 JTreeSelect）
    │   │   ├── ImageUpload.vue        #     图片上传（替代 JImageUpload）
    │   │   ├── FileUpload.vue         #     文件上传（替代 JUpload）
    │   │   └── GraphicCode.vue        #     图形验证码（替代 JGraphicCode）
    │   │
    │   ├── chart/                     #   图表组件（ECharts 5 重写）
    │   │   ├── BarChart.vue           #     柱状图
    │   │   ├── LineChart.vue          #     折线图
    │   │   ├── PieChart.vue           #     饼图
    │   │   └── StatCard.vue           #     统计卡片（替代 ChartCard）
    │   │
    │   └── common/                    #   通用小组件
    │       ├── Ellipsis.vue           #     文本溢出省略
    │       ├── SvgIcon.vue            #     SVG 图标
    │       ├── HeaderNotice.vue       #     头部通知
    │       └── ImportFileModal.vue    #     文件导入弹窗
    │
    └── views/                         # ★ 页面视图（保持原目录结构，兼容后端菜单配置）
        │
        ├── dashboard/                 #   仪表盘模块
        │   ├── Analysis.vue           #     首页数据分析
        │   └── IndexChart.vue         #     首页图表
        │
        ├── bill/                      #   单据模块（14 种单据）
        │   ├── SaleOutList.vue        #     销售出库列表
        │   ├── SaleBackList.vue       #     销售退货列表
        │   ├── SaleOrderList.vue      #     销售订单列表
        │   ├── PurchaseInList.vue     #     采购入库列表
        │   ├── PurchaseBackList.vue   #     采购退货列表
        │   ├── PurchaseOrderList.vue  #     采购订单列表
        │   ├── PurchaseApplyList.vue  #     采购申请列表
        │   ├── RetailOutList.vue      #     零售出库列表
        │   ├── RetailBackList.vue     #     零售退货列表
        │   ├── AllocationOutList.vue  #     调拨出库列表
        │   ├── OtherInList.vue        #     其他入库列表
        │   ├── OtherOutList.vue       #     其他出库列表
        │   ├── AssembleList.vue       #     组装单列表
        │   ├── DisassembleList.vue    #     拆卖单列表
        │   └── components/            #     单据子组件（24 个 Modal + 9 个 Dialog）
        │       ├── SaleOutModal.vue
        │       ├── SaleBackModal.vue
        │       ├── SaleOrderModal.vue
        │       ├── PurchaseInModal.vue
        │       ├── PurchaseBackModal.vue
        │       ├── PurchaseOrderModal.vue
        │       ├── PurchaseApplyModal.vue
        │       ├── RetailOutModal.vue
        │       ├── RetailBackModal.vue
        │       ├── AllocationOutModal.vue
        │       ├── OtherInModal.vue
        │       ├── OtherOutModal.vue
        │       ├── AssembleModal.vue
        │       ├── DisassembleModal.vue
        │       ├── BillDetail.vue
        │       ├── HistoryBillList.vue
        │       ├── WaitBillList.vue
        │       ├── LinkBillList.vue
        │       ├── BatchSetDepot.vue
        │       ├── ImportItemModal.vue
        │       ├── ManyAccountModal.vue
        │       ├── BatchWaitBillList.vue
        │       ├── BillPrintIframe.vue
        │       └── BillPrintProIframe.vue
        │
        ├── material/                  #   商品模块
        │   ├── MaterialList.vue       #     商品列表
        │   ├── MaterialCategoryList.vue  #  商品分类列表
        │   ├── MaterialAttributeList.vue #  商品属性列表
        │   ├── MaterialPropertyList.vue  #  商品特性列表
        │   └── components/            #     商品子组件（7 个 Modal）
        │       ├── MaterialModal.vue
        │       ├── MaterialCategoryModal.vue
        │       ├── MaterialAttributeModal.vue
        │       ├── MaterialPropertyModal.vue
        │       ├── BatchSetInfoModal.vue
        │       ├── BatchSetPriceModal.vue
        │       └── BatchSetStockModal.vue
        │
        ├── financial/                 #   财务模块
        │   ├── MoneyInList.vue        #     收款单列表
        │   ├── MoneyOutList.vue       #     付款单列表
        │   ├── AdvanceInList.vue      #     预收款列表
        │   ├── ItemInList.vue         #     收入列表
        │   ├── ItemOutList.vue        #     支出列表
        │   ├── GiroList.vue           #     转账单列表
        │   └── components/            #     财务子组件（6 个 Modal + 3 个 Dialog）
        │       ├── MoneyInModal.vue
        │       ├── MoneyOutModal.vue
        │       ├── AdvanceInModal.vue
        │       ├── ItemInModal.vue
        │       ├── ItemOutModal.vue
        │       ├── GiroModal.vue
        │       ├── FinancialDetail.vue
        │       ├── DebtBillList.vue
        │       └── WaitNeedList.vue
        │
        ├── report/                    #   报表模块
        │   ├── MaterialStock.vue      #     库存报表
        │   ├── StockWarningReport.vue #     库存预警
        │   ├── InOutStockReport.vue   #     进销存报表
        │   ├── InDetail.vue           #     入库明细
        │   ├── OutDetail.vue          #     出库明细
        │   ├── InMaterialCount.vue    #     入库汇总
        │   ├── OutMaterialCount.vue   #     出库汇总
        │   ├── SaleOutReport.vue      #     销售出库报表
        │   ├── RetailOutReport.vue    #     零售出库报表
        │   ├── BuyInReport.vue        #     采购入库报表
        │   ├── AllocationDetail.vue   #     调拨明细
        │   ├── AccountReport.vue      #     账户统计
        │   ├── CustomerAccount.vue    #     客户对账
        │   ├── VendorAccount.vue      #     供应商对账
        │   └── components/            #     报表子组件（6 个）
        │       ├── MaterialDepotStockList.vue
        │       ├── MaterialDepotStockListWithTime.vue
        │       ├── MaterialInOutList.vue
        │       ├── AccountInOutList.vue
        │       ├── DebtAccountList.vue
        │       └── HistoryFinancialList.vue
        │
        ├── system/                    #   系统管理模块
        │   ├── UserList.vue           #     用户管理
        │   ├── RoleList.vue           #     角色管理
        │   ├── FunctionList.vue       #     功能权限
        │   ├── OrganizationList.vue   #     机构管理
        │   ├── PersonList.vue         #     经手人管理
        │   ├── MemberList.vue         #     会员管理
        │   ├── CustomerList.vue       #     客户管理
        │   ├── VendorList.vue         #     供应商管理
        │   ├── DepotList.vue          #     仓库管理
        │   ├── AccountList.vue        #     账户管理
        │   ├── InOutItemList.vue      #     收支项目
        │   ├── UnitList.vue           #     计量单位
        │   ├── SystemConfigList.vue   #     系统配置
        │   ├── PlatformConfigList.vue #     平台配置
        │   ├── PluginList.vue         #     插件管理
        │   ├── TenantList.vue         #     租户管理
        │   ├── LogList.vue            #     操作日志
        │   ├── MsgList.vue            #     消息管理
        │   └── components/            #     系统子组件（26 个 Modal）
        │       ├── UserModal.vue
        │       ├── RoleModal.vue
        │       ├── RoleFunctionModal.vue
        │       ├── RolePushBtnModal.vue
        │       ├── FunctionModal.vue
        │       ├── FunctionTreeModal.vue
        │       ├── OrganizationModal.vue
        │       ├── PersonModal.vue
        │       ├── MemberModal.vue
        │       ├── CustomerModal.vue
        │       ├── VendorModal.vue
        │       ├── DepotModal.vue
        │       ├── AccountModal.vue
        │       ├── InOutItemModal.vue
        │       ├── UnitModal.vue
        │       ├── PlatformConfigModal.vue
        │       ├── PluginModal.vue
        │       ├── PluginAppModal.vue
        │       ├── TenantModal.vue
        │       ├── UserResetModal.vue
        │       ├── UserCustomerModal.vue
        │       ├── UserDepotModal.vue
        │       ├── CustomerUserModal.vue
        │       └── DepotUserModal.vue
        │
        ├── user/                      #   用户认证模块
        │   ├── Login.vue              #     登录页
        │   └── Register.vue           #     注册页
        │
        └── exception/                 #   异常页面
            ├── 403.vue
            ├── 404.vue
            └── 500.vue
```

---

## 四、核心组件映射表（Ant Design Vue → Element Plus）

### 4.1 布局组件

| Ant Design Vue | Element Plus | 迁移要点 |
|---|---|---|
| `a-layout` + `a-layout-sider` + `a-layout-content` | `el-container` + `el-aside` + `el-main` | 结构一致，属性名不同 |
| `a-row` / `a-col` | `el-row` / `el-col` | 栅格系统一致，`gutter` → `gutter` |
| `a-card` | `el-card` | 直接替换 |
| `a-tabs` / `a-tab-pane` | `el-tabs` / `el-tab-pane` | `activeKey` → `v-model` |
| `a-divider` | `el-divider` | 直接替换 |

### 4.2 表单组件

| Ant Design Vue | Element Plus | 迁移要点 |
|---|---|---|
| `a-form` + `v-decorator` | `el-form` + `v-model` + `:rules` | **最大改动**：AntD 用 `v-decorator` 做表单绑定和校验，Element Plus 用 `v-model` 绑定 + `rules` 校验 |
| `a-form-item` (labelCol/wrapperCol) | `el-form-item` (label-width) | 布局方式不同：栅格 → 固定宽度 |
| `a-input` | `el-input` | 直接替换 |
| `a-input-password` | `el-input type="password" show-password` | 直接替换 |
| `a-input-number` | `el-input-number` | 直接替换 |
| `a-input-search` | `el-input` + 搜索 suffix 图标 | 需手动组合 |
| `a-textarea` | `el-input type="textarea"` | 直接替换 |
| `a-select` + `a-select-option` | `el-select` + `el-option` | `showSearch` → `filterable`；`optionFilterProp` → `filterable` |
| `a-date-picker` | `el-date-picker` | 直接替换，dayjs 替代 moment |
| `a-range-picker` | `el-date-picker type="daterange"` | 两个组件合一 |
| `a-checkbox` / `a-checkbox-group` | `el-checkbox` / `el-checkbox-group` | 直接替换 |
| `a-radio` / `a-radio-group` | `el-radio` / `el-radio-group` | 直接替换 |
| `a-switch` | `el-switch` | 直接替换 |
| `a-cascader` | `el-cascader` | 直接替换 |
| `a-tree-select` | `el-tree-select` | Element Plus 2.x 内置此组件 |
| `a-upload` | `el-upload` | 事件名和插槽有差异，需逐个调整 |
| `a-auto-complete` | `el-autocomplete` | 直接替换 |

### 4.3 数据展示

| Ant Design Vue | Element Plus | 迁移要点 |
|---|---|---|
| `a-table` (columns + dataSource) | **ProTable 封装**（内部 el-table） | ★ 核心：保持 columns 配置式，减少 100+ 页面改动 |
| `a-pagination` | `el-pagination` | 事件名：`change` → `current-change`，`showSizeChange` → `size-change` |
| `a-tree` | `el-tree` | API 基本一致 |
| `a-tag` | `el-tag` | 直接替换 |
| `a-badge` | `el-badge` | 直接替换 |
| `a-tooltip` | `el-tooltip` | 直接替换 |
| `a-popover` | `el-popover` | 直接替换 |
| `a-popconfirm` | `el-popconfirm` | 直接替换 |
| `a-collapse` | `el-collapse` | 直接替换 |
| `a-descriptions` | `el-descriptions` | 直接替换 |
| `a-empty` | `el-empty` | 直接替换 |

### 4.4 反馈组件

| Ant Design Vue | Element Plus | 迁移要点 |
|---|---|---|
| `a-modal` | `el-dialog` | `visible` → `v-model`；footer 用 `#footer` 插槽 |
| `a-drawer` | `el-drawer` | 直接替换 |
| `a-spin` | `v-loading` 指令 | 组件式 → 指令式 |
| `this.$message.success/warning/error` | `ElMessage.success/warning/error` | 需从 element-plus 导入 |
| `this.$confirm({...})` | `ElMessageBox.confirm(msg, title, options)` | API 参数结构完全不同 |
| `this.$notification.error` | `ElNotification.error` | 需从 element-plus 导入 |
| `a-alert` | `el-alert` | 直接替换 |
| `a-progress` | `el-progress` | 直接替换 |

### 4.5 导航组件

| Ant Design Vue | Element Plus | 迁移要点 |
|---|---|---|
| `a-menu` / `a-sub-menu` / `a-menu-item` | `el-menu` / `el-sub-menu` / `el-menu-item` | 基本一致 |
| `a-breadcrumb` / `a-breadcrumb-item` | `el-breadcrumb` / `el-breadcrumb-item` | 直接替换 |
| `a-dropdown` | `el-dropdown` | 直接替换 |
| `a-steps` | `el-steps` | 直接替换 |

### 4.6 特殊处理项

| 原有用法 | 新方案 | 说明 |
|---|---|---|
| `a-config-provider :locale="zh_CN"` | `app.use(ElementPlus, { locale: zhCn })` | 全局配置中文 |
| `a-icon type="xxx"` | `<el-icon><XxxIcon /></el-icon>` | 图标改为组件式引入 |
| `v-decorator="['field', {rules}]"` | `v-model="form.field"` + `:rules` | 表单绑定机制彻底改变 |
| `this.$form.createForm(this)` | 删除，使用 `reactive({})` | Vue 3 响应式替代 |
| `scopedSlots: { customRender: 'xxx' }` | `<template #xxx="scope">` | Vue 3 插槽语法 |
| `slot="xxx"` / `slot-scope="scope"` | `#xxx="scope"` / `v-slot:xxx="scope"` | Vue 3 统一插槽语法 |

---

## 五、Mixin → Composable 迁移对照表

### 5.1 JeecgListMixin → useList

**原文件**：`src/mixins/JeecgListMixin.js`（574 行）
**新文件**：`src/composables/useList.ts`

所有列表页（~100 个）都使用此 Mixin，是迁移工作量最大的单点。

```typescript
// ============ 使用方式对比 ============

// 【Vue 2 原写法】
export default {
  mixins: [JeecgListMixin],
  data() {
    return {
      url: { list: '/depotHead/list', delete: '/depotHead/delete' },
      columns: [...]
    }
  }
}

// 【Vue 3 新写法】
const { loading, dataSource, pagination, selectedRowKeys, loadData, searchQuery, handleDelete, ... } = useList({
  url: { list: '/depotHead/list', delete: '/depotHead/delete' },
  columns: [...]
})
```

**useList 返回值清单**：

| 返回值 | 类型 | 说明 | 对应原 Mixin |
|--------|------|------|-------------|
| loading | `Ref<boolean>` | 加载状态 | data.loading |
| dataSource | `Ref<any[]>` | 表格数据 | data.dataSource |
| queryParam | `Ref<Record<string, any>>` | 查询参数 | data.queryParam |
| pagination | `Ref<PaginationConfig>` | 分页配置 | data.ipagination |
| selectedRowKeys | `Ref<string[]>` | 选中行 key | data.selectedRowKeys |
| selectionRows | `Ref<any[]>` | 选中行数据 | data.selectionRows |
| toggleSearchStatus | `Ref<boolean>` | 查询折叠状态 | data.toggleSearchStatus |
| columns | `Ref<TableColumn[]>` | 列配置 | data.columns |
| btnEnableList | `Ref<string>` | 按钮权限 | data.btnEnableList |
| loadData | `(reset?) => Promise` | 加载数据 | methods.loadData |
| searchQuery | `() => void` | 搜索 | methods.searchQuery |
| searchReset | `() => void` | 重置搜索 | methods.searchReset |
| handleDelete | `(id) => void` | 删除 | methods.handleDelete |
| batchDel | `() => void` | 批量删除 | methods.batchDel |
| handleExportXls | `(fileName) => void` | 导出 Excel | methods.handleExportXls |
| handleTableChange | `(pag, filters, sorter) => void` | 表格变化 | methods.handleTableChange |
| onSelectChange | `(keys, rows) => void` | 选择变化 | methods.onSelectChange |
| handleAdd | `() => void` | 新增 | methods.handleAdd |
| handleEdit | `(record) => void` | 编辑 | methods.handleEdit |
| modalFormOk | `() => void` | 弹窗确认后刷新 | methods.modalFormOk |

### 5.2 JEditableTableMixin → useEditableTable

**原文件**：`src/mixins/JEditableTableMixin.js`
**新文件**：`src/composables/useEditableTable.ts`

### 5.3 BillListMixin → useBillList

**原文件**：`src/views/bill/mixins/BillListMixin.js`（~1000 行）
**新文件**：`src/composables/useBillList.ts`

在 useList 基础上扩展单据特有逻辑：
- 供应商/客户/零售客户下拉数据
- 经手人/账户/仓库/业务员下拉数据
- 审核标志、Excel 预览、关联采购标志
- 待办数量统计
- 展开行加载单据明细

### 5.4 BillModalMixin → useBillModal

**原文件**：`src/views/bill/mixins/BillModalMixin.js`（~1200 行）
**新文件**：`src/composables/useBillModal.ts`

单据弹窗核心逻辑：
- 扫码枪输入处理
- 多账户结算
- 快捷键支持（Enter 保存）
- 单据审核/反审核
- 历史单据查看
- 打印功能
- 关联单据

### 5.5 其他 Mixin 映射

| 原 Mixin | 新 Composable | 说明 |
|----------|--------------|------|
| `mixinDevice` (utils/mixin.js) | `useDevice()` | `isMobile()` / `isDesktop()` |
| `mixin` (utils/mixin.js) | `useLayout()` | mapState 布局配置 |
| `FinancialListMixin` | `useFinancialList()` | 财务列表逻辑 |
| `FinancialModalMixin` | `useFinancialModal()` | 财务弹窗逻辑 |

---

## 六、Vuex → Pinia 迁移对照表

### 6.1 app store

| Vuex (原) | Pinia (新) |
|-----------|-----------|
| `state.sidebar` | `const sidebar = reactive({ opened: true, withoutAnimation: false })` |
| `state.device` | `const device = ref<'desktop' \| 'mobile'>('desktop')` |
| `state.theme` / `layout` / `color` / ... | 同样用 `ref()` |
| `mutation: SET_SIDEBAR_TYPE` | `function toggleSidebar(opened: boolean)` |
| `mutation: TOGGLE_DEVICE` | `function toggleDevice(val)` |
| `action: ToggleSidebar` | 不再需要，直接调用 function |

### 6.2 user store

| Vuex (原) | Pinia (新) |
|-----------|-----------|
| `action: Login(userInfo)` | `async function login(userInfo): Promise<LoginResult>` |
| `action: GetPermissionList()` | `async function getPermissionList(): Promise<any[]>` |
| `action: GetUserBtnList()` | `async function getUserBtnList(): Promise<void>` |
| `action: Logout()` | `async function logout(): Promise<void>` |
| `mutation: SET_TOKEN` | 在 action 内直接 `token.value = val` |
| `getter: token` | 直接访问 `store.token` |

### 6.3 permission store

| Vuex (原) | Pinia (新) |
|-----------|-----------|
| `state.routers` | `const routers = ref<RouteRecordRaw[]>([])` |
| `state.addRouters` | `const addRouters = ref<RouteRecordRaw[]>([])` |
| `action: GenerateRoutes(data)` | `function generateRoutes(menuData): RouteRecordRaw[]` |
| `action: UpdateAppRouter(routes)` | `function setRouters(routes)` |

### 6.4 tab store（新增）

从 TabLayout.vue 中提取的状态，原来直接写在组件 data 中：

```typescript
export const useTabStore = defineStore('tab', () => {
  const pageList = ref<TabPage[]>([])       // 打开的页签列表
  const activePage = ref('')                 // 当前激活页签
  const cachedComponents = ref<string[]>([]) // keep-alive 缓存列表

  function addTab(route) { ... }
  function removeTab(key) { ... }
  function closeLeft(key) { ... }
  function closeRight(key) { ... }
  function closeOthers(key) { ... }
  function updateCachedComponents() { ... }
})
```

### 6.5 组件中使用方式对比

```typescript
// 【Vue 2 原写法】
import { mapGetters, mapActions } from 'vuex'
export default {
  computed: {
    ...mapGetters(['token', 'userInfo', 'permissionList'])
  },
  methods: {
    ...mapActions(['Login', 'Logout'])
  }
}

// 【Vue 3 新写法】
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
// 直接访问: userStore.token / userStore.userInfo
// 直接调用: userStore.login() / userStore.logout()
```

---

## 七、Vue 2 → Vue 3 语法转换速查表

| Vue 2 写法 | Vue 3 写法 | 说明 |
|-----------|-----------|------|
| `data() { return { x: 1 } }` | `const x = ref(1)` 或 `reactive({})` | 响应式数据 |
| `computed: { y() {} }` | `const y = computed(() => {})` | 计算属性 |
| `watch: { x(val) {} }` | `watch(x, (val) => {})` | 侦听器 |
| `methods: { fn() {} }` | `function fn() {}` 或 `const fn = () => {}` | 方法定义 |
| `mounted() {}` | `onMounted(() => {})` | 生命周期 |
| `created() {}` | 直接写在 `<script setup>` 顶层 | setup 本身就是 created |
| `this.$refs.xxx` | `const xxxRef = ref<InstanceType<typeof Xxx>>()` | 模板引用 |
| `this.$emit('event', data)` | `const emit = defineEmits(['event']); emit('event', data)` | 事件发射 |
| `props: { x: String }` | `const props = defineProps<{ x: string }>()` | 属性定义 |
| `this.$store.commit('X', val)` | `const store = useXxxStore(); store.xxx = val` | Store mutation |
| `this.$store.dispatch('X')` | `store.actionName()` | Store action |
| `this.$store.getters.x` | `store.x` | Store getter |
| `this.$message.success('ok')` | `ElMessage.success('ok')` | 消息提示 |
| `this.$confirm({...})` | `ElMessageBox.confirm(msg, title, opts)` | 确认弹窗 |
| `this.$router.push('/path')` | `const router = useRouter(); router.push('/path')` | 路由跳转 |
| `this.$route.path` | `const route = useRoute(); route.path` | 路由信息 |
| `Vue.ls.get(KEY)` | `storage.get(KEY)` | 本地存储 |
| `Vue.ls.set(KEY, val, expire)` | `storage.set(KEY, val, expire)` | 本地存储 |
| `this.$bus.$emit('event')` | `eventBus.emit('event')` | 事件总线 |
| `this.$nextTick(() => {})` | `nextTick(() => {})` | DOM 更新后 |
| `Vue.filter('name', fn)` | 移除，改为工具函数 | Vue 3 不支持 filter |
| `mixins: [XxxMixin]` | `const { ... } = useXxx()` | Mixin → Composable |
| `v-decorator="['field', {rules}]"` | `v-model="form.field"` + form rules | 表单绑定 |
| `slot="xxx"` | `#xxx` | 具名插槽 |
| `slot-scope="scope"` | `#default="scope"` | 作用域插槽 |
| `this.$form.createForm(this)` | 移除，用 `reactive` 对象 | 表单实例 |

---

## 八、关键架构设计决策

### 决策 1：ProTable 封装组件（保持 columns 配置式）

**问题**：原项目 ~100 个列表页都使用 AntD Table 的 `columns` 数组配置方式。Element Plus 的 `el-table` 使用声明式 `<el-table-column>` 标签。

**方案**：封装 `ProTable.vue` 组件，接受 `columns` 数组 prop，内部用 `v-for` 渲染 `el-table-column`，同时集成分页、选择、排序、合计行功能。

**效果**：所有列表页只需将 `<a-table>` 替换为 `<pro-table>`，`columns` 定义几乎不需要修改（仅 `scopedSlots` 语法需调整）。

### 决策 2：保留 `getAction/postAction/putAction/deleteAction` 函数签名

**问题**：原项目 100+ 个 API 调用都使用这些函数名。

**方案**：在 `api/http.ts` 中保留完全相同的函数签名，仅更换内部实现（新版 Axios + TypeScript）。

**效果**：业务代码中的 API 调用零修改，只需更换导入路径 `import { getAction } from '@/api/http'`。

### 决策 3：views/ 目录结构保持不变

**问题**：后端菜单表 `jsh_function` 中的 `component` 字段存储前端组件路径（如 `bill/SaleOutList`），动态路由生成器据此加载组件。

**方案**：views/ 目录结构完全保持一致，仅将子组件文件夹从 `modules` 统一改名为 `components`（Vue 3 社区惯例）。

**效果**：后端数据库零修改，动态路由正常工作。

### 决策 4：TypeScript 渐进式引入

**问题**：原项目为纯 JavaScript，一次性全部转 TypeScript 工作量巨大。

**方案**：
- **严格 TS**：stores / composables / api / utils / types
- **宽松 TS**：views / components（允许 `any`，后续逐步收紧）

### 决策 5：Vite 动态路由使用 `import.meta.glob`

**原有**：Webpack `() => import('@/views/' + path)`
**新方案**：
```typescript
const viewModules = import.meta.glob('../views/**/*.vue')
// 使用时：viewModules[`../views/${path}.vue`]
```

### 决策 6：useStorage 替代 Vue-ls

**问题**：原项目依赖 `Vue.ls` 的过期时间功能（Token 7天过期），直接用 `localStorage` 无法实现。

**方案**：封装 `useStorage` composable，存储时附带 `expireTime` 字段，读取时检查是否过期。

---

## 九、实施阶段与进度估算

### 阶段一：基础框架搭建（3-5 天）
> 目标：项目跑起来，登录流程可用

| # | 任务 | 涉及文件 |
|---|------|---------|
| 1 | 创建 Vite + Vue 3 + TS 项目 | vite.config.ts / tsconfig.json |
| 2 | 安装全部依赖 | package.json |
| 3 | 配置 Element Plus（中文/按需引入/主题） | plugins/element.ts / styles/ |
| 4 | 迁移 utils/ 工具函数 | utils/*.ts |
| 5 | 实现 API 层（Axios 拦截器 + 按模块拆分） | api/*.ts |
| 6 | 实现 Pinia stores | stores/*.ts |
| 7 | 实现路由系统（静态路由 + 守卫 + 动态路由生成器） | router/*.ts |
| 8 | 实现 composables（useStorage / usePermission / useDevice / useEventBus） | composables/*.ts |
| 9 | 实现 v-has 权限指令 | directives/permission.ts |
| 10 | 迁移 Login.vue / Register.vue | views/user/ |
| 11 | 迁移异常页面（403/404/500） | views/exception/ |

### 阶段二：布局框架（3-5 天）
> 目标：登录后看到完整布局，菜单导航可用

| # | 任务 | 涉及文件 |
|---|------|---------|
| 1 | 迁移 UserLayout | components/layouts/UserLayout.vue |
| 2 | 迁移 GlobalLayout | components/page/GlobalLayout.vue |
| 3 | 迁移 GlobalHeader | components/page/GlobalHeader.vue |
| 4 | 迁移 SideMenu（el-menu 递归） | components/menu/SideMenu.vue |
| 5 | 迁移 TabLayout（多页签 + keep-alive） | components/layouts/TabLayout.vue |
| 6 | 迁移 Dashboard/Analysis | views/dashboard/ |

### 阶段三：核心组件 + Composables（5-7 天）
> 目标：所有基础设施就位，可批量迁移业务页面

| # | 任务 | 涉及文件 | 复杂度 |
|---|------|---------|-------|
| 1 | 实现 ProTable 组件 | components/table/ProTable.vue | ★★★ |
| 2 | 实现 EditableTable 组件 | components/table/EditableTable.vue | ★★★★★ |
| 3 | 实现 useList composable | composables/useList.ts | ★★★★ |
| 4 | 实现 useEditableTable composable | composables/useEditableTable.ts | ★★★ |
| 5 | 迁移表单组件（5个） | components/form/ | ★★ |
| 6 | 迁移图表组件（ECharts 重写） | components/chart/ | ★★ |

### 阶段四：系统管理模块（5-7 天）
> 16 个列表 + 26 个 Modal

以 UserList 作为模板验证完整 List + Modal 模式，然后批量迁移其余页面。

### 阶段五：商品模块（2-3 天）
> 4 个列表 + 7 个 Modal

MaterialModal 是最大的 Modal 组件，需要特别关注。

### 阶段六：单据模块（8-12 天，最大工作量）
> 14 种单据 + useBillList / useBillModal composable

先实现 useBillList / useBillModal 两个核心 composable，再以销售出库为模板批量迁移。

### 阶段七：财务模块（3-4 天）
> 6 个列表 + 9 个组件

### 阶段八：报表模块（3-5 天）
> 13 个报表 + 6 个子组件

### 阶段九：测试与优化（3-5 天）
> 全流程测试 + 构建优化

**总计估算：35-53 个工作日（约 7-11 周）**

---

## 十、风险清单与缓解措施

| 风险项 | 影响范围 | 严重程度 | 缓解措施 |
|--------|---------|---------|---------|
| EditableTable 重写（~3000行） | 所有单据表单 | ★★★★★ | 先做最小可用原型，确保对外 API 兼容；分批支持字段类型（先 input/select/date，再 upload/popup 等） |
| BillModalMixin（~1200行）复杂 | 14种单据弹窗 | ★★★★ | 拆分为多个小 composable：useBillForm / useBillScan / useBillPrint / useBillAccount |
| 表单 v-decorator → v-model | 所有表单页面 | ★★★★ | 制定统一替换模板，批量搜索替换 + 手动微调 |
| Vite import.meta.glob 行为差异 | 动态路由 | ★★★ | 阶段一即验证路由生成器，确保所有路径正确匹配 |
| Vue-ls 过期存储机制 | Token 管理 | ★★ | 实现自定义 useStorage，带 expireTime 字段 |
| moment → dayjs | 日期处理 | ★★ | dayjs API 大部分兼容 moment，需注意 locale 和 plugin |
| jQuery 依赖 | 少量 DOM 操作 | ★ | 分析实际使用场景，预计可完全移除（改用原生 DOM API） |

---

## 十一、验证方案

| 阶段 | 验证方式 | 通过标准 |
|------|---------|---------|
| 阶段一 | `pnpm dev` 启动 + 访问登录页 | 能正常显示验证码、输入账号密码登录、获取 Token 后跳转首页 |
| 阶段二 | 登录后操作 | 侧边菜单正确渲染、点击菜单切换页面、多页签正常工作、头部用户菜单可用 |
| 阶段三 | UserList CRUD | ProTable 正常渲染、分页/搜索/排序正常、新增/编辑弹窗打开关闭正常、删除确认正常 |
| 阶段四-八 | 模块功能回归 | 对比原项目逐页面测试每个功能点 |
| 阶段九 | 全流程 | 用默认账号（jsh / admin / 123456）完整操作所有业务：创建单据→审核→查看报表→系统配置 |

---

## 附录 A：完整依赖清单

```json
{
  "dependencies": {
    "vue": "^3.4.38",
    "vue-router": "^4.4.3",
    "pinia": "^2.2.2",
    "element-plus": "^2.8.1",
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.7.4",
    "echarts": "^5.5.1",
    "vue-echarts": "^7.0.2",
    "dayjs": "^1.11.12",
    "@vueuse/core": "^11.0.3",
    "nprogress": "^0.2.0",
    "mitt": "^3.0.1",
    "js-cookie": "^3.0.5",
    "crypto-js": "^4.2.0",
    "md5": "^2.3.0",
    "clipboard": "^2.0.11",
    "lodash-es": "^4.17.21",
    "intro.js": "^7.2.0",
    "vuedraggable": "^4.1.0",
    "vue3-print-nb": "^0.1.4",
    "viewerjs": "^1.11.6",
    "vue-codemirror": "^6.1.1",
    "@codemirror/lang-javascript": "^6.2.2",
    "@codemirror/lang-sql": "^6.7.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "@vitejs/plugin-vue": "^5.1.2",
    "unplugin-vue-components": "^0.27.4",
    "unplugin-auto-import": "^0.18.2",
    "sass": "^1.77.8",
    "postcss": "^8.4.41",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "@typescript-eslint/parser": "^8.2.0",
    "eslint-plugin-vue": "^9.27.0",
    "prettier": "^3.3.3",
    "@types/js-cookie": "^3.0.6",
    "@types/crypto-js": "^4.2.2",
    "@types/lodash-es": "^4.17.12",
    "@types/nprogress": "^0.2.3",
    "vue-tsc": "^2.0.29"
  }
}
```

---

## 附录 B：API 端点模块拆分参考

### auth.ts（认证）
```
POST /user/login
GET  /user/logout
GET  /user/randomImage
```

### system.ts（系统管理）
```
用户: POST /user/addUser, PUT /user/updateUser, GET /user/getUserList, POST /user/resetPwd
角色: POST /role/add, PUT /role/update, GET /role/allList, GET /role/getTenantRoleList
功能: POST /function/add, PUT /function/update, GET /function/findMenuByPNumber
组织: GET /organization/getOrganizationTree, GET /organization/findById
经手人: POST /person/add, PUT /person/update, GET /person/getPersonByType
账户: POST /account/add, PUT /account/update, GET /account/getAccount
仓库: POST /depot/add, PUT /depot/update
收支: POST /inOutItem/add, PUT /inOutItem/update, GET /inOutItem/findByParam
单位: POST /unit/add, PUT /unit/update
供应商/客户: POST /supplier/add, PUT /supplier/update, GET /supplier/findBySelect_sup
系统配置: POST /systemConfig/add, PUT /systemConfig/update, GET /systemConfig/getCurrentInfo
平台配置: POST /platformConfig/add, PUT /platformConfig/update
租户: POST /tenant/add, PUT /tenant/update
用户业务: POST /userBusiness/add, PUT /userBusiness/update
```

### bill.ts（单据）
```
GET  /depotHead/list
POST /depotHead/batchAddDepotHeadAndDetail
GET  /depotHead/getDetailByNumber
GET  /depotHead/waitBillCount
GET  /depotHead/getBuyAndSaleStatistics
GET  /depotItem/buyOrSalePrice
GET  /depotItem/findStockByDepotAndBarCode
GET  /depotItem/getBatchNumberList
```

### material.ts（商品）
```
POST /material/add, PUT /material/update
GET  /material/getMaterialBySelect
GET  /material/getSerialMaterialBySelect
GET  /material/getMaterialByBarCode
GET  /material/getMaxBarCode
POST /material/batchUpdate
GET  /materialCategory/getTree
POST /materialAttribute/add, PUT /materialAttribute/update
POST /materialProperty/addOrUpdate
POST /serialNumber/batAddSerialNumber
```

### financial.ts（财务）
```
GET  /accountHead/list
POST /accountHead/batchAddAccountHeadAndDetail
GET  /accountHead/getDetailByNumber
GET  /accountHead/getNeedCount
```

### report.ts（报表）
```
GET /depotItem/findByAll          # 明细报表
GET /depotItem/findInOutMaterialCount  # 汇总报表
GET /depotHead/getStatistics      # 统计报表
GET /account/getStatistics        # 账户统计
```

### common.ts（公共）
```
POST /systemConfig/upload         # 文件上传
GET  /systemConfig/fileSizeLimit  # 文件大小限制
GET  /depotHead/exportExcel       # 导出 Excel
```
