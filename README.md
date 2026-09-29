# cwyd

React application built with Vite (TypeScript, Tailwind CSS, ESLint).

## Scripts

- `npm run dev` — local development
- `npm run build` — typecheck and production build
- `npm run preview` — serve the production build
- `npm run lint` — ESLint

## Layout

```text
index.html          HTML entry
src/main.tsx        client entry
src/App.tsx         root component
src/components/     shared UI
src/lib/            shared helpers
src/types/          shared types
vite.config.ts      Vite config and GET /api/health
data/sim/           simulated SLM, SCC, DCM, SRC JSON (see data/README.md)
semantic/domains/   LLM-oriented field semantics per data source
                    (`npm run validate:semantic`, `GET /api/semantic/summary`)
docs/product.md     users, goals, and constraints
docs/requirements/  one file per feature
.cursor/skills/     project-only agent skills
.cursor/rules/      project-only agent rules
```

`GET /api/health` returns `{ "status": "ok" }`. `POST /api/inquiries` with `{ "message": "..." }` runs the prototype query engine over simulated SLM/SCC/DCM/SRC data (dev and preview only).

Run `npm run dev`, open the app, and use the chat panel. Example prompts: `help`, `rollout by supplier`, `purchase order status`, `capacity alerts`, `rfq status`.

For **LangGraph + MCP** (multi-dataset chat): install [services/requirements.txt](services/requirements.txt), set `OPENAI_API_KEY`, run `npm run orchestrator`, then use the same chat UI (`services/README.md`).

## Requirements

Copy `docs/requirements/_template.md` to `docs/requirements/REQ-NNN-short-name.md`. An agent implements a file only when `status` is `ready` and Open questions is empty. See `docs/requirements/README.md`.

## Agent skills

General skills stay in `~/.cursor/skills/` and apply to every repository. Skills that name this app live in `.cursor/skills/`. See `.cursor/skills/README.md`.
