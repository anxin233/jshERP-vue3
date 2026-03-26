#!/usr/bin/env bash
# 在 Linux 服务器上使用（外置 MySQL + 仅拉 Harbor 镜像）
# 前置：本目录已有 docker-compose.yml、docker-compose.server.yml、.env（与构建机同一 REGISTRY_PREFIX、IMAGE_TAG）
# 首次拉取前在本机执行：docker login harbor.aicode.ccwu.cc
# .env 中 REGISTRY_PREFIX 形如 harbor.aicode.ccwu.cc/erp（不要写 https://）
# 用法：chmod +x server-pull-up-external.sh && ./server-pull-up-external.sh
set -euo pipefail
cd "$(dirname "$0")"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.server.yml"
echo ">>> pull"
$COMPOSE pull
echo ">>> up -d"
$COMPOSE up -d
echo ">>> ps"
$COMPOSE ps
