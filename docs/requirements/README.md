# Requirements

Each feature is one markdown file in this folder. Copy `_template.md` and name it `REQ-NNN-short-name.md`.

## Lifecycle

1. `draft` — still being written. An agent must not implement it.
2. `ready` — Open questions is empty and acceptance criteria are testable. An agent may implement it.
3. `in-progress` — an agent is implementing it.
4. `done` — verification in the requirement has passed.

Set `status` in the file frontmatter. Do not invent behavior that is not in Scope or the acceptance criteria.

Requirements with `status: draft` stay blocked until Open questions is empty and acceptance criteria, interfaces, data, constraints, and verification are filled in (not “Details to be provided”).

## Where things live

- Shared product context: `docs/product.md`
- How to implement a requirement: `.cursor/skills/implement-requirement/SKILL.md`
