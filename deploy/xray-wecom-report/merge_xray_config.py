#!/usr/bin/env python3
"""Merge stats/api/access-log into existing Xray config without changing clients/keys."""
import json
import shutil
import sys
from pathlib import Path

CONFIG = Path("/opt/xray/config/config.json")


def main() -> int:
    if not CONFIG.exists():
        print(f"missing {CONFIG}", file=sys.stderr)
        return 1

    shutil.copy2(CONFIG, CONFIG.with_suffix(".json.bak"))

    with CONFIG.open(encoding="utf-8") as f:
        cfg = json.load(f)

    cfg["stats"] = {}
    cfg["api"] = {
        "tag": "api",
        "services": ["StatsService"],
    }
    cfg["policy"] = {
        "levels": {
            "0": {
                "statsUserUplink": True,
                "statsUserDownlink": True,
            }
        },
        "system": {
            "statsInboundUplink": True,
            "statsInboundDownlink": True,
            "statsOutboundUplink": True,
            "statsOutboundDownlink": True,
        },
    }

    log = cfg.get("log") or {}
    if isinstance(log, str):
        log = {"loglevel": log}
    log["loglevel"] = log.get("loglevel", "warning")
    log.pop("access", None)
    log.pop("error", None)
    cfg["log"] = log

    inbounds = cfg.get("inbounds") or []
    if not any(ib.get("tag") == "api" for ib in inbounds):
        inbounds.append(
            {
                "listen": "127.0.0.1",
                "port": 10085,
                "protocol": "dokodemo-door",
                "settings": {"address": "127.0.0.1"},
                "tag": "api",
            }
        )
    cfg["inbounds"] = inbounds

    for ib in inbounds:
        if ib.get("tag") == "vless-reality" and ib.get("protocol") == "vless":
            clients = ib.get("settings", {}).get("clients") or []
            for c in clients:
                if "email" not in c:
                    c["email"] = "default@vless"

    outbounds = cfg.get("outbounds") or []
    if not any(ob.get("tag") == "api" for ob in outbounds):
        outbounds.append({"protocol": "blackhole", "tag": "api"})
    cfg["outbounds"] = outbounds

    routing = cfg.get("routing") or {}
    rules = routing.get("rules") or []
    if not any(r.get("outboundTag") == "api" for r in rules):
        rules.insert(
            0,
            {"inboundTag": ["api"], "outboundTag": "api"},
        )
    routing["rules"] = rules
    cfg["routing"] = routing

    with CONFIG.open("w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print("merged ok:", CONFIG)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
