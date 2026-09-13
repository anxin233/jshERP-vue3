# AGENTS.md

管伊佳 ERP（原名华夏 ERP，英文名 jshERP）——开源进销存 + 财务 + 生产 ERP，前后端分离，Apache 2.0。本文件是 AI 助手（OpenCode / Claude Code / Cursor）在本仓库协作的项目指南，**以当前代码与依赖为准**（最后核对：2026-09-11）。

## 项目概述与仓库结构

```text
jshERP/
├── jshERP-boot/     # Spring Boot 2.7 后端（Java 11）
├── jshERP-web/      # Vue 3 + Ant Design Vue 4 + Vite 前端（唯一 Web 端）
├── deploy/dev/      # 本机开发 MySQL 8 + Redis 6（Docker Compose）
├── deploy/docker/   # 生产 Docker / Nginx 部署示例
└── *.md             # 方案、排查、升级记录
```

> 历史上曾规划 `jshERP-web-v3`（Element Plus 分支），**仓库中不存在**；现有 `jshERP-web` 已完成 Vue 3 + Antdv 4 + Vite 迁移，不要再按 Vue 2.7 / `vue.config.js` 理解前端。

## 技术栈速查

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端 | Spring Boot / JDK | 2.7.18 / 11 |
| ORM / 分页 | MyBatis Plus / PageHelper | 3.0.7.1 / 1.2.13 |
| 数据库迁移 | Flyway | `db/migration/V*.sql` |
| 前端 | Vue / Ant Design Vue | 3.5.35 / 4.2.6 |
| 路由 / 状态 | Vue Router 4 / Vuex 4 | 4.6.4 / 4.1.0 |
| 构建 | Vite | 8.0.16 |
| 图标 | @ant-design/icons-vue + LegacyIcon | 7.0.1 |
| 数据库 / 缓存 | MySQL 8 / Redis 6.2+ | 库 `jsh_erp` |

## 常用命令

```bash
# 本机依赖（MySQL 8 + Redis 6，项目自带 compose）
colima start && (cd deploy/dev && docker compose up -d)
# 凭据在 deploy/dev/.env：MySQL root/jsherp_dev_root，Redis 密码 jsherp_dev_redis

# 后端 jshERP-boot（Java 11，本机默认 java 已是 11）
mvn spring-boot:run              # 默认即连本机库（application.yml 默认已本地化）
mvn clean package -DskipTests    # 产物 target/jshERP.jar
java -jar target/jshERP.jar --spring.profiles.active=local
mvn mybatis-generator:generate   # Entity / Mapper / XML 生成

# 前端 jshERP-web（Node 20）
npm install && npm run serve     # http://localhost:3000
npm run build                    # 产物 dist/
npm run preview                  # http://localhost:4173
npx eslint <file>                # 配置 eslint.config.mjs；存量错误多，不要顺手全量修
```

- 服务：`http://localhost:9999/jshERP-boot`，接口文档 `/doc.html`
- **没有测试套件**：后端 `src/test` 仅 generatorConfig.xml，前端无单测/无 test script。验证 = 后端编译/启动 + 前端 `npm run build` + 页面手动回归。
- 老库首次接入 Flyway：`java -jar target/jshERP.jar --spring.profiles.active=flyway-baseline`（说明见 `db/migration/README.md`）

## 依赖服务与环境变量

- 推荐本机开发库：`deploy/dev`（Colima/Docker：`jsherp-dev-mysql` + `jsherp-dev-redis`），启停说明见 `deploy/dev/README.md`；本机库已 migrate 到 V14（43 表），空库可让应用内 Flyway 自动 migrate。
- 后端默认即连本机（`application.yml`）；远程/生产通过环境变量注入：`JSH_DB_URL` / `JSH_DB_USERNAME` / `JSH_DB_PASSWORD` / `JSH_REDIS_HOST` / `JSH_REDIS_PORT` / `JSH_REDIS_PASSWORD`。`prod` profile 故意强制要求这些变量，启动失败好过误连开发库。
- 前端 env（`.env.development`）：`VITE_APP_PUBLIC_PATH=/erp/`（静态资源 base）、`VITE_APP_API_BASE=/erp/jshERP-boot`；Vite 代理 `/erp/jshERP-boot`（去 `/erp`）与 `/jshERP-boot` → `localhost:9999`。改 API 路径要 env + 代理两处同步。
- 默认登录：租户 `jsh` / 用户 `admin` / 密码 `123456`。生产子路径部署见 `.env.subpath.example` 与 `deploy/docker/nginx/`。
- 首次全量安装 SQL 基线：`jshERP-boot/docs/jsh_erp.sql`（仅全新安装；日常 schema 变更走 Flyway）。

## 必须知道的约定 / 常见陷阱

- **不是 Vue 2**：Vue 3 + Antdv 4（`v-model:open`、Menu `items`、`#` 插槽）；不存在 `jshERP-web-v3` / `vue.config.js`，勿引入 Element UI / viser-vue。
- **Flyway**：schema 变更新增 `db/migration/V{n}__*.sql`，不改已应用脚本；`local` profile 关 `validate-on-migrate`（本机库曾手工导入 SQL）。
- **MyBatis**：`*Mapper` 是 generator 产物勿改，自定义 SQL 写 `*MapperEx` + `resources/mapper_xml/*.xml`。
- **多租户自动注入 `tenant_id`**：不需要租户字段的新表必须加进 `config/TenantConfig.java` 豁免，否则查询报错。
- **认证是 Redis 会话 token，不是 JWT**：请求头 `X-Access-Token`，值 `UUID_tenantId`；未登录受保护接口返回 500 `loginOut`（`filter/LogCostFilter.java`）。
- **动态菜单/图标**：`GetPermissionList` 返回菜单（`icon`/`url`/`component`），`utils/util.js` 的 `generateIndexRouter`/`generateChildRouters` 生成路由；icon 是 AntD 旧 kebab-case 名，须在 `components/legacy/legacy-icon-asn.js` 有映射否则显示问号，新增后跑 `npm run generate:icons`。
- **列表页**：统一 `mixins/JeecgListMixin.js` + `getQueryParams()`；报表/对账查询有字段白名单，新增查询字段要同步 `utils/util.js` 的 `build*QueryParams`，否则 HTTP 400。
- 图表统一 `@antv/g2plot`（见 `jshERP-web/docs/CHART_G2PLOT_MIGRATION.md`）。
- 前端大量页面仍是 Mixin + Vuex 写法，新代码与邻近文件保持一致，不顺手重构。
- 后端版本是 Spring Boot 2.7 / JDK 11，不是上游 README 旧写的 2.0.0 / JDK 1.8。
- `.mcp.json` / `.cursor/mcp.json` 的 MySQL 密码 `root` 与本机 compose（`jsherp_dev_root`）不一致，别照抄；含明文凭据，勿提交新密钥。

## 后端架构（jshERP-boot）

分层（包路径 `com.jsh.erp`）：

```text
Controller (controller/)           — REST，多继承 base/BaseController
    ↓
Service (service/)                 — 业务逻辑
    ↓
Mapper (datasource/mappers/)       — *Mapper（生成）+ *MapperEx（自定义）
    ↓
XML (resources/mapper_xml/)        — SQL 映射
    ↓
Entity (datasource/entities/)      — 实体 + Example；VO (datasource/vo/)
```

关键机制：

- 多租户：MyBatis Plus 租户插件注入 `tenant_id`，豁免表见 `config/TenantConfig.java`
- 认证：`LogCostFilter` 校验 Redis 会话（非 JWT）
- 分页：PageHelper，封装在 `base/BaseController`
- 异常：`GlobalExceptionHandler` + `BusinessRunTimeException`
- 插件：Spring Boot Plugin Framework（`config/PluginConfiguration.java`）
- 配置入口（统一 YAML，无 `application*.properties`）：`application.yml`（主）/ `application-local.yml` / `application-prod.yml` / `application-flyway-baseline.yml`；外部目录部署用 yml（`src/main/bin/run-manage.sh` 的 `spring.config.location`）

## 前端架构（jshERP-web）

Jeecg-Boot 风格模板，已迁 Vue 3，但大量页面保留 Mixin + Vuex 写法。

```text
src/
├── main.js            — createApp 入口，注册 Antd/Vuex/Router/LegacyIcon
├── permission.js      — 路由守卫 + 动态菜单路由注入
├── api/               — api.js（业务接口）、manage.js（HTTP 封装）、login.js
├── config/            — api-base-bootstrap、router.config、layout
├── components/        — jeecg/、legacy/、menu/、page/、table/ 等
├── store/modules/     — user、permission、app、dict、enhance
├── router/            — 静态路由；动态路由生成在 utils/util.js
├── utils/             — request、util、hasPermission、storage
└── views/             — 业务页面（见下表）
```

菜单与路由：登录后拉 `GetPermissionList` → `generateIndexRouter`/`generateChildRouters` 生成动态路由 → `GlobalLayout` → `SideMenu` 渲染，图标经 `LegacyIcon` + `legacy-icon-asn.js`。

## 核心业务与扩展模块

| 模块 | 后端 Service（示例） | 前端 views | 主要表 / 说明 |
|------|---------------------|------------|---------------|
| 采购/销售/仓库单据 | DepotHeadService、DepotItemService | views/bill/ | jsh_depot_head、jsh_depot_item |
| 商品管理 | MaterialService | views/material/ | jsh_material、jsh_material_extend |
| 财务管理 | AccountHeadService、AccountItemService | views/financial/ | jsh_account_head、jsh_account_item |
| 报表 | 各 Report Controller | views/report/ | 多为查询 / 统计 |
| 用户/租户/系统 | UserService、TenantService、FunctionController | views/system/、views/user/ | jsh_user、jsh_tenant、jsh_function |
| 项目管理 | ProjectService 等 | views/project/ | jsh_project、jsh_project_category（Flyway V2+） |
| 工单管理 | WorkOrderService 等 | views/workorder/ | jsh_work_order 等（Flyway V5+） |
| 车辆管理 | Vehicle 相关 | views/vehicle/ | Flyway V4 |
| 选项中心 | Option 相关 | views/system/OptionList 等 | Flyway V7 |
| 系统字典 | SysDict 相关 | views/system/DictList 等 | Flyway V9 |

菜单数据在 `jsh_function`（`icon`/`url`/`component`）；扩展菜单见 Flyway V8 及 `jshERP-boot/docs/*_menu_*.sql`。

## 开发环境建议

JDK 11+（与 `pom.xml` 一致）、Maven 3.3.9+、Node 20.x、MySQL 8.0.24+、Redis 6.2+；IDE：IntelliJ IDEA（后端）、VS Code / Cursor（前端）。

## 文档索引

- [`jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md`](jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md)：前端迁移现状与回归项
- [`jshERP-web/docs/CHART_G2PLOT_MIGRATION.md`](jshERP-web/docs/CHART_G2PLOT_MIGRATION.md)：图表 G2Plot 迁移
- [`deploy/dev/README.md`](deploy/dev/README.md)：本地库启停、手工初始化 schema
- [`deploy/docker/README.md`](deploy/docker/README.md)：Docker 部署
- [`jshERP-boot/src/main/resources/db/migration/README.md`](jshERP-boot/src/main/resources/db/migration/README.md)：Flyway 接入
- 根目录 `01-*.md` ~ `24-*.md`：历史排查/升级记录（09 Flyway、12 Antdv4、15 Vite、18 菜单图标等），按需再读
