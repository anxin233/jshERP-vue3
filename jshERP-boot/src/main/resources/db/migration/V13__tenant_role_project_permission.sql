-- Grant project module menu + button permissions to tenant role (jsh_role.id=10, manage.roleId=10)
-- V8 only covered role id=4; tenant admins use role 10.

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '10';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project_category' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '10';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project_info' LIMIT 1);
UPDATE `jsh_user_business`
SET `value` = CONCAT(RTRIM(`value`), IF(@mid IS NOT NULL AND LOCATE(CONCAT('[', @mid, ']'), `value`) = 0, CONCAT('[', @mid, ']'), ''))
WHERE `type` = 'RoleFunctions' AND `key_id` = '10';

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project_category' LIMIT 1);
UPDATE `jsh_user_business`
SET `btn_str` = JSON_ARRAY_APPEND(
    IF(`btn_str` IS NULL OR TRIM(`btn_str`) = '' OR JSON_VALID(`btn_str`) = 0, JSON_ARRAY(), CAST(`btn_str` AS JSON)),
    '$', JSON_OBJECT('funId', @mid, 'btnStr', '1,3')
)
WHERE `type` = 'RoleFunctions' AND `key_id` = '10'
  AND @mid IS NOT NULL
  AND COALESCE(`btn_str`, '') NOT LIKE CONCAT('%"funId":', @mid, '%');

SET @mid = (SELECT `id` FROM `jsh_function` WHERE `number` = 'project_info' LIMIT 1);
UPDATE `jsh_user_business`
SET `btn_str` = JSON_ARRAY_APPEND(
    IF(`btn_str` IS NULL OR TRIM(`btn_str`) = '' OR JSON_VALID(`btn_str`) = 0, JSON_ARRAY(), CAST(`btn_str` AS JSON)),
    '$', JSON_OBJECT('funId', @mid, 'btnStr', '1,3')
)
WHERE `type` = 'RoleFunctions' AND `key_id` = '10'
  AND @mid IS NOT NULL
  AND COALESCE(`btn_str`, '') NOT LIKE CONCAT('%"funId":', @mid, '%');
