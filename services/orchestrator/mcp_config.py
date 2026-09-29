from __future__ import annotations

import os
import sys
from pathlib import Path


def repo_root() -> Path:
    configured = os.environ.get("CWYD_ROOT")
    if configured:
        return Path(configured).resolve()
    return Path(__file__).resolve().parents[2]


def sim_data_dir() -> str:
    return str(
        Path(os.environ.get("CWYD_DATA_DIR", repo_root() / "data" / "sim")).resolve()
    )


def semantic_dir() -> str:
    return str(
        Path(os.environ.get("CWYD_SEMANTIC_DIR", repo_root() / "semantic")).resolve()
    )


def base_env() -> dict[str, str]:
    env = os.environ.copy()
    root = str(repo_root())
    env["CWYD_ROOT"] = root
    env["CWYD_DATA_DIR"] = sim_data_dir()
    env["CWYD_SEMANTIC_DIR"] = semantic_dir()
    return env


def mcp_servers() -> dict:
    root = repo_root()
    python = sys.executable
    env = base_env()
    return {
        "slm": {
            "command": python,
            "args": [str(root / "services" / "mcp_slm" / "server.py")],
            "transport": "stdio",
            "env": env,
        },
        "scc": {
            "command": python,
            "args": [str(root / "services" / "mcp_scc" / "server.py")],
            "transport": "stdio",
            "env": env,
        },
        "dcm": {
            "command": python,
            "args": [str(root / "services" / "mcp_dcm" / "server.py")],
            "transport": "stdio",
            "env": env,
        },
        "src": {
            "command": python,
            "args": [str(root / "services" / "mcp_src" / "server.py")],
            "transport": "stdio",
            "env": env,
        },
    }
