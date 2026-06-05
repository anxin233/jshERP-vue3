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

CRON_LINE='0 8,20 * * * TZ=Asia/Shanghai /usr/bin/python3 /opt/xray/stats/report.py >> /opt/xray/stats/report.log 2>&1'
( crontab -l 2>/dev/null | grep -v 'xray/stats/report.py' || true; echo "$CRON_LINE" ) | crontab -

echo "install done"
