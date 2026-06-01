-- Link work order to financial account head (idempotent)

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jsh_account_head'
      AND COLUMN_NAME = 'work_order_id'
);

SET @ddl = IF(
    @col_exists = 0,
    'ALTER TABLE `jsh_account_head` ADD COLUMN `work_order_id` BIGINT NULL COMMENT ''关联工单ID'' AFTER `delete_flag`',
    'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
