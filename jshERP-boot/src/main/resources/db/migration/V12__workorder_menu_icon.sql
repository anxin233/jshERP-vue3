-- 工单管理菜单出厂未配置 icon，补为 tool（与 LegacyIcon 映射一致）
UPDATE `jsh_function`
SET `icon` = 'tool'
WHERE `number` = 'workorder'
  AND (`icon` IS NULL OR TRIM(`icon`) = '');

UPDATE `jsh_function`
SET `icon` = 'profile'
WHERE `number` = 'workorder_info'
  AND (`icon` IS NULL OR TRIM(`icon`) = '');
