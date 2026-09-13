-- jsh_depot_head：剩余订金字段（上游 2026-07-25 剩余订金功能）

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jsh_depot_head'
      AND COLUMN_NAME = 'last_deposit'
);

SET @ddl = IF(
    @col_exists = 0,
    'ALTER TABLE `jsh_depot_head` ADD COLUMN `last_deposit` decimal(24,6) NULL DEFAULT NULL COMMENT ''剩余订金'' AFTER `deposit`',
    'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 初始化历史数据（上游 f7a29a85）
UPDATE `jsh_depot_head` SET `last_deposit` = 0 WHERE `last_deposit` IS NULL;
