-- Option center tables and system-level initial data

CREATE TABLE IF NOT EXISTS `jsh_option_group` (
  `id`           bigint(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code`         varchar(64)  NOT NULL COMMENT '选项组编码（如 customer_source）',
  `name`         varchar(100) NOT NULL COMMENT '选项组名称（如 客户来源）',
  `scope`        varchar(20)  NOT NULL DEFAULT 'system' COMMENT '作用域：system-系统级, tenant-租户级',
  `tenant_id`    bigint(20)            DEFAULT NULL COMMENT '租户ID，系统级为空',
  `remark`       varchar(255)         DEFAULT NULL COMMENT '备注',
  `enabled`      tinyint(1)  NOT NULL DEFAULT 1 COMMENT '是否启用',
  `create_time`  datetime             DEFAULT CURRENT_TIMESTAMP,
  `update_time`  datetime             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_flag`  char(1)     NOT NULL DEFAULT '0' COMMENT '删除标记 0=正常 1=删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code_tenant` (`code`,`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通用下拉选项-选项组';

CREATE TABLE IF NOT EXISTS `jsh_option_item` (
  `id`           bigint(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
  `group_code`   varchar(64)  NOT NULL COMMENT '所属选项组编码',
  `tenant_id`    bigint(20)            DEFAULT NULL COMMENT '租户ID，系统级为空',
  `value`        varchar(64)  NOT NULL COMMENT '选项值（存入业务表的代码）',
  `label`        varchar(100) NOT NULL COMMENT '选项名称（展示用）',
  `sort`         int(11)      NOT NULL DEFAULT 0 COMMENT '排序号',
  `enabled`      tinyint(1)   NOT NULL DEFAULT 1 COMMENT '是否启用',
  `is_default`   tinyint(1)   NOT NULL DEFAULT 0 COMMENT '是否默认选中',
  `hidden`       tinyint(1)   NOT NULL DEFAULT 0 COMMENT '是否隐藏系统默认项',
  `create_time`  datetime              DEFAULT CURRENT_TIMESTAMP,
  `update_time`  datetime              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_flag`  char(1)      NOT NULL DEFAULT '0' COMMENT '删除标记 0=正常 1=删除',
  PRIMARY KEY (`id`),
  KEY `idx_group_tenant` (`group_code`,`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通用下拉选项-选项项';

INSERT IGNORE INTO `jsh_option_group` (`code`, `name`, `scope`, `tenant_id`, `enabled`, `delete_flag`)
VALUES ('workorder_status', '工单状态', 'system', NULL, 1, '0');

INSERT IGNORE INTO `jsh_option_item` (`group_code`, `tenant_id`, `value`, `label`, `sort`, `enabled`, `is_default`, `hidden`, `delete_flag`)
VALUES
  ('workorder_status', NULL, '0', '草稿',   0, 1, 1, 0, '0'),
  ('workorder_status', NULL, '1', '待派工', 1, 1, 0, 0, '0'),
  ('workorder_status', NULL, '2', '维修中', 2, 1, 0, 0, '0'),
  ('workorder_status', NULL, '3', '待结算', 3, 1, 0, 0, '0'),
  ('workorder_status', NULL, '4', '已结算', 4, 1, 0, 0, '0'),
  ('workorder_status', NULL, '5', '已取消', 5, 1, 0, 0, '0');

INSERT IGNORE INTO `jsh_option_group` (`code`, `name`, `scope`, `tenant_id`, `enabled`, `delete_flag`)
VALUES ('vehicle_purpose', '车辆用途', 'system', NULL, 1, '0');

INSERT IGNORE INTO `jsh_option_item` (`group_code`, `tenant_id`, `value`, `label`, `sort`, `enabled`, `is_default`, `hidden`, `delete_flag`)
VALUES
  ('vehicle_purpose', NULL, '乘用车', '乘用车', 0, 1, 1, 0, '0'),
  ('vehicle_purpose', NULL, '商用车', '商用车', 1, 1, 0, 0, '0'),
  ('vehicle_purpose', NULL, '专用车', '专用车', 2, 1, 0, 0, '0');

INSERT IGNORE INTO `jsh_option_group` (`code`, `name`, `scope`, `tenant_id`, `enabled`, `delete_flag`)
VALUES ('customer_source', '客户来源', 'system', NULL, 1, '0');

INSERT IGNORE INTO `jsh_option_item` (`group_code`, `tenant_id`, `value`, `label`, `sort`, `enabled`, `is_default`, `hidden`, `delete_flag`)
VALUES
  ('customer_source', NULL, 'ZRLF', '自然来访', 0, 1, 1, 0, '0'),
  ('customer_source', NULL, 'FRJJ', '朋友介绍', 1, 1, 0, 0, '0'),
  ('customer_source', NULL, 'WLZH', '网络渠道', 2, 1, 0, 0, '0'),
  ('customer_source', NULL, 'DHYY', '电话预约', 3, 1, 0, 0, '0'),
  ('customer_source', NULL, 'BXLD', '保险理赔', 4, 1, 0, 0, '0'),
  ('customer_source', NULL, 'QTLY', '其他',     5, 1, 0, 0, '0');
