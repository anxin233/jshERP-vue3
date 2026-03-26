# Compose 可选叠加层

根目录只保留三套主文件，其余场景在此目录用 **额外 `-f`** 叠上去即可。

> 若你服务器上曾用已移除的 `docker-compose.jsherp-server-runtime.yml`，请改为：  
> `docker-compose.yml` + `docker-compose.server.yml` + 本目录 `mysql-external-docker-network.yml`（三份 `-f`），`.env` 与原先一致即可。

| 文件 | 何时使用 |
|------|----------|
| `mysql-external-docker-network.yml` | MySQL 跑在**别的 compose 项目**里，后端要用容器名（如 `tianranqi-mysql`）访问时，把 `jsherp-boot` 挂进该外部网络。按需修改文件内 `name: tianranqi_default`。 |

示例：

```bash
cd deploy/docker
docker compose -f docker-compose.yml -f docker-compose.server.yml \
  -f overrides/mysql-external-docker-network.yml pull
docker compose -f docker-compose.yml -f docker-compose.server.yml \
  -f overrides/mysql-external-docker-network.yml up -d
```
