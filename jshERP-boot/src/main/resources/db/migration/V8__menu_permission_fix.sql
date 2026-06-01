-- Extension module menus and admin role permissions (idempotent)
-- Menus: project, vehicle, workorder, option
-- Role: jsh_role.id=4 (管理员), NOT manage.roleId=10

-- Fix project menu component paths
UPDATE `jsh_function`
SET `component` = '/project/ProjectCategoryList'
WHERE `number` = 'project_category'
  AND (`component` IS NULL OR `component` <> '/project/ProjectCategoryList');

UPDATE `jsh_function`
SET `component` = '/project/ProjectList'
WHERE `number` = 'project_info'
  AND (`component` IS NULL OR `component` <> '/project/ProjectList');

-- Project management menus (type=0 per production)
INSERT INTO `jsh_function` (
    `number`, `name`, `parent_number`, `url`, `component`,
    `sort`, `enabled`, `icon`, `type`, `push_btn`, `delete_flag`
)
SELECT 'project', '项目管理', '0', '/project', '/layouts/TabLayout',
       '150', b'1', 'project', '0', NULL, '0'
WHERE NOT EXISTS (SELECT 1 FROM `jsh_function` WHERE `number` = 'project');

INSERT INTO `jsh_function` (
    `number`, `name`, `parent_number`, `url`, `component`,
    `sort`, `enabled`, `icon`, `type`, `push_btn`, `delete_flag`
)
SELECT 'project_category', '项目类别', 'project', '/project/category', '/project/ProjectCategoryList',
       '151', b'1', 'folder', '0', '1,3', '0'
WHERE NOT EXISTS (SELECT 1 FROM `jsh_function` WHERE `number` = 'project_category');

INSERT INTO `jsh_function` (
    `number`, `name`, `parent_number`, `url`, `component`,
    `sort`, `enabled`, `icon`, `type`, `push_btn`, `delete_flag`
)
SELECT 'project_info', '项目信息', 'project', '/project/info', '/project/ProjectList',
       '152', b'1', 'file-text', '0', '1,3', '0'
WHERE NOT EXISTS (SELECT 1 FROM `jsh_function` WHERE `number` = 'project_info');

-- Work order menus (type=电脑端)
INSERT INTO `jsh_function` (
    `number`, `name`, `parent_number`, `url`, `component`,
    `sort`, `enabled`, `state`, `type`, `push_btn`, `delete_flag`
)
SELECT 'workorder', '工单管理', '0', '/workorder', '/layouts/TabLayout',
       '0900', b'1', b'0', '电脑端', NULL, '0'
WHERE NOT EXISTS (SELECT 1 FROM `jsh_function` WHERE `number` = 'workorder');

INSERT INTO `jsh_function` (
    `number`, `name`, `parent_number`, `url`, `component`,
    `sort`, `enabled`, `state`, `type`, `push_btn`, `delete_flag`
)
SELECT 'workorder_info', '工单信息', 'workorder', '/workorder/workOrderList', '/workorder/WorkOrderList',
       '0901', b'1', b'0', '电脑端', '1,3', '0'
WHERE NOT EXISTS (SELECT 1 FROM `jsh_function` WHERE `number` = 'workorder_info');

-- Vehicle menu under 基础资料 (0102)
INSERT INTO `jsh_function` (
    `number`, `name`, `parent_number`, `url`, `component`,
    `sort`, `enabled`, `state`, `type`, `push_btn`, `delete_flag`
)
SELECT '01020104', '客户车辆', '0102', '/vehicle/vehicleList', '/vehicle/VehicleList',
       '0264', b'1', b'0', '电脑端', '1,3', '0'
WHERE NOT EXISTS (SELECT 1 FROM `jsh_function` WHERE `number` = '01020104');

-- Option menu under 系统管理 (0001)
INSERT INTO `jsh_function` (
    `number`, `name`, `parent_number`, `url`, `component`,
    `sort`, `enabled`, `state`, `type`, `push_btn`, `delete_flag`
)
SELECT '0910', '选项管理', '0001', '/system/optionList', '/system/OptionList',
       '0910', b'1', b'0', '电脑端', '1', '0'
WHERE NOT EXISTS (SELECT 1 FROM `jsh_function` WHERE `number` = '0910');

-- Grant menu access to admin role (key_id='4')
SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '4';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project_category' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '4';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project_info' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '4';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'workorder' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '4';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'workorder_info' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '4';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = '01020104' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '4';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = '0910' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '4';

-- Button permissions (btn_str) for admin role
SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project_category' LIMIT 1);
UPDATE `jsh_user_business`
SET `btn_str` = JSON_ARRAY_APPEND(
    IF(`btn_str` IS NULL OR TRIM(`btn_str`) = '' OR JSON_VALID(`btn_str`) = 0, JSON_ARRAY(), CAST(`btn_str` AS JSON)),
    '$', JSON_OBJECT('funId', @mid, 'btnStr', '1,3')
)
WHERE `type` = 'RoleFunctions' AND `key_id` = '4'
  AND @mid IS NOT NULL
  AND COALESCE(`btn_str`, '') NOT LIKE CONCAT('%"funId":', @mid, '%');

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project_info' LIMIT 1);
UPDATE `jsh_user_business`
SET `btn_str` = JSON_ARRAY_APPEND(
    IF(`btn_str` IS NULL OR TRIM(`btn_str`) = '' OR JSON_VALID(`btn_str`) = 0, JSON_ARRAY(), CAST(`btn_str` AS JSON)),
    '$', JSON_OBJECT('funId', @mid, 'btnStr', '1,3')
)
WHERE `type` = 'RoleFunctions' AND `key_id` = '4'
  AND @mid IS NOT NULL
  AND COALESCE(`btn_str`, '') NOT LIKE CONCAT('%"funId":', @mid, '%');

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'workorder_info' LIMIT 1);
UPDATE `jsh_user_business`
SET `btn_str` = JSON_ARRAY_APPEND(
    IF(`btn_str` IS NULL OR TRIM(`btn_str`) = '' OR JSON_VALID(`btn_str`) = 0, JSON_ARRAY(), CAST(`btn_str` AS JSON)),
    '$', JSON_OBJECT('funId', @mid, 'btnStr', '1,3')
)
WHERE `type` = 'RoleFunctions' AND `key_id` = '4'
  AND @mid IS NOT NULL
  AND COALESCE(`btn_str`, '') NOT LIKE CONCAT('%"funId":', @mid, '%');

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = '01020104' LIMIT 1);
UPDATE `jsh_user_business`
SET `btn_str` = JSON_ARRAY_APPEND(
    IF(`btn_str` IS NULL OR TRIM(`btn_str`) = '' OR JSON_VALID(`btn_str`) = 0, JSON_ARRAY(), CAST(`btn_str` AS JSON)),
    '$', JSON_OBJECT('funId', @mid, 'btnStr', '1,3')
)
WHERE `type` = 'RoleFunctions' AND `key_id` = '4'
  AND @mid IS NOT NULL
  AND COALESCE(`btn_str`, '') NOT LIKE CONCAT('%"funId":', @mid, '%');

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = '0910' LIMIT 1);
UPDATE `jsh_user_business`
SET `btn_str` = JSON_ARRAY_APPEND(
    IF(`btn_str` IS NULL OR TRIM(`btn_str`) = '' OR JSON_VALID(`btn_str`) = 0, JSON_ARRAY(), CAST(`btn_str` AS JSON)),
    '$', JSON_OBJECT('funId', @mid, 'btnStr', '1')
)
WHERE `type` = 'RoleFunctions' AND `key_id` = '4'
  AND @mid IS NOT NULL
  AND COALESCE(`btn_str`, '') NOT LIKE CONCAT('%"funId":', @mid, '%');
