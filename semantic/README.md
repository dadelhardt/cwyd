# Semantic mapping

LLM-oriented descriptions of the cwyd physical data model. Each SupplyOn data source has its own file under `domains/`. Cross-dataset joins and shared business terms are in `relationships.yaml` and `glossary.yaml`.

Specification: [docs/requirements/REQ-007-semantic-mapping.md](../docs/requirements/REQ-007-semantic-mapping.md).

## Layout

```text
semantic/
  README.md
  glossary.yaml       Shared business terms
  relationships.yaml  Join keys across data/sim/*.json
  domains/
    slm.yaml          Supplier Connect (SLM)
    scc.yaml          SupplyOn Collaboration Center (SCC)
    dcm.yaml          Demand Capacity Management (DCM)
    src.yaml          Sourcing (SRC)
```

Physical data: [data/sim/](../data/sim/).

Runtime loader: [server/semantic/load-catalog.ts](../server/semantic/load-catalog.ts).

```bash
npm run validate:semantic
```

Debug API (dev/preview): `GET /api/semantic/summary` → `{ version, summary }`.

## Editing

- Write `description` fields for an LLM reader, not only for humans skimming column names.
- Keep `physicalField` identical to JSON property names in sim data.
- Add synonyms when users might phrase prompts differently (rollout, PO, RFQ, alert).
- When sim columns change, update the matching domain file before merging.
