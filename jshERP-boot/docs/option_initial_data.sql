-- 选项中心初始数据（系统级，tenant_id 为 NULL，所有租户均可见）
-- 执行前请确保 jsh_option_group 和 jsh_option_item 表已存在

-- ============================================================
-- 1. 工单状态 (workorder_status)
--    value 与后端 status 字段保持一致（0~5 整数字符串）
-- ============================================================
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

-- ============================================================
-- 2. 车辆用途 (vehicle_purpose)
-- ============================================================
INSERT IGNORE INTO `jsh_option_group` (`code`, `name`, `scope`, `tenant_id`, `enabled`, `delete_flag`)
VALUES ('vehicle_purpose', '车辆用途', 'system', NULL, 1, '0');

INSERT IGNORE INTO `jsh_option_item` (`group_code`, `tenant_id`, `value`, `label`, `sort`, `enabled`, `is_default`, `hidden`, `delete_flag`)
VALUES
  ('vehicle_purpose', NULL, '乘用车', '乘用车', 0, 1, 1, 0, '0'),
  ('vehicle_purpose', NULL, '商用车', '商用车', 1, 1, 0, 0, '0'),
  ('vehicle_purpose', NULL, '专用车', '专用车', 2, 1, 0, 0, '0');

-- ============================================================
-- 3. 客户来源 (customer_source)
-- ============================================================
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
