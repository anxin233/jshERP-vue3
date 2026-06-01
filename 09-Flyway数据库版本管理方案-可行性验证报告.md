# Flyway 数据库版本管理方案 — 可行性验证报告

> **关联文档**：[09-Flyway数据库版本管理方案.md](./09-Flyway数据库版本管理方案.md)  
> **验证时间**：2026-05-26  
> **验证范围**：方案文档、`jshERP-boot/docs/*.sql`、后端 Java/Mapper、本地库 `jsh_erp`（MySQL 8）

---

## 1. 验证结论（摘要）

| 维度 | 结论 |
|------|------|
| 方案是否适合本项目 | **适合** |
| 技术栈是否兼容 | **兼容**（Spring Boot 2.0 + Java 8 + MySQL 8） |
| 业务代码与数据库是否对齐 | **已对齐**（项目/车辆/工单/选项/工单结算字段均已落地） |
| 能否按方案文档直接上线 | **不能**，需先整理历史 SQL 并修正 baseline 策略 |
| 当前接入状态 | **未接入**（无 Flyway 依赖、无 `db/migration`、无配置） |

**一句话**：Flyway 方案在技术和业务上**可行且值得实施**；主要工作量在于将 `docs/` 下散落 SQL 改造成可重复执行的版本链，以及对已迁移数据库使用**正确的 baseline 版本号**接入，而非框架本身存在障碍。

---

## 2. 验证方法与依据

### 2.1 代码与配置

- 检索 `jshERP-boot`：`flyway`、`db/migration` — **无匹配**
- 阅读 `pom.xml`：Spring Boot `2.0.0.RELEASE`，MySQL 驱动 `8.0.33`
- 阅读 `application.properties`：数据源 `jsh_erp`，`allowMultiQueries=true`
- 核对实体/Controller/Mapper：`WorkOrder`、`Project`、`Vehicle`、`OptionGroup`、`AccountHead.workOrderId` 等

### 2.2 SQL 脚本清单（`jshERP-boot/docs/`）

共 **13** 个文件：

| 文件 | 用途概要 |
|------|----------|
| `jsh_erp.sql` | 核心 ERP 基线（约 30 张表 + 菜单/演示数据） |
| `project_management_migration.sql` | 项目类别、项目表 + 示例数据 |
| `project_material_relation.sql` | 项目商品关联表 |
| `project_menu_config.sql` | 项目管理菜单（按 `number`） |
| `project_menu_permission.sql` | 角色菜单/按钮权限（依赖 role_id、菜单 id） |
| `vehicle_migration.sql` | 车辆主表、联系人表 |
| `vehicle_menu_config.sql` | 车辆菜单（**字段模型过时**） |
| `work_order_migration.sql` | 工单三表 + 菜单 + 角色授权 |
| `workorder_account_migration.sql` | `jsh_account_head.work_order_id` |
| `option_migration.sql` | 选项组/选项项表结构 |
| `option_initial_data.sql` | 选项初始数据（`INSERT IGNORE`） |
| `option_menu_config.sql` | 选项管理菜单 |
| `fix_component_path.sql` | 按 `number` 修正项目菜单 component |

### 2.3 数据库实况（本地 `jsh_erp`）

- 表数量：**39** 张（含全部扩展模块表）
- **`flyway_schema_history`**：不存在
- 扩展表均已存在：`jsh_project*`、`jsh_vehicle*`、`jsh_work_order*`、`jsh_option_*`
- `jsh_account_head.work_order_id`：已存在且有数据
- 菜单：项目 262–264、车辆 265、工单 266–267、选项 268；admin 角色（`key_id=4`）权限串已含上述 id

---

## 3. 技术栈兼容性

| 项目 | 现状 | 与方案关系 |
|------|------|------------|
| Spring Boot | 2.0.0.RELEASE | 父 POM 可管理 Flyway 5.x，与 Java 8、MySQL 8 匹配 |
| JDK | 1.8 | 满足 Flyway 5.x 要求 |
| MySQL | 8.0.x（驱动 8.0.33） | 支持 Flyway 官方迁移；部分脚本可改用 `IF NOT EXISTS` 等语法 |
| 多语句 SQL | `allowMultiQueries=true` | 支持单文件多语句迁移 |
| Flyway 依赖 | 未引入 | 需新增 `flyway-core` 及 `spring.flyway.*` 配置 |
| MyBatis 多租户 | `TenantConfig` 已配置扩展表豁免 | Flyway 在启动早期执行，与运行时租户插件无冲突 |

**建议**：采用 Spring Boot BOM 管理的 `flyway-core`，不单独升级到 Flyway 9+，与方案文档第 3 节一致。

---

## 4. 业务代码与数据库对齐情况

### 4.1 扩展模块对照表

| 模块 | 数据表 | 后端 | 前端（jshERP-web） |
|------|--------|------|-------------------|
| 项目管理 | `jsh_project_category`、`jsh_project`、`jsh_project_material` | `ProjectService`、Mapper | `views/project/` |
| 车辆档案 | `jsh_vehicle`、`jsh_vehicle_contact` | `VehicleMapper`、Service | `views/vehicle/` |
| 工单管理 | `jsh_work_order`、`jsh_work_order_project`、`jsh_work_order_material` | `WorkOrderController/Service` | `views/workorder/` |
| 选项中心 | `jsh_option_group`、`jsh_option_item` | `OptionController/Service` | `/system/OptionList` |
| 工单结算 | `jsh_account_head.work_order_id` | `AccountHead`、Mapper XML | 结算逻辑已使用 |

### 4.2 基线脚本与扩展表关系

- `jsh_erp.sql` 约 **30** 个 `CREATE TABLE`，**不包含** 上述 9 张扩展表
- `jsh_function` 基线脚本中 `AUTO_INCREMENT=262`，与扩展菜单从 id 262 起的历史习惯一致
- 与方案「V1 基线 + V2 起增量」的拆分思路**一致**

### 4.3 多租户相关说明

`TenantConfig` 已对以下表做租户插件过滤豁免（迁移脚本无需改动该逻辑）：

- `jsh_work_order_project`、`jsh_work_order_material`（无 `tenant_id`，依赖主表）
- `jsh_option_group`、`jsh_option_item`（需合并系统级与租户级数据）

---

## 5. 菜单与权限现状

### 5.1 当前库菜单（抽样）

| id | number | 名称 | 说明 |
|----|--------|------|------|
| 262 | project | 项目管理 | 一级 |
| 263 | project_category | 项目类别 | |
| 264 | project_info | 项目信息 | |
| 265 | 01020104 | 客户车辆 | 挂在「基础资料」下，非 `vehicle` 编号 |
| 266 | workorder | 工单管理 | |
| 267 | workorder_info | 工单信息 | |
| 268 | 0910 | 选项管理 | 系统管理下 |

### 5.2 与方案文档风险点的对应

方案文档第 11、13 节强调：菜单/权限应使用稳定业务键（`number`、`code`），避免固定自增 id 与固定 `role_id`。

| 脚本/实践 | 问题 | 严重程度 |
|-----------|------|----------|
| `work_order_migration.sql` | `CONCAT(value, '[266][267]')` 且 `key_id=4` | 高 |
| `project_menu_permission.sql` | 注释与示例依赖 id 262–264、role 4；部分语句含防重复判断 | 中 |
| `project_menu_config.sql` | 按 `number` 插入，较好 | 低 |
| `option_initial_data.sql` | `INSERT IGNORE`，符合幂等思路 | 低 |
| `fix_component_path.sql` | 按 `number` 更新 component，**推荐模式** | 低 |
| `vehicle_menu_config.sql` | 使用 `fathers_json`、`href` 等**已废弃字段** | 高（不宜直接迁入 Flyway） |

本库车辆菜单实际为 `number=01020104`，说明未按 `vehicle_menu_config.sql` 执行，而是手工或其它方式配置。**该文件建议废弃或完全重写后再纳入版本链。**

---

## 6. 历史 SQL → 建议 Flyway 版本映射

方案文档示例版本与现有文件建议对应关系如下（**迁入前必须改写，不可原样复制**）：

| 建议版本 | 来源文件 | 改写要点 |
|----------|----------|----------|
| **V1** | `jsh_erp.sql` | 剔除演示/测试业务数据；保留租户、管理员、核心菜单等运行必需数据 |
| **V2** | `project_management_migration.sql` | 含 `DROP TABLE IF EXISTS`，仅适用于空库首次安装；去掉 `tenant_id=63` 等环境绑定示例数据 |
| **V3** | `project_material_relation.sql` | 增加 `CREATE TABLE IF NOT EXISTS` 或确保仅执行一次 |
| **V4** | `vehicle_migration.sql` | 表结构已用 `IF NOT EXISTS`，相对安全 |
| **V5** | `work_order_migration.sql` | 表结构可保留；**菜单与权限段须按 `number` 重写** |
| **V6** | `workorder_account_migration.sql` | `ALTER ADD COLUMN` 非幂等；改为判断列是否存在或 MySQL 8 兼容写法 |
| **V7** | `option_migration.sql` + `option_initial_data.sql` | 结构 + `INSERT IGNORE`，较符合规范 |
| **V8+** | `project_menu_config.sql`、`project_menu_permission.sql`（改写）、`option_menu_config.sql`、`fix_component_path.sql` | 合并为幂等菜单/权限脚本；权限用 `number` 解析 id，避免写死 role_id |

**未单独成链、需处理：**

- `vehicle_menu_config.sql` — 不建议纳入，除非按当前 `jsh_function` 表结构重写

---

## 7. 方案文档各章节符合度

| 章节 | 评估 | 说明 |
|------|------|------|
| §1 背景 | 符合 | 当前确为手工 SQL，问题描述准确 |
| §3 技术选型 | 符合 | Boot 2.0 + flyway-core 合理 |
| §4–5 目录与命名 | 符合 | `db/migration`、`V{n}__描述.sql` 可直接采用 |
| §6 配置建议 | 基本符合 | 建议用 profile 区分 dev 首次 baseline 与 prod |
| §7 新库策略 | 可行 | 依赖 V1 整理及 V2–V8 脚本改写 |
| §8 已有库策略 | **需补充** | baseline 版本应等于库已完成的**最高**迁移号，不能对已全量库固定 `baseline-version=1` |
| §11–13 菜单/幂等 | 原则正确 | 多数历史 SQL **未达标** |
| §16 回滚 | 正确 | Community 无 Undo，需备份 + 分阶段 DDL |
| §17–18 风险与冲突 | 正确 | 与验证发现一致 |
| §19 分阶段落地 | 建议采纳 | 作为实施路线图 |
| §21 结论 | 同意 | 项目适合 Flyway，重点在脚本与流程 |

---

## 8. Baseline 策略补充说明（重要）

方案文档写法：

```properties
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=1
```

**含义**：将当前库标记为已执行 V1，启动后自动执行 **V2 及以后** 的脚本。

### 8.1 对不同环境的影响

| 环境类型 | 若 `baseline-version=1` 且库已含 V2–V8 全部对象 | 正确做法 |
|----------|--------------------------------------------------|----------|
| 全新空库 | 正常：执行 V1→V2→…→最新 | 无需 baseline，或 baseline 仅用于跳过空 V1 |
| 已手工迁移完毕的库（如当前本地） | **危险**：会重复执行 DROP/CREATE、ALTER 等 | `baseline-version` = **当前最高版本号**（如 8），或 CLI `flyway baseline` |
| 仅执行了部分脚本的库 | 可能部分成功、部分失败 | 先盘点缺失对象，再定 baseline 或补迁移脚本 |

### 8.2 推荐配置节奏

1. **首次接入（已有全量结构的库）**：备份 → `baseline-version=N`（N 为整理后的最终版本）→ 启动验证无待执行迁移 → **关闭** `baseline-on-migrate`
2. **新环境**：不开启 baseline，从 V1 顺序执行至最新
3. **生产**：发布前备份；禁止手工改 `flyway_schema_history` 绕过失败

---

## 9. 新库空库初始化路径（可行条件）

```text
空库
  → V1__baseline_jsh_erp.sql（精简）
  → V2__project_management.sql（改写）
  → V3__project_material_relation.sql
  → V4__vehicle_module.sql
  → V5__work_order_module.sql
  → V6__workorder_account.sql
  → V7__option_center.sql
  → V8__menu_permission.sql（幂等）
  → 39 张表 + flyway_schema_history + 核心菜单
```

**验收标准建议**：

- `flyway_schema_history` 记录版本连续、无失败项
- 表数量与清单一致（核心 30 + 扩展 9）
- 默认租户、admin 可登录；项目/车辆/工单/选项菜单可见（按角色配置）
- 后端启动无 Flyway 异常日志

---

## 10. 风险清单

| 风险 | 说明 | 缓解措施 |
|------|------|----------|
| 历史脚本非幂等 | DROP、ALTER、无 `IF NOT EXISTS` | 改写后再迁入；已发布脚本不可改，只能新增版本 |
| 固定菜单/角色 id | 跨环境 id 不一致 | 按 `number` 查 id；权限更新前判断已存在 |
| Baseline 版本设错 | 重复迁移或漏迁移 | 接入前盘点；全量库 baseline 到最高版本 |
| V1 含演示数据 | 新环境数据混乱 | 基线剔除演示 INSERT |
| 团队手工改库 | 与 Flyway 历史不一致 | 流程约束 + Code Review 必审 SQL |
| 多分支版本号冲突 | 两个 `V12` | 合并前检查主分支最新版本号 |
| `vehicle_menu_config.sql` 误导 | 字段与现表不符 | 废弃或重写，勿直接执行 |

---

## 11. 与方案文档的差异与建议修订

建议在 [09-Flyway数据库版本管理方案.md](./09-Flyway数据库版本管理方案.md) 中增补：

1. **§8 已有库接入**：增加「已全量迁移库应将 `baseline-version` 设为当前最高迁移版本，而非固定为 1」的说明与示例。
2. **附录或脚本清单**：明确 `docs/` 各文件与 V1–Vn 的映射及「禁止原样迁入」的脚本列表（含 `vehicle_menu_config.sql`）。
3. **V1 基线要求**：明确删除 `jsh_erp.sql` 中演示业务数据及扩展模块示例数据（如 `tenant_id=63` 的项目样例）。
4. **菜单权限模板**：提供按 `number` 授权的标准 SQL 模板，作为 V8+ 脚本的规范参考。

---

## 12. 建议实施步骤（验证通过后的落地顺序）

### 第一阶段：准备（不改生产）

- [ ] `pom.xml` 增加 `flyway-core`
- [ ] 创建 `jshERP-boot/src/main/resources/db/migration`
- [ ] 整理 V1 基线（精简 `jsh_erp.sql`）
- [ ] 改写 V2–V8 脚本（幂等、去固定 id、去演示数据）
- [ ] 确定最终版本号 N

### 第二阶段：本地验证

- [ ] 空库：从 V1 执行到 VN，核对 39 表与菜单
- [ ] 当前库：`baseline-version=N`，确认无重复迁移
- [ ] 启动后端，检查日志与 `flyway_schema_history`

### 第三阶段：测试环境

- [ ] 备份测试库
- [ ] 按测试库实际迁移程度设置 baseline
- [ ] 回归：进销存、项目、车辆、工单、选项、财务结算

### 第四阶段：生产

- [ ] 发布前全量备份
- [ ] 首次 baseline 后关闭 `baseline-on-migrate`
- [ ] 后续变更仅通过新增 `V{n+1}__*.sql`

---

## 13. 最终判定

| 问题 | 答案 |
|------|------|
| Flyway 方案是否可行？ | **是** |
| 当前能否零改动直接启用？ | **否**，需脚本整理与配置接入 |
| 代码与数据库是否已为 Flyway 做好准备？ | **结构已就绪**，流程与脚本未就绪 |
| 最大投入点 | 历史 SQL 规范化 + baseline 策略 + 团队流程约束 |

---

## 14. 附录：验证时关键文件路径

| 类型 | 路径 |
|------|------|
| 方案文档 | `09-Flyway数据库版本管理方案.md` |
| 本报告 | `09-Flyway数据库版本管理方案-可行性验证报告.md` |
| SQL 脚本目录 | `jshERP-boot/docs/` |
| 后端配置 | `jshERP-boot/src/main/resources/application.properties` |
| 构建配置 | `jshERP-boot/pom.xml` |
| 租户配置 | `jshERP-boot/src/main/java/com/jsh/erp/config/TenantConfig.java` |

---

*本报告基于方案文档与仓库/数据库静态核查生成，未包含 Flyway 接入后的实际启动压测；实施阶段建议在测试环境完成空库与 baseline 双路径验证后再上生产。*
