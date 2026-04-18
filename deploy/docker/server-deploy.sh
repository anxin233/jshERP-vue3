#!/usr/bin/env bash
# 服务器上：本目录需有 docker-compose.yml、docker-compose.server.yml、.env
# 前置：/opt/infra 已启动，网络 infra_default 存在；已 docker login
set -euo pipefail
cd "$(dirname "$0")"
C=(docker compose -f docker-compose.yml -f docker-compose.server.yml)
"${C[@]}" pull
"${C[@]}" up -d
"${C[@]}" ps
