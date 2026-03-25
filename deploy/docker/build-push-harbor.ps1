# 在 deploy/docker 目录执行: .\build-push-harbor.ps1
# 需已安装 Docker，且能访问 Docker Hub（或已配置镜像加速 / 私有基础镜像仓库）
# 推送前请先: docker login 38.226.195.139
#
# .env 中可设 DOCKERFILE_FRONTEND / DOCKERFILE_BACKEND 为 *.prebuilt，与本机 dist、target/jshERP.jar 对齐后再 build+push

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$env:REGISTRY_PREFIX = "38.226.195.139/erp"
$env:IMAGE_TAG       = "latest"

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
        $p = $_.IndexOf('=')
        if ($p -gt 0) {
            $k = $_.Substring(0, $p).Trim()
            $v = $_.Substring($p + 1).Trim()
            [Environment]::SetEnvironmentVariable($k, $v, "Process")
        }
    }
}

Write-Host "REGISTRY_PREFIX=$env:REGISTRY_PREFIX IMAGE_TAG=$env:IMAGE_TAG"
docker compose build jsherp-boot jsherp-web
docker compose push jsherp-boot jsherp-web
Write-Host "Done. Images:"
Write-Host "  $env:REGISTRY_PREFIX/jsherp-boot:$env:IMAGE_TAG"
Write-Host "  $env:REGISTRY_PREFIX/jsherp-web:$env:IMAGE_TAG"
