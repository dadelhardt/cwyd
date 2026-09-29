from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv


def load_service_env() -> None:
    """Load repo `.env` then `services/.env` (later overrides)."""
    services_dir = Path(__file__).resolve().parents[1]
    repo_root = services_dir.parent
    load_dotenv(repo_root / ".env")
    load_dotenv(services_dir / ".env", override=True)
