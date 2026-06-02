# Ant Design Vue 4 迁移状态

## 已完成（2026-06-02）

| 项 | 说明 |
| --- | --- |
| 布局热修 | `LegacyIcon` 使用 `icons-svg` + `generate()`，绕过 compat 下 `AntdIcon` 丢 prop |
| 菜单热修 | Webpack alias → [`vc-menu-SubPopupMenu.js`](../src/compat/vc-menu-SubPopupMenu.js)、[`vc-menu-SubMenu.js`](../src/compat/vc-menu-SubMenu.js)；[`vnode-compat.js`](../src/compat/vnode-compat.js) 修复 Symbol 与 `resolveParentMenu`；[`SMenu`](../src/components/menu/index.js) 使用 Vue3 具名 slot |
| Select 热修 | Webpack alias → [`vc-select-util.js`](../src/compat/vc-select-util.js)、[`vc-select-Select.js`](../src/compat/vc-select-Select.js)（`getPropValue` 读 Vue3 `vnode.children` / `props`，修复头部菜单搜索等 `a-select` 初始化崩溃） |
| 登录表单 | `Login.vue` 已改为 `v-model`，不再使用 `v-decorator` |

## 待办（按 12-AntDesignVue4升级实施步骤.md）

| 里程碑 | 内容 |
| --- | --- |
| M1 全量 AntD4 | `ant-design-vue@4.2.6` + 样式入口 + 布局 API；**须在核心表单迁移后进行** |
| M2 表单 | 其余约 66 个文件、`429` 处 `v-decorator` / `fieldDecoratorId`（含 Register、UserPassword） |
| M3 去 compat | 删除 `antd-vue2-compat.js`、`vue -> @vue/compat` alias；**依赖 M1+M2 完成** |

## 说明

当前仍使用 `ant-design-vue@1.5.2` + `@vue/compat`。全量升级 AntD4 前直接删除 compat 会导致登录表单、菜单、输入框再次异常。
