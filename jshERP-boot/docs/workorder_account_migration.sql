-- 将工单结算纳入账户统计的数据库更新脚本

ALTER TABLE `jsh_account_head`
  ADD COLUMN `work_order_id` BIGINT NULL COMMENT '关联工单ID' AFTER `delete_flag`;

