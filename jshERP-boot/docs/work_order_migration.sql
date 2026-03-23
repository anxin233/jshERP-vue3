-- 工单管理模块数据库迁移脚本
-- 包含：工单主表、工单服务项目明细表、工单材料明细表、菜单配置

-- ============================================================
-- 1. 工单主表
-- ============================================================
CREATE TABLE IF NOT EXISTS `jsh_work_order` (
  `id`                    bigint       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_no`              varchar(30)  DEFAULT NULL COMMENT '工单编号（WO+日期+序号）',
  `vehicle_id`            bigint       DEFAULT NULL COMMENT '客户车辆ID',
  `license_plate`         varchar(30)  DEFAULT NULL COMMENT '车牌号（冗余，省份+号码）',
  `customer_name`         varchar(60)  DEFAULT NULL COMMENT '客户姓名',
  `customer_phone`        varchar(20)  DEFAULT NULL COMMENT '客户手机号',
  `vehicle_info`          varchar(100) DEFAULT NULL COMMENT '车辆信息（品牌车型）',
  `vin`                   varchar(20)  DEFAULT NULL COMMENT 'VIN码',
  `mileage`               int          DEFAULT NULL COMMENT '进厂里程(km)',
  `fault_desc`            text         COMMENT '故障描述/客户主诉',
  `handler_name`          varchar(60)  DEFAULT NULL COMMENT '经手人',
  `intake_time`           datetime     DEFAULT NULL COMMENT '接车时间',
  `estimated_finish_time` datetime     DEFAULT NULL COMMENT '预计完工时间',
  `actual_finish_time`    datetime     DEFAULT NULL COMMENT '实际完工时间',
  `status`                tinyint      DEFAULT 0   COMMENT '状态:0草稿,1待派工,2维修中,3待结算,4已结算,5已取消',
  `labor_amount`          decimal(12,2) DEFAULT 0.00 COMMENT '工时费合计',
  `material_amount`       decimal(12,2) DEFAULT 0.00 COMMENT '材料费合计',
  `other_amount`          decimal(12,2) DEFAULT 0.00 COMMENT '其他费用',
  `total_amount`          decimal(12,2) DEFAULT 0.00 COMMENT '合计金额（工时+材料+其他）',
  `discount_amount`       decimal(12,2) DEFAULT 0.00 COMMENT '优惠金额',
  `payable_amount`        decimal(12,2) DEFAULT 0.00 COMMENT '应收金额（合计-优惠）',
  `payment_status`        tinyint      DEFAULT 0   COMMENT '付款状态:0未付,1部分付款,2已付清',
  `remark`                varchar(500) DEFAULT NULL COMMENT '备注',
  `create_time`           datetime     DEFAULT NULL COMMENT '创建时间',
  `update_time`           datetime     DEFAULT NULL COMMENT '更新时间',
  `tenant_id`             bigint       DEFAULT NULL COMMENT '租户ID',
  `delete_flag`           varchar(1)   DEFAULT '0' COMMENT '删除标记:0正常,1删除',
  PRIMARY KEY (`id`),
  KEY `idx_wo_vehicle_id`   (`vehicle_id`),
  KEY `idx_wo_tenant_id`    (`tenant_id`),
  KEY `idx_wo_order_no`     (`order_no`),
  KEY `idx_wo_status`       (`status`),
  KEY `idx_wo_intake_time`  (`intake_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单主表';

-- ============================================================
-- 2. 工单服务项目明细（工时/工序）
-- ============================================================
CREATE TABLE IF NOT EXISTS `jsh_work_order_project` (
  `id`           bigint        NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_id`     bigint        NOT NULL COMMENT '工单ID',
  `project_id`   bigint        DEFAULT NULL COMMENT '关联项目ID（jsh_project，允许为空）',
  `project_name` varchar(100)  DEFAULT NULL COMMENT '服务项目名称',
  `unit_price`   decimal(12,2) DEFAULT 0.00 COMMENT '单价（元）',
  `quantity`     decimal(10,2) DEFAULT 1.00 COMMENT '数量/工时',
  `discount_rate` decimal(5,2) DEFAULT 100.00 COMMENT '折扣率(0~100)',
  `amount`       decimal(12,2) DEFAULT 0.00 COMMENT '金额=单价×数量×折扣率/100',
  `worker_name`  varchar(60)   DEFAULT NULL COMMENT '施工人员',
  `remark`       varchar(200)  DEFAULT NULL COMMENT '备注',
  `sort`         int           DEFAULT 0   COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_wop_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单服务项目明细';

-- ============================================================
-- 3. 工单材料明细（配件/商品）
-- ============================================================
CREATE TABLE IF NOT EXISTS `jsh_work_order_material` (
  `id`            bigint        NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_id`      bigint        NOT NULL COMMENT '工单ID',
  `material_id`   bigint        DEFAULT NULL COMMENT '商品ID（jsh_material，允许为空手动录入）',
  `material_name` varchar(100)  DEFAULT NULL COMMENT '商品名称',
  `standard`      varchar(60)   DEFAULT NULL COMMENT '规格',
  `model`         varchar(60)   DEFAULT NULL COMMENT '型号',
  `unit`          varchar(20)   DEFAULT NULL COMMENT '单位',
  `unit_price`    decimal(12,2) DEFAULT 0.00 COMMENT '单价（元）',
  `quantity`      decimal(10,2) DEFAULT 1.00 COMMENT '数量',
  `discount_rate` decimal(5,2)  DEFAULT 100.00 COMMENT '折扣率(0~100)',
  `amount`        decimal(12,2) DEFAULT 0.00 COMMENT '金额=单价×数量×折扣率/100',
  `remark`        varchar(200)  DEFAULT NULL COMMENT '备注',
  `sort`          int           DEFAULT 0   COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_wom_order_id`    (`order_id`),
  KEY `idx_wom_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单材料明细';

-- ============================================================
-- 4. 菜单配置
--    工单管理（根目录）id=266
--    工单信息        id=267
-- ============================================================
INSERT INTO `jsh_function` (`number`, `name`, `parent_number`, `component`, `url`, `sort`, `enabled`, `state`, `type`, `push_btn`, `delete_flag`)
VALUES
  ('workorder',      '工单管理', '0',         '/layouts/TabLayout',          NULL,                    '0900', 1, 0, '电脑端', NULL, '0'),
  ('workorder_info', '工单信息', 'workorder',  '/workorder/WorkOrderList',    '/workorder/workOrderList', '0901', 1, 0, '电脑端', '1,3', '0');

-- ============================================================
-- 5. 为 admin 角色授权（role_id=4）
-- ============================================================
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), '[266][267]')
WHERE `type` = 'RoleFunctions' AND `key_id` = 4;
