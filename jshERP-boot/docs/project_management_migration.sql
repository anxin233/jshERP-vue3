-- ===========================
-- 项目管理模块数据库迁移脚本
-- 创建时间: 2026-03-09
-- 说明: 包含项目类别表和项目信息表
-- ===========================

-- ----------------------------
-- Table structure for jsh_project_category
-- ----------------------------
DROP TABLE IF EXISTS `jsh_project_category`;
CREATE TABLE `jsh_project_category`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '类别名称',
  `category_level` smallint(0) NULL DEFAULT NULL COMMENT '等级',
  `parent_id` bigint(0) NULL DEFAULT NULL COMMENT '上级id',
  `sort` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '显示顺序',
  `serial_no` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '编号',
  `remark` varchar(1024) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint(0) NULL DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `parent_id`(`parent_id`) USING BTREE,
  INDEX `tenant_id`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '项目类别表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jsh_project_category (示例数据)
-- ----------------------------
INSERT INTO `jsh_project_category` VALUES (1, '软件开发', NULL, NULL, '10', 'PRJ_CAT_001', '软件开发类项目', NOW(), NOW(), 63, '0');
INSERT INTO `jsh_project_category` VALUES (2, 'Web开发', NULL, 1, '11', 'PRJ_CAT_002', 'Web应用开发', NOW(), NOW(), 63, '0');
INSERT INTO `jsh_project_category` VALUES (3, '移动开发', NULL, 1, '12', 'PRJ_CAT_003', '移动应用开发', NOW(), NOW(), 63, '0');
INSERT INTO `jsh_project_category` VALUES (4, '咨询服务', NULL, NULL, '20', 'PRJ_CAT_004', '咨询服务类项目', NOW(), NOW(), 63, '0');

-- ----------------------------
-- Table structure for jsh_project
-- ----------------------------
DROP TABLE IF EXISTS `jsh_project`;
CREATE TABLE `jsh_project`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '项目名称',
  `category_id` bigint(0) NULL DEFAULT NULL COMMENT '项目类别id',
  `hourly_rate` decimal(24, 2) NULL DEFAULT NULL COMMENT '工时单价（元/小时）',
  `default_hours` decimal(24, 2) NULL DEFAULT NULL COMMENT '默认工时（小时）',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  `enabled` bit(1) NULL DEFAULT b'1' COMMENT '启用 0-禁用  1-启用',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `tenant_id` bigint(0) NULL DEFAULT NULL COMMENT '租户id',
  `delete_flag` varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `category_id`(`category_id`) USING BTREE,
  INDEX `tenant_id`(`tenant_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '项目信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jsh_project (示例数据)
-- ----------------------------
INSERT INTO `jsh_project` VALUES (1, 'ERP系统开发', 2, 500.00, 160.00, '企业资源规划系统开发项目', b'1', NOW(), NOW(), 63, '0');
INSERT INTO `jsh_project` VALUES (2, '移动商城APP', 3, 600.00, 200.00, '电商移动应用开发', b'1', NOW(), NOW(), 63, '0');
INSERT INTO `jsh_project` VALUES (3, '企业管理咨询', 4, 800.00, 80.00, '企业管理流程优化咨询', b'1', NOW(), NOW(), 63, '0');
