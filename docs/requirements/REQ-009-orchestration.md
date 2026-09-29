---
id: REQ-009
title: Multi-MCP orchestration
status: draft
priority:
---

## Outcome

Orchestration and data aggregation occur across multiple MCPs and data sets when answering inquiries, as described in `docs/product.md`. A framework such as LangGraph is a candidate, not a committed decision.

## Scope

### In

- Orchestration and aggregation over multiple MCPs / data sets.

### Out

- Single-MCP-only access without cross-dataset aggregation (unless specified elsewhere).
- End-user chat, canvas, export, and persistence (see REQ-002–REQ-005).
- Federation and semantic mapping as standalone deliverables (see REQ-006, REQ-007).
- Definition of a single dataset MCP (see REQ-008).

## Acceptance criteria

Details to be provided.

## Interfaces

Details to be provided.

## Data

Details to be provided.

## Constraints

Details to be provided.

## Open questions

- Is LangGraph (or another framework) the chosen orchestration approach?
- Which service or process owns orchestration (separate backend vs in-repo)?
- How are partial failures and timeouts handled across MCPs?

## Verification

Details to be provided.
