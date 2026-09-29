from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any


def repo_root() -> Path:
    configured = os.environ.get("CWYD_ROOT")
    if configured:
        return Path(configured).resolve()
    # services/mcp_shared/data.py -> repo root
    return Path(__file__).resolve().parents[2]


def sim_dir() -> Path:
    configured = os.environ.get("CWYD_DATA_DIR")
    if configured:
        return Path(configured).resolve()
    return repo_root() / "data" / "sim"


def load_dataset(name: str) -> list[dict[str, Any]]:
    path = sim_dir() / f"{name}.json"
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def count_by(rows: list[dict[str, Any]], field: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        key = str(row[field])
        counts[key] = counts.get(key, 0) + 1
    return dict(sorted(counts.items(), key=lambda item: item[1], reverse=True))
