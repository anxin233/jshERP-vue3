#!/bin/bash
set -eu
cd /opt/xray

mkdir -p logs stats config
chmod 777 logs
touch logs/access.log logs/error.log
chmod 666 logs/access.log logs/error.log

python3 /opt/xray/stats/merge_xray_config.py

cat > docker-compose.yml <<'YAML'
services:
  xray:
    image: ghcr.io/xtls/xray-core:latest
    container_name: xray
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./config/config.json:/etc/xray/config.json:ro
      - ./logs:/var/log/xray
    command: run -c /etc/xray/config.json
YAML

docker compose up -d
sleep 3
chmod +x /opt/xray/stats/report.py

# 服务器系统时区多为 UTC；须用 CRON_TZ 指定调度时区（命令行 TZ= 只影响脚本环境）
{
  crontab -l 2>/dev/null | grep -v 'CRON_TZ=Asia/Shanghai' | grep -v 'xray/stats/report.py' || true
  echo 'CRON_TZ=Asia/Shanghai'
  echo '0 8,20 * * * /usr/bin/python3 /opt/xray/stats/report.py >> /opt/xray/stats/report.log 2>&1'
} | crontab -

echo "install done"
