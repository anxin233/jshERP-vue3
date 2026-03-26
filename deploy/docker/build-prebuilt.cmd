@echo off
cd /d "%~dp0"
docker compose build redis jsherp-boot jsherp-web
if errorlevel 1 exit /b %errorlevel%
