# 在 deploy/docker 执行，或：.\deploy\docker\build-push.ps1
# 前置：本机已有 jshERP-boot/target/jshERP.jar、jshERP-web/dist；推送前 docker login
# .env：REGISTRY_PREFIX、IMAGE_TAG；可选 JRE_RUNTIME_IMAGE、NGINX_RUNTIME_IMAGE、NGINX_CONF

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

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
Write-Host "Done:"
Write-Host "  $env:REGISTRY_PREFIX/jsherp-boot:$env:IMAGE_TAG"
Write-Host "  $env:REGISTRY_PREFIX/jsherp-web:$env:IMAGE_TAG"
