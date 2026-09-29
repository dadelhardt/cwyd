from __future__ import annotations

import sys
from pathlib import Path

SERVICES = Path(__file__).resolve().parents[1]
if str(SERVICES) not in sys.path:
    sys.path.insert(0, str(SERVICES))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from orchestrator.env_loader import load_service_env
from orchestrator.graph import run_inquiry
from orchestrator.llm_config import get_llm_mode, llm_credentials_configured

load_service_env()

app = FastAPI(title="cwyd orchestrator", version="0.1.0")


class InquiryRequest(BaseModel):
    message: str


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "orchestrator",
        "llm_mode": get_llm_mode(),
        "llm_configured": llm_credentials_configured(),
    }


@app.post("/inquiries")
async def inquiries(body: InquiryRequest):
    message = body.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="message is required")
    try:
        return await run_inquiry(message)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
