#!/usr/bin/env bash
# 在 Linux 服务器上使用（外置 MySQL + 仅拉 Harbor 镜像）
# 前置：本目录已有 docker-compose.external-mysql.yml、docker-compose.server.yml、.env
# 用法：chmod +x server-pull-up-external.sh && ./server-pull-up-external.sh
set -euo pipefail
cd "$(dirname "$0")"
COMPOSE="docker compose -f docker-compose.external-mysql.yml -f docker-compose.server.yml"
echo ">>> pull"
$COMPOSE pull
echo ">>> up -d"
$COMPOSE up -d
echo ">>> ps"
$COMPOSE ps
