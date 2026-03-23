-- ===========================
-- 项目管理菜单权限配置SQL
-- 创建时间: 2026-03-10
-- 说明: 为角色添加项目管理菜单权限
-- ===========================

-- 说明：
-- 1. 首先查询菜单ID
-- 2. 然后为指定角色添加权限
-- 3. 需要同时更新 value 和 btn_str 两个字段

-- 步骤1: 查询项目管理菜单的ID
SELECT id, number, name FROM jsh_function WHERE number LIKE 'project%';
-- 结果应该是：
-- 262  project           项目管理
-- 263  project_category  项目类别
-- 264  project_info      项目信息

-- 步骤2: 查询当前用户的角色ID
-- 假设用户ID是120（admin用户）
SELECT key_id as role_id, value as role_ids
FROM jsh_user_business
WHERE type='UserRole' AND key_id='120';
-- 结果：role_id=120, role_ids=[4]，说明角色ID是4

-- 步骤3: 为角色4添加项目管理菜单权限（已执行）
-- 在原有的 value 字段末尾添加 [262][263][264]
UPDATE jsh_user_business
SET value = CONCAT(value, '[262][263][264]')
WHERE type='RoleFunctions'
  AND key_id='4'
  AND value NOT LIKE '%[262]%';  -- 避免重复添加

-- 步骤4: 为角色4添加项目管理菜单的按钮权限（已执行）
-- 在 btn_str 字段中添加项目类别和项目信息的按钮权限
-- funId:263 (项目类别) -> btnStr:"1,3" (编辑、导出)
-- funId:264 (项目信息) -> btnStr:"1,3" (编辑、导出)
UPDATE jsh_user_business
SET btn_str = JSON_ARRAY_APPEND(
    btn_str,
    '$',
    JSON_OBJECT('funId', 263, 'btnStr', '1,3'),
    '$',
    JSON_OBJECT('funId', 264, 'btnStr', '1,3')
)
WHERE type='RoleFunctions'
  AND key_id='4'
  AND btn_str NOT LIKE '%"funId":263%';  -- 避免重复添加

-- ===========================
-- 为其他角色添加权限的通用脚本
-- ===========================

-- 替换下面的 @role_id 为实际的角色ID
SET @role_id = 4;  -- 修改这里的角色ID

-- 添加菜单权限
UPDATE jsh_user_business
SET value = CONCAT(value, '[262][263][264]')
WHERE type='RoleFunctions'
  AND key_id=@role_id
  AND value NOT LIKE '%[262]%';

-- 添加按钮权限（简化版本，直接拼接JSON字符串）
UPDATE jsh_user_business
SET btn_str = CONCAT(
    TRIM(TRAILING ']' FROM btn_str),
    ',{"funId":263,"btnStr":"1,3"},{"funId":264,"btnStr":"1,3"}]'
)
WHERE type='RoleFunctions'
  AND key_id=@role_id
  AND btn_str NOT LIKE '%"funId":263%';

-- ===========================
-- 验证权限配置
-- ===========================

-- 查看角色的菜单权限
SELECT id, type, key_id, value
FROM jsh_user_business
WHERE type='RoleFunctions' AND key_id=@role_id;

-- 查看角色的按钮权限
SELECT id, type, key_id, btn_str
FROM jsh_user_business
WHERE type='RoleFunctions' AND key_id=@role_id;

-- ===========================
-- 注意事项
-- ===========================
-- 1. 用户需要重新登录才能看到新菜单
-- 2. 或者清除浏览器缓存和LocalStorage
-- 3. 确保后端服务已重启并加载了新的Mapper文件
