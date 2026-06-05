# Xray 流量 → 企业微信推送（38 服务器）

每天 **08:00**、**20:00**（北京时间）推送流量与连接统计到企业微信群机器人。

## 服务器路径

| 路径 | 说明 |
|------|------|
| `/opt/xray/stats/report.py` | 采集并推送 |
| `/opt/xray/stats/state.json` | 流量累计状态 |
| `/opt/xray/stats/.env` | `WECOM_WEBHOOK` |
| `/opt/xray/logs/access.log` | Xray 访问日志 |

## 手动测试

```bash
/usr/bin/python3 /opt/xray/stats/report.py
```

## 说明

- 启用 Xray Stats API 后，**累计/按日/7 天/30 天** 流量从 API 增量写入 `state.json`。
- 部署前的历史流量无法回溯，首日部分维度为 0 属正常。
- IP 与连接成功率来自 access 日志 + docker 日志解析。
