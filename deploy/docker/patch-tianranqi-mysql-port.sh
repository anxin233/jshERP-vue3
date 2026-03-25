#!/bin/sh
# 在服务器上执行：为 tianranqi mysql 增加宿主机端口映射（默认 3306:3306 对公网开放，玩票环境用；生产请改为 127.0.0.1:3306:3306 + SSH）
set -e
path=/opt/tianranqi-deploy/docker-compose.yml
[ -f "$path" ] || { echo "missing $path"; exit 1; }
if grep -q '3306:3306' "$path"; then
  echo "SKIP: 3306 mapping already in $path"
  exit 0
fi
cp -a "$path" "$path.bak.$(date +%Y%m%d%H%M)"
python3 << 'PY'
path = "/opt/tianranqi-deploy/docker-compose.yml"
with open(path) as f:
    s = f.read()
needle = "    container_name: tianranqi-mysql\n"
ins = needle + "    ports:\n      - \"3306:3306\"\n"
if needle not in s:
    raise SystemExit("needle not found")
if "3306:3306" in s:
    raise SystemExit("already has 3306 mapping")
with open(path, "w") as f:
    f.write(s.replace(needle, ins, 1))
print("PATCH_OK")
PY
echo "Backup: $path.bak.* — 回滚可: cp 备份文件 $path"
