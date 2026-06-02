-- jsh_system_config：商品价格含税标记（与 SystemConfig 实体 / jsh_erp.sql 对齐）

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jsh_system_config'
      AND COLUMN_NAME = 'material_price_tax_flag'
);

SET @ddl = IF(
    @col_exists = 0,
    'ALTER TABLE `jsh_system_config` ADD COLUMN `material_price_tax_flag` varchar(1) DEFAULT ''0'' COMMENT ''商品价格含税启用标记，0未启用，1启用'' AFTER `customer_static_price_flag`',
    'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
