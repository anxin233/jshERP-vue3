# Vite 打包迁移可行性分析与实施方案

## 1. 结论

当前前端项目可以迁移到最新 Vite，但不建议用“直接替换依赖 + 改脚本”的方式一次切换。项目现在已经是 `Vue 3.5.35 + vue-router 4.6.4 + vuex 4.1.0 + ant-design-vue 4.2.6`，从框架版本上具备迁移 Vite 的基础；真正的迁移风险主要来自 Vue CLI / webpack 构建语义，而不是 Vue 本身。

建议路线是：先建立 Vite 并行构建入口，让 `vue-cli-service` 保留为回退路径；Vite 构建、预览、核心页面回归全部通过后，再删除 Vue CLI 相关依赖和配置。这样风险最低，也方便在出现构建差异时快速定位。

当前不建议立刻切换生产构建，原因如下：

- `public/index.html` 仍使用 Vue CLI 的 `<%= BASE_URL %>` 模板语法。
- 源码仍有 `process.env.BASE_URL` 和 `process.env.VUE_APP_API_BASE`。
- 样式中存在 65 处 webpack 风格 `@import '~@assets/less/common.less'`。
- `vue.config.js` 中存在 webpack 专属配置：`configureWebpack`、`chainWebpack`、`compression-webpack-plugin`、`resolve.fallback`、`css.loaderOptions`、`devServer.proxy`。
- 当前仍有若干 Vue2 时代插件依赖，例如 `vue-i18n@8`、`vuedraggable@2`、`vue-draggable-resizable@2`、`@tinymce/tinymce-vue@2`，这些虽然和打包器没有一一绑定，但在 Vite 的依赖预构建下需要专项验证。

## 2. 当前打包方式

当前前端位于 `jshERP-web`，使用 Vue CLI 5，也就是 webpack 5 构建链。

关键配置如下：

- `package.json`
  - `serve`: `vue-cli-service serve`
  - `build`: `vue-cli-service build --no-module`
  - `@vue/cli-service`: `5.0.9`
  - `@vue/cli-plugin-babel`: `5.0.9`
  - `compression-webpack-plugin`: `^10.0.0`
- `vue.config.js`
  - `publicPath`: `process.env.VUE_APP_PUBLIC_PATH || '/'`
  - 生产关闭 sourcemap。
  - 生产启用 gzip 压缩。
  - webpack alias：`@$`、`@api`、`@assets`、`@comp`、`@views`。
  - webpack fallback：`timers -> timers-browserify`。
  - Less 主题变量和 `javascriptEnabled: true`。
  - devServer 端口 `3000`。
  - 代理 `/erp/jshERP-boot` 到 `http://localhost:9999`，并移除 `/erp` 前缀。
- `public/index.html`
  - 通过 `<%= BASE_URL %>` 拼接 favicon 和 `static/translate.js`。
  - 在内联脚本中根据 `<%= BASE_URL %>` 初始化 `window._CONFIG['domianURL']`。

从架构角度看，当前构建链是“Vue CLI 5 已现代化，但仍深度依赖 webpack 配置层”的状态。

## 3. 最新 Vite 版本与环境要求

截至本次检查，npm registry 返回：

- `vite`: `8.0.16`
- `@vitejs/plugin-vue`: `6.0.7`
- `@vitejs/plugin-vue` peer dependency 支持 `vite ^5 || ^6 || ^7 || ^8`、`vue ^3.2.25`
- Vite 8 和 `@vitejs/plugin-vue 6` 要求 Node `^20.19.0 || >=22.12.0`

当前本机环境：

- 实际 Node：`v24.10.0`
- `.node-version`：`20.20.2`

因此运行环境满足 Vite 8 要求。

官方依据：

- Vite 官网当前文档显示版本为 `v8.0.16`，并说明 Vite 由开发服务器和生产构建两部分组成，生产构建输出优化后的静态资源。
- Vite 官方文档说明 Vite 8 要求 Node `20.19+` 或 `22.12+`。
- Vite 官方文档说明项目根目录的 `index.html` 是应用入口，不再放在 `public` 下由 Vue CLI 模板处理。
- Vite 官方文档说明客户端环境变量通过 `import.meta.env` 暴露，默认只有 `VITE_` 前缀变量会进入客户端代码。
- Vite 官方文档说明 `base` 配置用于开发和生产的公共基础路径，等价承接当前 Vue CLI `publicPath` 的职责。

参考：

- https://vite.dev/guide/
- https://vite.dev/guide/env-and-mode
- https://vite.dev/config/shared-options.html
- https://vite.dev/guide/assets.html

## 4. 是否支持替换为 Vite

支持，但需要分阶段迁移。

可迁移的有利条件：

- 已经升级到 Vue 3，不需要再依赖 Vue CLI 的 Vue2 兼容构建链。
- Ant Design Vue 已经是 Vue3 原生版本 `4.2.6`。
- 路由已是 `vue-router 4`。
- 状态管理已是 `vuex 4`。
- 源码没有发现 `require()`、`require.context()` 这类强 webpack 运行时依赖。
- 动态路由里的 `webpackChunkName` 注释不会阻塞 Vite，只是会被忽略。
- 当前 `.node-version` 满足 Vite 8 的 Node 要求。

主要阻塞点：

- HTML 模板语法不兼容：`<%= BASE_URL %>` 需要迁移为 Vite 的 `%BASE_URL%` 或改为基于 `import.meta.env.BASE_URL` 的初始化脚本。
- 环境变量语义不兼容：`process.env.BASE_URL`、`process.env.VUE_APP_API_BASE` 需要迁移到 `import.meta.env.BASE_URL`、`import.meta.env.VITE_APP_API_BASE`，或者在过渡期配置 `envPrefix` 和 `define`。
- 样式导入不兼容：65 处 `@import '~@assets/less/common.less'` 需要移除 webpack 的 `~` 前缀。
- webpack 配置需要等价翻译：代理、alias、gzip、Less 变量、生产 sourcemap、drop console 都要迁到 `vite.config.js`。
- Babel 配置需要重新评估：当前 `babel.config.js` 依赖 `@vue/cli-plugin-babel/preset`，Vite 默认用 esbuild，不再需要 Vue CLI Babel preset；如果保留旧浏览器降级能力，应使用 `@vitejs/plugin-legacy`。
- 部分旧生态依赖需要预构建验证：`vue-i18n@8`、`vuedraggable@2`、`vue-draggable-resizable@2`、`@tinymce/tinymce-vue@2`、`vue-print-nb-jeecg`、`vue-area-linkage` 等可能出现 CommonJS/ESM 或 Vue3 运行期兼容问题。

## 5. 推荐目标版本

建议迁移目标：

```json
{
  "vite": "8.0.16",
  "@vitejs/plugin-vue": "6.0.7",
  "@vitejs/plugin-legacy": "8.0.2",
  "terser": "^5.16.0",
  "vite-plugin-compression": "0.5.1",
  "sass": "^1.94.2",
  "less": "^4.4.2"
}
```

说明：

- `@vitejs/plugin-vue` 用于 Vue SFC 编译，替代 Vue CLI + `vue-loader`。
- `@vitejs/plugin-legacy` 不是必须项；如果继续希望接近 Vue CLI 的 `core-js` 降级能力，可以加入。当前 `browserslist` 已不支持 IE，因此也可以先不加 legacy，减少变量。
- `vite-plugin-compression` 用于替代当前 `compression-webpack-plugin` 生成 gzip。
- `vue-loader`、`@vue/cli-service`、`@vue/cli-plugin-babel`、`@vue/cli-plugin-eslint`、`compression-webpack-plugin`、`css-loader`、`postcss-loader`、`vue-style-loader` 后续可以删除，但必须等 Vite 构建稳定后再删。

## 6. 迁移设计

### 6.1 新增 Vite 配置

新增 `jshERP-web/vite.config.js`，核心职责：

- `base`: 读取 `VITE_APP_PUBLIC_PATH`，默认 `/erp/`。
- `plugins`: `vue()`，稳定后可加 `viteCompression()`。
- `resolve.alias`: 对齐现有 `@`、`@$`、`@api`、`@assets`、`@comp`、`@views`。
- `server.port`: `3000`。
- `server.proxy`: 对齐现有 `/erp/jshERP-boot` 和 `/jshERP-boot`。
- `css.preprocessorOptions.less`: 迁移当前 Less 变量、`javascriptEnabled: true`、`math: 'always'`。
- `build.sourcemap`: `false`。
- `build.outDir`: `dist`。
- `define`: 过渡期可临时兼容 `process.env.BASE_URL`，最终应删除。
- `esbuild.drop`: 生产环境 drop `console`，替代 webpack terser 配置。

### 6.2 迁移 HTML 入口

Vite 要求 `index.html` 位于项目根目录并作为入口参与构建。

建议做法：

- 将 `public/index.html` 复制为 `jshERP-web/index.html`。
- 将 favicon 改为 `%BASE_URL%static/favicon.ico`。
- 将 `static/translate.js` 改为 `%BASE_URL%static/translate.js`。
- 将内联脚本里的 `<%= BASE_URL %>` 改为 `%BASE_URL%`。
- 增加入口脚本：

```html
<script type="module" src="/src/main.js"></script>
```

注意：Vite 的 `public` 目录仍保留，用于 `static/translate.js`、`static/less.min.js`、favicon、图片等静态文件。

### 6.3 迁移环境变量

推荐改名并收敛语义：

```text
VITE_APP_PUBLIC_PATH=/erp/
VITE_APP_API_BASE=/erp/jshERP-boot
```

源码调整：

- `process.env.BASE_URL` -> `import.meta.env.BASE_URL`
- `process.env.VUE_APP_API_BASE` -> `import.meta.env.VITE_APP_API_BASE`
- `process.env.NODE_ENV === 'production'` -> `import.meta.env.PROD`

如果希望降低一次性改动量，可以在 `vite.config.js` 里临时配置：

```js
envPrefix: ['VITE_', 'VUE_APP_']
```

但最终仍建议统一为 `VITE_`，避免长期混用 Vue CLI 命名。

### 6.4 迁移样式导入

把 65 处 webpack 写法：

```less
@import '~@assets/less/common.less';
```

统一改为：

```less
@import '@assets/less/common.less';
```

Vite 配置 alias 后即可解析。

### 6.5 迁移 npm scripts

第一阶段不要直接覆盖原脚本，建议并行增加：

```json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build --no-module",
    "dev:vite": "vite --host 0.0.0.0 --port 3000",
    "build:vite": "vite build",
    "preview:vite": "vite preview --host 0.0.0.0 --port 4173"
  }
}
```

Vite 验证通过后，再把正式脚本切换为：

```json
{
  "scripts": {
    "serve": "vite --host 0.0.0.0 --port 3000",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173"
  }
}
```

### 6.6 清理 Vue CLI 依赖

只有在 `build:vite`、`preview:vite`、核心页面回归全部通过后，才删除：

- `@vue/cli-service`
- `@vue/cli-plugin-babel`
- `@vue/cli-plugin-eslint`
- `@vue/eslint-config-standard`
- `vue-loader`
- `compression-webpack-plugin`
- `css-loader`
- `postcss-loader`
- `vue-style-loader`
- `timers-browserify`，前提是确认源码和依赖不再需要 webpack fallback
- `babel.config.js`，前提是没有其它工具依赖它
- `vue.config.js`，或保留为历史备份一轮后删除

## 7. 分阶段实施步骤

### 阶段 0：冻结 Vue CLI 基线

目标：确认当前 Vue CLI 构建仍可作为回退点。

操作：

- 执行 `npm run build`。
- 启动现有前端服务。
- 人工确认登录、首页、侧边菜单、系统管理、单据列表、项目/车辆/工单、报表页面可打开。
- 记录当前 dist 产物路径和线上部署前缀 `/erp/`。

出口：

- Vue CLI 构建通过。
- 核心页面无红屏。

### 阶段 1：新增 Vite 并行构建

目标：引入 Vite，但不影响原有 `serve/build`。

操作：

- 新增 Vite 依赖。
- 新增 `vite.config.js`。
- 新增根目录 `index.html`。
- 新增 `dev:vite`、`build:vite`、`preview:vite`。
- 保留 `vue.config.js` 和 Vue CLI 相关依赖。

出口：

- `npm run dev:vite` 能启动。
- 首页 HTML 能加载 `src/main.js`。

### 阶段 2：修复 Vite 编译差异

目标：让 `npm run build:vite` 通过。

操作：

- 迁移 `process.env.*` 到 `import.meta.env.*`。
- 迁移 65 处 `@import '~@assets/less/common.less'`。
- 去掉或忽略 `webpackChunkName` 注释。
- 处理 Vite 预构建暴露的第三方依赖问题，必要时在 `optimizeDeps.include/exclude` 中声明。
- 如出现 CommonJS 兼容问题，通过替换依赖版本、显式导入入口或 `optimizeDeps` 处理，不在业务代码里硬改逻辑。

出口：

- `npm run build:vite` 通过。
- `dist` 内资源路径以 `/erp/` 为前缀。
- `static/translate.js`、favicon、动态主题相关静态文件能被正确引用。

### 阶段 3：Vite 预览与开发代理验证

目标：确认开发态和生产预览态都可用。

操作：

- 执行 `npm run dev:vite`。
- 验证 `/erp/` 页面加载。
- 验证 `/erp/jshERP-boot` 代理到 `http://localhost:9999`，且 path rewrite 与 Vue CLI 一致。
- 执行 `npm run preview:vite`。
- 在 preview 下验证登录页、首页、菜单、接口请求路径。

出口：

- 开发态接口代理正常。
- 预览态资源路径正常。
- 刷新 `/erp/xxx` 不出现静态资源路径错误。

### 阶段 4：业务回归

目标：确认打包器切换没有改变页面行为。

必须回归：

- 登录、退出、刷新后重进。
- 首页布局、顶部菜单、侧边菜单、页签。
- 动态菜单和权限按钮。
- 系统管理：用户、角色、菜单、字典、租户。
- 基础资料：客户、供应商、商品、仓库、账户。
- 项目、车辆、工单。
- 单据：采购、销售、零售、调拨、组装拆卸、其他出入库。
- 财务：收付款、账户流水、欠款明细。
- 报表：筛选、分页、导出。
- 上传、预览、打印、富文本、可编辑表格。
- 动态主题色、`less.min.js`、`color.less` 相关功能。

出口：

- 核心页面无红屏。
- 接口路径与 Vue CLI 构建一致。
- 页面刷新和路由跳转正常。

### 阶段 5：正式切换

目标：把生产构建切到 Vite。

操作：

- 将 `serve/build` 脚本切换为 Vite。
- 删除 Vue CLI 依赖和 webpack 专属配置。
- 删除 `babel.config.js` 或改为仅供其它工具使用。
- 更新 README 和部署说明。
- 重新生成 `package-lock.json`。

出口：

- `npm install` 后无 Vue CLI 依赖。
- `npm run build` 使用 Vite。
- 部署产物可直接替代原 `dist`。

## 8. 关键风险与处理策略

### 8.1 子路径部署风险

当前项目默认部署在 `/erp/`，这是迁移 Vite 的最高优先级风险。

处理方式：

- `vite.config.js` 的 `base` 必须等价于当前 `VUE_APP_PUBLIC_PATH`。
- `router` 的 history base 必须使用 `import.meta.env.BASE_URL`。
- `window._CONFIG['domianURL']` 必须继续得到 `/erp/jshERP-boot`。
- HTML 中静态资源必须使用 `%BASE_URL%static/...`。

### 8.2 环境变量风险

Vite 不会自动暴露 `VUE_APP_*`。

处理方式：

- 推荐统一改为 `VITE_APP_*`。
- 过渡期可配置 `envPrefix: ['VITE_', 'VUE_APP_']`。
- 禁止把敏感信息放进 `VITE_` 变量，因为它会进入客户端包。

### 8.3 样式风险

webpack 的 `~` 导入在 Vite 下不是推荐写法。

处理方式：

- 全部替换为 alias 导入。
- Less 变量迁移到 `css.preprocessorOptions.less`。
- 动态主题相关的 `public/static/color.less` 和 `less.min.js` 必须单独回归。

### 8.4 旧插件风险

项目中仍存在一些 Vue2 时代插件。

处理方式：

- Vite 迁移阶段不顺手升级业务插件，避免变量过多。
- 如果某个插件在 Vite 预构建阶段失败，优先做插件级替换或 Vite `optimizeDeps` 配置。
- 对 `vue-i18n@8`、`vuedraggable@2`、`vue-draggable-resizable@2`、`@tinymce/tinymce-vue@2` 建立专项页面回归清单。

### 8.5 生产压缩差异

Vue CLI 当前通过 terser drop console，Vite 默认构建压缩策略不同。

处理方式：

- 在 Vite 中配置 `esbuild.drop: ['console']` 或使用 terser。
- gzip 使用 `vite-plugin-compression`。
- 对比 Vue CLI 和 Vite 的 `dist` 资源路径、gzip 产物、入口 HTML。

## 9. 推荐方案

推荐采用“并行迁移 + 稳定后切换”的方案。

不推荐：

- 直接删除 Vue CLI。
- 直接把 `serve/build` 改成 Vite。
- 直接删除 `public/index.html` 或动态主题静态文件。
- 在 Vite 迁移同时升级第三方业务插件。

推荐默认决策：

- 目标版本使用 `vite@8.0.16`、`@vitejs/plugin-vue@6.0.7`。
- 使用 npm，不引入 pnpm/yarn。
- 继续输出 `dist`。
- 继续使用 `/erp/` 子路径部署。
- 继续使用 `3000` 作为开发端口。
- 第一阶段保留 Vue CLI 回退路径。
- 环境变量最终统一为 `VITE_APP_PUBLIC_PATH`、`VITE_APP_API_BASE`。

## 10. 验收标准

技术验收：

- `npm run build:vite` 通过。
- `npm run preview:vite` 可访问 `/erp/`。
- 静态资源路径正确，不出现 `/static/...` 与 `/erp/static/...` 混乱。
- 接口请求仍指向 `/erp/jshERP-boot`。
- 生产产物包含 gzip 文件，或部署侧明确由 nginx 压缩。
- 浏览器控制台无构建器迁移导致的模块加载错误。

业务验收：

- 登录、首页、菜单、页签无异常。
- 动态路由和刷新恢复正常。
- 所有核心业务模块能打开。
- 单据新增、编辑、保存、导入、导出、打印正常。
- 上传、图片预览、富文本、可编辑表格正常。
- 动态主题和系统设置正常。

回退标准：

- `build:vite` 无法通过时，不切换正式脚本。
- preview 环境核心页面红屏时，不删除 Vue CLI。
- 子路径部署出现资源 404 时，优先回退到 Vue CLI 构建。

