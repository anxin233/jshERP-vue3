#!/bin/bash
set -euo pipefail
docker rm -f ss-server 2>/dev/null || true
mkdir -p /opt/ss-rust
PASS=$(openssl rand -hex 16)
echo "$PASS" > /root/ss-rust-password.txt
chmod 600 /root/ss-rust-password.txt
python3 << PY
import json
p = open("/root/ss-rust-password.txt").read().strip()
cfg = {
  "server": "0.0.0.0",
  "server_port": 8488,
  "password": p,
  "timeout": 300,
  "method": "aes-256-gcm",
  "fast_open": True,
  "nameserver": "8.8.8.8",
  "mode": "tcp_and_udp",
}
open("/opt/ss-rust/config.json", "w").write(json.dumps(cfg, indent=2) + "\n")
PY
chmod 600 /opt/ss-rust/config.json
docker run -d --name ss-server --restart unless-stopped \
  -p 8488:8488/tcp -p 8488:8488/udp \
  -v /opt/ss-rust/config.json:/etc/shadowsocks-rust/config.json:ro \
  teddysun/shadowsocks-rust:latest
sleep 2
docker ps --filter name=ss-server
docker logs ss-server --tail 8
echo "PORT=8488"
echo "PASSWORD_FILE=/root/ss-rust-password.txt"
