---
name: implement-requirement
description: Implements a cwyd product requirement from docs/requirements. Use when the user mentions a requirement, REQ-, acceptance criteria, or asks to build a feature specified in docs/requirements.
---

# Implement a requirement

## Instructions

1. Read `docs/product.md`.
2. Read the matching file in `docs/requirements/`. If none was named, list files whose status is `ready` and ask which one to implement.
3. Stop when status is not `ready`, or when Open questions is not empty.
4. Set status to `in-progress` before editing code.
5. Change only what Scope (In) and the acceptance criteria require.
6. Run the checks in that requirement's Verification section.
7. Set status to `done` only after those checks pass.

## Paths

- Product context: `docs/product.md`
- Requirements: `docs/requirements/`
- Entry: `src/main.tsx` and `src/App.tsx`
- UI: `src/components/`
- Helpers: `src/lib/`
- Types: `src/types/`
- Dev and preview server: `vite.config.ts`
