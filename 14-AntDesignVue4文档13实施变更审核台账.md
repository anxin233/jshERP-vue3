# Ant Design Vue 4 — 文档 13 实施变更审核台账

| 文档属性 | 说明 |
| --- | --- |
| 版本 | v1.0 |
| 日期 | 2026-06-02 |
| 分支基线 | `feature/vue3.0` |
| 计划依据 | [13-AntDesignVue4验证问题修复计划与实施步骤.md](./13-AntDesignVue4验证问题修复计划与实施步骤.md) |
| 总体方案 | [12-AntDesignVue4升级实施步骤.md](./12-AntDesignVue4升级实施步骤.md) |
| 实时进度 | [jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md](./jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md) |

> **文档定位**  
> - **文档 13**：修复计划、阶段划分、验收标准（「要做什么」）。  
> - **本文档 14**：按文档 13 已落地的代码变更汇总，供审核、回归与 diff 对照（「做了什么」）。  
> - 说明：文档 13 正文中的「第 14 章 回滚策略」与本文件序号无关。

---

## 1. 维护约定（后续必遵）

凡按 **文档 13** 实施的任何代码变更，实施人须同步更新本文档：

1. 在 **第 8 章「变更履历」** 顶部追加一条记录（日期、阶段、执行人、构建结果）。
2. 在对应阶段章节补充或修改文件清单；若为新阶段，可复制 **第 7 章阶段模板** 新建一节。
3. 更新 **第 5 章「进度总览」** 与 **第 6 章「待办与文档 13 映射」**。
4. 可选：同步精简更新 `jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md`。

**单条变更最小字段：**

| 字段 | 必填 |
| --- | --- |
| 变更 ID | 建议 `CHG-YYYYMMDD-序号` |
| 对应文档 13 章节 | 如「§5 阶段 A / A-1」 |
| 变更类型 | 新增文件 / 修改文件 / 仅文档 |
| 文件路径 | 相对 `jshERP-web/` |
| 变更摘要 | 1～3 句，说明绑定方式或 API 适配点 |
| 业务影响 | 无 / 需回归的菜单或页面 |
| 接口契约 | 默认「未改」；若改须单独说明 |
| 构建 | `npm run build` 通过与否 |
| 审核 | 留空，审核人填写 □通过 □驳回 |

---

## 2. 实施约束（与文档 13 一致）

审核时确认下列约束未被破坏：

| 维度 | 要求 |
| --- | --- |
| 业务逻辑 | 保存、审核、计算、权限流程不变 |
| 布局 | `GlobalLayout`、弹窗 `labelCol`/`wrapperCol` 未主动改版 |
| 后端接口 | URL、请求体字段名、类型与迁移前一致 |
| 数据提交 | `validateFields` 的 `values` 语义 ≡ `formModel` 展开对象 |

---

## 3. 迁移技术标准（审核对照）

### 3.1 标准弹窗（B1、B2 大部分文件）

| 改造项 | 改造后 |
| --- | --- |
| 表单容器 | `<a-form ref="formRef" :model="formModel" :rules="formRules">` |
| 字段绑定 | `v-model:value="formModel.xxx"` |
| 校验项 | `<a-form-item name="xxx">` + `formRules.xxx` 数组 |
| 异步校验 | `validator(rule, value)` 返回 `Promise.resolve()` / `Promise.reject(msg)` |
| 打开编辑 | `formModel = pick(record, ...)` 或 `Object.assign` |
| 保存 | `formRef.validate().then(() => httpAction(..., { ...formModel }))` |

### 3.2 含 JEditableTable 的大弹窗（MaterialModal / 单据 Mixin）

| 改造项 | 说明 |
| --- | --- |
| 模板 | 主表字段 `v-model:value="formModel.*"`，`<a-form ref="formRef" :model="formModel" :rules="formRules">` |
| Mixin | `JEditableTableMixin` 在 `created` 调用 `initLegacyFormBridge()`，提供 `formModel` + `this.form` 桥接 |
| 子表校验 | `handleOk` → `validateFormAndTables(this.form, tables)`，bridge 转发 `formRef.validate()` |
| 部分校验 | `getListData` / `validateFields(['number'])` 由 bridge 支持字段名数组 |
| 工具 | `src/utils/legacyFormBridge.js`（B2 新增，D 阶段增强） |
| BillModalMixin | 仍使用 `this.form.setFieldsValue` / `getFieldValue`，经 bridge 写入 `formModel`，**无需改 mixin 即可被试点弹窗复用** |

### 3.3 DynamicOptionSelect（VehicleModal）

组件 props 为 `value`，事件为 `change`/`input`，非 Vue3 默认 `modelValue`：

```vue
<dynamic-option-select
  :value="formModel.vehiclePurpose"
  @change="v => formModel.vehiclePurpose = v"
  code="vehicle_purpose" />
```

### 3.4 条件校验（MaterialModal 多单位）

```vue
<a-form-item :name="unitChecked ? 'unitId' : 'unit'" ...>
```

---

## 4. 进度总览

| 文档 13 阶段 | 状态 | 完成日期 | 涉及文件约数 | 构建验证 |
| --- | --- | --- | ---: | --- |
| **A** 稳定骨架 | ✅ 已完成 | 2026-06-02 | 6 | 已通过 |
| **B1** 系统管理表单 | ✅ 已完成 | 2026-06-02 | 18 | 已通过 |
| **B2** 物料/车辆/项目弹窗 | ✅ 已完成 | 2026-06-02 | 11 + 1 工具 | 已通过 |
| **D** JEditableTableMixin + 试点 | ✅ 已完成 | 2026-06-02 | 4 | 已通过 |
| **B3** 单据弹窗 | ✅ 已完成 | 2026-06-02 | 21 | 已通过 |
| **B4** 财务弹窗 | ✅ 已完成 | 2026-06-02 | 7 | 已通过 |
| **B5** 工单等 | ✅ 已完成 | 2026-06-02 | WorkOrderModal 等 | 已通过 |
| **C** 列表/表格/插槽 | ⏳ 未开始 | — | 150+ 文件级 | — |
| **E** 清理 compat 占位 | ⏳ 未开始 | — | — | — |

**`v-decorator` 存量：** **`jshERP-web/src` 已为 0**（2026-06-02）。阶段 B3～B5 + dialog/iframe 表单迁移已完成；阶段 C/E 见 §10。

---

## 5. 阶段 A — 稳定系统骨架（已完成）

对应文档 13：**§5 阶段 A**（任务 A-1～A-6）。

### 5.1 变更清单

| 任务 ID | 文件路径（`jshERP-web/src/` 起） | 变更类型 | 变更摘要 | 业务影响 |
| --- | --- | --- | --- | --- |
| A-1 | `components/menu/index.js` | 修改 | 侧栏菜单改为 Ant Design Vue 4 `items` 配置；`selectedKeys`/`openKeys` 与路由联动保留 | 全局侧栏导航 |
| A-1 | `components/menu/SideMenu.vue` | 修改 | 去掉 `ant-design-vue/es/layout/Sider` 等 1.x 深层引用，配合新 Menu | 全局侧栏布局 |
| A-2 | `views/user/Register.vue` | 修改 | 注册表单使用 `a-form-model` / `formModel`（文档 13 要求，非 decorator） | 租户注册 |
| A-3 | `components/tools/UserPassword.vue` | 修改 | 改密表单同上 | 用户改密 |
| A-4 | `utils/antd4-compat.js` | 修改 | 新增 `CompatADrawer`（`visible` ↔ `open`） | 布局抽屉 |
| A-4 | `components/page/GlobalLayout.vue` 等 | 验证/适配 | 布局壳层使用 Compat 组件，未改 `paddingLeft` 等业务布局公式 | 全局布局 |
| A-5 | `components/tools/UserMenu.vue` | 修改 | 头部菜单搜索 `a-select` 增加 `:label` 等 AntD4 过滤兼容 | 顶栏菜单搜索 |
| A-6 | `docs/ANTDV4_MIGRATION_STATUS.md` | 修改 | 迁移看板与 package 4.2.6 对齐 | 文档 |

### 5.2 阶段 A 审核检查项

| 编号 | 检查项 | 结果（审核填写） |
| --- | --- | --- |
| A-R1 | 登录后侧栏可展开、路由高亮正确 | □ |
| A-R2 | 头部菜单搜索可选中跳转 | □ |
| A-R3 | 注册/改密可提交且字段名未变 | □ |
| A-R4 | 控制台无 Menu 相关红屏 | □ |

---

## 6. 阶段 B1 — 系统管理表单（已完成）

对应文档 13：**§6.2 批次 B1**。

### 6.1 变更清单 — 弹窗模块

| 文件路径 | 变更类型 | 备注 |
| --- | --- | --- |
| `views/system/modules/UserModal.vue` | 修改 | 用户新增/编辑 |
| `views/system/modules/TenantModal.vue` | 修改 | 租户 |
| `views/system/modules/DepotModal.vue` | 修改 | 仓库 |
| `views/system/modules/AccountModal.vue` | 修改 | 结算账户 |
| `views/system/modules/UnitModal.vue` | 修改 | 多单位 |
| `views/system/modules/MemberModal.vue` | 修改 | 会员 |
| `views/system/modules/OrganizationModal.vue` | 修改 | 机构 |
| `views/system/modules/DictDataModal.vue` | 修改 | 字典数据 |
| `views/system/modules/FunctionModal.vue` | 修改 | 功能 |
| `views/system/modules/CustomerModal.vue` | 修改 | 客户 |
| `views/system/modules/VendorModal.vue` | 修改 | 供应商 |

### 6.2 变更清单 — 列表/树内嵌表单

| 文件路径 | 变更类型 | 备注 |
| --- | --- | --- |
| `views/system/SystemConfigList.vue` | 修改 | 系统配置内嵌表单 |
| `views/system/OrganizationList.vue` | 修改 | 组织树 + 侧栏表单 |
| `views/system/OptionList.vue` | 修改 | 选项组 + 选项 |
| `views/material/MaterialCategoryList.vue` | 修改 | 商品类别树侧栏 |
| `views/project/ProjectCategoryList.vue` | 修改 | 项目类别树侧栏 |

### 6.3 未改动（B1 范围说明）

| 文件 | 原因 |
| --- | --- |
| `views/system/modules/RoleModal.vue` | 原已 `a-form-model`，符合 AntD4 绑定，未改 |
| `RoleFunctionModal`、`UserDepotModal` 等 | 无 `v-decorator`，非本批目标 |

### 6.4 阶段 B1 审核检查项

| 编号 | 检查项 | 结果 |
| --- | --- | --- |
| B1-R1 | 用户/租户/仓库/客户/供应商 新增保存 Network body 字段名与旧版一致 | □ |
| B1-R2 | 机构/选项/类别树侧栏编辑保存正常 | □ |
| B1-R3 | 上述文件无 `v-decorator`、无 `Form.create` | □ |

---

## 7. 阶段 B2 — 物料/车辆/项目弹窗（已完成）

对应文档 13：**§6.2 批次 B2**。

### 7.1 变更清单 — 标准迁移

| 文件路径 | 变更类型 | 特殊说明 |
| --- | --- | --- |
| `views/material/modules/MaterialPropertyModal.vue` | 修改 | 别名编辑 |
| `views/material/modules/MaterialAttributeModal.vue` | 修改 | 标签/文字双模式同步 `attributeValue` |
| `views/material/modules/MaterialCategoryModal.vue` | 修改 | 类别弹窗 |
| `views/material/modules/BatchSetStockModal.vue` | 修改 | `$emit('ok', number, type)` 语义不变 |
| `views/material/modules/BatchSetPriceModal.vue` | 修改 | 同上 |
| `views/material/modules/BatchSetInfoModal.vue` | 修改 | 批量编辑，无 rules 仅业务校验 |
| `views/project/modules/ProjectCategoryModal.vue` | 修改 | 项目类别 |
| `views/project/modules/ProjectModal.vue` | 修改 | 工时/关联商品/总价计算逻辑未改；`enabledSwitch` 用 `v-model:checked` |

### 7.2 变更清单 — 复杂迁移

| 文件路径 | 变更类型 | 特殊说明 |
| --- | --- | --- |
| `views/material/modules/MaterialModal.vue` | 修改 | 主表 `formModel` + `legacyFormBridge`；JEditableTable 子表逻辑未改 |
| `views/vehicle/modules/VehicleModal.vue` | 修改 | 全字段 `formModel`；日期仍 `moment`；联系人 `v-model:value` |

### 7.3 本阶段新增文件

| 文件路径 | 变更类型 | 说明 |
| --- | --- | --- |
| `utils/legacyFormBridge.js` | **新增** | 兼容 `getFieldValue` / `setFieldsValue` / `validateFields` |
| `scripts/migrate-v-decorator.js` | **新增** | 开发辅助：批量替换模板 `v-decorator`（非运行时依赖） |

### 7.4 阶段 B2 审核检查项

| 编号 | 检查项 | 结果 |
| --- | --- | --- |
| B2-R1 | 商品新增/编辑：主表校验 + 条码子表保存成功 | □ |
| B2-R2 | 商品多单位/多属性切换与保存数据正确 | □ |
| B2-R3 | 车辆档案：日期格式化 `YYYY-MM-DD`、无牌/VIN 勾选 | □ |
| B2-R4 | 项目：工时费用与商品总价计算与迁移前一致 | □ |
| B2-R5 | `MaterialModal` / `VehicleModal` 无 `v-decorator` | □ |

---

## 8. 阶段 D — JEditableTableMixin + 采购入库试点（已完成）

对应文档 13：**§8 阶段 D**、**§6.2 批次 B3**（试点 `PurchaseInModal`）。

### 8.1 公共层变更

| 文件路径 | 变更类型 | 变更摘要 |
| --- | --- | --- |
| `mixins/JEditableTableMixin.js` | 修改 | 移除 `$form.createForm`；新增 `formModel`、`initLegacyFormBridge()`；`edit`/`handleOk` 走 bridge |
| `utils/legacyFormBridge.js` | 修改 | `validateFields` 支持全表/指定字段；失败 reject `VALIDATE_NO_PASSED` Symbol |
| `utils/JEditableTableUtil.js` | 修改 | `validateFormAndTables` 非法 form 时抛出标准 `Error` |

### 8.2 B3 已迁移弹窗

| 文件路径 | 前缀 | 变更摘要 |
| --- | --- | --- |
| `views/bill/modules/PurchaseInModal.vue` | CGRK 采购入库 | 主表 `formModel` + `formRules`；`type/subType` 入库/采购 |
| `views/bill/modules/SaleOutModal.vue` | XSCK 销售出库 | 同上；客户/收款字段；`salesMan` 仍用 `personList` |
| `views/bill/modules/PurchaseOrderModal.vue` | CGDD 采购订单 | 含 `linkApply`/`linkNumber`；`changeAmount` 仅金额格式校验 |
| `views/bill/modules/PurchaseBackModal.vue` | CGTH 采购退货出库 | `type/subType` 出库/采购退货；`accountId` 必填；`linkBillListOk` 仍走 bridge |
| `views/bill/modules/SaleOrderModal.vue` | XSDD 销售订单 | 同 CGDD 模式；`changeAmount` 收取订金仅金额格式；`salesMan` 用 `personList` |
| `views/bill/modules/SaleBackModal.vue` | XSTH 销售退货入库 | 同 CGTH；客户/结算账户必填；`salesMan` 用 `personList` |
| `views/bill/modules/PurchaseApplyModal.vue` | QGD 请购单 | 主表仅日期/单号；无供应商主表字段（原 `organId` 规则未绑定 UI） |
| `views/bill/modules/OtherInModal.vue` | QTRK 其它入库 | `operTime`/`number` 必填；供应商可选；原 `type` 规则无表单项未迁入 |
| `views/bill/modules/OtherOutModal.vue` | QTCK 其它出库 | 同 QTRK；客户可选 |
| `views/bill/modules/SaleBackModal.vue` | XSTH 销售退货入库 | 同 CGTH；客户/结算账户必填 |
| `views/bill/modules/RetailOutModal.vue` | LSCK 零售出库 | 日期/单号/收款账户；收银 `getAmount`/`backAmount` 仍走 bridge |
| `views/bill/modules/RetailBackModal.vue` | LSTH 零售退货 | 同 LSCK；关联零售出库单 |
| `views/bill/modules/AllocationOutModal.vue` | DBCK 调拨出库 | 日期/单号 |
| `views/bill/modules/AssembleModal.vue` | ZZD 组装单 | 日期/单号 |
| `views/bill/modules/DisassembleModal.vue` | CXD 拆卸单 | 日期/单号 |

### 8.3 影响范围说明

单据 21 个 + 财务 7 个 JEditable 弹窗模板均已迁移为 `formModel` + `formRef` + `formRules`；`BillModalMixin` / `FinancialModalMixin` 仍通过 `legacyFormBridge` 写 `formModel`。

### 8.4 阶段 D 审核检查项（采购入库 CGRK）

| 编号 | 检查项 | 结果 |
| --- | --- | --- |
| D-R1 | 新增采购入库：供应商/日期/单号校验生效，明细表可增删行 | □ |
| D-R2 | 保存后 Network：`info`、`rows` 字段名与迁移前一致 | □ |
| D-R3 | 关联订单、优惠、多账户、保存并审核流程正常 | □ |
| D-R4 | `PurchaseInModal` 无 `v-decorator`、无 `Form.create` | □ |

---

## 9. 变更履历（倒序，新记录写在最上）

| 变更 ID | 日期 | 阶段 | 执行摘要 | 构建 | 审核人 | 审核 |
| --- | --- | --- | --- | --- | --- | --- |
| CHG-20260602-008 | 2026-06-02 | B4+B5+dialog | 财务 7 Modal、工单 `WorkOrderModal`、dialog/iframe 等收尾；**`v-decorator` 清零** | ✅ `npm run build` | | □ |
| CHG-20260602-007 | 2026-06-02 | B3 | `RetailOutModal`、`RetailBackModal`、`AllocationOutModal`、`AssembleModal`、`DisassembleModal` 迁移；**B3 单据 21/21 完成** | ✅ `npm run build` | | □ |
| CHG-20260602-006 | 2026-06-02 | B3 | `SaleBackModal`、`PurchaseApplyModal`、`OtherInModal`、`OtherOutModal` 迁移 | ✅ `npm run build` | | □ |
| CHG-20260602-005 | 2026-06-02 | B3 | `PurchaseBackModal`、`SaleOrderModal` 按 CGRK 模式迁移 | ✅ `npm run build` | | □ |
| CHG-20260602-004 | 2026-06-02 | B3 | `SaleOutModal`、`PurchaseOrderModal` 按 CGRK 模式迁移 | ✅ `npm run build` | | □ |
| CHG-20260602-003 | 2026-06-02 | D + B3试点 | Mixin/bridge/Util 升级；`PurchaseInModal` 完整迁移 | ✅ `npm run build` | | □ |
| CHG-20260602-002 | 2026-06-02 | B2 | 物料 7 弹窗 + MaterialModal bridge + VehicleModal + Project 2 弹窗；新增 `legacyFormBridge.js` | ✅ `npm run build` | | □ |
| CHG-20260602-001 | 2026-06-02 | A + B1 | 菜单/注册/改密/Drawer/UserMenu；系统管理 18 个表单文件迁移 | ✅ `npm run build` | | □ |

---

## 10. 待办与文档 13 章节映射

| 文档 13 章节 | 待迁移重点 | 当前仍含 `v-decorator` 的代表文件 |
| --- | --- | --- |
| §6.2 B3 | 21 个单据 Modal + mixin | ✅ 已完成 |
| §6.2 B4 | 7 个财务 Modal | ✅ 已完成 |
| §6.2 B5 | 工单 `WorkOrderModal` | ✅ 已完成 |
| §7 阶段 C | `slot-scope`、Table `bodyCell` | 全站列表页（约 150+ 文件） |
| §9 阶段 E | 删除 `$form.createForm` 占位、`v-decorator` 空指令 | `utils/antd4-compat.js` |

**`v-decorator`：** 已无存量。Jeecg 子组件（`JSelectMaterialModal` 等）仍可能含 `$form.createForm`，属选人/选料子模块，与主业务弹窗表单链路分离。

---

## 11. 阶段模板（后续 B3/C… 复制使用）

```markdown
## 阶段 X — 标题（状态）

对应文档 13：**§X …**

### 变更清单
| 文件路径 | 变更类型 | 变更摘要 | 业务影响 |
| --- | --- | --- | --- |

### 审核检查项
| 编号 | 检查项 | 结果 |
| --- | --- | --- |

### 构建与回归
- 构建：`npm run build` — 
- 回归：文档 13 §12.x — 
```

---

## 12. 全量已修改文件索引（A+B1+B2+D）

便于审核 `git diff`，路径均相对于 `jshERP-web/src/`。

<details>
<summary>点击展开 40 个路径</summary>

```text
components/menu/index.js
components/menu/SideMenu.vue
components/tools/UserMenu.vue
components/tools/UserPassword.vue
utils/antd4-compat.js
utils/legacyFormBridge.js
views/user/Register.vue
views/system/modules/UserModal.vue
views/system/modules/TenantModal.vue
views/system/modules/DepotModal.vue
views/system/modules/AccountModal.vue
views/system/modules/UnitModal.vue
views/system/modules/MemberModal.vue
views/system/modules/OrganizationModal.vue
views/system/modules/DictDataModal.vue
views/system/modules/FunctionModal.vue
views/system/modules/CustomerModal.vue
views/system/modules/VendorModal.vue
views/system/SystemConfigList.vue
views/system/OrganizationList.vue
views/system/OptionList.vue
views/material/MaterialCategoryList.vue
views/project/ProjectCategoryList.vue
views/material/modules/MaterialPropertyModal.vue
views/material/modules/MaterialAttributeModal.vue
views/material/modules/MaterialCategoryModal.vue
views/material/modules/BatchSetStockModal.vue
views/material/modules/BatchSetPriceModal.vue
views/material/modules/BatchSetInfoModal.vue
views/material/modules/MaterialModal.vue
views/vehicle/modules/VehicleModal.vue
views/project/modules/ProjectModal.vue
views/project/modules/ProjectCategoryModal.vue
mixins/JEditableTableMixin.js
views/bill/modules/PurchaseInModal.vue
views/bill/modules/SaleOutModal.vue
views/bill/modules/PurchaseOrderModal.vue
```

</details>

另：`jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md`、`jshERP-web/scripts/migrate-v-decorator.js`（仓库内非 `src/`）。

---

## 13. 审核签字栏

| 角色 | 姓名 | 日期 | 意见 |
| --- | --- | --- | --- |
| 开发负责人 | | | |
| 测试负责人 | | | |
| 产品/业务 | | | |

---

## 14. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.6 | 2026-06-02 | B4/B5/dialog：`v-decorator` 全站清零 |
| v1.5 | 2026-06-02 | B3 收尾：`RetailOut/Back`、`AllocationOut`、`Assemble`、`Disassemble`；单据 21/21 完成 |
| v1.4 | 2026-06-02 | B3：`SaleBackModal`、`PurchaseApplyModal`、`OtherInModal`、`OtherOutModal` 迁移 |
| v1.3 | 2026-06-02 | B3：`PurchaseBackModal`、`SaleOrderModal` 迁移 |
| v1.2 | 2026-06-02 | B3：`SaleOutModal`、`PurchaseOrderModal` 迁移 |
| v1.1 | 2026-06-02 | 阶段 D：`JEditableTableMixin` + `legacyFormBridge` 增强；`PurchaseInModal` B3 试点 |
| v1.0 | 2026-06-02 | 初版：汇总阶段 A、B1、B2 已实施变更；建立维护约定与待办映射 |

---

**后续实施提醒：** 每完成文档 13 中任一阶段或子任务，务必更新本文档 **§4 进度总览**、对应阶段章节及 **§8 变更履历**。

---

## 15. v1.7 补充审核记录（AntD4 兼容桥与后续 E 阶段范围）

### 15.1 本次补充变更

| 变更点 | 文件 | 说明 |
| --- | --- | --- |
| Modal/Drawer 事件桥 | `jshERP-web/src/utils/antd4-compat.js` | `ok/cancel/close` 事件不再依赖 `attrs.onOk/onCancel/onClose` 是否存在，统一向业务层 `emit`，避免 Vue3 emits 吞掉监听后真实 AntD4 组件无事件处理器。 |
| Button 字符串图标兼容 | `jshERP-web/src/utils/antd4-compat.js` | 新增全局 `AButton` 包装，将旧 `icon="plus"` 等字符串转换为 `LegacyIcon`，作为 AntD4 过渡兼容。 |
| 旧图标映射补齐 | `jshERP-web/src/components/legacy/legacy-icon-asn.js` | 补齐 `share-alt`、`issues-close`、`fund`、`folder`、`sync`、`form`、`database`、`stock`、`book`、`stop` 等按钮常用旧图标。 |
| legacy form 重置策略 | `jshERP-web/src/utils/legacyFormBridge.js` | `resetFields()` 保留 `formModel` 对象引用，按字段置空，降低响应式对象被整体替换的风险。 |
| 公共表格 render 兼容 | `jshERP-web/src/components/table/index.js` | 将公共表格 render 中的 `attrs/on/scopedSlots` 写法调整为 Vue3 props + slots 写法。 |

### 15.2 当前仍需纳入 E 阶段的范围

`v-decorator` 已清零，但 E 阶段不能只清理 `utils/antd4-compat.js`。截至本次审核，以下 12 处仍含 `$form.createForm`，应作为后续 E 阶段明确待办：

```text
jshERP-web/src/components/jeecgbiz/modal/JSelectBatchModal.vue
jshERP-web/src/components/jeecgbiz/modal/JSelectMaterialModal.vue
jshERP-web/src/components/jeecgbiz/modal/JSelectSnAddModal.vue
jshERP-web/src/components/jeecgbiz/modal/JSelectSnModal.vue
jshERP-web/src/components/jeecgbiz/modal/JSelectUserByDepModal.vue
jshERP-web/src/views/system/modules/CustomerUserModal.vue
jshERP-web/src/views/system/modules/DepotUserModal.vue
jshERP-web/src/views/system/modules/FunctionTreeModal.vue
jshERP-web/src/views/system/modules/RoleFunctionModal.vue
jshERP-web/src/views/system/modules/RolePushBtnModal.vue
jshERP-web/src/views/system/modules/UserCustomerModal.vue
jshERP-web/src/views/system/modules/UserDepotModal.vue
```

### 15.3 后续审核口径

- 阶段 C 继续处理 `slot-scope`、`scopedSlots`、旧 `slot="xxx"` 与表格 `bodyCell`。
- 阶段 E 扩展为：清理 12 个 `$form.createForm` 子模块、精简 `antd4-compat.js`、删除 `antd-vue2-compat.js` 与 `src/compat` 死代码。
- 阶段 F 必须等 C/E 完成、控制台无关键 compat warning 后再删除 `@vue/compat`。

### 15.4 变更履历补充

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.7 | 2026-06-02 | 修复 AntD4 Modal/Drawer 事件桥；新增 Button 字符串图标兼容；补齐旧图标映射；优化 `legacyFormBridge.resetFields()`；明确 E 阶段需覆盖 12 个 `$form.createForm` 子模块。 |
