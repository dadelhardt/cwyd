# Product

cwyd is a React application built with Vite, with a Python LangGraph orchestrator and dataset MCP servers for chat-with-your-data.

## Users
Users are typical customer users that have to manage a rollout of SupplyOn Services. They are interested in information about the rollout status by supplier, transactional usage, regional patterns etc.

## Goals

Chat with your data (cwyd) shall present an AI centric approach towards traditional business intelligence products. It shall support users with an interactive way to prompt data requirements. The data requirements can surface as results with a chat, a canvas mode showing visualizations or reusable data exports in user defined formats. data inquiries shall be persistable for re-curring usage.

## Development Stage
Before plugging in real data, create 3 example data sets with 1000 simulated records. The data sets are:

- Supplier Connect Data (SLM)
-- provide a simple data set consisting of customer name, customer id, Supplier Name, Supplier ID, SupplyOn Service (one of SCC, DCM SRC)

- SCC Data
-- a data set with customer id, Supplier ID, Purchase Order Nr, Purchase Order Description, PO Status (New, Confirmed)

- DCM Data
-- a data set with customer id, Supplier ID, Capacity Alert Nr, Capacity Alert Details

- SRC Data
-- a data set with customer id, Supplier ID, RFQ Nr, RFQ Details, RfQ Status (new, closed)

## Technical boundaries

The system will consist of multiple existing databases that must be integrated.
Data queries can be federated (joining of data) across multiple databases.
Data will need to be semantically enriched (semantic mapping layer) to describe business objects, attributes and their meaning for the LLM.
Individual data sets shall be exposed as MCPs for an application domain (typically corresponding to one data base existing).
Orchestration and data aggregation must occur over multiple MCPs/data sets. LangGraph orchestrates inquiries and may call tools on more than one MCP in a single chat turn.

## AI orchestration and LLM (Azure AI Foundry)

The inquiry path is: React chat → Vite `/api/inquiries` → **LangGraph orchestrator** (`npm run orchestrator`) → **MCP servers** (SLM, SCC, DCM, SRC over simulated `data/sim/`).

**LLM provider:** [Azure AI Foundry](https://learn.microsoft.com/azure/ai-foundry/) (primary). OpenAI-compatible endpoints are supported as a fallback.

Configure credentials in **`services/.env`** (copy from [`services/.env.example`](../services/.env.example); do not commit `services/.env`):

| Variable | Purpose |
|----------|---------|
| `AZURE_AI_ENDPOINT` | Foundry inference endpoint (`https://<project>.inference.ai.azure.com`) or Azure OpenAI resource URL |
| `AZURE_AI_API_KEY` | API key from the Foundry / Azure OpenAI portal |
| `AZURE_AI_DEPLOYMENT_NAME` | Deployed model name (for example `gpt-4o-mini`) |
| `AZURE_AI_API_VERSION` | Optional chat API version (default in code: `2024-12-01-preview`) |
| `AZURE_AI_USE_OPENAI_V1` | Optional; for `*.inference.ai.azure.com` uses `{endpoint}/openai/v1` |

Aliases: `AZURE_OPENAI_*`. Fallback: `OPENAI_API_KEY`, optional `OPENAI_BASE_URL` and `OPENAI_MODEL`.

Other documented env files: [`.env.example`](../.env.example) (Vite, data paths, orchestrator URL). Semantic catalog: [`semantic/`](../semantic/). Operational detail: [`services/README.md`](../services/README.md).

## Constraints

- TypeScript, React, Vite, and Tailwind CSS for the UI; Python for orchestrator and MCP servers.
- Do not commit secrets. Document environment variables in `.env.example` and `services/.env.example`.
