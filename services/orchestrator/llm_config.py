from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import AzureChatOpenAI, ChatOpenAI

LlmMode = Literal["azure_foundry", "openai_compatible", "unconfigured"]


def _azure_endpoint() -> str | None:
    value = os.getenv("AZURE_AI_ENDPOINT") or os.getenv("AZURE_OPENAI_ENDPOINT")
    return value.strip() if value else None


def _azure_api_key() -> str | None:
    value = os.getenv("AZURE_AI_API_KEY") or os.getenv("AZURE_OPENAI_API_KEY")
    return value.strip() if value else None


def _azure_deployment() -> str | None:
    value = (
        os.getenv("AZURE_AI_DEPLOYMENT_NAME")
        or os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
    )
    return value.strip() if value else None


def _azure_api_version() -> str:
    return (
        os.getenv("AZURE_AI_API_VERSION")
        or os.getenv("AZURE_OPENAI_API_VERSION")
        or "2024-12-01-preview"
    )


def get_llm_mode() -> LlmMode:
    if _azure_endpoint() and _azure_api_key() and _azure_deployment():
        return "azure_foundry"
    if os.getenv("OPENAI_API_KEY"):
        return "openai_compatible"
    return "unconfigured"


def llm_credentials_configured() -> bool:
    return get_llm_mode() != "unconfigured"


def _use_foundry_openai_v1_path(endpoint: str) -> bool:
    if os.getenv("AZURE_AI_USE_OPENAI_V1", "").lower() in ("1", "true", "yes"):
        return True
    return "inference.ai.azure.com" in endpoint


@lru_cache(maxsize=1)
def get_chat_model() -> BaseChatModel:
    mode = get_llm_mode()
    if mode == "unconfigured":
        raise RuntimeError(
            "LLM is not configured. Copy services/.env.example to services/.env "
            "and set Azure AI Foundry (AZURE_AI_*) or OPENAI_API_KEY."
        )

    if mode == "azure_foundry":
        endpoint = _azure_endpoint()
        api_key = _azure_api_key()
        deployment = _azure_deployment()
        assert endpoint and api_key and deployment

        if _use_foundry_openai_v1_path(endpoint):
            return ChatOpenAI(
                model=deployment,
                api_key=api_key,
                base_url=f"{endpoint.rstrip('/')}/openai/v1",
                temperature=0,
            )

        return AzureChatOpenAI(
            azure_endpoint=endpoint.rstrip("/"),
            azure_deployment=deployment,
            api_key=api_key,
            api_version=_azure_api_version(),
            temperature=0,
        )

    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
        temperature=0,
    )
