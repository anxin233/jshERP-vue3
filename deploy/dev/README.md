# 本机开发依赖（MySQL + Redis）

与 38 服务器隔离的本地库，降低 SQL 网络延迟。

## 前置

```bash
# macOS（本仓库常用）
colima start
# 或 Docker Desktop 保持运行
```

## 启停

```bash
cd deploy/dev
cp -n .env.example .env   # 首次
docker compose up -d
docker compose ps
docker compose logs -f --tail=50
docker compose down       # 停容器，保留数据卷
docker compose down -v    # 停容器并清空数据（慎用）
```

## 默认连接

| 服务 | 地址 | 认证 |
|------|------|------|
| MySQL 8.0 | `127.0.0.1:3306`，库 `jsh_erp` | `root` / `jsherp_dev_root` |
| Redis 6.2 | `127.0.0.1:6379` | 密码 `jsherp_dev_redis` |

密码以 `.env` 为准（勿提交真密码到 Git）。

## 后端启用本地配置

```bash
# IDE：Active profiles = local
# 或
java -jar jshERP.jar --spring.profiles.active=local
```

对应文件：`jshERP-boot/src/main/resources/application-local.yml`。

## 初始化 schema

**推荐**：空库后启动后端并带 `local` profile，由应用内 **Flyway 自动 migrate**。

若需手动灌脚本（Flyway 镜像拉取失败时可用，本机库已用此方式初始化到 V13）：

```bash
# 仓库根目录，按版本顺序导入
MIG=jshERP-boot/src/main/resources/db/migration
for f in "$MIG"/V*.sql; do
  echo "apply $f"
  docker exec -i jsherp-dev-mysql mysql -uroot -pjsherp_dev_root jsh_erp < "$f"
done
```

手动导入后需维护 `flyway_schema_history`；`application-local.yml` 已设 `spring.flyway.validate-on-migrate: false`，避免 checksum 校验失败。

默认登录：租户 `jsh`，用户 `admin`，密码 `123456`。
