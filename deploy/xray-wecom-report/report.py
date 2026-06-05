#!/usr/bin/env python3
"""
Collect Xray traffic & connection stats, push to WeCom group robot.
Cron: 0 8,20 * * * TZ=Asia/Shanghai
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.request
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Asia/Shanghai")
STATE_FILE = Path("/opt/xray/stats/state.json")
ENV_FILE = Path("/opt/xray/stats/.env")
ACCESS_LOG = Path("/opt/xray/logs/access.log")
INBOUND_TAG = "vless-reality"
LOG_TS_RE = re.compile(r"^(\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2})")
XRAY_API = "127.0.0.1:10085"
CONTAINER = "xray"

ACCEPT_RE = re.compile(
    r"from\s+(\d+\.\d+\.\d+\.\d+):\d+\s+accepted",
    re.I,
)
REJECT_RE = re.compile(
    r"from\s+(\d+\.\d+\.\d+\.\d+):\d+\s+rejected",
    re.I,
)


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    env.update({k: v for k, v in os.environ.items() if k.startswith("WECOM_")})
    return env


def fmt_bytes(n: int) -> str:
    n = max(0, int(n))
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024:
            if unit == "B":
                return f"{n} B"
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} PB"


def pct(part: int, whole: int) -> int:
    if whole <= 0:
        return 0
    return int(round(part * 100 / whole))


def fmt_traffic_block(title: str, up: int, down: int, hint: str = "") -> str:
    """企业微信 Markdown 对表格支持差，改用分块 + 颜色标签。"""
    total = up + down
    hint_html = f"<font color=\"comment\">（{hint}）</font>" if hint else ""
    if total == 0:
        return f"**{title}**{hint_html}\n> <font color=\"comment\">暂无流量</font>"
    up_p, down_p = pct(up, total), pct(down, total)
    return (
        f"**{title}**{hint_html}\n"
        f"> 合计 <font color=\"info\">**{fmt_bytes(total)}**</font>\n"
        f"> 上行 ↑ <font color=\"info\">{fmt_bytes(up)}</font>　"
        f"{up_p}%　｜　下行 ↓ <font color=\"warning\">{fmt_bytes(down)}</font>　"
        f"{down_p}%"
    )


def build_traffic_section(
    *,
    since: str,
    today: str,
    yesterday: str,
    total_up: int,
    total_down: int,
    y_up: int,
    y_down: int,
    t_up: int,
    t_down: int,
    d7_up: int,
    d7_down: int,
    d30_up: int,
    d30_down: int,
) -> str:
    blocks = [
        fmt_traffic_block("今日", t_up, t_down, today),
        fmt_traffic_block("昨日", y_up, y_down, yesterday),
        fmt_traffic_block("近 7 天", d7_up, d7_down),
        fmt_traffic_block("近 30 天", d30_up, d30_down),
        fmt_traffic_block("累计总流量", total_up, total_down, f"自 {since} 起"),
    ]
    return "### 流量统计\n\n" + "\n\n".join(blocks)


def run(cmd: list[str]) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if p.returncode != 0:
        raise RuntimeError(f"cmd failed: {' '.join(cmd)}\n{p.stderr or p.stdout}")
    return p.stdout


def query_xray_bytes() -> tuple[int, int]:
    """Return (uplink, downlink) cumulative bytes for inbound."""
    raw = run(
        [
            "docker",
            "exec",
            CONTAINER,
            "/usr/local/bin/xray",
            "api",
            "statsquery",
            f"--server={XRAY_API}",
            "-pattern",
            "",
        ]
    )
    up = down = 0
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # xray may print non-json lines; find JSON object
        start = raw.find("{")
        data = json.loads(raw[start:]) if start >= 0 else {"stat": []}
    for item in data.get("stat") or []:
        name = item.get("name", "")
        val = int(item.get("value", 0))
        if f"inbound>>>{INBOUND_TAG}>>>traffic>>>uplink" in name:
            up = val
        elif f"inbound>>>{INBOUND_TAG}>>>traffic>>>downlink" in name:
            down = val
    return up, down


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    return {
        "since": datetime.now(TZ).strftime("%Y-%m-%d"),
        "last_report": None,
        "last_up": 0,
        "last_down": 0,
        "total_up": 0,
        "total_down": 0,
        "daily": {},
        "connections": {"accepted": 0, "rejected": 0},
    }


def save_state(state: dict) -> None:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(
        json.dumps(state, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def day_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def sum_daily(state: dict, start: datetime, end: datetime) -> tuple[int, int]:
    total_up = total_down = 0
    cur = start.date()
    end_d = end.date()
    daily = state.get("daily") or {}
    while cur <= end_d:
        k = cur.isoformat()
        if k in daily:
            total_up += int(daily[k].get("up", 0))
            total_down += int(daily[k].get("down", 0))
        cur += timedelta(days=1)
    return total_up, total_down


def _parse_log_line(line: str) -> tuple[int, int, str | None]:
    accepted = rejected = 0
    ip = None
    if " accepted " in line:
        accepted = 1
        m = ACCEPT_RE.search(line)
        ip = m.group(1) if m else None
    elif " rejected " in line:
        rejected = 1
        m = REJECT_RE.search(line)
        ip = m.group(1) if m else None
    return accepted, rejected, ip


def parse_docker_logs_since(since: datetime) -> tuple[int, int, Counter]:
    accepted = rejected = 0
    ips: Counter = Counter()
    try:
        out = run(["docker", "logs", "--tail", "20000", CONTAINER])
    except RuntimeError:
        return accepted, rejected, ips
    for line in out.splitlines():
        ts_m = LOG_TS_RE.match(line)
        if ts_m:
            try:
                ts = datetime.strptime(ts_m.group(1), "%Y/%m/%d %H:%M:%S").replace(
                    tzinfo=TZ
                )
            except ValueError:
                continue
            if ts < since:
                continue
        elif since < datetime.now(TZ) - timedelta(hours=12):
            continue
        a, r, ip = _parse_log_line(line)
        accepted += a
        rejected += r
        if ip:
            ips[ip] += a + r
    return accepted, rejected, ips


def container_running() -> bool:
    try:
        out = run(
            [
                "docker",
                "inspect",
                "-f",
                "{{.State.Running}}",
                CONTAINER,
            ]
        )
        return out.strip().lower() == "true"
    except RuntimeError:
        return False


def push_wecom(webhook: str, content: str) -> None:
    body = json.dumps(
        {"msgtype": "markdown", "markdown": {"content": content}},
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(
        webhook,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode())
    if result.get("errcode") != 0:
        raise RuntimeError(f"wecom error: {result}")


def main() -> int:
    env = load_env()
    webhook = env.get("WECOM_WEBHOOK", "").strip()
    if not webhook:
        print("WECOM_WEBHOOK not set", file=sys.stderr)
        return 1

    now = datetime.now(TZ)
    today = day_key(now)
    yesterday = day_key(now - timedelta(days=1))

    state = load_state()
    daily = state.setdefault("daily", {})

    running = container_running()
    up = down = 0
    api_ok = False
    if running:
        try:
            up, down = query_xray_bytes()
            api_ok = True
        except Exception as exc:
            print(f"stats api failed: {exc}", file=sys.stderr)

    last_up = int(state.get("last_up", 0))
    last_down = int(state.get("last_down", 0))

    if api_ok:
        if up < last_up:
            delta_up = up
        else:
            delta_up = up - last_up
        if down < last_down:
            delta_down = down
        else:
            delta_down = down - last_down
        state["last_up"] = up
        state["last_down"] = down
        state["total_up"] = int(state.get("total_up", 0)) + delta_up
        state["total_down"] = int(state.get("total_down", 0)) + delta_down
        bucket = daily.setdefault(today, {"up": 0, "down": 0})
        bucket["up"] = int(bucket.get("up", 0)) + delta_up
        bucket["down"] = int(bucket.get("down", 0)) + delta_down

    last_report_raw = state.get("last_report")
    if last_report_raw:
        since = datetime.fromisoformat(last_report_raw)
        if since.tzinfo is None:
            since = since.replace(tzinfo=TZ)
    else:
        since = now - timedelta(hours=12)

    period_a, period_r, period_ips = parse_docker_logs_since(since)

    conn = state.setdefault("connections", {})
    conn["accepted"] = int(conn.get("accepted", 0)) + period_a
    conn["rejected"] = int(conn.get("rejected", 0)) + period_r
    state["last_report"] = now.isoformat()

    save_state(state)

    total_up = int(state.get("total_up", 0))
    total_down = int(state.get("total_down", 0))
    total = total_up + total_down

    y_up, y_down = sum_daily(
        state,
        now - timedelta(days=1),
        now - timedelta(days=1),
    )
    t_up, t_down = sum_daily(state, now, now)
    d7_up, d7_down = sum_daily(state, now - timedelta(days=6), now)
    d30_up, d30_down = sum_daily(state, now - timedelta(days=29), now)

    period_conn = period_a + period_r
    period_success = (period_a / period_conn * 100) if period_conn else 100.0

    total_conn = int(conn.get("accepted", 0)) + int(conn.get("rejected", 0))
    total_success = (
        (int(conn.get("accepted", 0)) / total_conn * 100) if total_conn else 100.0
    )

    top_ips = sorted(period_ips.items(), key=lambda x: -x[1])[:10]
    if top_ips:
        ip_lines = "\n".join(
            f"> {i}. `{ip}`　<font color=\"comment\">{cnt} 次</font>"
            for i, (ip, cnt) in enumerate(top_ips, 1)
        )
    else:
        ip_lines = "> <font color=\"comment\">本周期暂无连接</font>"

    if not api_ok and not running:
        api_status = "容器未运行"
    elif not api_ok:
        api_status = "Stats API 不可用"
    else:
        api_status = "正常"

    traffic_section = build_traffic_section(
        since=str(state.get("since", "-")),
        today=today,
        yesterday=yesterday,
        total_up=total_up,
        total_down=total_down,
        y_up=y_up,
        y_down=y_down,
        t_up=t_up,
        t_down=t_down,
        d7_up=d7_up,
        d7_down=d7_down,
        d30_up=d30_up,
        d30_down=d30_down,
    )

    period_range = f"{since.strftime('%m-%d %H:%M')} ~ {now.strftime('%m-%d %H:%M')}"

    content = f"""## Xray 流量日报
> 38 服务器　｜　{now.strftime("%Y-%m-%d %H:%M")}（北京）
> 状态：<font color="info">{api_status}</font>　｜　容器：{"运行中" if running else "未运行"}

{traffic_section}

### 连接情况
> 本周期（{period_range}）
> 成功 <font color="info">**{period_a}**</font>　｜　失败 <font color="warning">**{period_r}**</font>　｜　成功率 **{period_success:.1f}%**
> 累计　成功 {int(conn.get("accepted", 0))}　｜　失败 {int(conn.get("rejected", 0))}　｜　成功率 {total_success:.1f}%

### 客户端 IP（本周期 Top 10）
{ip_lines}
"""

    push_wecom(webhook, content)
    print("pushed ok", now.isoformat())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
