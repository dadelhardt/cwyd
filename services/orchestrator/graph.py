from __future__ import annotations

import os
from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

from orchestrator.format_inquiry import merge_inquiry_from_messages
from orchestrator.llm_config import get_chat_model, llm_credentials_configured
from orchestrator.mcp_config import mcp_servers, repo_root


def _semantic_summary() -> str:
    path = Path(os.environ.get("CWYD_SEMANTIC_DIR", repo_root() / "semantic"))
    # Lightweight summary for orchestrator; full loader lives in Node.
    domains = []
    for name in ("slm", "scc", "dcm", "src"):
        domain_file = path / "domains" / f"{name}.yaml"
        if domain_file.exists():
            domains.append(name)
    return (
        "Datasets: "
        + ", ".join(domains)
        + ". Join customerId and supplierId across MCPs. "
        "Use multiple MCP tools when the user asks about rollout plus transactional usage."
    )


SYSTEM_PROMPT = """You are cwyd, chat with your data for SupplyOn rollout analytics.

You have MCP tools from four data sources:
- cwyd-slm (Supplier Connect enrollments)
- cwyd-scc (purchase orders)
- cwyd-dcm (capacity alerts)
- cwyd-src (RFQs)

When a question spans rollout and usage, call tools from MORE THAN ONE MCP (for example SLM plus SCC).
After tools return JSON, summarize in plain language for the user.

{semantic}
"""


async def run_inquiry(message: str) -> dict:
    if not llm_credentials_configured():
        raise RuntimeError(
            "LLM is not configured. Copy services/.env.example to services/.env "
            "and set Azure AI Foundry (AZURE_AI_*) or OPENAI_API_KEY."
        )

    async with MultiServerMCPClient(mcp_servers()) as client:
        tools = await client.get_tools()
        agent = create_react_agent(get_chat_model(), tools)
        system = SYSTEM_PROMPT.format(semantic=_semantic_summary())
        result = await agent.ainvoke(
            {
                "messages": [
                    SystemMessage(content=system),
                    HumanMessage(content=message),
                ],
            },
        )
    messages = result.get("messages", [])
    return merge_inquiry_from_messages(messages)
