# 依赖：本机已有 jshERP-boot/target/jshERP.jar 与 jshERP-web/dist
# 且本目录 .env 中已设 DOCKERFILE_BACKEND / DOCKERFILE_FRONTEND 为 *.prebuilt（见 .env.example）
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
docker compose build redis jsherp-boot jsherp-web
