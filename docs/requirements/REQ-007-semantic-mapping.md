---
id: REQ-007
title: Semantic mapping layer
status: draft
priority: high
---

## Outcome

An operator or downstream component (orchestrator, MCP, inquiry API) can attach **LLM-readable semantic descriptions** to the **raw physical data model** (`data/sim/*.json` and future real databases). Natural-language prompts that use business terms (for example “supplier”, “rollout”, “purchase order”, “RFQ”) can be linked to concrete datasets, fields, joins, and value meanings without the model guessing column names.

## Scope

### In

- A **versioned semantic catalog** in the repository that describes, per dataset:
  - **Business entities** (for example Supplier Connect enrollment, purchase order, capacity alert, RFQ).
  - **Attributes** mapped to physical fields (JSON property names and types).
  - **Human-oriented descriptions** written for LLM consumption (what the field means, how to use it in answers).
  - **Synonyms and aliases** (DE/EN and other SupplyOn languages as needed later) pointing to the same attribute.
  - **Enumerated values** with meanings (for example `SCC` / `DCM` / `SRC`, PO status, RFQ status).
  - **Relationships and join keys** across datasets (`customerId`, `supplierId`) so federation intent is explicit.
- A **loader** in the server codebase that reads the catalog and exposes:
  - A structured object for programmatic use.
  - A **compact text summary** suitable for injection into an LLM system or tool context (token-bounded; exact strategy in Open questions).
- **Coverage** of all four simulated datasets: SLM, SCC, DCM, SRC (see `docs/product.md` Development Stage and `data/README.md`).
- **Validation** that every physical field in the sim JSON files is documented in the catalog (no undocumented columns).

### Out

- End-user chat, canvas, export, and persistence UI (REQ-002–REQ-005).
- Executing federated SQL or MCP calls (REQ-006, REQ-008, REQ-009); this requirement only **describes** the model for those layers.
- Automatic inference of semantics from live database schemas (may be a later requirement).
- Choosing or integrating a specific LLM vendor (document env vars only; no API keys in repo).

## Acceptance criteria

1. Given the semantic catalog is present, when the loader runs, then it returns definitions for entities `slm`, `scc`, `dcm`, and `src` each with at least one attribute mapped to every column in the corresponding `data/sim/*.json` file.
2. Given a business synonym defined in the catalog (for example “purchase order” → SCC purchase order entity), when lookup is invoked with that synonym, then the result includes the correct dataset id, entity id, and physical field name(s).
3. Given two datasets share `supplierId`, when the catalog is queried for cross-dataset relationships, then the join key and a plain-language explanation of how suppliers link SLM to SCC/DCM/SRC is returned.
4. Given enumerated fields in sim data (SupplyOn service, PO status, RFQ status), when the catalog is read, then each allowed value has an LLM-oriented description.
5. Given the validation script or test for this requirement runs, when any sim JSON column is missing from the catalog, then validation fails with a clear list of gaps.

## Interfaces

- **Files:**
  - `semantic/README.md` — purpose, editing rules, link to this requirement.
  - `semantic/glossary.yaml`, `semantic/relationships.yaml` — shared terms and joins.
  - `semantic/domains/{slm,scc,dcm,src}.yaml` — one semantic mapping file per data source (proposed content in repo).
- **Server module (initial convention):**
  - `server/semantic/load-catalog.ts` — `loadSemanticCatalog()`, `getSemanticSummaryForLlm(options?)`, `resolveSynonym(term: string)`.
- **Optional HTTP (if needed by UI prototype):** `GET /api/semantic/summary` returns JSON `{ summary: string, version: string }` for debugging only; not required for end users.

## Data

- Semantic catalog files under `semantic/` (committed to git).
- Read-only reference to physical layout: `data/sim/slm.json`, `scc.json`, `dcm.json`, `src.json`.
- No runtime mutation of sim JSON by the mapping layer.

## Constraints

- Descriptions must be written for **LLM readability**: complete sentences, disambiguation where terms overlap (for example “supplier in SLM” vs “supplier on a PO line”).
- Catalog changes must remain reviewable in git (prefer YAML or JSON with stable ordering).
- Do not duplicate full dataset rows in the catalog; only metadata and mappings.
- Align naming with product.md: Supplier Connect (SLM), SCC, DCM, SRC.

## Open questions

- Maximum size of `getSemanticSummaryForLlm` output (truncate per domain vs full catalog)?
- Who approves mapping changes (developer-only vs data steward workflow)?
- Should synonyms for REQ-002 languages (DE, EN, HU, FR, CN, IT, ES) be in scope for the first implementation or English-only initially?
- Is `GET /api/semantic/summary` needed for the first slice, or loader-only used by orchestration?

## Verification

- `npm run lint` succeeds.
- Semantic validation passes (to be added with implementation): for example `npm run validate:semantic` checks catalog coverage against `data/sim/*.json` and fails on missing fields or broken synonym references.
- Manual check: loader output mentions join keys `customerId` and `supplierId` and describes all four datasets.
