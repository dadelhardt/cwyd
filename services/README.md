# cwyd services

Python **MCP servers** (one per sim dataset) and a **LangGraph orchestrator** that combines them for chat inquiries.

## Setup

```bash
cd services
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Configure the LLM in **`services/.env`** (copy from [`services/.env.example`](.env.example)):

**Azure AI Foundry (default path in code):**

- `AZURE_AI_ENDPOINT` — project inference endpoint or `*.openai.azure.com` resource URL  
- `AZURE_AI_API_KEY` — key from Foundry / Azure OpenAI  
- `AZURE_AI_DEPLOYMENT_NAME` — deployed model name (for example `gpt-4o-mini`)  
- `AZURE_AI_API_VERSION` — optional (default `2024-12-01-preview`)  
- `AZURE_AI_USE_OPENAI_V1=true` — for `*.inference.ai.azure.com` (uses `{endpoint}/openai/v1`)

**Fallback:** `OPENAI_API_KEY`, optional `OPENAI_BASE_URL`, `OPENAI_MODEL`.

Optional data paths: `CWYD_ROOT`, `CWYD_DATA_DIR`, `CWYD_SEMANTIC_DIR`.

Restart `npm run orchestrator` after editing `services/.env`. Check `GET /health` for `llm_mode` (`azure_foundry`, `openai_compatible`, or `unconfigured`).

## Run orchestrator

From repository root:

```bash
npm run orchestrator
```

Or manually:

```bash
cd services
python -m uvicorn orchestrator.main:app --host 127.0.0.1 --port 8765
```

API: `POST http://127.0.0.1:8765/inquiries` with `{ "message": "..." }`.

The Vite dev/preview server proxies `/api/inquiries` here when `CWYD_ORCHESTRATOR_URL` is set (default `http://127.0.0.1:8765`).

## MCP servers (stdio)

Each runs as a subprocess of the orchestrator:

| MCP | Script | Tools |
|-----|--------|--------|
| cwyd-slm | `mcp_slm/server.py` | service mix, rollout by supplier, multi-service suppliers |
| cwyd-scc | `mcp_scc/server.py` | PO status, POs for supplier |
| cwyd-dcm | `mcp_dcm/server.py` | alert summary, alerts for supplier |
| cwyd-src | `mcp_src/server.py` | RFQ status, RFQs for supplier |

Data is read from `data/sim/*.json`.

## Example prompts (multi-MCP)

- "Which suppliers use multiple services and how many POs are new vs confirmed?"
- "Rollout by supplier and DCM alert volume summary"
- "Show multi-service suppliers and RFQ status breakdown"
