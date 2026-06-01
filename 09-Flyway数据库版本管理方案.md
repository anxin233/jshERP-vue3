# Flyway 数据库版本管理方案

## 1. 背景

当前项目的数据库结构和初始化数据主要依赖 SQL 文件手工维护。随着项目继续扩展，尤其是项目管理、车辆档案、工单管理、工单结算等业务模块持续演进，单纯依赖人工执行 SQL 会带来以下问题：

- 不同环境数据库版本不一致，难以判断某个库执行到了哪个阶段。
- 新环境初始化流程依赖人工经验，容易漏执行脚本或执行顺序错误。
- 已上线环境和本地开发环境缺少统一的数据库变更记录。
- 多人协作时，数据库结构变更缺少强约束，容易出现重复字段、重复菜单、重复字典数据。
- 回归问题排查时，难以追溯某个表结构或初始化数据由哪次变更引入。

因此，建议引入 Flyway 对数据库版本进行集中管理。

## 2. 目标

本方案目标是将数据库变更从“手工执行 SQL”改造成“随应用启动自动校验和迁移”的版本化机制。

核心目标：

- 数据库结构变更可追踪。
- 新环境可以从空库自动初始化到最新版本。
- 已有环境可以安全纳入 Flyway 管理。
- 所有开发人员使用同一套迁移脚本。
- 生产环境数据库变更有明确版本号和执行记录。
- 禁止绕过版本体系直接修改数据库结构。

## 3. 技术选型

项目后端使用 Spring Boot 2.0、Java 8、MySQL，因此建议使用 Spring Boot 2.0 兼容的 Flyway 版本。

推荐方式是在后端模块中引入 Flyway：

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

不建议直接使用过新的 Flyway 版本。较新的 Flyway 对 JDK、数据库支持、模块拆分方式都有变化，和当前项目技术栈不完全匹配，会增加不必要的接入风险。

当前后端使用 `spring-boot-starter-parent` 2.0.0.RELEASE，建议优先让 Spring Boot BOM 管理 `flyway-core` 版本，不要手工升级到 Flyway 9+。如果必须显式指定版本，也应选择与 Spring Boot 2.0 和 Java 8 兼容的版本。

## 4. 目录设计

建议在后端模块中增加标准 Flyway 迁移目录：

```text
jshERP-boot/src/main/resources/db/migration
```

Flyway 默认会扫描：

```text
classpath:db/migration
```

后续所有数据库结构变更、必要的系统初始化数据变更，都应放入该目录。

## 5. 脚本命名规范

Flyway 版本迁移脚本建议使用如下格式：

```text
V版本号__英文说明.sql
```

示例：

```text
V1__baseline_jsh_erp.sql
V2__project_management.sql
V3__project_material_relation.sql
V4__vehicle_module.sql
V5__work_order_module.sql
V6__workorder_account.sql
V7__option_center.sql
V8__menu_permission_fix.sql
```

命名规则：

- 使用 `V` 开头表示版本迁移脚本。
- 版本号只能递增。
- 双下划线 `__` 后面写脚本说明。
- 文件名建议使用英文，避免中文文件名在不同系统或 CI 环境中出现编码问题。
- SQL 文件统一使用 UTF-8 编码。
- 已经发布或执行过的迁移脚本不允许修改内容。
- 后续变更必须新增版本脚本，不能回改旧脚本。

## 6. 配置建议

建议在后端配置文件中增加 Flyway 配置：

```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.table=flyway_schema_history
spring.flyway.validate-on-migrate=true
spring.flyway.out-of-order=false
```

如果需要将已有数据库纳入 Flyway 管理，可以在首次接入时临时开启 baseline：

```properties
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=N
```

说明：

- `spring.flyway.enabled=true`：启用 Flyway。
- `spring.flyway.locations`：指定迁移脚本目录。
- `spring.flyway.table`：指定 Flyway 版本记录表。
- `spring.flyway.validate-on-migrate=true`：迁移前校验历史脚本是否被篡改。
- `spring.flyway.out-of-order=false`：禁止乱序执行迁移脚本。
- `baseline-on-migrate=true`：用于已有数据库首次接入。
- `baseline-version=N`：将已有数据库标记为已完成的基线版本，`N` 必须根据当前数据库实际状态确定。

注意：`baseline-version` 不能固定写成 `1` 后直接用于所有已有库。如果当前数据库已经手工执行过项目、车辆、工单、选项等扩展脚本，就应将 `baseline-version` 设置为整理后的最高已完成版本号，而不是 `1`。否则 Flyway 会继续执行 `V2` 及之后脚本，可能导致重复建表、重复授权、重复加字段或历史数据被 `DROP TABLE` 破坏。

生产环境完成首次基线接入后，建议关闭 `baseline-on-migrate`，避免未知数据库被误标记为合法基线。

生产环境可在 profile 中明确关闭：

```properties
# application-prod.properties
spring.flyway.baseline-on-migrate=false
```

建议按环境拆分配置：

```text
新建空库环境：不开启 baseline，从 V1 顺序执行到最新版本。
已有完整结构环境：首次接入时 baseline-version 设置为当前最高版本 N。
生产环境：首次接入完成后关闭 baseline-on-migrate。
```

## 7. 新库初始化策略

对于全新数据库，Flyway 应从 `V1` 开始完整执行所有迁移脚本。

执行结果：

```text
空数据库
  -> 执行 V1__baseline_jsh_erp.sql
  -> 执行 V2__project_management.sql
  -> 执行 V3__project_material_relation.sql
  -> ...
  -> 数据库达到最新版本
```

这种方式适合：

- 新开发环境。
- 新测试环境。
- 新部署环境。
- Docker 初始化环境。
- CI 自动化验证环境。

## 8. 已有数据库接入策略

对于已经存在表和数据的数据库，不能直接让 Flyway 从 `V1` 开始执行，否则会出现表已存在、数据重复、主键冲突等问题。

推荐使用 Flyway baseline 机制，但 baseline 版本号必须按数据库当前状态确定。

```properties
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=N
```

首次启动时，Flyway 会创建 `flyway_schema_history` 表，并将当前数据库标记为版本 `N`。

后续只执行 `V(N+1)` 之后的新迁移。

适用场景：

- 本地已有开发库。
- 测试环境已有数据库。
- 生产环境首次纳入 Flyway 管理。

接入前必须先备份数据库。

不同数据库状态的处理建议：

| 数据库状态 | 推荐做法 | 说明 |
| --- | --- | --- |
| 空库 | 不开启 baseline | 让 Flyway 从 `V1` 顺序执行到最新版本 |
| 只包含原始 ERP 基础库 | `baseline-version=1` | 表示当前库等价于已经完成 `V1`，后续执行 `V2+` |
| 已手工完成项目、车辆、工单、选项等全部扩展 | `baseline-version=N`，其中 `N` 为整理后的最高版本 | 避免重复执行扩展模块迁移 |
| 只执行过部分扩展脚本 | 先盘点对象，再决定 baseline 或补迁移 | 不能凭感觉设置版本号 |

对于当前项目这类已经存在多份历史 SQL 的情况，建议先完成一次数据库对象盘点，再确定版本映射。例如整理后的迁移链如果到 `V8` 覆盖了当前库已有的全部对象，那么当前已有库首次接入时应使用：

```properties
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=8
```

完成接入并确认无误后，再关闭：

```properties
spring.flyway.baseline-on-migrate=false
```

## 9. 基线脚本设计

`V1__baseline_jsh_erp.sql` 应作为项目数据库的基线脚本。

建议包含：

- 基础表结构。
- 基础系统配置。
- 默认租户。
- 默认角色。
- 默认管理员账号。
- 基础菜单。
- 基础字典。
- 系统运行必需的初始化数据。

不建议包含：

- 测试数据。
- 临时数据。
- 本地调试数据。
- 业务演示数据。
- 和环境强绑定的数据。

结合当前项目，整理 `V1__baseline_jsh_erp.sql` 时应特别处理：

- 从现有 `jsh_erp.sql` 中保留系统运行必需的基础表、默认租户、默认管理员、基础角色、基础菜单和基础配置。
- 剔除与演示业务相关的单据、商品、客户、供应商、库存、财务流水等样例数据。
- 不要把项目、车辆、工单、选项中心等后续扩展模块直接混入 V1，扩展模块应从 V2 开始按业务边界拆分。
- 不要保留环境绑定数据，例如固定 `tenant_id=63` 的项目样例、固定自增 ID 的测试数据。
- 不要保留仅用于本地排障或临时修复的 SQL。

## 10. 增量脚本设计

后续每次数据库变更都应新建独立版本脚本。

示例：

```text
V9__add_work_order_source_field.sql
V10__add_vehicle_maintenance_index.sql
V11__update_workorder_status_options.sql
```

每个脚本应只处理一个清晰的变更主题。

推荐拆分方式：

- 建表单独一个版本。
- 加字段单独一个版本。
- 加索引单独一个版本。
- 初始化字典单独一个版本。
- 菜单权限调整单独一个版本。
- 数据修复单独一个版本。

不要把多个不相关的变更混在一个大 SQL 文件中。

## 11. 菜单和权限数据处理原则

该项目存在菜单、角色、权限、按钮权限等系统数据。这类数据必须特别谨慎。

不建议依赖固定自增 ID。

错误风险示例：

```sql
UPDATE jsh_user_business
SET value = CONCAT(value, '[266][267]')
WHERE type = 'RoleFunctions' AND key_id = 4;
```

问题：

- 不同环境中菜单 ID 可能不同。
- 重复执行可能导致权限值重复拼接。
- 依赖固定角色 ID，环境迁移风险高。

推荐使用稳定业务键：

- 菜单使用 `number`。
- 字典使用 `code`。
- 配置使用 `key`。
- 角色优先使用角色标识或名称。

推荐写法思路：

```sql
INSERT INTO jsh_function (...)
SELECT ...
WHERE NOT EXISTS (
    SELECT 1 FROM jsh_function WHERE number = 'workorder'
);
```

权限更新也需要先判断目标权限是否已存在，避免重复拼接。

菜单插入推荐模板：

```sql
INSERT INTO jsh_function (
    number, name, parent_number, url, component,
    sort, enabled, state, icon, type, push_btn, delete_flag
)
SELECT
    'workorder_info', '工单信息', 'workorder',
    '/workorder/workOrderList', '/workorder/WorkOrderList',
    '0901', 1, 0, 'tool', '电脑端', '1,3', '0'
WHERE NOT EXISTS (
    SELECT 1 FROM jsh_function WHERE number = 'workorder_info'
);
```

`type`、`enabled`、`state`、`url`、`component` 等字段必须与 `V1` 基线中的 `jsh_function` 现有格式保持一致，或者统一为前端实际过滤逻辑使用的格式。当前历史脚本中同时存在 `电脑版`、`电脑端`、`0` 等写法，实施时不能混用后直接上线。

**实施注意（菜单字段）**：上文工单示例使用 `type='电脑端'`，但当前全量库中项目管理菜单（`project`、`project_category`、`project_info`）实际为 `type='0'`。改写 `V8__menu_permission_fix.sql` 中的项目菜单时，应**沿用现网 `type='0'`**（或在测试环境验证后，将扩展模块统一为同一取值，例如全部改为 `电脑端`），不要机械套用工单模板的 `电脑端`。`FunctionService` 新建菜单默认写入 `电脑版`，三种写法并存时更容易导致侧栏或权限异常。

权限授权推荐思路：

**实施注意（角色 ID）**：模板中的 `@admin_role_id = 4` 对应 `jsh_role` 表中「管理员」角色（与历史 `project_menu_permission.sql`、`work_order_migration.sql` 中的 `key_id=4` 一致），用于 `jsh_user_business` 的 `RoleFunctions` 授权。`application.properties` 中的 `manage.roleId=10` 是「租户」角色，供租户业务逻辑使用，**不是**超管菜单授权对象，迁移脚本中不要混用。

```sql
-- 先通过菜单 number 获取菜单 id，而不是写死 [266][267]
SET @workorder_menu_id = (
    SELECT id FROM jsh_function WHERE number = 'workorder'
);

SET @workorder_info_menu_id = (
    SELECT id FROM jsh_function WHERE number = 'workorder_info'
);

-- 角色 id 也应尽量通过稳定条件获取；如果项目暂时只有固定超管角色，也要集中定义变量
SET @admin_role_id = 4;

UPDATE jsh_user_business
SET value = CONCAT(
    RTRIM(value),
    IF(LOCATE(CONCAT('[', @workorder_menu_id, ']'), value) = 0,
       CONCAT('[', @workorder_menu_id, ']'),
       ''),
    IF(LOCATE(CONCAT('[', @workorder_info_menu_id, ']'), value) = 0,
       CONCAT('[', @workorder_info_menu_id, ']'),
       '')
)
WHERE type = 'RoleFunctions'
  AND key_id = @admin_role_id;
```

如果菜单包含按钮权限，还需要同步维护 `btn_str`，且同样不能写死菜单 ID：

```sql
SET @project_category_menu_id = (
    SELECT id FROM jsh_function WHERE number = 'project_category'
);

UPDATE jsh_user_business
SET btn_str = JSON_ARRAY_APPEND(
    COALESCE(btn_str, JSON_ARRAY()),
    '$',
    JSON_OBJECT('funId', @project_category_menu_id, 'btnStr', '1,3')
)
WHERE type = 'RoleFunctions'
  AND key_id = @admin_role_id
  AND @project_category_menu_id IS NOT NULL
  AND COALESCE(btn_str, '') NOT LIKE CONCAT('%"funId":', @project_category_menu_id, '%');
```

上面的模板只表达迁移脚本的方向：菜单 ID 必须由 `number` 查询得到，权限追加前必须判断是否已存在。正式脚本还需要根据当前 `jsh_user_business.value` 和 `btn_str` 的实际格式做完整兼容，尤其要兼容 `btn_str` 为空、非标准 JSON 或历史字符串拼接的情况。

## 12. 数据修复脚本原则

Flyway 可以管理必要的数据修复，但不建议滥用。

允许进入 Flyway 的数据修复：

- 系统配置修复。
- 菜单路径修复。
- 字典值修复。
- 必须随版本发布的结构性业务数据修复。

不建议进入 Flyway 的数据修复：

- 某个客户的个性化数据修复。
- 临时排障 SQL。
- 一次性清理测试数据。
- 依赖具体生产数据状态的复杂修复。

如果必须执行生产数据修复，应单独评审，并保证脚本具备幂等性。

## 13. 幂等性要求

Flyway 的版本脚本理论上只执行一次，但仍建议对关键初始化数据保持幂等设计。

尤其是以下内容：

- 菜单。
- 字典。
- 系统配置。
- 默认角色权限。
- 默认按钮权限。

建议使用：

```sql
INSERT ... SELECT ... WHERE NOT EXISTS ...
```

或：

```sql
INSERT ... ON DUPLICATE KEY UPDATE ...
```

前提是表上存在合理的唯一键。

## 14. 开发流程

建议建立如下开发流程：

1. 开发人员需要修改数据库结构时，先新建 Flyway 版本脚本。
2. 本地启动后端，由 Flyway 自动执行迁移。
3. 本地确认表结构、菜单、字典、权限符合预期。
4. 提交代码时同时提交 Java/Vue 代码和对应 SQL 迁移脚本。
5. Code Review 时必须审查迁移脚本。
6. 测试环境部署时自动执行迁移。
7. 生产部署前先备份数据库。
8. 生产启动时执行迁移。
9. 迁移完成后检查 `flyway_schema_history`。

## 15. 发布流程

生产发布建议流程：

1. 发布前备份数据库。
2. 确认当前生产数据库版本。
3. 确认待发布版本包含哪些 Flyway 脚本。
4. 在测试环境完整验证迁移。
5. 发布后端应用。
6. 应用启动时 Flyway 自动执行迁移。
7. 检查启动日志。
8. 检查 `flyway_schema_history`。
9. 验证核心业务功能。

如果迁移失败，不应手工修改 `flyway_schema_history` 表强行绕过。应先定位失败 SQL，确认数据库是否已部分执行，再制定修复方案。

## 16. 回滚策略

Flyway Community 版本不提供自动 Undo 迁移能力。

因此建议采用以下策略：

- 发布前必须备份数据库。
- 迁移脚本上线前必须在测试环境验证。
- DDL 变更尽量向前兼容。
- 删除字段、删除表、修改字段类型等破坏性变更必须谨慎。
- 复杂变更采用分阶段发布。

推荐分阶段方式：

第一版：

```text
新增字段 -> 代码同时兼容新旧字段
```

第二版：

```text
完成数据迁移 -> 代码切换到新字段
```

第三版：

```text
确认无旧逻辑依赖后，再删除旧字段
```

## 17. 风险点

接入 Flyway 时需要重点关注以下风险：

- 历史 SQL 不是严格幂等，直接迁入可能执行失败。
- 中文文件名或非 UTF-8 编码可能在不同环境中出问题。
- 菜单权限依赖固定 ID，跨环境可能错乱。
- 已有数据库首次 baseline 操作不当，可能导致版本标记错误。
- 开发人员继续手工改库，会破坏 Flyway 管理体系。
- 多分支同时新增迁移脚本，可能产生版本号冲突。

## 18. 版本号冲突处理

多人开发时，容易出现两个分支同时创建 `V12` 的情况。

建议规则：

- 合并前检查目标分支最新迁移版本。
- 如果版本号冲突，后合并者调整版本号。
- 已经进入主分支的脚本不允许修改内容。
- 如果脚本已经在共享环境执行过，只能新增修正脚本，不能回改原脚本。

## 19. 历史 SQL 映射建议

当前项目已有多份历史 SQL。接入 Flyway 时不应原样复制到 `db/migration`，而应先按业务边界改写为版本脚本。

建议映射如下：

| 建议版本 | 来源文件 | 处理要求 |
| --- | --- | --- |
| `V1__baseline_jsh_erp.sql` | `jsh_erp.sql` | 精简为基础库结构和系统运行必需数据，剔除演示业务数据 |
| `V2__project_management.sql` | `project_management_migration.sql` | 去掉 `DROP TABLE IF EXISTS`，去掉固定 `tenant_id=63` 的样例数据 |
| `V3__project_material_relation.sql` | `project_material_relation.sql` | 增加 `IF NOT EXISTS` 或确保只在空库链路执行一次 |
| `V4__vehicle_module.sql` | `vehicle_migration.sql` | 仅整理车辆表结构；该文件不包含菜单，车辆菜单不要在这里遗漏 |
| `V5__work_order_module.sql` | `work_order_migration.sql` | 仅保留工单三表 DDL；工单菜单可用 §11 幂等 `INSERT` 写入，**不要**包含写死菜单/角色 ID 的 `UPDATE` 授权 |
| `V6__workorder_account.sql` | `workorder_account_migration.sql` | `ALTER ADD COLUMN` 需要增加列存在判断 |
| `V7__option_center.sql` | `option_migration.sql`、`option_initial_data.sql` | 结构脚本和 `INSERT IGNORE` 数据可合并或拆分 |
| `V8__menu_permission_fix.sql` | `project_menu_config.sql`、`project_menu_permission.sql`、`option_menu_config.sql`、`fix_component_path.sql`、现网车辆菜单记录 | 统一改写为幂等菜单和权限脚本，包含项目、车辆、选项、工单相关菜单授权及 `btn_str` 幂等更新 |

**实施注意（V5 与 V8 分工）**：

- **V5**：只负责工单表结构；若需在本版本插入工单菜单，使用 §11 的 `INSERT ... WHERE NOT EXISTS`（按 `number`），**不得**包含对 `jsh_user_business.value`、`btn_str` 的授权更新，也不得写死 `[266][267]`、`key_id=4`。
- **V8**：统一处理项目、车辆、选项、工单等扩展模块的菜单（含尚未在 V5 插入的工单菜单）及全部 `RoleFunctions` 授权（`value` + `btn_str`），避免 V5、V8 重复插菜单或重复授权。

车辆菜单必须纳入版本链，否则空库执行到 `V8` 后只有 `jsh_vehicle`、`jsh_vehicle_contact` 表，没有入口菜单，不能认为与当前全量库等价。当前全量库中的车辆菜单应按以下稳定业务键写入 `V8__menu_permission_fix.sql`，不要使用 `vehicle_menu_config.sql` 的 `vehicle001` 方案：

```text
number        = 01020104
name          = 客户车辆
parent_number = 0102
url           = /vehicle/vehicleList
component     = /vehicle/VehicleList
sort          = 0264
push_btn      = 1,3
```

选项管理菜单也应在 `V8` 中按当前基线结构重写。`option_menu_config.sql` 里的 `parent_number='01'` 是错误的，应改为系统管理菜单 `number='0001'`，与 `jsh_erp.sql` 中的 `系统管理` 保持一致。

`V8__menu_permission_fix.sql` 的菜单脚本必须使用第 11 节的 `INSERT ... SELECT ... WHERE NOT EXISTS` 风格，禁止直接照搬 `INSERT VALUES`。权限脚本必须同时处理 `value` 和 `btn_str`，其中 `btn_str` 要按菜单 `number` 查到的真实 `id` 生成，不能写死 `263`、`264` 等自增 ID。

以下脚本不建议直接迁入 Flyway：

- `vehicle_menu_config.sql`：该脚本使用 `fathers_json`、`fathers_str`、`href`、`push_btn_str`、`btn_str` 等字段，与当前 `jsh_function` 表结构和 Mapper 不匹配，应废弃或完全重写。
- `option_menu_config.sql`：脚本中 `parent_number='01'` 与当前系统管理菜单 `number='0001'` 不匹配，不能原样迁入。
- `project_menu_config.sql`：脚本是直接 `INSERT VALUES`，没有 `NOT EXISTS` 判断，应合并进 `V8__menu_permission_fix.sql` 并改为幂等写法。
- `project_menu_permission.sql`：脚本中写死菜单 ID `262`、`263`、`264` 和角色 ID `4`，需要改为按 `number` 查询菜单 ID。
- `work_order_migration.sql` 的菜单权限段：写死 `[266][267]` 和 `key_id=4`，需要改写。
- `workorder_account_migration.sql`：直接 `ALTER ADD COLUMN`，重复执行会失败，需要补充列存在判断。

## 20. 推荐落地步骤

建议分阶段接入，不要一次性大改。

第一阶段：准备

- 引入 Flyway 依赖。
- 增加 `db/migration` 目录。
- 整理基线脚本。
- 按历史 SQL 映射关系改写 V2 之后的增量脚本。
- 明确当前已有库对应的最高迁移版本号 `N`。
- 确定命名规范和开发流程。

第二阶段：本地验证

- 使用空库从 `V1` 完整初始化。
- 使用已有库验证 baseline 接入。
- 验证后端启动时迁移行为。

第三阶段：测试环境接入

- 备份测试库。
- 开启 baseline。
- 启动应用并检查 `flyway_schema_history`。
- 验证主要业务模块。

第四阶段：生产环境接入

- 发布前完整备份。
- 首次接入时开启 baseline。
- 接入完成后关闭生产环境的自动 baseline。
- 后续所有数据库变更必须走 Flyway。

## 21. 最终约束

Flyway 接入后，应建立以下硬性约束：

- 不再手工执行散落 SQL 作为正式变更方式。
- 不再直接修改已发布的迁移脚本。
- 不允许跳过 Flyway 直接改生产库结构。
- 数据库变更必须和业务代码一起提交。
- 所有环境以 `flyway_schema_history` 作为数据库版本依据。
- SQL 脚本必须经过 Review。

## 22. 结论

该项目适合使用 Flyway 管理数据库版本。

推荐将 Flyway 放在后端 `jshERP-boot` 中统一管理，由应用启动时自动完成迁移和校验。对于新环境，从 `V1` 开始完整初始化；对于已有环境，使用 baseline 机制安全纳入版本管理。

接入后的关键收益是：

- 数据库版本可追踪。
- 新环境可自动初始化。
- 多环境结构一致性更高。
- 生产发布风险更可控。
- 后续项目、车辆、工单、财务等模块扩展更容易维护。

真正需要重点把控的是历史脚本整理、菜单权限幂等处理、已有库 baseline 策略，以及团队禁止手工改库的流程约束。
