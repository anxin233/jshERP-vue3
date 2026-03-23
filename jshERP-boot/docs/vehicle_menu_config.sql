-- ============================================================
-- 客户车辆模块菜单权限配置脚本
-- 执行前请确认 jsh_function 表中"基础资料"菜单的 id
-- 以下假设"基础资料"菜单 id = 21（请根据实际数据库调整）
-- ============================================================

-- 查询"基础资料"父菜单id（执行此语句确认后再配置下方）
-- SELECT id, name, number FROM jsh_function WHERE name = '基础资料';

-- 插入"客户车辆"菜单（component 路径对应前端路由组件）
INSERT INTO `jsh_function` (
  `name`, `number`, `fathers_json`, `fathers_str`,
  `component`, `href`, `sort`, `push_btn_str`,
  `btn_str`, `delete_flag`
) VALUES (
  '客户车辆',                          -- 菜单名称
  'vehicle001',                        -- 菜单编号（唯一）
  '[21]',                              -- 父菜单id数组（替换21为实际基础资料id）
  '基础资料',                          -- 父菜单名称路径
  '/vehicle/VehicleList',              -- 前端组件路径
  NULL,                                -- 外链（无）
  99,                                  -- 排序
  '[{"name":"新增/编辑","number":"1"},{"name":"审核","number":"2"},{"name":"导出","number":"3"}]',
  NULL,
  '0'
);

-- 查询刚插入的菜单id用于后续授权
-- SELECT id, name, number FROM jsh_function WHERE number = 'vehicle001';

-- ============================================================
-- 给超管角色授权（假设超管角色 id = 1，请根据实际调整）
-- ============================================================
-- INSERT INTO `jsh_user_business` (type, key_id, value, btn_str, delete_flag)
-- SELECT 'RoleFunctions', 1,
--   CONCAT('[', id, ']'),
--   '[{"funId":' + id + ',"btns":["1","2","3"]}]',
--   '0'
-- FROM jsh_function WHERE number = 'vehicle001';

-- ============================================================
-- 简单验证脚本
-- ============================================================
SELECT id, name, number, component FROM jsh_function WHERE number = 'vehicle001';
