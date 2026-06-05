# CLAUDE.md

本文件为 Claude Code / Cursor 等 AI 助手在本仓库中协作时的项目指南。**以当前仓库实际代码与依赖为准**（最后核对：2026-05）。

## 项目概述

管伊佳 ERP（原华夏 ERP，英文名 jshERP）— 开源进销存 + 财务 + 生产 ERP。前后端分离，Apache 2.0 协议。

**仓库结构（当前仅一套前端）：**

```text
jshERP/
├── jshERP-boot/     # Spring Boot 后端
├── jshERP-web/      # Vue 3 前端（唯一维护中的 Web 端）
├── deploy/docker/   # Docker / Nginx 部署示例
└── *.md             # 方案、排查、升级记录文档
```

> **注意**：历史上曾规划 `jshERP-web-v3`（Element Plus 分支），**当前仓库不存在该目录**。现有 `jshERP-web` 已完成 **Vue 3 + Ant Design Vue 4 + Vite** 迁移，请不要再按 Vue 2.7 / `vue.config.js` 理解前端。

---

## 技术栈速查

| 层级 | 技术 | 版本（见各 `package.json` / `pom.xml`） |
|------|------|------------------------------------------|
| 后端框架 | Spring Boot | **2.7.18** |
| JDK | Java | **11**（`pom.xml` 中 `java.version=11`） |
| ORM | MyBatis Plus | 3.0.7.1 |
| 分页 | PageHelper | spring-boot-starter |
| 数据库迁移 | Flyway | 启用，脚本在 `db/migration/` |
| 前端框架 | Vue | **3.5.35** |
| UI | Ant Design Vue | **4.2.6** |
| 图标 | @ant-design/icons-vue + LegacyIcon | 7.0.1 |
| 构建 | Vite | **8.0.16** |
| 路由 / 状态 | Vue Router 4 / Vuex 4 | 4.6.4 / 4.1.0 |
| 数据库 | MySQL | 8.0，库名 `jsh_erp` |
| 缓存 | Redis | 6.2+ |

更细的前端迁移状态见 [`jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md`](jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md)。

---

## 构建与运行

### 后端（jshERP-boot）

```bash
# 构建（产物：jshERP-boot/target/jshERP.jar）
cd jshERP-boot && mvn clean package

# 运行（端口 9999，上下文 /jshERP-boot）
java -jar jshERP-boot/target/jshERP.jar

# MyBatis 代码生成（Entity / Mapper / XML）
cd jshERP-boot && mvn mybatis-generator:generate
```

**已有老库首次接入 Flyway**（见 [`jshERP-boot/src/main/resources/db/migration/README.md`](jshERP-boot/src/main/resources/db/migration/README.md)）：

```bash
java -jar jshERP-boot/target/jshERP.jar --spring.profiles.active=flyway-baseline
```

### 前端（jshERP-web）

```bash
# 安装依赖（npm / yarn / pnpm 均可）
cd jshERP-web && npm install

# 开发（http://localhost:3000，Vite 热更新）
cd jshERP-web && npm run serve

# 生产构建
cd jshERP-web && npm run build

# 本地预览构建产物
cd jshERP-web && npm run preview
```

**环境变量**（[`jshERP-web/.env.development`](jshERP-web/.env.development)）：

| 变量 | 典型值 | 含义 |
|------|--------|------|
| `VITE_APP_PUBLIC_PATH` | `/erp/` | 前端静态资源 base |
| `VITE_APP_API_BASE` | `/erp/jshERP-boot` | API 前缀，写入 `window._CONFIG.domianURL` |

**开发代理**（[`jshERP-web/vite.config.js`](jshERP-web/vite.config.js)）：

- `/jshERP-boot` → `http://localhost:9999`
- `/erp/jshERP-boot` → 同上（去掉 `/erp` 前缀后转发）

生产子路径部署可参考 [`jshERP-web/.env.subpath.example`](jshERP-web/.env.subpath.example) 与 [`deploy/docker/nginx/`](deploy/docker/nginx/)。

### 依赖服务

- MySQL 8.0（3306），库名 `jsh_erp`
- Redis 6.2+（6379；本地 `application.properties` 与 `application.yml` 中密码配置可能不一致，以实际生效 profile 为准）

### 默认登录

- 租户：`jsh`
- 用户：`admin`
- 密码：`123456`

首次安装 SQL 基线：[`jshERP-boot/docs/jsh_erp.sql`](jshERP-boot/docs/jsh_erp.sql)（**仅全新安装**；日常 schema 变更优先走 Flyway）。

### API 文档

启动后端后访问：`http://localhost:9999/jshERP-boot/doc.html`

---

## 后端架构

**分层（包路径 `com.jsh.erp`）：**

```text
Controller (controller/)           — REST，多继承 base/BaseController
    ↓
Service (service/)                 — 业务逻辑
    ↓
Mapper (datasource/mappers/)       — MyBatis 接口 + *Ex 扩展 Mapper
    ↓
XML (resources/mapper_xml/)        — SQL 映射 + *Ex XML
    ↓
Entity (datasource/entities/)      — 实体 + Example 查询类
VO   (datasource/vo/)              — 视图对象
```

**关键机制：**

- **多租户**：MyBatis Plus 租户插件注入 `tenant_id`；租户 ID 从 JWT（请求头 `X-Access-Token`）解析；豁免表见 `TenantConfig.java`
- **认证**：Token 过滤器
- **分页**：PageHelper，在 BaseController 封装
- **异常**：`GlobalExceptionHandler`；业务异常 `BusinessRunTimeException`
- **插件**：Spring Boot Plugin Framework（`PluginConfiguration.java`）
- **数据库版本**：Flyway 脚本 `jshERP-boot/src/main/resources/db/migration/V*.sql`

**Mapper 约定：** Generator 生成的基础 Mapper（如 `MaterialMapper`）勿手改；自定义 SQL 写在 `MaterialMapperEx` 及对应 XML。

**配置入口：**

- 主配置：[`application.properties`](jshERP-boot/src/main/resources/application.properties)
- 补充 / 覆盖：[`application.yml`](jshERP-boot/src/main/resources/application.yml)、`application-prod.properties` 等 profile

---

## 前端架构（jshERP-web）

基于 **Jeecg-Boot 风格模板**，已从 Vue 2 Options API 迁到 **Vue 3**，但大量页面仍保留 **Mixin + Vuex** 写法，新代码宜与邻近文件风格一致。

```text
jshERP-web/src/
├── main.js                 — createApp 入口，注册 Antd / Vuex / Router / LegacyIcon
├── permission.js           — 路由守卫 + 动态菜单路由注入
├── api/                    — api.js（业务接口）、manage.js（HTTP 封装）
├── config/                 — api-base-bootstrap、router.config 等
├── components/
│   ├── jeecg/              — 表格、弹窗、可编辑行等框架组件
│   ├── legacy/             — LegacyIcon + legacy-icon-asn（菜单/按钮图标）
│   ├── menu/               — SideMenu、SMenu
│   └── page/               — GlobalLayout、GlobalHeader
├── store/modules/          — user、permission、app
├── router/                 — 静态路由 + 动态路由生成（util.js）
├── utils/                  — util.js、request、hasPermission、mixin
└── views/                  — 业务页面（见下表）
```

**菜单与路由：**

1. 登录后 `GetPermissionList` 拉取菜单 JSON（含 `icon`、`url`、`component`）
2. `utils/util.js` 的 `generateIndexRouter` / `generateChildRouters` 生成动态路由
3. `GlobalLayout` → `SideMenu` → `menu/index.js` 渲染侧栏；图标经 `LegacyIcon` + [`legacy-icon-asn.js`](jshERP-web/src/components/legacy/legacy-icon-asn.js)

**图标注意：** 菜单 `icon` 为 Ant Design 旧版 **kebab-case 字符串**（如 `shopping-cart`）。未写入 `outlinedIconAsn` 映射时会回退为问号图标。详见 [`18-左侧菜单图标显示异常-排查与解决方案.md`](18-左侧菜单图标显示异常-排查与解决方案.md)。

**列表页常见模式：** `JeecgListMixin` + `getQueryParams()`；报表/对账类接口需白名单过滤 `field`、`createTimeRange` 等字段，避免 HTTP 400（见 `utils/util.js` 中 `build*QueryParams`）。

---

## 核心业务与扩展模块

| 模块 | 后端 Service（示例） | 前端 views | 主要数据表 / 说明 |
|------|---------------------|------------|-------------------|
| 采购/销售/仓库单据 | DepotHeadService, DepotItemService | views/bill/ | jsh_depot_head, jsh_depot_item |
| 商品管理 | MaterialService | views/material/ | jsh_material, jsh_material_extend |
| 财务管理 | AccountHeadService, AccountItemService | views/financial/ | jsh_account_head, jsh_account_item |
| 报表 | 各 Report Controller | views/report/ | 多为查询 / 统计 |
| 用户/租户/系统 | UserService, TenantService, FunctionController | views/system/, views/user/ | jsh_user, jsh_tenant, jsh_function |
| **项目管理** | ProjectService 等 | views/project/ | jsh_project, jsh_project_category（Flyway V2+） |
| **工单管理** | WorkOrderService 等 | views/workorder/ | jsh_work_order 等（Flyway V5+） |
| **车辆管理** | Vehicle 相关 | views/vehicle/ | Flyway V4 |
| **选项中心** | Option 相关 | views/system/OptionList 等 | Flyway V7 |
| **系统字典** | SysDict 相关 | views/system/DictList 等 | Flyway V9 |

菜单数据存 `jsh_function.icon`；扩展菜单见 Flyway `V8__menu_permission_fix.sql` 及 `jshERP-boot/docs/*_menu_*.sql`。

---

## 开发环境建议

| 工具 | 建议版本 |
|------|----------|
| JDK | **11+**（与 `pom.xml` 一致；README 中 JDK 1.8 为上游旧说明） |
| Maven | 3.3.9+ |
| Node | **20.x**（如 20.17.0） |
| MySQL | 8.0.24+ |
| Redis | 6.2+ |
| IDE | IntelliJ IDEA（后端）、VS Code / Cursor（前端） |

---

## 仓库内重要文档索引

| 文档 | 内容 |
|------|------|
| [`09-Flyway数据库版本管理方案.md`](09-Flyway数据库版本管理方案.md) | 数据库迁移策略 |
| [`12-AntDesignVue4升级实施步骤.md`](12-AntDesignVue4升级实施步骤.md) | Ant Design Vue 4 升级 |
| [`15-Vite打包迁移可行性分析与实施方案.md`](15-Vite打包迁移可行性分析与实施方案.md) | Vite 迁移 |
| [`18-左侧菜单图标显示异常-排查与解决方案.md`](18-左侧菜单图标显示异常-排查与解决方案.md) | 侧栏图标问号问题 |
| [`jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md`](jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md) | 前端迁移现状 |
| [`jshERP-web/docs/CHART_G2PLOT_MIGRATION.md`](jshERP-web/docs/CHART_G2PLOT_MIGRATION.md) | 图表 G2Plot |
| [`deploy/docker/README.md`](deploy/docker/README.md) | Docker 部署 |

---

## AI 协作时的常见陷阱

1. **不要假设 Vue 2**：组件语法、Ant Design Vue API（如 `v-model:open`、`Menu items`）均按 Vue 3 / Antdv4 处理。
2. **不要引用 `vue.config.js` / `jshERP-web-v3`**：已移除或不存在；构建看 `vite.config.js`。
3. **后端版本**：Spring Boot **2.7**，不是 README 里的 2.0.0。
4. **Flyway vs 手工 SQL**：新表结构优先新增 `V{n}__*.sql`；`docs/jsh_erp.sql` 面向全量安装。
5. **MyBatis 基础 Mapper**：改 Ex 扩展，不改 Generator 产物。
6. **菜单图标**：改 `legacy-icon-asn.js` 或数据库 `icon` 字段，不是改 Ant Design 主题。
7. **API 路径**：开发环境常用 `/erp/jshERP-boot/...`，与纯 `/jshERP-boot` 并存，改代理或 env 时需两处一致。
