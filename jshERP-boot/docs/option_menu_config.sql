-- 选项管理菜单配置

INSERT INTO `jsh_function` (`number`, `name`, `parent_number`, `component`, `url`, `sort`, `enabled`, `state`, `type`, `push_btn`, `delete_flag`)
VALUES
  ('0910', '选项管理', '01', '/system/OptionList', '/system/optionList', '0910', 1, 0, '电脑端', '1', '0');

-- 如需赋权给超级管理员（示例：role id=4），请根据实际 value 追加：
-- UPDATE `jsh_user_business`
-- SET `value` = CONCAT(RTRIM(`value`), '[新ID]')
-- WHERE `type` = 'RoleFunctions' AND `key_id` = 4;

