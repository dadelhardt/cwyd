from __future__ import annotations

import json
from typing import Any


def tool_payload(
    reply: str,
    *,
    visualization: str | None = None,
    table: dict[str, Any] | None = None,
    chart: list[dict[str, Any]] | None = None,
) -> str:
    body: dict[str, Any] = {"reply": reply}
    if visualization:
        body["visualization"] = visualization
    if table:
        body["table"] = table
    if chart:
        body["chart"] = chart
    return json.dumps(body)
