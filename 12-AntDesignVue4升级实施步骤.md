# 12-AntDesignVue4升级实施步骤

## 1. 摘要

当前前端已经运行在 `Vue 3.5.35 + @vue/compat`，但 UI 组件库仍为 `ant-design-vue@1.5.2`。本次升级目标是迁移到 Vue3 原生适配版本：

- `ant-design-vue`: `1.5.2` -> `4.2.6`
- 新增 `@ant-design/icons-vue`: `7.0.1`
- 保持页面视觉、交互流程、后端 API 不变
- 最终删除 `src/utils/antd-vue2-compat.js` 中针对 AntD 1.x 的兼容补丁

升级前旧写法规模如下：

| 写法 | 数量 | 涉及文件数 |
| --- | ---: | ---: |
| `v-decorator` | 429 | 66 |
| `<a-icon>` | 315 | 102 |
| `slot-scope` | 278 | 101 |
| `scopedSlots` | 184 | 79 |
| `.native` | 79 | 77 |
| `fieldDecoratorId` | 12 | 3 |
| `autoFormCreate` | 1 | 1 |
| `ant-design-vue` 直接 import | 23 | 14 |

结论：本次升级必须分阶段实施。不能直接替换依赖，否则会同时触发表单、图标、插槽、弹窗、表格和 Vue compat 多类问题，风险不可控。

## 2. 当前基线

当前分支：`feature/vue3.0`

当前已验证基线：

```bash
cd jshERP-web
npm run build
```

验证结果：构建通过。

当前保留警告：

- `ant-design-vue@1.5.2` named export 警告
- Sass legacy JS API 警告
- 资源体积超限警告
- `/deep/` 与 `>>>` 深度选择器弃用警告

阶段 0 回退点：

```text
2ab23987 fix: stabilize ant design vue compat inputs
```

该提交只包含前端 `src/utils/antd-vue2-compat.js` 的 AntD 1.x 兼容修复，用于保证 Vue3 compat 模式下登录/注册输入框可以正常渲染。

## 3. 实施步骤

### 阶段 0：升级前基线确认

目标：固定当前 Vue3 compat + AntD 1.x 可运行状态，作为后续任意阶段失败时的回退点。

执行项：

1. 确认当前分支为 `feature/vue3.0`。
2. 隔离未提交改动，避免把后端 Flyway/SysDict 等非本次前端升级内容混入提交。
3. 执行：
   ```bash
   cd jshERP-web
   npm run build
   npm run serve
   ```
4. 人工确认登录、注册、首页、单据列表、系统管理页面可打开。
5. 单独提交当前 AntD 1.x compat 可运行状态。

阶段出口：

- `npm run build` 通过。
- 登录/注册输入框正常显示。
- 有明确 Git 回退点。

当前状态：已完成构建验证，并已提交回退点 `2ab23987`。

### 阶段 1：清理 Vue2 模板语法

目标：先不升级 AntD 依赖，只清除 Vue3/AntD4 明确不兼容的模板写法。

执行项：

1. 将 `.native` 改为普通事件监听或组件事件透传。
2. 将 `slot-scope` 改为 `v-slot` / `#slotName`。
3. 将表格列配置中的 `scopedSlots: { customRender: 'xxx' }` 迁移为 Vue3 可用的插槽或新版 `customRender` 写法。
4. 优先迁移公共组件：
   - `JEditableTable`
   - `JTreeTable`
   - `JSelect*`
   - `BillListMixin`
   - `components/table`
5. 每迁移一个模块，必须执行：
   ```bash
   npm run build
   ```

阶段出口：

- `.native` 清零。
- 公共组件中的 `slot-scope`、`scopedSlots` 优先清理。
- 构建通过，页面主流程不变。

### 阶段 2：图标迁移

目标：在升级 AntD4 之前，先消除旧 `<a-icon>` 依赖。

执行项：

1. 安装目标依赖：
   ```json
   "@ant-design/icons-vue": "7.0.1"
   ```
2. 建立统一图标适配组件，例如：
   ```text
   src/components/legacy/LegacyIcon.vue
   ```
3. 将旧写法：
   ```vue
   <a-icon type="plus" />
   ```
   迁移为：
   ```vue
   <legacy-icon type="plus" />
   ```
4. 在适配组件内维护旧 `type` 到新版 icon 组件的映射。
5. 第一批必须覆盖常用图标：
   - `plus`
   - `delete`
   - `reload`
   - `search`
   - `setting`
   - `question-circle`
   - `up`
   - `down`
   - `user`
   - `lock`
   - `smile`
   - `loading`
   - `check-circle`
   - `exclamation-circle`
6. 图标全部迁移后，禁止继续使用 `<a-icon>`。

阶段出口：

- `<a-icon>` 清零。
- 登录、菜单、表格操作列、按钮图标显示正常。
- 构建通过。

### 阶段 3：表单体系迁移

目标：迁移 AntD 1.x 的 `Form.create / v-decorator` 表单体系。AntD4 不再支持旧表单 API，此阶段是整个升级的核心风险点。

新版模板：

```vue
<a-form ref="formRef" :model="formModel" :rules="rules">
  <a-form-item name="fieldName">
    <a-input v-model:value="formModel.fieldName" />
  </a-form-item>
</a-form>
```

API 迁移规则：

| 旧写法 | 新写法 |
| --- | --- |
| `this.form.validateFields(...)` | `this.$refs.formRef.validate()` |
| `this.form.setFieldsValue(...)` | 直接赋值 `formModel` |
| `this.form.resetFields()` | `this.$refs.formRef.resetFields()` |
| `v-decorator` | `name + model + rules + v-model:value` |

迁移顺序：

1. 登录、注册、修改密码。
2. 系统管理基础弹窗。
3. 项目/车辆模块。
4. 单据弹窗。
5. 财务弹窗。
6. 报表筛选区。

每个弹窗必须验证：

- 新增
- 编辑
- 必填校验失败
- 保存成功
- 关闭重开
- 重置表单

阶段出口：

- `v-decorator` 清零。
- `Form.create` 清零。
- `fieldDecoratorId` 清零。
- 构建通过。
- 核心表单交互通过人工回归。

### 阶段 4：组件 API 适配

目标：在正式升级依赖前，提前按 AntD4 API 调整高频组件。

执行项：

1. 弹窗组件：
   - `visible` 迁移为 `open`
   - `@ok`、`@cancel` 保持语义不变
2. 表格组件：
   - 插槽统一使用 `#bodyCell` 或新版 `customRender`
   - 保留原分页、排序、选择行逻辑
3. 输入组件：
   - `v-model` 改为 `v-model:value`
   - `a-input-number`、`a-select`、`a-date-picker` 同步调整绑定
4. 下拉自定义渲染：
   - `dropdownRender` 改为新版 slot 写法
5. 全局消息、弹窗确认：
   - 检查 `Modal`、`notification`、`message` API 是否仍兼容
   - 保持调用入口集中在现有工具文件中

阶段出口：

- 高频组件 API 已经与 AntD4 对齐。
- 弹窗、表格、输入、下拉、消息确认均可正常操作。
- 构建通过。

### 阶段 5：正式升级依赖

目标：替换 UI 库版本，并删除 AntD 1.x 兼容补丁。

修改 `jshERP-web/package.json`：

```json
"ant-design-vue": "4.2.6",
"@ant-design/icons-vue": "7.0.1"
```

入口文件处理：

1. `main.js` 中继续使用：
   ```js
   app.use(Antd)
   ```
2. 删除 AntD 1.x 兼容补丁调用：
   ```js
   patchAntdVue2ForVue3Compat()
   ```
3. 删除不再需要的文件：
   ```text
   src/utils/antd-vue2-compat.js
   ```
4. 检查样式引入路径，使用 AntD4 对应样式入口。
5. 删除 `node_modules` 后重新安装：
   ```bash
   npm install
   ```

阶段出口：

- `ant-design-vue@4.2.6` 安装完成。
- `@ant-design/icons-vue@7.0.1` 安装完成。
- `npm run build` 通过。
- 核心页面人工回归通过。

### 阶段 6：去除 Vue compat 依赖

目标：确认 AntD4 稳定后，再切换到纯 Vue3。

执行项：

1. 清理剩余 compat warning。
2. 删除 `vue.config.js` 中 `vue -> @vue/compat` alias。
3. 从依赖中删除：
   ```json
   "@vue/compat"
   ```
4. 保留：
   ```json
   "vue": "3.5.35",
   "@vue/compiler-sfc": "3.5.35"
   ```
5. 重新执行完整构建和核心页面回归。

阶段出口：

- 无 compat warning。
- 纯 `vue@3.5.35` 运行。
- 构建通过。
- 核心页面回归通过。

## 4. 验收测试

每个阶段都必须执行：

```bash
npm run build
npm run serve
```

核心人工回归页面：

- 登录、注册、退出、刷新后重进
- 首页布局、顶部菜单、侧边菜单、页签
- 系统管理：用户、角色、菜单、字典、租户
- 基础资料：客户、供应商、商品、仓库、账户
- 项目、车辆、工单模块
- 单据：采购、销售、零售、调拨、组装拆卸、其他出入库
- 财务：收付款、账户流水、欠款明细
- 报表：筛选、分页、导出
- 上传、预览、打印、富文本、可编辑表格

重点交互：

- 表单必填校验
- 弹窗打开/关闭/重开
- 表格插槽列渲染
- 下拉框远程搜索
- 日期选择
- 金额输入
- 行编辑、拖拽、合计
- 图标按钮点击
- 权限按钮显示隐藏

## 5. 默认决策与约束

- 不修改后端接口。
- 不改页面业务流程和视觉布局。
- 不引入 Vite，继续使用 Vue CLI 5。
- 不引入 TypeScript。
- 不重写为 Composition API，优先保留 Options API。
- 不一次性全量替换所有表单，按模块逐步迁移。
- 不把后端 Flyway/SysDict 相关未提交改动混入前端升级提交。
- 每个阶段独立提交，提交信息示例：
  - `refactor: migrate vue2 slot syntax`
  - `refactor: replace legacy ant icons`
  - `refactor: migrate ant form usage`
  - `feat: upgrade ant design vue to v4`
  - `chore: remove vue compat mode`
- 任一阶段构建失败或核心页面阻断，立即回退到上一阶段提交点。

## 6. 风险说明

本次升级风险最高的部分不是依赖安装，而是业务页面中的旧表单体系。`v-decorator` 涉及 429 处，且分布在 66 个文件中。若在表单迁移完成前直接升级到 AntD4，页面会大面积失效。

因此实际执行顺序必须是：

```text
基线提交 -> 清理 Vue2 模板语法 -> 图标迁移 -> 表单迁移 -> 组件 API 适配 -> 升级 AntD4 -> 去除 Vue compat
```

不得跳过阶段 1 至阶段 4 直接进入阶段 5。
