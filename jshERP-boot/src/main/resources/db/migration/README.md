# Flyway 数据库迁移

迁移脚本由 [09-Flyway数据库版本管理方案.md](../../../../09-Flyway数据库版本管理方案.md) 定义。

## 版本链

| 版本 | 文件 | 说明 |
|------|------|------|
| V1 | `V1__baseline_jsh_erp.sql` | ERP 基线（无演示业务数据） |
| V2 | `V2__project_management.sql` | 项目表 |
| V3 | `V3__project_material_relation.sql` | 项目商品关联 |
| V4 | `V4__vehicle_module.sql` | 车辆表 |
| V5 | `V5__work_order_module.sql` | 工单表 |
| V6 | `V6__workorder_account.sql` | 财务主表关联工单 |
| V7 | `V7__option_center.sql` | 选项中心 |
| V8 | `V8__menu_permission_fix.sql` | 扩展菜单与管理员权限 |
| V9 | `V9__sys_dict_module.sql` | 系统字典表与基础数据 |
| V10 | `V10__system_config_material_price_tax_flag.sql` | 系统配置商品价格含税标记 |
| V11 | `V11__local_db_sync_20260601.sql` | 本地库补齐欠款字段、字典菜单和权限字段容量 |
| V12 | `V12__workorder_menu_icon.sql` | 工单管理菜单补全 icon |
| V13 | `V13__tenant_role_project_permission.sql` | 租户角色项目菜单权限 |
| V14 | `V14__fix_menu_name_encoding.sql` | 修复 V8 扩展菜单名称双重编码乱码 |
| V15 | `V15__add_last_deposit.sql` | 单据增加最终订金字段 |
| V16 | `V16__add_app_version_platform_config.sql` | 平台配置增加手机端版本 |
| V17 | `V17__fix_seed_name_encoding.sql` | 修复 V7/V9/V11 种子数据双重编码乱码（菜单/选项/字典） |

> 乱码成因：历史某次执行 V7/V9/V11 时连接字符集为 latin1（MySQL 为 cp1252），UTF-8 中文被二次编码入库；V14 只修复了 V8 的菜单。修复脚本使用 `UNHEX` 十六进制字面量并用 `HEX(col) LIKE 'C3%'` 做幂等判断，与客户端编码无关。

## 重新生成 V1

```bash
python scripts/build_v1_baseline.py
```

## 启动方式

**空库或已经存在 `flyway_schema_history` 的数据库**：直接启动应用，Flyway 会执行尚未应用的迁移脚本。

**已有老库首次纳入 Flyway**：先备份数据库，再显式启用一次 `flyway-baseline` profile。

```bash
java -jar jshERP.jar --spring.profiles.active=flyway-baseline
```

`flyway-baseline` profile 对应配置文件 [`application-flyway-baseline.yml`](../application-flyway-baseline.yml)，会读取 `spring.flyway.baseline-version`，默认标记到 `8`，不会自动猜测数据库状态。首次 baseline 成功并生成 `flyway_schema_history` 后，后续恢复普通启动，并继续执行 V9+ 的增量脚本。

主配置中的 Flyway 默认项见 [`application.yml`](../application.yml) 的 `spring.flyway` 节点。

| 数据库状态 | 推荐行为 |
|------------|----------|
| 空库 | 普通启动，执行 V1→最新 |
| 已有完整扩展结构但无 `flyway_schema_history` | 启用一次 `flyway-baseline`，baseline 到 8 |
| 仅有核心 ERP 结构 | 在 `application-flyway-baseline.yml`（或启动参数）将 `spring.flyway.baseline-version` 设为 `1` 后启用一次 `flyway-baseline` |
| 已有 `flyway_schema_history` | 普通启动，仅执行未应用的后续版本 |

**生产**：禁止自动猜测 baseline。上线前必须先确认数据库实际版本并备份，再决定是否启用 `flyway-baseline`。应用配置统一使用 YAML（`application*.yml`），不再使用 `application*.properties`。
