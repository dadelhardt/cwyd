# Data

Simulated SupplyOn datasets for local development and the prototype inquiry API.

## Layout

```text
data/sim/
  slm.json   Supplier Connect (customer, supplier, service)
  scc.json   Purchase orders
  dcm.json   Capacity alerts
  src.json   RFQs
```

Each file holds 1,000 records. Supplier IDs align across files so multi-service suppliers appear in SCC, DCM, and/or SRC as enrolled in SLM.

## Regenerate

```bash
npm run seed
```

Optional: `CWYD_DATA_SEED` (default `42`), `CWYD_DATA_DIR` (default `./data/sim`).

If JSON files are missing, the dev/preview server creates them on first API access using the same generator.
