# cwyd

React application built with Vite. TypeScript, Tailwind CSS, ESLint. Source lives under `src/`.

## Instruction layers

Apply these in order. A later layer adds project facts. It does not replace a general skill.

1. Personal skills: `~/.cursor/skills/<skill-name>/SKILL.md` (every repository; do not copy them here)
2. Cursor user rules (Settings)
3. Project skills: `.cursor/skills/`
4. Project rules: `.cursor/rules/`
5. The requirement for the task: `docs/requirements/`

Where a new skill belongs is described in `.cursor/skills/README.md`.

## Layout

- `src/main.tsx` — client entry
- `src/App.tsx` — root component
- `src/components/` — shared UI
- `src/lib/` — shared helpers
- `src/types/` — shared types
- `vite.config.ts` — Vite config, including `GET /api/health` on the dev and preview servers
- `docs/product.md` — users, goals, and constraints
- `docs/requirements/` — one file per feature

## Implementing a feature

Follow `.cursor/skills/implement-requirement/SKILL.md`. Implement a requirement only when its status is `ready` and Open questions is empty.
