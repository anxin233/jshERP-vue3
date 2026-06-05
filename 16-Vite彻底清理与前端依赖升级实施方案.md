# Vite 彻底清理与前端依赖升级实施方案

## 1. 目标

当前前端已经从 Vue CLI/Webpack 迁移到 Vite，`npm run build` 已执行 `vite build`。本轮目标是在不改变业务页面和后端接口的前提下，进一步清理旧构建方式残留，让项目构建链只保留 Vite 体系。

最终验收目标：

- `package.json` 中不再保留 Vue CLI/Webpack 构建依赖。
- `package-lock.json` 中不再因为旧 ESLint 配置残留 `webpack`。
- 源码不再出现 `webpackChunkName`、`VUE_APP_*`、`process.env.*`、Vue CLI HTML 模板变量等旧构建写法。
- 环境变量统一使用 `VITE_APP_*`。
- `index.html` 使用 Vite HTML 环境变量和根入口。
- `npm run build`、`npm run preview` 可正常工作。

## 2. Context7 依据

通过 Context7 查询 Vite 8 官方文档后，确认本项目应采用以下实践：

- `index.html` 位于项目根目录，由 Vite 作为入口处理。
- 子路径部署使用 `base` 配置统一处理资源路径。
- 客户端环境变量使用 `VITE_` 前缀，通过 `import.meta.env` 读取。
- `public` 目录用于原样复制静态资源，本项目的 `public/static` 和 `public/doc` 应保留。
- 接口代理使用 `server.proxy`，不再依赖 Vue CLI devServer。
- 生产产物路径和 gzip 产物通过 Vite/Rollup 插件配置。

## 3. 当前审计结论

### 3.1 已完成的 Vite 迁移

- `vite.config.js` 已存在，并配置了 Vue 插件、别名、Less 主题变量、代理、gzip 产物。
- `index.html` 已迁移到项目根目录。
- `package.json` 的 `serve/build/preview` 已切到 Vite。
- Vue CLI 入口文件 `vue.config.js`、`babel.config.js`、`public/index.html` 已删除。

### 3.2 仍需清理的旧构建残留

- `vite.config.js` 仍兼容 `VUE_APP_*`，应改为只读取 `VITE_APP_*`。
- `.env.*` 中仍保留 `VUE_APP_PUBLIC_PATH`、`VUE_APP_API_BASE`，应删除。
- `api-base-bootstrap.js` 仍回退读取 `import.meta.env.VUE_APP_API_BASE`，应删除。
- `router.config.js` 和路由说明文档仍有 `webpackChunkName` 注释，应删除。
- `index.html` 仍使用 `%BASE_URL%` 拼接接口地址，应改为 `%VITE_APP_API_BASE%`。
- `serve-vue3.*.log` 是旧 Vue CLI 启动日志，应删除。
- `@vue/eslint-config-standard@6` 间接引入 `eslint-import-resolver-webpack`，导致锁文件仍残留 `webpack`。应升级为当前 Vite/Vue3 更合适的 ESLint 9 体系。

## 4. 依赖升级清单

### 4.1 本轮立即处理

| 依赖 | 当前 | 目标 | 原因 |
| --- | --- | --- | --- |
| `vite` | `8.0.16` | 保持 | 已是当前 npm 最新，且满足 Node 20.19+ |
| `@vitejs/plugin-vue` | `6.0.7` | 保持 | 已是当前 npm 最新，支持 Vite 8 和 Vue 3 |
| `@vue/eslint-config-standard` | `6.1.0` | `9.0.1` | 移除旧 `eslint-import-resolver-webpack` 间接依赖 |
| `eslint` | `7.32.0` | `9.x` | 匹配新版 Vue ESLint 配置 |
| `eslint-plugin-vue` | `7.20.0` | `10.x` | 匹配 Vue3 和 ESLint 9 |

### 4.2 需要后续专项迁移的组件

这些依赖与业务组件行为绑定较深，不应在本轮 Vite 构建链清理中直接升级，否则容易影响页面交互：

| 依赖 | 当前 | 最新/目标方向 | 使用位置 | 建议 |
| --- | --- | --- | --- | --- |
| `vue-i18n` | `8.28.2` | `11.x` | 全局插件 | Vue3 版本 API 差异大，需专项迁移 |
| `vuedraggable` | `2.20.0` | `4.1.0` | `JEditableTable.vue` | 需验证行拖拽、编辑、合计 |
| `vue-draggable-resizable` | `2.3.0` | `3.0.0` | `JeecgListMixin.js` | 需验证列表列宽拖拽 |
| `@tinymce/tinymce-vue` | `2.1.0` | `6.x` | 富文本 | 需补齐 `tinymce` peer dependency |
| `vue-area-linkage` | `5.1.0` | 待替换 | 全局插件 | Vue2 生态痕迹，需要替换或封装 |
| `vue-print-nb-jeecg` | `1.0.9` | 待替换 | 打印 | 私有/定制包，先验证兼容性 |
| `vue-cropper` | `0.4.9` | `0.6.x` 或替代 | 图片裁剪 | 需专项验证上传裁剪 |
| `vue-splitpane` | `1.0.4` | 待替换 | 分栏 | 需确认实际页面使用 |
| `axios` | `0.18.1` | `1.x` | 请求层 | 拦截器和错误处理差异大，另起专项 |
| `jquery` | `1.12.4` | 去除或 3.x/4.x | `JEditableTable.vue` | 建议先去 jQuery，再升级 |
| `codemirror` | `5.65.21` | 6.x | 代码编辑器 | API 重构，另起专项 |

## 5. 实施步骤

### 阶段 A：清理源码旧构建写法

1. `vite.config.js` 删除 `VUE_APP_*` 兼容，只保留 `VITE_APP_PUBLIC_PATH`。
2. `.env.development`、`.env.production`、`.env.local` 只保留 `VITE_APP_*`。
3. `api-base-bootstrap.js` 只读取 `import.meta.env.VITE_APP_API_BASE`。
4. `index.html` 使用 `%VITE_APP_API_BASE%` 初始化 `window._CONFIG['domianURL']`。
5. 删除 `router.config.js` 中的 `webpackChunkName` 注释。
6. 删除旧 Vue CLI 启动日志。
7. 执行 `npm run build`。

### 阶段 B：清理锁文件中的 webpack 残留

1. 升级 ESLint 体系到当前 Vue3/Vite 更合适的版本。
2. 移除旧 `babel-eslint`、`eslint-plugin-import`、`eslint-plugin-node`、`eslint-plugin-promise` 直接依赖。
3. 新增 `eslint.config.mjs`，替代旧 `package.json eslintConfig`。
4. 更新 `package-lock.json`。
5. 执行 `npm ls @vue/cli-service vue-loader webpack --depth=3`，确认不存在旧构建依赖。
6. 执行 `npm run build`。

### 阶段 C：静态复扫与运行验证

1. 复扫旧构建关键词：`VUE_APP_`、`webpackChunkName`、`vue-cli-service`、`@vue/compat`、`process.env.`。
2. 启动 `npm run preview -- --strictPort`，验证 `/erp/` 和静态资源返回 200。
3. 若 3000 端口未被占用，再启动 `npm run serve -- --strictPort`；若被占用，使用临时端口验证。
4. 最终执行 `npm run build`。

## 6. 验收标准

- `npm run build` 成功。
- `npm ls @vue/cli-service vue-loader webpack --depth=3` 不再列出旧构建链。
- 源码中不再出现旧构建关键词，文档中的历史说明除外。
- `preview` 下 `/erp/`、`/erp/static/translate.js`、`/erp/static/favicon.ico` 返回 200。
- 不删除 `public` 目录，因为它是 Vite 静态资源目录。

## 7. 风险控制

- 本轮不升级业务深绑定组件，避免影响页面操作逻辑。
- 本轮不修改后端接口。
- 本轮不重构页面。
- 任一阶段构建失败，只修复当前阶段引入的问题，通过后再进入下一阶段。

## 8. 本轮执行结果

### 8.1 已完成

- `vite.config.js` 已删除 `VUE_APP_*` 兼容读取，只保留 `VITE_APP_*`。
- `.env.development`、`.env.production`、`.env.local` 已统一为 Vite 环境变量。
- `api-base-bootstrap.js` 已统一读取 `import.meta.env.VITE_APP_API_BASE`。
- `index.html` 已改为使用 `%VITE_APP_API_BASE%` 初始化接口根地址。
- 路由配置和路由说明文档中的 `webpackChunkName` 注释已删除。
- 旧 Vue CLI 运行日志已删除，并停止了遗留的 `vue-cli-service serve` 进程。
- ESLint 栈已升级到 ESLint 9 + `@vue/eslint-config-standard@9`，并新增 `eslint.config.mjs`。
- 旧 `.eslintignore` 和 `package.json eslintConfig` 已移除。
- `util.js` 和 `HeaderNotice.vue` 中的直接 `eval` 已清理，Vite 构建不再出现 eval 警告。

### 8.2 验证结果

- `npm run build` 通过。
- `npx eslint --print-config src/main.js` 可解析配置。
- `npm ls @vue/cli-service vue-loader webpack --depth=3` 返回空依赖树。
- 静态复扫未命中 `VUE_APP_`、`webpackChunkName`、`@vue/compat`、`vue-cli-service`、`process.env.`、`require.context`、loader 写法等旧构建关键词。
- `vite preview` 下 `/erp/`、`/erp/static/translate.js`、`/erp/static/favicon.ico` 返回 200。
- Vite dev server 下 `/erp/`、`/erp/static/translate.js`、`/erp/static/favicon.ico` 返回 200。
- 验证后 3000 和 4173 端口无遗留监听。

### 8.3 剩余非阻断项

- 构建仍会提示第三方 CSS 旧语法，来源于依赖包样式，当前通过 Vite `lightningcss.errorRecovery` 容错，不阻断产物生成。
- 构建仍提示部分 chunk 超过 500KB，后续可按路由和大组件做拆包优化。
- npm 本地配置仍提示若干旧镜像字段 warning，这是用户级 npm 配置，不属于项目源码。
