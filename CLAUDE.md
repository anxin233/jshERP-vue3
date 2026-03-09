# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

管伊佳ERP（原华夏ERP，英文名jshERP）— 开源进销存+财务+生产ERP系统。前后端分离架构，Apache 2.0协议。

**重要提示**：项目包含两个前端版本：

- `jshERP-web`：Vue 2.7 + Ant Design Vue 1.5（原版，稳定）
- `jshERP-web-v3`：Vue 3.5 + Element Plus 2.13（新版，迁移中）

## 构建和运行命令

### 后端（jshERP-boot）

```bash
# 构建（生成 jshERP-boot/target/jshERP.jar）
cd jshERP-boot && mvn clean package

# 运行（端口9999，上下文路径 /jshERP-boot）
java -jar jshERP-boot/target/jshERP.jar

# MyBatis代码生成（根据generatorConfig.xml生成Entity/Mapper/XML）
cd jshERP-boot && mvn mybatis-generator:generate
```

### 前端 Vue 2（jshERP-web）

```bash
# 安装依赖（推荐yarn）
cd jshERP-web && yarn install

# 开发模式（http://localhost:3000，代理到后端9999端口）
cd jshERP-web && yarn serve

# 生产打包
cd jshERP-web && yarn build
```

### 前端 Vue 3（jshERP-web-v3）

```bash
# 安装依赖（推荐cnpm）
cd jshERP-web-v3 && cnpm install

# 开发模式（http://localhost:6060，代理到后端9999端口）
cd jshERP-web-v3 && npm run dev

# 生产打包
cd jshERP-web-v3 && npm run build

# 类型检查
cd jshERP-web-v3 && npx vue-tsc --noEmit
```

### 数据库初始化

- SQL脚本：`jshERP-boot/docs/jsh_erp.sql`
- 数据库：MySQL 8.0，库名 `jsh_erp`
- 默认登录：租户 `jsh`，用户 `admin`，密码 `123456`

### 依赖服务

- MySQL 8.0（端口3306）
- Redis 6.2+（端口6379，密码 `1234abcd`）

## 技术架构

### 后端 — Spring Boot 2.0 + MyBatis Plus 3.0

**分层结构（包路径 `com.jsh.erp`）：**

```text
Controller (controller/)  — REST接口，继承自 base/BaseController
    ↓
Service (service/)        — 业务逻辑，接口+实现
    ↓
Mapper (datasource/mappers/) — MyBatis接口，含Ex扩展Mapper
    ↓
XML (resources/mapper_xml/)  — SQL映射，含Ex扩展XML
    ↓
Entity (datasource/entities/) — 数据实体，含Example查询类
VO (datasource/vo/)           — 视图对象
```

**关键机制：**

- **多租户**：MyBatis Plus租户插件自动在SQL中注入 `tenant_id` 过滤。租户ID从请求头 `X-Access-Token` 的JWT中解析。豁免表配置在 `TenantConfig.java`
- **认证**：基于Token的认证，通过Filter拦截验证
- **分页**：使用PageHelper，在BaseController中封装
- **异常处理**：GlobalExceptionHandler统一处理，BusinessRunTimeException为业务异常
- **插件系统**：Spring Boot Plugin Framework，配置在 `PluginConfiguration.java`

**Mapper双层结构：** MyBatis Generator生成的基础Mapper（如 `MaterialMapper`）不要手动修改，自定义SQL写在Ex扩展Mapper（如 `MaterialMapperEx`）和对应的Ex XML文件中。

### 前端 Vue 2（jshERP-web）— Vue 2.7 + Ant Design Vue 1.5 + Jeecg-Boot模板

```text
src/
├── api/          — Axios请求封装（api.js为主业务接口，manage.js为HTTP包装）
├── views/        — 页面组件（bill/单据, material/商品, financial/财务, report/报表, system/系统）
├── components/   — 可复用组件（jeecg/框架组件为核心）
├── store/modules/ — Vuex状态（user/用户, permission/权限, app/应用）
└── router/       — 路由配置
```

**前端代理配置**：`vue.config.js` 中 `/jshERP-boot/*` 代理到 `http://localhost:9999`

### 前端 Vue 3（jshERP-web-v3）— Vue 3.5 + Element Plus 2.13 + TypeScript

详细架构请参考 `jshERP-web-v3/CLAUDE.md`。关键特性：

- 使用 Vite 7 + TypeScript 5.9
- Pinia 替代 Vuex，Composition API 替代 Mixin
- ProTable 组件保持 columns 配置式 API（兼容原 Ant Design Table）
- 完全复用后端 API，零改动

## 核心业务模块

| 模块 | 后端Service | 前端视图 | 主要数据表 |
| ---- | ---------- | ------- | --------- |
| 采购/销售/仓库单据 | DepotHeadService, DepotItemService | views/bill/ | jsh_depot_head, jsh_depot_item |
| 商品管理 | MaterialService | views/material/ | jsh_material, jsh_material_extend |
| 财务管理 | AccountHeadService, AccountItemService | views/financial/ | jsh_account_head, jsh_account_item |
| 用户/租户 | UserService, TenantService | views/user/, views/system/ | jsh_user, jsh_tenant |
| 组织架构 | OrganizationService | views/system/ | jsh_organization |

## 配置文件

- 后端配置：`jshERP-boot/src/main/resources/application.properties`
- 前端配置：`jshERP-web/vue.config.js`
- MyBatis Generator配置：`jshERP-boot/src/test/resources/generatorConfig.xml`
- API文档（Swagger）：启动后访问 `http://localhost:9999/jshERP-boot/doc.html`

## 开发环境要求

JDK 1.8、Maven 3.3.9、Node 20.17.0、MySQL 8.0.24、Redis 6.2.1
