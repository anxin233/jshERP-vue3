# 在仓库根目录执行（会先 cd 到 deploy/docker，读取该目录 .env）
#   .\build-jsherp-docker.ps1
#   .\build-jsherp-docker.ps1 -PrebuiltWeb    # 仅覆盖为前端 prebuilt（若 .env 未设）
#   .\build-jsherp-docker.ps1 -PrebuiltBoot   # 仅覆盖为后端 prebuilt（若 .env 未设）
#   .\build-jsherp-docker.ps1 -Prebuilt     # 前后端均 prebuilt（进程环境覆盖 .env）
#
# Prebuilt 前置条件：
#   前端：jshERP-web\dist（如 cnpm run build）
#   后端：jshERP-boot\target\jshERP.jar（如 cd jshERP-boot; mvn -B -DskipTests package）
param(
  [switch]$PrebuiltWeb,
  [switch]$PrebuiltBoot,
  [switch]$Prebuilt
)
$ErrorActionPreference = "Stop"
if ($Prebuilt) {
  $PrebuiltWeb = $true
  $PrebuiltBoot = $true
}
if ($PrebuiltWeb) {
  $env:DOCKERFILE_FRONTEND = "deploy/docker/Dockerfile.frontend.prebuilt"
}
if ($PrebuiltBoot) {
  $env:DOCKERFILE_BACKEND = "deploy/docker/Dockerfile.backend.prebuilt"
}
Set-Location (Join-Path $PSScriptRoot "deploy\docker")
docker compose -f docker-compose.external-mysql.yml build jsherp-boot jsherp-web
