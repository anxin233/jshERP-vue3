#!/usr/bin/env bash
# 在服务器上执行：停掉本栈容器、删掉本仓库 jsherp 镜像、再 pull + up（腾磁盘）
# 用法：
#   chmod +x server-redeploy-from-harbor.sh
#   # 首次或 token 过期：docker login harbor.aicode.ccwu.cc
#   ./server-redeploy-from-harbor.sh              # 默认目录：当前脚本所在目录
#   ./server-redeploy-from-harbor.sh /opt/jsherp-compose
#
# 不会删除数据卷（redis / upload）；若需清空业务数据请自行 docker volume rm（慎用）
set -euo pipefail

DEPLOY_DIR="${1:-$(cd "$(dirname "$0")" && pwd)}"
cd "$DEPLOY_DIR"

if [[ ! -f docker-compose.yml ]] || [[ ! -f docker-compose.server.yml ]] || [[ ! -f .env ]]; then
  echo "错误：在 $DEPLOY_DIR 未找到 docker-compose.yml / docker-compose.server.yml / .env"
  exit 1
fi

# 从 .env 取 REGISTRY_PREFIX（不 source，避免特殊字符）
REGISTRY_PREFIX="$(grep -E '^[[:space:]]*REGISTRY_PREFIX=' .env | head -1 | cut -d= -f2- | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
if [[ -z "$REGISTRY_PREFIX" ]]; then
  echo "错误：.env 中未找到 REGISTRY_PREFIX"
  exit 1
fi

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.server.yml)

echo ">>> 部署目录: $DEPLOY_DIR"
echo ">>> 镜像前缀: $REGISTRY_PREFIX"

echo ">>> 停止并移除本 compose 栈容器"
"${COMPOSE[@]}" down --remove-orphans

echo ">>> 删除本地 jsherp 业务镜像（${REGISTRY_PREFIX}/jsherp-*），释放空间"
for name in jsherp-redis jsherp-boot jsherp-web; do
  ref="${REGISTRY_PREFIX}/${name}"
  ids="$(docker images -q "$ref" 2>/dev/null || true)"
  if [[ -n "${ids:-}" ]]; then
    docker rmi -f $ids || true
  fi
done

echo ">>> 清理悬空镜像层（可选安全项）"
docker image prune -f >/dev/null || true

echo ">>> 从 Harbor 拉取并启动"
"${COMPOSE[@]}" pull
"${COMPOSE[@]}" up -d

echo ">>> 状态"
"${COMPOSE[@]}" ps
