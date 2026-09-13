-- 修复种子数据双重编码乱码（UTF-8 字节被按 Latin-1/cp1252 连接字符集再次编码后入库）。
-- 背景：V7(选项中心)/V9(字典)/V11(本地库同步) 在历史某次执行时连接字符集为 latin1，
--       其中文值被双重编码；V14 只修复了 V8 的菜单，遗漏了菜单/选项/字典其余数据。
-- 幂等：仅更新 HEX 仍以 C3 开头（双重编码特征）的行；UNHEX 写法与客户端编码无关。

UPDATE `jsh_function`
SET
    `name` = CONVERT(UNHEX('E88F9CE58D95E7AEA1E79086') USING utf8mb4)
WHERE `number` = '000105'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET
    `name` = CONVERT(UNHEX('E983A8E997A8E7AEA1E79086') USING utf8mb4)
WHERE `number` = '000108'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET
    `name` = CONVERT(UNHEX('E5AD97E585B8E7AEA1E79086') USING utf8mb4)
WHERE `number` = '000113'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET
    `type` = CONVERT(UNHEX('E794B5E88491E78988') USING utf8mb4)
WHERE HEX(`type`) LIKE 'C3%';

UPDATE `jsh_option_group`
SET
    `name` = CONVERT(UNHEX('E5B7A5E58D95E78AB6E68081') USING utf8mb4)
WHERE `code` = 'workorder_status'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_option_group`
SET
    `name` = CONVERT(UNHEX('E8BDA6E8BE86E794A8E98094') USING utf8mb4)
WHERE `code` = 'vehicle_purpose'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_option_group`
SET
    `name` = CONVERT(UNHEX('E5AEA2E688B7E69DA5E6BA90') USING utf8mb4)
WHERE `code` = 'customer_source'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E88D89E7A8BF') USING utf8mb4)
WHERE `group_code` = 'workorder_status'
  AND `value` = '0'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E5BE85E6B4BEE5B7A5') USING utf8mb4)
WHERE `group_code` = 'workorder_status'
  AND `value` = '1'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E7BBB4E4BFAEE4B8AD') USING utf8mb4)
WHERE `group_code` = 'workorder_status'
  AND `value` = '2'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E5BE85E7BB93E7AE97') USING utf8mb4)
WHERE `group_code` = 'workorder_status'
  AND `value` = '3'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E5B7B2E7BB93E7AE97') USING utf8mb4)
WHERE `group_code` = 'workorder_status'
  AND `value` = '4'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E5B7B2E58F96E6B688') USING utf8mb4)
WHERE `group_code` = 'workorder_status'
  AND `value` = '5'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `value` = CONVERT(UNHEX('E4B998E794A8E8BDA6') USING utf8mb4),
    `label` = CONVERT(UNHEX('E4B998E794A8E8BDA6') USING utf8mb4)
WHERE `group_code` = 'vehicle_purpose'
  AND `sort` = 0
  AND HEX(`value`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `value` = CONVERT(UNHEX('E59586E794A8E8BDA6') USING utf8mb4),
    `label` = CONVERT(UNHEX('E59586E794A8E8BDA6') USING utf8mb4)
WHERE `group_code` = 'vehicle_purpose'
  AND `sort` = 1
  AND HEX(`value`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `value` = CONVERT(UNHEX('E4B893E794A8E8BDA6') USING utf8mb4),
    `label` = CONVERT(UNHEX('E4B893E794A8E8BDA6') USING utf8mb4)
WHERE `group_code` = 'vehicle_purpose'
  AND `sort` = 2
  AND HEX(`value`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E887AAE784B6E69DA5E8AEBF') USING utf8mb4)
WHERE `group_code` = 'customer_source'
  AND `value` = 'ZRLF'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E69C8BE58F8BE4BB8BE7BB8D') USING utf8mb4)
WHERE `group_code` = 'customer_source'
  AND `value` = 'FRJJ'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E7BD91E7BB9CE6B8A0E98193') USING utf8mb4)
WHERE `group_code` = 'customer_source'
  AND `value` = 'WLZH'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E794B5E8AF9DE9A284E7BAA6') USING utf8mb4)
WHERE `group_code` = 'customer_source'
  AND `value` = 'DHYY'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E4BF9DE999A9E79086E8B594') USING utf8mb4)
WHERE `group_code` = 'customer_source'
  AND `value` = 'BXLD'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_option_item`
SET
    `label` = CONVERT(UNHEX('E585B6E4BB96') USING utf8mb4)
WHERE `group_code` = 'customer_source'
  AND `value` = 'QTLY'
  AND HEX(`label`) LIKE 'C3%';

UPDATE `jsh_sys_dict_type`
SET
    `dict_name` = CONVERT(UNHEX('E794A8E688B7E680A7E588AB') USING utf8mb4),
    `remark` = CONVERT(UNHEX('E794A8E688B7E680A7E588ABE58897E8A1A8') USING utf8mb4)
WHERE `dict_type` = 'sys_user_sex'
  AND HEX(`dict_name`) LIKE 'C3%';

UPDATE `jsh_sys_dict_type`
SET
    `dict_name` = CONVERT(UNHEX('E7B3BBE7BB9FE5BC80E585B3') USING utf8mb4),
    `remark` = CONVERT(UNHEX('E7B3BBE7BB9FE5BC80E585B3E58897E8A1A8') USING utf8mb4)
WHERE `dict_type` = 'sys_normal_disable'
  AND HEX(`dict_name`) LIKE 'C3%';

UPDATE `jsh_sys_dict_data`
SET
    `dict_label` = CONVERT(UNHEX('E794B7') USING utf8mb4),
    `remark` = CONVERT(UNHEX('E680A7E588ABE794B7') USING utf8mb4)
WHERE `dict_type` = 'sys_user_sex'
  AND `dict_value` = '0'
  AND HEX(`dict_label`) LIKE 'C3%';

UPDATE `jsh_sys_dict_data`
SET
    `dict_label` = CONVERT(UNHEX('E5A5B3') USING utf8mb4),
    `remark` = CONVERT(UNHEX('E680A7E588ABE5A5B3') USING utf8mb4)
WHERE `dict_type` = 'sys_user_sex'
  AND `dict_value` = '1'
  AND HEX(`dict_label`) LIKE 'C3%';

UPDATE `jsh_sys_dict_data`
SET
    `dict_label` = CONVERT(UNHEX('E6ADA3E5B8B8') USING utf8mb4),
    `remark` = CONVERT(UNHEX('E6ADA3E5B8B8E78AB6E68081') USING utf8mb4)
WHERE `dict_type` = 'sys_normal_disable'
  AND `dict_value` = '0'
  AND HEX(`dict_label`) LIKE 'C3%';

UPDATE `jsh_sys_dict_data`
SET
    `dict_label` = CONVERT(UNHEX('E5819CE794A8') USING utf8mb4),
    `remark` = CONVERT(UNHEX('E5819CE794A8E78AB6E68081') USING utf8mb4)
WHERE `dict_type` = 'sys_normal_disable'
  AND `dict_value` = '1'
  AND HEX(`dict_label`) LIKE 'C3%';
