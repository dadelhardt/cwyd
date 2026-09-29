---
id: REQ-002
title: Prompt data inquiry (chat)
status: ready
priority:
---

## Outcome

A customer user who manages a SupplyOn Services rollout can describe a data need in natural language and receive an answer in a chat experience, as described in `docs/product.md` (interactive prompting for data requirements).

## Scope

### In

- Chat-oriented interaction for prompting data requirements and surfacing results in chat.
- Prompt UI is a right side panel allowing also file inputs as drag and drop file attachments

### Out
- chat response is text or visualizations
- Canvas visualizations (see REQ-003).
- Reusable exports (see REQ-004).
- Persisting inquiries for re-use (see REQ-005).
- Federated queries, semantic mapping, MCP exposure, and orchestration (see REQ-006–REQ-009).

## Acceptance criteria

- input in natural language
- all major languages of SupplyOn supported (DE, EN, HU, FR, CN, IT, ES)
## Interfaces

Details to be provided.

## Data

Details to be provided.

## Constraints

Details to be provided.

## Open questions

- What does the prompt UI look like (layout, history, attachments)?
- What is the chat response shape (text only, structured data, citations)?
- Error and empty states when the inquiry cannot be answered?
- Which model or service generates the answer?

## Verification

Details to be provided.
