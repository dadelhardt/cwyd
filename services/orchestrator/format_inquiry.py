from __future__ import annotations

import json
from typing import Any

from langchain_core.messages import AIMessage, ToolMessage


def _parse_tool_json(content: str) -> dict[str, Any] | None:
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        return None
    if isinstance(parsed, dict) and "reply" in parsed:
        return parsed
    return None


def merge_inquiry_from_messages(messages: list[Any]) -> dict[str, Any]:
    """Build UI inquiry JSON from LangGraph message list."""
    tool_payloads: list[dict[str, Any]] = []
    last_ai_text = ""

    for message in messages:
        if isinstance(message, ToolMessage) and isinstance(message.content, str):
            parsed = _parse_tool_json(message.content)
            if parsed:
                tool_payloads.append(parsed)
        elif isinstance(message, AIMessage):
            content = message.content
            if isinstance(content, str):
                last_ai_text = content
            elif isinstance(content, list):
                last_ai_text = " ".join(
                    block.get("text", "")
                    for block in content
                    if isinstance(block, dict)
                )

    if tool_payloads:
        merged = dict(tool_payloads[-1])
        merged["reply"] = last_ai_text.strip() or str(merged.get("reply", ""))
        if len(tool_payloads) > 1:
            merged["reply"] = (
                f"{merged['reply']}\n\n(Combined data from {len(tool_payloads)} MCP tool calls.)"
            ).strip()
        return merged

    if last_ai_text:
        try:
            parsed = json.loads(last_ai_text)
            if isinstance(parsed, dict) and "reply" in parsed:
                return parsed
        except json.JSONDecodeError:
            pass
        return {"reply": last_ai_text}

    return {"reply": "No response from orchestrator."}
