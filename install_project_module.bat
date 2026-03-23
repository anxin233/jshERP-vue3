@echo off
chcp 65001 >nul
echo ========================================
echo 执行项目管理模块数据库脚本
echo ========================================
echo.

REM 设置MySQL连接信息
set MYSQL_HOST=127.0.0.1
set MYSQL_PORT=3306
set MYSQL_USER=root
set MYSQL_PASSWORD=root
set MYSQL_DATABASE=jsh_erp

echo [1/2] 创建数据表和示例数据...
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < jshERP-boot\docs\project_management_migration.sql
if %errorlevel% neq 0 (
    echo 错误：数据表创建失败！
    pause
    exit /b 1
)
echo ✓ 数据表创建成功

echo.
echo [2/2] 配置菜单...
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < jshERP-boot\docs\project_menu_config.sql
if %errorlevel% neq 0 (
    echo 错误：菜单配置失败！
    pause
    exit /b 1
)
echo ✓ 菜单配置成功

echo.
echo ========================================
echo 所有脚本执行完成！
echo ========================================
echo.
echo 请按以下步骤继续：
echo 1. 配置前端路由（参考 PROJECT_MANAGEMENT_GUIDE.md）
echo 2. 重启后端服务
echo 3. 重启前端服务
echo 4. 登录系统测试功能
echo.
pause
