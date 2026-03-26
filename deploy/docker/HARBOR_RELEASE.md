# 使用私有 Harbor + Docker Compose 发布方案

面向：**构建机（CI 或本机）打镜像并推 Harbor** → **业务服务器只拉镜像 + compose 启动**，不在服务器上保留源码。

---

## 1. 架构与镜像

```
                    ┌─────────────────────────────────────┐
                    │  业务服务器（仅 Docker + Compose）    │
  浏览器 / 宿主机 Nginx  │  jsherp-web (Nginx + 静态前端)      │
        │            │  jsherp-boot (Spring Boot :9999)    │
        └──────────► │  jsherp-redis（由官方 Redis 打底）   │
                     └─────────────────────────────────────┘
                                        │
                                        ▼
                              MySQL（宿主机或其它栈，外置）
```

| 镜像 | 说明 | 是否推 Harbor |
|------|------|----------------|
| `${REGISTRY_PREFIX}/jsherp-boot:${IMAGE_TAG}` | 后端 JAR | **是**（业务镜像） |
| `${REGISTRY_PREFIX}/jsherp-web:${IMAGE_TAG}` | 前端构建 + Nginx | **是**（业务镜像） |
| `${REGISTRY_PREFIX}/jsherp-redis:${IMAGE_TAG}` | 缓存（`Dockerfile.redis` 基于 `REDIS_IMAGE`） | **是**（与前后端同前缀推 Harbor） |
| MySQL | 由运维自备，**不在**本 compose 内 | 不适用 |

建议在 Harbor 建项目，例如 **`erp`**，完整业务镜像名示例：

- `harbor.公司.com/erp/jsherp-redis:3.6.0`
- `harbor.公司.com/erp/jsherp-boot:3.6.0`
- `harbor.公司.com/erp/jsherp-web:3.6.0`

---

## 2. Harbor 侧准备

1. 登录 Harbor Web，新建**项目**（如 `erp`），权限按团队设置。
2. （推荐）创建**机器人账户**或用户，用于 `docker login`，只给 `erp` 的 push/pull。
3. 若构建机不能访问 Docker Hub：在 `.env` 里把 `REDIS_IMAGE` 指到可拉取的基础 Redis 镜像；或在 Harbor 做 **Proxy Cache** 后仍用官方短名。

---

## 3. 构建机：打标签并推送

在**有完整 Git 仓库**的机器上操作（或 CI Job）。

### 3.1 配置环境变量

```bash
cd deploy/docker
cp .env.example .env
```

编辑 `.env` 中与 Harbor、版本、子路径相关的项，例如：

```env
REGISTRY_PREFIX=harbor.公司.com/erp
IMAGE_TAG=3.6.0

EXTERNAL_MYSQL_HOST=你的mysql主机或容器可达地址
EXTERNAL_MYSQL_PORT=3306
EXTERNAL_MYSQL_USER=root
MYSQL_DATABASE=jsh_erp
MYSQL_ROOT_PASSWORD=与上述账号匹配的 JDBC 密码

REDIS_PASSWORD=

WEB_PORT=8080
VUE_APP_PUBLIC_PATH=/erp/
VUE_APP_API_BASE=/erp/jshERP-boot
```

### 3.2 登录 Harbor

```bash
docker login harbor.公司.com
```

### 3.3 构建并推送

```bash
docker compose build redis jsherp-boot jsherp-web
docker compose push redis jsherp-boot jsherp-web
```

> 若 Compose 版本较旧不支持 `compose push`，可手动 `docker push` 上述三个镜像名（`jsherp-redis` / `jsherp-boot` / `jsherp-web`）。

---

## 4. 业务服务器：仅拉取并启动

服务器上**不需要**克隆代码，只需：

- `docker-compose.yml`（与仓库 `deploy/docker` 下一致）
- `docker-compose.server.yml`（去掉 `build`，避免无源码时误构建）
- `nginx/default.conf`（前端容器内配置，已随镜像打包进 `jsherp-web`，一般不必改）
- `.env`（与构建机**同一套** `REGISTRY_PREFIX`、`IMAGE_TAG`、`EXTERNAL_MYSQL_*`、子路径变量等）

### 4.1 登录 Harbor

```bash
docker login harbor.公司.com
```

### 4.2 拉镜像并启动（推荐）

使用合并文件，**禁止在本机构建**：

```bash
cd /opt/jsherp-compose   # 你存放 compose 的目录
docker compose -f docker-compose.yml -f docker-compose.server.yml pull
docker compose -f docker-compose.yml -f docker-compose.server.yml up -d
```

> `docker-compose.server.yml` 中对 `jsherp-boot`、`jsherp-web` 使用 `build: !reset null`，需 **Docker Compose V2**（较新版本）。  
> 若合并报错，可退化为：  
> `docker compose pull && docker compose up -d --no-build`

**MySQL 外置**：compose 内**无** MySQL 服务。在 `.env` 中设置 `EXTERNAL_MYSQL_HOST`、`EXTERNAL_MYSQL_PORT`、`EXTERNAL_MYSQL_USER`、`MYSQL_DATABASE`、`MYSQL_ROOT_PASSWORD`（JDBC 密码，变量名沿用历史命名）与已有库一致。

若 MySQL 是**其他 compose 里的容器**，任选其一：

- **A.** 把 MySQL 容器 `docker network connect` 进本栈默认网络；或  
- **B.** 叠一层 **`overrides/mysql-external-docker-network.yml`**，让 `jsherp-boot` 加入 MySQL 所在外部网络（见 `overrides/README.md`，按需改文件内网络名）。

```bash
docker network connect <本栈默认网络名> 你的mysql容器名
```

（网络名以 `docker compose -f docker-compose.yml config` 里 `networks.default.name` 为准，与项目目录名相关。）

若 MySQL 在**其他 compose 网络**，在 `pull` / `up` 命令中再插入 `-f overrides/mysql-external-docker-network.yml`。

也可在 `deploy/docker` 目录执行：`chmod +x server-pull-up-external.sh && ./server-pull-up-external.sh`（需 overlay 时在命令中加 `-f overrides/...`）。

示例变量见 `.env.external-mysql.example`。

### 4.3 首次初始化数据库

仅在**第一次**部署或空库时执行，将 `jsh_erp.sql` 拷入容器或从宿主机 `mysql` 客户端导入，详见 [README.md](./README.md) 中「导入数据库」一节。

---

## 5. 版本与回滚

| 操作 | 做法 |
|------|------|
| 发新版 | 构建机改 `IMAGE_TAG`（如 `3.6.1`），`build` + `push`；服务器改 `.env` 中 `IMAGE_TAG`，再 `pull` + `up -d` |
| 回滚 | 服务器 `.env` 把 `IMAGE_TAG` 改回旧版本，`pull` + `up -d` |

数据库结构升级需自行执行迁移 SQL，不在本文范围。

---

## 6. 安全与运维建议

1. **不要把 MySQL、Redis 端口暴露到公网**：生产可去掉 `ports` 映射，仅容器内网访问；或防火墙只放行本机。
2. **HTTPS**：在宿主机 Nginx 终止 TLS，反代到 `127.0.0.1:WEB_PORT`（参见 `nginx/host-nginx-erp.example.conf`）。
3. **密码**：`MYSQL_ROOT_PASSWORD`、Harbor 账号使用强密码；`.env` 权限 `chmod 600`。
4. **备份**：按你的 MySQL 运维方式备份业务库；同时备份 Docker volume `jsherp-upload`（上传文件）。

---

## 7. 与 CI 集成（可选）

流水线步骤示例：

1. `docker login`（Harbor 机器人账号，用 Secret）
2. `docker compose -f deploy/docker/docker-compose.yml build`
3. `docker compose push redis jsherp-boot jsherp-web`（或 `docker push` 三条）
4. SSH 到服务器执行 `pull` + `up`（或触发 Ansible / 自建脚本）

---

## 8. 文件清单（服务器最小集）

```
deploy/docker/
├── docker-compose.yml                 # Redis + 前后端；MySQL 外置
├── Dockerfile.redis                   # 将 REDIS_IMAGE 打成 jsherp-redis
├── docker-compose.server.yml          # 与上合并：服务器只 pull
├── overrides/                         # 可选叠加（外网 MySQL 容器网络等）
├── .env                               # 由你生成，勿提交真实密码
└── nginx/default.conf                 # 已打进 jsherp-web 镜像
```

可选：将 `README.md`、`HARBOR_RELEASE.md` 一并放到运维文档库，便于交接。

**示例**：Harbor 域名为 `harbor.aicode.ccwu.cc`、项目名为 `erp` 时，`.env` 模板见 **[.env.harbor.aicode.example](./.env.harbor.aicode.example)**（`REGISTRY_PREFIX` 勿加 `https://`）。
