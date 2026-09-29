from __future__ import annotations

import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services"))

from mcp.server.fastmcp import FastMCP

from mcp_shared.data import count_by, load_dataset
from mcp_shared.response import tool_payload

mcp = FastMCP("cwyd-slm")


@mcp.tool()
def slm_schema() -> str:
    """Describe SLM (Supplier Connect) columns and purpose."""
    return (
        "SLM dataset: customerName, customerId, supplierName, supplierId, "
        "supplyOnService (SCC|DCM|SRC). One row per customer-supplier-service enrollment."
    )


@mcp.tool()
def slm_service_mix() -> str:
    """Count SLM enrollments by SupplyOn service."""
    rows = load_dataset("slm")
    counts = count_by(rows, "supplyOnService")
    chart = [{"label": k, "value": v} for k, v in counts.items()]
    table = {
        "columns": ["Service", "Count"],
        "rows": [[k, str(v)] for k, v in counts.items()],
    }
    return tool_payload(
        "SLM enrollment counts by SupplyOn service.",
        visualization="donut",
        table=table,
        chart=chart,
    )


@mcp.tool()
def slm_rollout_by_supplier(limit: int = 10) -> str:
    """Top suppliers by number of SLM enrollment rows (rollout breadth)."""
    rows = load_dataset("slm")
    counts = count_by(rows, "supplierName")
    top = list(counts.items())[: max(1, min(limit, 25))]
    chart = [{"label": k, "value": v} for k, v in top]
    table = {
        "columns": ["Supplier", "Enrollment rows"],
        "rows": [[k, str(v)] for k, v in top],
    }
    return tool_payload(
        f"Top {len(top)} suppliers by SLM enrollment row count.",
        visualization="bar",
        table=table,
        chart=chart,
    )


@mcp.tool()
def slm_multi_service_suppliers(limit: int = 15) -> str:
    """Suppliers enrolled in more than one SupplyOn service (same supplierId in SLM)."""
    rows = load_dataset("slm")
    services: dict[str, set[str]] = defaultdict(set)
    names: dict[str, str] = {}
    for row in rows:
        sid = str(row["supplierId"])
        names[sid] = str(row["supplierName"])
        services[sid].add(str(row["supplyOnService"]))
    multi = [
        (sid, names[sid], sorted(list(svc)))
        for sid, svc in services.items()
        if len(svc) > 1
    ]
    multi.sort(key=lambda item: len(item[2]), reverse=True)
    multi = multi[: max(1, min(limit, 50))]
    table = {
        "columns": ["Supplier ID", "Supplier name", "Services"],
        "rows": [[sid, name, ", ".join(svc)] for sid, name, svc in multi],
    }
    return tool_payload(
        f"Found {len(multi)} suppliers with multiple SupplyOn services in SLM.",
        visualization="table",
        table=table,
    )


if __name__ == "__main__":
    mcp.run()
