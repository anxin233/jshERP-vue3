-- 系统字典模块（合并分支引入，供 SysDictTypeService 启动加载缓存）

CREATE TABLE IF NOT EXISTS `jsh_sys_dict_type` (
  `dict_id` bigint NOT NULL AUTO_INCREMENT COMMENT '字典主键',
  `dict_name` varchar(100) DEFAULT '' COMMENT '字典名称',
  `dict_type` varchar(100) DEFAULT '' COMMENT '字典类型',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `delete_flag` varchar(1) DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`dict_id`),
  UNIQUE KEY `dict_type` (`dict_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典类型表';

CREATE TABLE IF NOT EXISTS `jsh_sys_dict_data` (
  `dict_code` bigint NOT NULL AUTO_INCREMENT COMMENT '字典编码',
  `dict_sort` int DEFAULT 0 COMMENT '字典排序',
  `dict_label` varchar(100) DEFAULT '' COMMENT '字典标签',
  `dict_value` varchar(100) DEFAULT '' COMMENT '字典键值',
  `dict_type` varchar(100) DEFAULT '' COMMENT '字典类型',
  `css_class` varchar(100) DEFAULT NULL COMMENT '样式属性',
  `list_class` varchar(100) DEFAULT NULL COMMENT '表格回显样式',
  `is_default` char(1) DEFAULT 'N' COMMENT '是否默认（Y是 N否）',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `delete_flag` varchar(1) DEFAULT '0' COMMENT '删除标记，0未删除，1删除',
  PRIMARY KEY (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典数据表';

INSERT IGNORE INTO `jsh_sys_dict_type` (`dict_id`, `dict_name`, `dict_type`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `delete_flag`) VALUES
(1, '用户性别', 'sys_user_sex', '0', 'admin', '2021-12-15 21:36:18', 'admin', '2026-04-02 16:20:41', '用户性别列表', '0'),
(12, '系统开关', 'sys_normal_disable', '0', 'admin', '2026-04-03 22:30:57', 'admin', '2026-04-04 21:41:09', '系统开关列表', '0');

INSERT IGNORE INTO `jsh_sys_dict_data` (`dict_code`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`, `delete_flag`) VALUES
(1, 1, '男', '0', 'sys_user_sex', '', 'default', 'Y', '0', 'admin', '2021-12-15 21:36:18', 'admin', '2026-04-04 22:38:19', '性别男', '0'),
(2, 2, '女', '1', 'sys_user_sex', '', 'default', 'N', '0', 'admin', '2021-12-15 21:36:18', 'admin', '2026-04-04 22:38:27', '性别女', '0'),
(11, 1, '正常', '0', 'sys_normal_disable', NULL, 'green', 'N', '0', 'admin', '2026-04-03 22:31:34', 'admin', '2026-04-04 22:35:39', '正常状态', '0'),
(12, 2, '停用', '1', 'sys_normal_disable', NULL, 'red', 'N', '0', 'admin', '2026-04-03 22:32:03', 'admin', '2026-04-04 21:38:10', '停用状态', '0');
