-- Local database sync for changes recorded up to 2026-06-01.
-- Do not execute docs/数据库更新记录-首次安装请勿使用.txt as a whole: it is a historical,
-- non-idempotent upgrade log. This migration contains only the current-code deltas
-- verified against the local database after baseline 8 + V9 + V10.

-- Expand role permission storage for larger menu and button permission payloads.
ALTER TABLE `jsh_user_business`
  MODIFY COLUMN `value` text NULL COMMENT '值',
  MODIFY COLUMN `btn_str` varchar(20000) NULL COMMENT '按钮权限';

-- Add debt columns used by DepotHead entity, mapper XML, sales list, and debt APIs.
SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'jsh_depot_head'
    AND COLUMN_NAME = 'debt'
);

SET @ddl = IF(
  @col_exists = 0,
  'ALTER TABLE `jsh_depot_head` ADD COLUMN `debt` decimal(24,6) DEFAULT NULL COMMENT ''本次欠款'' AFTER `deposit`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'jsh_depot_head'
    AND COLUMN_NAME = 'last_debt'
);

SET @ddl = IF(
  @col_exists = 0,
  'ALTER TABLE `jsh_depot_head` ADD COLUMN `last_debt` decimal(24,6) DEFAULT NULL COMMENT ''最终欠款'' AFTER `debt`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add dictionary management menu for the existing SysDict frontend/backend module.
INSERT INTO `jsh_function`
  (`number`, `name`, `parent_number`, `url`, `component`, `state`, `sort`, `enabled`, `type`, `push_btn`, `icon`, `delete_flag`)
SELECT '000113', '字典管理', '0001', '/system/dict', '/system/DictList',
       b'0', '0172', b'1', '电脑版', '', 'profile', '0'
WHERE NOT EXISTS (
  SELECT 1 FROM `jsh_function` WHERE `number` = '000113'
);

-- Update historical menu names precisely by component. The local database has duplicate number=000105.
UPDATE `jsh_function`
SET `name` = '菜单管理'
WHERE `number` = '000105'
  AND `component` = '/system/FunctionList';

UPDATE `jsh_function`
SET `name` = '部门管理'
WHERE `number` = '000108'
  AND `component` = '/system/OrganizationList';

UPDATE `jsh_role`
SET `type` = '本部门数据'
WHERE `type` = '本机构数据';

-- Grant dictionary menu access to admin role id=4.
SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = '000113' LIMIT 1);

UPDATE `jsh_user_business`
SET `value` = CONCAT(
  RTRIM(COALESCE(`value`, '')),
  IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), COALESCE(`value`, '')) = 0, CONCAT('[', @mid, ']'), '')
)
WHERE `type` = 'RoleFunctions'
  AND `key_id` = '4';
