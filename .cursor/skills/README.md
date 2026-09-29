# Skills

Cursor loads general skills and project skills together. Keep them in different places so a general skill is edited once and a project skill stays in git with this app.

## General (every repository)

Maintain these outside this repo. Do not copy them here.

- Skills: `~/.cursor/skills/<skill-name>/SKILL.md`
- Standing instructions: Cursor user rules (Settings)

Do not write skills into `~/.cursor/skills-cursor/`. Cursor manages that folder.

Use the personal location when the skill would still be true in another application.

## Project (this repository)

- Skills: `.cursor/skills/<skill-name>/SKILL.md`
- Short rules: `.cursor/rules/*.mdc`
- Product facts: `docs/product.md` and `docs/requirements/`

Use the project location when the skill names this app's paths, stack, or product. Skills say how to work. Requirements say what to build.

Checked-in skill: `implement-requirement`.
