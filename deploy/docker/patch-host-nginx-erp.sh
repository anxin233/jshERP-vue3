#!/bin/bash
# 在宿主机执行：为默认站点增加 /erp -> jsherp-web:8080，避免 /erp 落到 Harbor 出现 404
set -euo pipefail
CONF=/etc/nginx/sites-available/tianranqi-proxy
if grep -q 'location /erp/' "$CONF"; then
  echo "ALREADY_HAS_ERP"
  exit 0
fi
cp -a "$CONF" "$CONF.bak.$(date +%Y%m%d%H%M)"
python3 << 'PY'
path = "/etc/nginx/sites-available/tianranqi-proxy"
with open(path) as f:
    lines = f.readlines()
needle = "    location / {\n"
insert = """    location = /erp {
        return 302 /erp/;
    }

    location /erp/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
        proxy_read_timeout 300s;
        client_max_body_size 20m;
    }

"""
out = []
done = False
for line in lines:
    if not done and line == needle:
        out.append(insert)
        done = True
    out.append(line)
if not done:
    raise SystemExit("needle not found: final location / block")
with open(path, "w") as f:
    f.writelines(out)
print("PATCH_OK")
PY
nginx -t
systemctl reload nginx
echo "OK_RELOADED"
