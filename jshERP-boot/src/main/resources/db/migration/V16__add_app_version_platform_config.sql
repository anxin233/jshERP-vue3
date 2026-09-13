-- jsh_platform_config：手机端版本配置（上游 2026-08-04 app 版本接口）

INSERT INTO `jsh_platform_config` (`platform_key`, `platform_key_info`, `platform_value`)
SELECT 'app_version', '手机端版本', ''
WHERE NOT EXISTS (
    SELECT 1 FROM `jsh_platform_config` WHERE `platform_key` = 'app_version'
);
