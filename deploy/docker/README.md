# jshERP 容器发布（Docker Hub + 共享 MySQL/Redis）

面向：**本机先 Maven / 前端打包** → **Docker 只拷贝产物打镜像并推送** → **服务器 pull + compose up**。数据库与 Redis 使用已有基础设施（如 `/opt/infra`，网络 `infra_default`）。

## 目录说明

| 文件 | 用途 |
|------|------|
| `docker-compose.yml` | `jsherp-boot`、`jsherp-web` 及 build 定义 |
| `docker-compose.server.yml` | 合并后去掉 build，仅拉镜像运行 |
| `Dockerfile.backend` | 拷贝 `jshERP-boot/target/jshERP.jar` + JRE |
| `Dockerfile.frontend` | 拷贝 `jshERP-web/dist` + Nginx |
| `nginx/default.conf` | 默认 `/erp` 子路径 + 反代后端 |
| `nginx/default-root.conf` | 根路径部署时通过 `.env` 中 `NGINX_CONF` 选用 |
| `build-push.ps1` | 构建并推送两个业务镜像 |
| `server-deploy.sh` | 服务器：`pull` + `up -d` |

## 构建并推送（本机）

```powershell
# 1) 后端 JAR
cd jshERP-boot
mvn -B -DskipTests package

# 2) 前端 dist（子路径 /erp/ 已写在 jshERP-web/.env.production）
cd ..\jshERP-web
yarn build

# 3) 打镜像并推送
cd ..\deploy\docker
# 新建 .env（内容见下文「.env 说明」）

docker login
.\build-push.ps1
```

仅本地构建镜像、不推送：`cd deploy\docker` 后执行 `docker compose build jsherp-boot jsherp-web`。

## .env 说明

在 `deploy/docker` 下新建 `.env`（勿提交真实密码）。服务器须先有共享库：网络 `infra_default`，容器 `shared-mysql`、`shared-redis`。

打镜像前本机须已有 `jshERP-boot/target/jshERP.jar` 与 `jshERP-web/dist`（生产环境变量见 `jshERP-web/.env.production`）。

```env
REGISTRY_PREFIX=aniden
IMAGE_TAG=latest

EXTERNAL_MYSQL_HOST=shared-mysql
EXTERNAL_MYSQL_PORT=3306
EXTERNAL_MYSQL_USER=root
MYSQL_DATABASE=jsh_erp
MYSQL_ROOT_PASSWORD=请修改为实际密码

SPRING_REDIS_HOST=shared-redis
REDIS_PASSWORD=

WEB_PORT=8080

# 可选：能直连 Docker Hub 时可改为短名
# JRE_RUNTIME_IMAGE=eclipse-temurin:8-jre-alpine
# NGINX_RUNTIME_IMAGE=nginx:1.25-alpine

# 根路径部署且 dist 已按 / 打包时：
# NGINX_CONF=deploy/docker/nginx/default-root.conf
```

## 服务器部署

将 `docker-compose.yml`、`docker-compose.server.yml`、`.env` 放到部署目录（如 `/opt/jsherp`），执行：

```bash
chmod +x server-deploy.sh
./server-deploy.sh
```

## 根路径

前端用 `VUE_APP_PUBLIC_PATH=/`、`VUE_APP_API_BASE=` 打包 `dist`，并在 `.env` 中设置 `NGINX_CONF=deploy/docker/nginx/default-root.conf` 后再执行 `.\build-push.ps1`。

## 宿主机 Nginx（HTTPS）

在宿主机上为 `https://域名/erp/` 做反代时，将 `location /erp/` 的 `proxy_pass` 指到 `jsherp-web` 映射端口（默认 `.env` 里 `WEB_PORT=8080` 即 `http://127.0.0.1:8080/erp/`），并设置常见 `Host`、`X-Forwarded-*`、`client_max_body_size` 等头即可。
