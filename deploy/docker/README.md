# jshERP Docker 最简发布（含 Harbor 私库）

## Compose 文件

| 文件 | 用途 |
|------|------|
| `docker-compose.yml` | **默认**：Redis + 前后端；MySQL 在宿主机或其它容器，由 `.env` 中 `EXTERNAL_MYSQL_*` 指定。 |
| `docker-compose.server.yml` | 与 `docker-compose.yml` **`-f` 合并**：去掉 `build`，只 `pull` 镜像。 |
| `overrides/*.yml` | 可选叠加，例如 MySQL 在别的 Docker 网络里，见 **[overrides/README.md](./overrides/README.md)**。 |

完整「构建推 Harbor + 服务器仅 pull」流程见 **[HARBOR_RELEASE.md](./HARBOR_RELEASE.md)**。

## 架构

| 组件 | 说明 |
|------|------|
| `jsherp-web` | Nginx 托管 Vue；**默认按 `/erp` 子路径**（见下文），API 为 `/erp/jshERP-boot/` |
| `jsherp-boot` | Spring Boot，端口容器内 `9999` |
| MySQL（外置） | 不在本 compose 内；`.env` 配置 `EXTERNAL_MYSQL_HOST` 等，库名默认 `jsh_erp` |
| `redis` | Redis 7，默认无密码（与当前 compose 一致） |

首次部署需在你选定的 MySQL 上创建库并导入 `jshERP-boot/docs/jsh_erp.sql`（及你启用的工单等扩展脚本）。

## 本地构建并运行

```bash
cd deploy/docker
copy .env.example .env
# 按需编辑 .env

docker compose build
docker compose up -d
```

导入数据库（示例：宿主机 MySQL，账号密码与 `.env` 中 `EXTERNAL_MYSQL_USER`、`MYSQL_ROOT_PASSWORD` 一致）：

```bash
mysql -h127.0.0.1 -P3306 -uroot -p jsh_erp < ../../jshERP-boot/docs/jsh_erp.sql
```

若 MySQL 在其它 Docker 容器内，对该容器执行 `docker exec -i ... mysql ...` 导入即可。变量示例见 `.env.external-mysql.example`。

访问：`http://localhost:8080/erp/`（默认 `WEB_PORT`，且 `.env.example` 中已配置子路径）。

## 部署在 `/erp` 子路径（与宿主机 Nginx 一致）

### 要改什么（对照表）

| 层级 | 作用 | 本项目中的处理 |
|------|------|----------------|
| Vue `publicPath` | JS/CSS 等静态资源 URL 前缀 | `vue.config.js` 读 `VUE_APP_PUBLIC_PATH`（Docker 构建参数或 `.env`） |
| Vue Router `base` | History 路由前缀 | 已用 `base: process.env.BASE_URL`，与 `publicPath` 一致 |
| Axios `baseURL` | 接口前缀 | `src/config/api-base-bootstrap.js` 在 `VUE_APP_API_BASE` 存在时覆盖 `window._CONFIG.domianURL` |
| 静态资源 `/static/...` | 登录页等图片 | `UserLayout.vue`、`IndexChart.vue` 已改为 `process.env.BASE_URL` |
| 退出登录跳转 | `location.href` | `UserMenu.vue` 已改为 `process.env.BASE_URL` |
| 容器内 Nginx | `/erp` 静态 + 反代 API | `deploy/docker/nginx/default.conf` |
| 后端 `context-path` | 仍为 `/jshERP-boot` | **不必改**；由 Nginx 把 `/erp/jshERP-boot/` 转到容器内 `.../jshERP-boot/` |
| 宿主机 Nginx | 对外 `https://域名/erp/` | 将请求原样转到 `jsherp-web` 的 `/erp/`（示例见 `nginx/host-nginx-erp.example.conf`） |

### 根路径部署（不要 `/erp`）

在 `.env` 中设置：

```env
VUE_APP_PUBLIC_PATH=/
VUE_APP_API_BASE=
```

并把前端镜像里的 Nginx 配置换为 `deploy/docker/nginx/default-root.conf`（构建自定义镜像时 `COPY` 该文件为 `default.conf`，或挂载覆盖）。

### 仅本地打包（不用 Docker）

参见 `jshERP-web/.env.subpath.example`，复制为 `.env.local` 后执行 `yarn build`，再将 `dist` 按你服务器 Nginx 规则发布。

### 本机打 JAR + dist，Docker 只跑 JRE / Nginx（推 Harbor 同样命令）

1. 后端：`cd jshERP-boot && mvn -B -DskipTests package` → 得到 `target/jshERP.jar`
2. 前端：在 `jshERP-web` 执行 `yarn build` / `cnpm run build` → 得到 `dist/`
3. 在 `deploy/docker/.env` 中设置：
   - `DOCKERFILE_BACKEND=deploy/docker/Dockerfile.backend.prebuilt`
   - `DOCKERFILE_FRONTEND=deploy/docker/Dockerfile.frontend.prebuilt`
4. `cd deploy/docker` 后执行 `docker compose build redis jsherp-boot jsherp-web` 与 `docker compose push redis jsherp-boot jsherp-web`（或 `.\build-push-harbor.ps1`），镜像名仍由 `REGISTRY_PREFIX`、`IMAGE_TAG` 决定（Redis 为 `${REGISTRY_PREFIX}/jsherp-redis`）。

## 推送到 Harbor（私库）

1. 在 Harbor 创建项目，例如 `erp`。
2. 本机登录：

```bash
docker login harbor.你的域名.com
```

3. 配置 `.env`：

```env
REGISTRY_PREFIX=harbor.你的域名.com/erp
IMAGE_TAG=3.6
```

4. 构建（镜像名会变为 `harbor.../erp/jsherp-boot:3.6` 等）：

```bash
cd deploy/docker
docker compose build
```

5. 推送：

```bash
docker push harbor.你的域名.com/erp/jsherp-redis:3.6
docker push harbor.你的域名.com/erp/jsherp-boot:3.6
docker push harbor.你的域名.com/erp/jsherp-web:3.6
```

6. 生产机只拉取运行（不 build）：

在生产机同样放置 `deploy/docker/docker-compose.yml` 与 `.env`（`REGISTRY_PREFIX`、`IMAGE_TAG` 与构建时一致），然后：

```bash
docker compose pull
docker compose up -d
```

**说明**：运行时的 Redis 镜像名为 `${REGISTRY_PREFIX}/jsherp-redis`（构建时从 `REDIS_IMAGE` 基底复制一层，便于整栈推同一 Harbor 项目）。MySQL 由你自行提供。

## 与手工部署的差异

- 数据库、Redis 地址由环境变量覆盖，无需改 jar 内 `application.properties`。
- 上传文件目录通过 JVM 参数 `-Dfile.path=/data/upload` 写入数据卷 `jsherp-upload`。

## 常见问题

- **登录 Redis 报错**：确保 compose 里 Redis 与 `SPRING_REDIS_PASSWORD` 一致；当前模板为无密码 Redis。
- **前端接口 502**：确认 Nginx 能解析到 `jsherp-boot`（同一 compose 网络内服务名）。
- **生产 HTTPS**：在 Nginx 前再加一层反向代理（或换用带证书的 Nginx 镜像）终止 TLS。
