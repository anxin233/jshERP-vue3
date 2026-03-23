-- ===========================
-- 项目管理菜单配置SQL
-- 创建时间: 2026-03-09
-- 说明: 在功能管理中添加项目管理菜单
-- ===========================

-- 插入一级菜单：项目管理
INSERT INTO `jsh_function` (`number`, `name`, `parent_number`, `url`, `component`, `sort`, `enabled`, `icon`, `type`, `push_btn`, `delete_flag`)
VALUES ('project', '项目管理', '0', '/project', '/layouts/TabLayout', '150', b'1', 'project', '0', NULL, '0');

-- 插入二级菜单：项目类别
INSERT INTO `jsh_function` (`number`, `name`, `parent_number`, `url`, `component`, `sort`, `enabled`, `icon`, `type`, `push_btn`, `delete_flag`)
VALUES ('project_category', '项目类别', 'project', '/project/category', '/project/ProjectCategoryList', '151', b'1', 'folder', '0', '1,3', '0');

-- 插入二级菜单：项目信息
INSERT INTO `jsh_function` (`number`, `name`, `parent_number`, `url`, `component`, `sort`, `enabled`, `icon`, `type`, `push_btn`, `delete_flag`)
VALUES ('project_info', '项目信息', 'project', '/project/info', '/project/ProjectList', '152', b'1', 'file-text', '0', '1,3', '0');

-- 说明：
-- 1. number: 菜单编号，唯一标识
-- 2. name: 菜单名称
-- 3. parent_number: 父菜单编号，'0'表示顶级菜单
-- 4. url: 前端路由路径
-- 5. component: Vue组件路径
-- 6. sort: 排序号
-- 7. enabled: 是否启用，b'1'表示启用
-- 8. icon: 图标名称（Ant Design Vue图标）
-- 9. type: 类型，'0'表示菜单
-- 10. push_btn: 功能按钮，'1'表示编辑，'3'表示导出
-- 11. tenant_id: 租户ID，63是默认租户
