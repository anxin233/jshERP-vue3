-- Fix double-encoded Chinese menu names (UTF-8 bytes misinterpreted as latin1 then re-stored as UTF-8).
-- Affects extension menus inserted by V8 on some local Flyway runs.
-- Idempotent: only updates rows whose HEX still looks like double-encoded UTF-8 (starts with C3%).
-- Uses UNHEX so this script itself is encoding-safe.

UPDATE `jsh_function`
SET `name` = CONVERT(UNHEX('E9A1B9E79BAEE7AEA1E79086') USING utf8mb4)
WHERE `number` = 'project'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET `name` = CONVERT(UNHEX('E9A1B9E79BAEE7B1BBE588AB') USING utf8mb4)
WHERE `number` = 'project_category'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET `name` = CONVERT(UNHEX('E9A1B9E79BAEE4BFA1E681AF') USING utf8mb4)
WHERE `number` = 'project_info'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET `name` = CONVERT(UNHEX('E5B7A5E58D95E7AEA1E79086') USING utf8mb4)
WHERE `number` = 'workorder'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET `name` = CONVERT(UNHEX('E5B7A5E58D95E4BFA1E681AF') USING utf8mb4)
WHERE `number` = 'workorder_info'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET `name` = CONVERT(UNHEX('E5AEA2E688B7E8BDA6E8BE86') USING utf8mb4)
WHERE `number` = '01020104'
  AND HEX(`name`) LIKE 'C3%';

UPDATE `jsh_function`
SET `name` = CONVERT(UNHEX('E98089E9A1B9E7AEA1E79086') USING utf8mb4)
WHERE `number` = '0910'
  AND HEX(`name`) LIKE 'C3%';
